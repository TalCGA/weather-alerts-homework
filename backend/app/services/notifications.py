from typing import List

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User


def list_notifications_for_user(db: Session, user: User) -> List[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def create_notification(
    db: Session,
    user_id: int,
    alert_id: int,
    channel: str,
    message: str,
) -> Notification:
    # TODO: Add notification sending logic (e.g., email) here in the future
    notif = Notification(
        user_id=user_id,
        alert_id=alert_id,
        channel=channel,
        message=message,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
