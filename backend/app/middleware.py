"""
Enhanced Middleware با RBAC, Caching, و Audit Logging
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import ORJSONResponse
import time
from typing import Optional
from datetime import datetime

from .rbac import RBACManager, User, Resource, Role, AccessLevel, DataSensitivity
from .cache import CacheManager


class EnhancedMiddleware:
    """Middleware برای RBAC و Audit Logging"""

    def __init__(self, rbac_manager: RBACManager, cache_manager: CacheManager):
        self.rbac = rbac_manager
        self.cache = cache_manager

    async def rbac_middleware(self, request: Request, call_next):
        """Middleware برای بررسی دسترسی"""

        # استخراج اطلاعات کاربر از header یا token
        # در اینجا برای نمایش، از header ساده استفاده می‌کنیم
        # در پروژه واقعی باید از JWT یا OAuth استفاده کنید
        user_id = request.headers.get("X-User-ID", "public")
        user_role = request.headers.get("X-User-Role", "public")

        # ساخت شیء کاربر
        user = User(
            user_id=user_id,
            username=request.headers.get("X-Username", "guest"),
            roles=[Role(user_role)] if user_role in [r.value for r in Role] else [Role.PUBLIC]
        )

        # ذخیره کاربر در request state
        request.state.user = user
        request.state.request_start = time.time()

        # تعیین سطح دسترسی منبع بر اساس path
        access_level = self._determine_access_level(request.url.path)
        sensitivity = self._determine_sensitivity(request.url.path)

        resource = Resource(
            resource_id=request.url.path,
            resource_type=self._extract_resource_type(request.url.path),
            access_level=access_level,
            sensitivity=sensitivity
        )

        request.state.resource = resource

        # بررسی دسترسی
        if not self.rbac.can_access(user, resource):
            # ثبت لاگ دسترسی رد شده
            self.rbac.log_access(
                user=user,
                resource=resource,
                action=request.method,
                granted=False,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("User-Agent")
            )

            return ORJSONResponse(
                {
                    "detail": "دسترسی غیرمجاز",
                    "required_role": access_level.value,
                    "your_roles": [r.value for r in user.roles]
                },
                status_code=status.HTTP_403_FORBIDDEN
            )

        # اجرای request
        response = await call_next(request)

        # ثبت لاگ دسترسی موفق
        request_time = time.time() - request.state.request_start
        self.rbac.log_access(
            user=user,
            resource=resource,
            action=request.method,
            granted=True,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent"),
            details={
                "status_code": response.status_code,
                "response_time": f"{request_time:.3f}s"
            }
        )

        return response

    @staticmethod
    def _determine_access_level(path: str) -> AccessLevel:
        """تعیین سطح دسترسی بر اساس path"""
        if "/public/" in path or path in ["/api/health", "/version", "/metrics"]:
            return AccessLevel.PUBLIC
        elif "/admin/" in path or "/restricted/" in path:
            return AccessLevel.RESTRICTED
        else:
            return AccessLevel.INTERNAL

    @staticmethod
    def _determine_sensitivity(path: str) -> DataSensitivity:
        """تعیین حساسیت داده بر اساس path"""
        if "/detailed/" in path or "/raw/" in path:
            return DataSensitivity.CRITICAL
        elif "/sensitive/" in path:
            return DataSensitivity.HIGH
        elif "/aggregated/" in path:
            return DataSensitivity.MEDIUM
        else:
            return DataSensitivity.LOW

    @staticmethod
    def _extract_resource_type(path: str) -> str:
        """استخراج نوع منبع از path"""
        parts = path.strip('/').split('/')
        if len(parts) >= 2:
            return parts[1]
        return "unknown"


# Utility functions برای استفاده در endpoints

async def get_cached_or_fetch(
    cache: CacheManager,
    cache_key: str,
    fetch_func,
    ttl: int = 300
):
    """دریافت از کش یا fetch از منبع"""
    cached = await cache.get(cache_key)
    if cached is not None:
        return cached

    data = await fetch_func()
    await cache.set(cache_key, data, ttl)
    return data


def require_role(*required_roles: Role):
    """دکوراتور برای بررسی نقش کاربر"""
    def decorator(func):
        async def wrapper(request: Request, *args, **kwargs):
            user: User = getattr(request.state, 'user', None)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="احراز هویت لازم است"
                )

            # بررسی نقش
            user_roles = set(user.roles)
            if not user_roles.intersection(set(required_roles)):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"نیاز به یکی از نقش‌های: {', '.join(r.value for r in required_roles)}"
                )

            return await func(request, *args, **kwargs)
        return wrapper
    return decorator


def apply_data_delay(rbac: RBACManager, user: User, resource: Resource, data: list):
    """اعمال تاخیر بر روی داده‌های حساس"""
    return rbac.filter_data_by_sensitivity(user, resource, data)
