from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.db import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    city_name = Column(String, nullable=False)

    parameter = Column(String, nullable=False)   # "temperature" / "windSpeed" / "precipitation"
    comparison = Column(String, nullable=False)  # "GT" / "GTE" / "LT" / "LTE"
    threshold = Column(Float, nullable=False)
    unit = Column(String, nullable=False)        # "C" / "km/h" / "mm"
    
    is_active = Column(Boolean, nullable=False, default=False) 
    notify_via_email = Column(Boolean, nullable=False, default=False)
    last_email_sent_date = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", backref="alerts")
