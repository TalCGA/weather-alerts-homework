from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class NotificationChannel(str, Enum):
    IN_APP = "IN_APP"
    EMAIL = "EMAIL"  


class NotificationRead(BaseModel):
    id: int
    alert_id: int
    channel: NotificationChannel
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
