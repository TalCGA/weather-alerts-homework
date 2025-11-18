from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.user import UserCreate, UserRead, Token, LoginRequest
from app.services import auth as auth_service
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = auth_service.get_user_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = auth_service.create_user(db, user_in=user_in)
    return user


@router.post("/login", response_model=Token)
def login(
    login_in: LoginRequest,
    db: Session = Depends(get_db),
):
    return auth_service.login_for_access_token(db=db, login_in=login_in)


@router.get("/me", response_model=UserRead)
def read_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
