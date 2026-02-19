"""
routers/auth.py
────────────────
POST /register  – create account
POST /login     – get JWT access token
GET  /me        – return current user profile
"""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import UserRole
from backend.services import auth_service
from backend.routers.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Request / Response Schemas ────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.SOC_ANALYST


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    # Check for duplicate username
    existing = await auth_service.get_user_by_username(db, payload.username)
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken")

    user = await auth_service.register_user(
        db, payload.username, payload.email, payload.password, payload.role
    )
    return UserProfile(
        id=str(user.id),
        username=user.username,
        email=user.email,
        role=user.role.value,
        is_active=user.is_active,
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    user = await auth_service.authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = auth_service.create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, role=user.role.value, user_id=str(user.id))


@router.get("/me", response_model=UserProfile)
async def me(current_user: Annotated[object, Depends(get_current_user)]):
    return UserProfile(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        role=current_user.role.value,
        is_active=current_user.is_active,
    )
