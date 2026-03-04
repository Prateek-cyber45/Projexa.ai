"""
services/auth_service.py
────────────────────────
Handles user registration, login, password hashing, and JWT creation.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config import settings
from backend.models.user import User, UserRole

# ── Password hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT helpers ───────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Raises JWTError on invalid/expired token."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


# ── DB helpers ────────────────────────────────────────────────────────────────
async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def register_user(
    db: AsyncSession, username: str, email: str, password: str, role: UserRole
) -> User:
    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    await db.flush()       # get the generated id without full commit
    return user


async def authenticate_user(
    db: AsyncSession, username: str, password: str
) -> Optional[User]:
    user = await get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
