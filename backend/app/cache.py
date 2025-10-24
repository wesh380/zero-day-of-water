"""
Redis Caching System
با پشتیبانی از TTL، Invalidation و Cache Strategies
"""

from typing import Optional, Any, Callable
import json
import hashlib
from datetime import timedelta
from functools import wraps
import asyncio


try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    print("Warning: redis package not installed. Using in-memory cache fallback.")


class CacheManager:
    """مدیریت کش با پشتیبانی از Redis و Fallback به حافظه"""

    def __init__(
        self,
        redis_url: Optional[str] = None,
        default_ttl: int = 300  # 5 دقیقه
    ):
        self.redis_url = redis_url or "redis://localhost:6379"
        self.default_ttl = default_ttl
        self.redis_client = None
        self._memory_cache = {}  # fallback cache
        self._use_redis = False

    async def connect(self):
        """اتصال به Redis"""
        if not REDIS_AVAILABLE:
            print("Using in-memory cache (Redis not available)")
            return

        try:
            self.redis_client = await aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            # تست اتصال
            await self.redis_client.ping()
            self._use_redis = True
            print(f"Connected to Redis: {self.redis_url}")
        except Exception as e:
            print(f"Failed to connect to Redis: {e}. Using in-memory cache.")
            self._use_redis = False

    async def disconnect(self):
        """قطع اتصال از Redis"""
        if self.redis_client:
            await self.redis_client.close()

    async def get(self, key: str) -> Optional[Any]:
        """دریافت مقدار از کش"""
        if self._use_redis and self.redis_client:
            try:
                value = await self.redis_client.get(key)
                if value:
                    return json.loads(value)
            except Exception as e:
                print(f"Redis get error: {e}")
                return self._memory_cache.get(key)
        else:
            return self._memory_cache.get(key)

        return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """ذخیره مقدار در کش"""
        ttl = ttl or self.default_ttl

        if self._use_redis and self.redis_client:
            try:
                serialized = json.dumps(value, default=str)
                await self.redis_client.setex(key, ttl, serialized)
                return True
            except Exception as e:
                print(f"Redis set error: {e}")
                self._memory_cache[key] = value
                return False
        else:
            self._memory_cache[key] = value
            # شبیه‌سازی TTL با asyncio
            asyncio.create_task(self._expire_memory_key(key, ttl))
            return True

    async def delete(self, key: str) -> bool:
        """حذف کلید از کش"""
        if self._use_redis and self.redis_client:
            try:
                await self.redis_client.delete(key)
                return True
            except Exception as e:
                print(f"Redis delete error: {e}")

        if key in self._memory_cache:
            del self._memory_cache[key]
            return True

        return False

    async def invalidate_pattern(self, pattern: str) -> int:
        """حذف کلیدهای با الگوی مشخص"""
        count = 0

        if self._use_redis and self.redis_client:
            try:
                keys = []
                async for key in self.redis_client.scan_iter(match=pattern):
                    keys.append(key)

                if keys:
                    count = await self.redis_client.delete(*keys)
            except Exception as e:
                print(f"Redis invalidate error: {e}")

        # Memory cache fallback
        keys_to_delete = [
            k for k in self._memory_cache.keys()
            if self._match_pattern(k, pattern)
        ]
        for key in keys_to_delete:
            del self._memory_cache[key]
            count += 1

        return count

    async def exists(self, key: str) -> bool:
        """بررسی وجود کلید"""
        if self._use_redis and self.redis_client:
            try:
                return bool(await self.redis_client.exists(key))
            except Exception as e:
                print(f"Redis exists error: {e}")

        return key in self._memory_cache

    async def get_ttl(self, key: str) -> int:
        """دریافت TTL کلید (ثانیه)"""
        if self._use_redis and self.redis_client:
            try:
                return await self.redis_client.ttl(key)
            except Exception as e:
                print(f"Redis TTL error: {e}")

        return -1

    @staticmethod
    def _match_pattern(key: str, pattern: str) -> bool:
        """بررسی تطابق کلید با pattern (ساده)"""
        if '*' in pattern:
            parts = pattern.split('*')
            if len(parts) == 2:
                return key.startswith(parts[0]) and key.endswith(parts[1])
        return key == pattern

    async def _expire_memory_key(self, key: str, ttl: int):
        """حذف خودکار کلید از memory cache بعد از TTL"""
        await asyncio.sleep(ttl)
        if key in self._memory_cache:
            del self._memory_cache[key]

    @staticmethod
    def generate_cache_key(prefix: str, *args, **kwargs) -> str:
        """تولید کلید کش یکتا"""
        # ترکیب تمام پارامترها
        params = f"{args}:{sorted(kwargs.items())}"
        hash_value = hashlib.md5(params.encode()).hexdigest()[:12]
        return f"{prefix}:{hash_value}"


