from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.notification import NotificationRead
from app.services.notifications import list_notifications_for_user
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[NotificationRead])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_notifications_for_user(db, user=current_user)
