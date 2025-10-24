"""
Role-Based Access Control (RBAC) System
با قابلیت Public/Internal/Restricted labels و Audit Logging
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
import hashlib
import json


class AccessLevel(str, Enum):
    """سطوح دسترسی"""
    PUBLIC = "public"           # دسترسی عمومی - بدون محدودیت
    INTERNAL = "internal"       # دسترسی داخلی - نیاز به احراز هویت
    RESTRICTED = "restricted"   # دسترسی محدود - نیاز به مجوز خاص


class Role(str, Enum):
    """نقش‌های کاربری"""
    ADMIN = "admin"             # مدیر سیستم - دسترسی کامل
    MANAGER = "manager"         # مدیر - دسترسی به داده‌های تجمیعی و گزارش‌ها
    OPERATOR = "operator"       # اپراتور - دسترسی به عملیات روزمره
    ANALYST = "analyst"         # تحلیلگر - دسترسی فقط خواندنی به داده‌ها
    PUBLIC = "public"           # عمومی - دسترسی محدود به داده‌های عمومی


class DataSensitivity(str, Enum):
    """حساسیت داده‌ها"""
    LOW = "low"                 # کم - داده‌های عمومی
    MEDIUM = "medium"           # متوسط - داده‌های تجمیعی
    HIGH = "high"               # بالا - داده‌های تفصیلی
    CRITICAL = "critical"       # بحرانی - داده‌های حساس (نیاز به تاخیر)


class User(BaseModel):
    """مدل کاربر"""
    user_id: str
    username: str
    roles: List[Role]
    permissions: List[str] = []
    department: Optional[str] = None
    created_at: datetime = datetime.now()


class Resource(BaseModel):
    """مدل منبع/داده"""
    resource_id: str
    resource_type: str
    access_level: AccessLevel
    sensitivity: DataSensitivity
    owner: Optional[str] = None
    delay_hours: int = 0  # تاخیر برای داده‌های حساس


class AuditLog(BaseModel):
    """مدل لاگ حسابرسی"""
    log_id: str
    timestamp: datetime
    user_id: str
    username: str
    action: str
    resource_id: str
    resource_type: str
    access_granted: bool
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Dict[str, Any] = {}


class RBACManager:
    """مدیریت RBAC"""

    def __init__(self):
        # نقشه دسترسی: هر نقش به چه سطوح دسترسی دارد
        self.role_permissions = {
            Role.ADMIN: [AccessLevel.PUBLIC, AccessLevel.INTERNAL, AccessLevel.RESTRICTED],
            Role.MANAGER: [AccessLevel.PUBLIC, AccessLevel.INTERNAL],
            Role.OPERATOR: [AccessLevel.PUBLIC, AccessLevel.INTERNAL],
            Role.ANALYST: [AccessLevel.PUBLIC, AccessLevel.INTERNAL],
            Role.PUBLIC: [AccessLevel.PUBLIC],
        }

        # نقشه تاخیر: حساسیت داده به تاخیر (ساعت)
        self.sensitivity_delays = {
            DataSensitivity.LOW: 0,
            DataSensitivity.MEDIUM: 0,
            DataSensitivity.HIGH: 48,       # 48 ساعت تاخیر
            DataSensitivity.CRITICAL: 72,   # 72 ساعت تاخیر
        }

        # لاگ‌های حسابرسی (در پروژه واقعی باید در دیتابیس ذخیره شود)
        self.audit_logs: List[AuditLog] = []

    def can_access(self, user: User, resource: Resource) -> bool:
        """بررسی دسترسی کاربر به منبع"""
        # بررسی دسترسی بر اساس نقش
        for role in user.roles:
            if resource.access_level in self.role_permissions.get(role, []):
                return True

        # بررسی مجوزهای اضافی
        if f"access:{resource.resource_type}" in user.permissions:
            return True

        return False

    def apply_sensitivity_delay(self, resource: Resource, data_timestamp: datetime) -> Optional[datetime]:
        """اعمال تاخیر بر اساس حساسیت داده"""
        delay_hours = self.sensitivity_delays.get(resource.sensitivity, 0)

        if delay_hours > 0:
            available_time = data_timestamp + timedelta(hours=delay_hours)

            # اگر هنوز زمان دسترسی نرسیده، زمان در دسترس بودن را برگردان
            if datetime.now() < available_time:
                return available_time

        return None  # داده آماده دسترسی است

    def filter_data_by_sensitivity(
        self,
        user: User,
        resource: Resource,
        data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """فیلتر کردن داده‌ها بر اساس حساسیت و تاخیر"""
        filtered_data = []

        for item in data:
            # استخراج زمان داده
            item_timestamp = item.get('timestamp')
            if isinstance(item_timestamp, str):
                item_timestamp = datetime.fromisoformat(item_timestamp)
            elif item_timestamp is None:
                item_timestamp = datetime.now()

            # بررسی تاخیر
            available_time = self.apply_sensitivity_delay(resource, item_timestamp)

            if available_time is None:
                # داده قابل دسترسی است
                filtered_data.append(item)
            elif Role.ADMIN in user.roles:
                # ادمین‌ها به همه داده‌ها دسترسی دارند
                filtered_data.append({
                    **item,
                    '_delayed': False,
                    '_admin_override': True
                })
            else:
                # داده هنوز قابل دسترسی نیست
                filtered_data.append({
                    '_delayed': True,
                    '_available_at': available_time.isoformat(),
                    '_message': f'این داده در {available_time.strftime("%Y-%m-%d %H:%M")} قابل دسترسی خواهد بود'
                })

        return filtered_data

    def log_access(
        self,
        user: User,
        resource: Resource,
        action: str,
        granted: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Dict[str, Any] = None
    ) -> AuditLog:
        """ثبت لاگ دسترسی"""
        log = AuditLog(
            log_id=self._generate_log_id(user.user_id, resource.resource_id),
            timestamp=datetime.now(),
            user_id=user.user_id,
            username=user.username,
            action=action,
            resource_id=resource.resource_id,
            resource_type=resource.resource_type,
            access_granted=granted,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details or {}
        )

        self.audit_logs.append(log)
        return log

    def get_audit_logs(
        self,
        user_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[AuditLog]:
        """دریافت لاگ‌های حسابرسی با فیلتر"""
        logs = self.audit_logs

        if user_id:
            logs = [log for log in logs if log.user_id == user_id]

        if resource_id:
            logs = [log for log in logs if log.resource_id == resource_id]

        if start_date:
            logs = [log for log in logs if log.timestamp >= start_date]

        if end_date:
            logs = [log for log in logs if log.timestamp <= end_date]

        return logs

    def export_audit_logs(self, logs: List[AuditLog]) -> str:
        """خروجی لاگ‌ها به JSON"""
        return json.dumps([log.dict() for log in logs], default=str, ensure_ascii=False, indent=2)

    @staticmethod
    def _generate_log_id(user_id: str, resource_id: str) -> str:
        """تولید شناسه یکتا برای لاگ"""
        timestamp = datetime.now().isoformat()
        content = f"{user_id}:{resource_id}:{timestamp}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]


# مثال استفاده
def example_usage():
    """مثال استفاده از سیستم RBAC"""
    rbac = RBACManager()

    # تعریف کاربران
    admin_user = User(
        user_id="u001",
        username="admin",
        roles=[Role.ADMIN]
    )

    analyst_user = User(
        user_id="u002",
        username="analyst",
        roles=[Role.ANALYST]
    )

    public_user = User(
        user_id="u003",
        username="guest",
        roles=[Role.PUBLIC]
    )

    # تعریف منابع
    public_data = Resource(
        resource_id="r001",
        resource_type="water_consumption",
        access_level=AccessLevel.PUBLIC,
        sensitivity=DataSensitivity.LOW
    )

    restricted_data = Resource(
        resource_id="r002",
        resource_type="detailed_usage",
        access_level=AccessLevel.RESTRICTED,
        sensitivity=DataSensitivity.CRITICAL
    )

    # بررسی دسترسی
    print("Admin can access public data:", rbac.can_access(admin_user, public_data))
    print("Analyst can access restricted data:", rbac.can_access(analyst_user, restricted_data))
    print("Public can access restricted data:", rbac.can_access(public_user, restricted_data))

    # ثبت لاگ
    rbac.log_access(
        user=admin_user,
        resource=public_data,
        action="read",
        granted=True,
        ip_address="192.168.1.1"
    )

    # فیلتر داده‌ها با تاخیر
    sample_data = [
        {"timestamp": datetime.now() - timedelta(hours=24), "value": 100},
        {"timestamp": datetime.now() - timedelta(hours=50), "value": 200},
        {"timestamp": datetime.now() - timedelta(hours=80), "value": 300},
    ]

    filtered = rbac.filter_data_by_sensitivity(analyst_user, restricted_data, sample_data)
    print("\nFiltered data for analyst:", json.dumps(filtered, default=str, indent=2))


if __name__ == "__main__":
    example_usage()