# Decorator برای caching
def cached(
    cache_manager: CacheManager,
    ttl: Optional[int] = None,
    key_prefix: str = "cache"
):
    """دکوراتور برای cache کردن خروجی توابع"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # تولید کلید کش
            cache_key = CacheManager.generate_cache_key(
                f"{key_prefix}:{func.__name__}",
                *args,
                **kwargs
            )

            # بررسی کش
            cached_value = await cache_manager.get(cache_key)
            if cached_value is not None:
                return cached_value

            # اجرای تابع
            result = await func(*args, **kwargs)

            # ذخیره در کش
            await cache_manager.set(cache_key, result, ttl)

            return result
        return wrapper
    return decorator


# استراتژی‌های کش
class CacheStrategy:
    """استراتژی‌های مختلف کش"""

    @staticmethod
    async def cache_aside(
        cache: CacheManager,
        key: str,
        fetch_func: Callable,
        ttl: Optional[int] = None
    ) -> Any:
        """
        Cache-Aside (Lazy Loading):
        ابتدا از کش چک می‌کند، در صورت نبودن از منبع می‌خواند
        """
        value = await cache.get(key)
        if value is None:
            value = await fetch_func()
            await cache.set(key, value, ttl)
        return value

    @staticmethod
    async def write_through(
        cache: CacheManager,
        key: str,
        value: Any,
        write_func: Callable,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Write-Through:
        ابتدا در دیتابیس می‌نویسد، سپس در کش
        """
        success = await write_func(value)
        if success:
            await cache.set(key, value, ttl)
        return success

    @staticmethod
    async def write_behind(
        cache: CacheManager,
        key: str,
        value: Any,
        write_func: Callable,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Write-Behind (Write-Back):
        ابتدا در کش می‌نویسد، سپس به صورت async در دیتابیس
        """
        await cache.set(key, value, ttl)
        # نوشتن async در background
        asyncio.create_task(write_func(value))
        return True


# مثال استفاده
async def example_usage():
    """مثال استفاده از سیستم کش"""

    # ایجاد cache manager
    cache = CacheManager(
        redis_url="redis://localhost:6379",
        default_ttl=300  # 5 دقیقه
    )

    # اتصال
    await cache.connect()

    # ذخیره و دریافت
    await cache.set("user:1", {"name": "Ali", "age": 30})
    user = await cache.get("user:1")
    print(f"User from cache: {user}")

    # استفاده از decorator
    @cached(cache, ttl=60, key_prefix="api")
    async def get_water_consumption(user_id: str, month: str):
        """تابع شبیه‌سازی شده - در پروژه واقعی از دیتابیس می‌خواند"""
        print(f"Fetching from database for {user_id}, {month}")
        await asyncio.sleep(0.5)  # شبیه‌سازی تاخیر دیتابیس
        return {"consumption": 150, "cost": 225000}

    # اولین بار از دیتابیس
    result1 = await get_water_consumption("u001", "2024-10")
    print(f"First call: {result1}")

    # دومین بار از کش
    result2 = await get_water_consumption("u001", "2024-10")
    print(f"Second call (cached): {result2}")

    # Invalidate کش
    await cache.invalidate_pattern("api:*")
    print("Cache invalidated")

    # قطع اتصال
    await cache.disconnect()


if __name__ == "__main__":
    asyncio.run(example_usage())
