"""
routers/auth.py — Authentication routes using canonical schemas.
POST /auth/register  POST /auth/login  GET /auth/me
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import UserRole
from backend.schemas.auth import UserCreate, LoginRequest, UserResponse, TokenResponse
from backend.services import auth_service
from backend.routers.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    if await auth_service.get_user_by_username(db, payload.username):
        raise HTTPException(status_code=409, detail="Username already taken")
    try:
        role = UserRole(payload.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {payload.role}")
    user = await auth_service.register_user(db, payload.username, payload.email, payload.password, role)
    return UserResponse(
        id=str(user.id), email=user.email, username=user.username,
        role=user.role.value, is_active=user.is_active, created_at=user.created_at,
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


@router.get("/me", response_model=UserResponse)
async def me(current_user: Annotated[object, Depends(get_current_user)]):
    return UserResponse(
        id=str(current_user.id), email=current_user.email,
        username=current_user.username, role=current_user.role.value,
        is_active=current_user.is_active, created_at=current_user.created_at,
    )
