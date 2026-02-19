#!/usr/bin/env python3
"""
scripts/setup_db.py - Creates all DB tables and seeds a demo admin user.
Run: python scripts/setup_db.py
"""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine
from backend.config import settings
from backend.database import Base
import backend.models


async def main():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("
[+] Database tables created.")

    from backend.database import AsyncSessionLocal
    from backend.services.auth_service import register_user, get_user_by_username
    from backend.models.user import UserRole

    async with AsyncSessionLocal() as db:
        if not await get_user_by_username(db, "admin"):
            await register_user(db, "admin", "admin@soc.local", "admin1234", UserRole.ADMIN)
            await db.commit()
            print("[+] Demo admin: username=admin password=admin1234")
        else:
            print("[i] Admin already exists.")

if __name__ == "__main__":
    asyncio.run(main())
