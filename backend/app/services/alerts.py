from typing import List

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.user import User
from app.schemas.alert import (
    AlertCreate,
    AlertRead,
    DEFAULT_UNITS_BY_PARAM,
    AlertStatus,
)


def create_alert(db: Session, user: User, alert_in: AlertCreate) -> Alert:
    unit = DEFAULT_UNITS_BY_PARAM[alert_in.parameter]

    alert = Alert(
        user_id=user.id,
        name=alert_in.name,
        city_name=alert_in.city_name,
        parameter=alert_in.parameter.value,
        comparison=alert_in.comparison.value,
        threshold=alert_in.threshold,
        unit=unit.value,
        notify_via_email=alert_in.notify_via_email,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def list_alerts(db: Session, user: User) -> List[Alert]:
    return db.query(Alert).filter(Alert.user_id == user.id).all()


def delete_alert(db: Session, user: User, alert_id: int) -> None:
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id, Alert.user_id == user.id)
        .first()
    )
    if alert:
        db.delete(alert)
        db.commit()


def evaluate_alerts_for_user_dummy(db: Session, user: User) -> list[AlertStatus]:
    # TODO: Replace with Tomorrow.io real weather evaluation logic
    alerts = list_alerts(db, user)
    statuses: list[AlertStatus] = []
    for alert in alerts:
        statuses.append(
            AlertStatus(
                alert_id=alert.id,
                is_triggered_now=False,
                next_3_days_slots=[],
            )
        )
    return statuses
