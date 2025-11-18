from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 characters long")
        return v


class UserRead(UserBase):
    id: int
    timezone: str

    class Config:
        from_attributes = True 


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
