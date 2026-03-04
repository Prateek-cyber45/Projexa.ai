"""
routers/deps.py
────────────────
Shared FastAPI dependencies:
  - get_current_user  → validates JWT and returns the User ORM object
  - require_role      → factory that creates a role-checker dependency
"""

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User, UserRole
from backend.services import auth_service

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Decode JWT and return the authenticated user."""
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_service.decode_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    user = await auth_service.get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise credentials_exc
    return user


def require_role(*roles: UserRole):
    """
    Usage:
        @router.get("/admin", dependencies=[Depends(require_role(UserRole.ADMIN))])
    """
    async def checker(current_user: Annotated[User, Depends(get_current_user)]):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {[r.value for r in roles]}",
            )
        return current_user
    return checker
