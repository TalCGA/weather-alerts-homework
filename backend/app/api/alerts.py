from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.alert import AlertCreate, AlertRead, AlertStatus
from app.services import alerts as alerts_service
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[AlertRead])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return alerts_service.list_alerts(db, user=current_user)


@router.post("/", response_model=AlertRead, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert_in: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return alerts_service.create_alert(db, user=current_user, alert_in=alert_in)


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts_service.delete_alert(db, user=current_user, alert_id=alert_id)
    return


@router.get("/status", response_model=list[AlertStatus])
def get_alerts_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return alerts_service.evaluate_alerts_for_user(db, user=current_user)




@router.post("/evaluate", response_model=List[AlertRead])
def evaluate_my_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Manually trigger evaluation of all alerts for the current user.
    This simulates what a cron/worker would do in a real system but returns
    the updated Alert objects (with is_active already updated).
    """
    alerts_service.evaluate_alerts_for_user(db, user=current_user)

    return alerts_service.list_alerts(db, user=current_user)