from datetime import datetime
from enum import Enum
from typing import List

from pydantic import BaseModel


class WeatherParameter(str, Enum):
    TEMPERATURE = "temperature"
    WIND_SPEED = "windSpeed"
    PRECIPITATION = "precipitation"


class Comparison(str, Enum):
    GT = "GT"
    GTE = "GTE"
    LT = "LT"
    LTE = "LTE"


class Unit(str, Enum):
    CELSIUS = "C"
    KM_PER_HOUR = "km/h"
    MILLIMETERS = "mm"


DEFAULT_UNITS_BY_PARAM = {
    WeatherParameter.TEMPERATURE: Unit.CELSIUS,
    WeatherParameter.WIND_SPEED: Unit.KM_PER_HOUR,
    WeatherParameter.PRECIPITATION: Unit.MILLIMETERS,
}


class AlertBase(BaseModel):
    name: str
    city_name: str
    parameter: WeatherParameter
    comparison: Comparison
    threshold: float
    notify_via_email: bool = False


class AlertCreate(AlertBase):
    pass


class AlertRead(AlertBase):
    id: int
    unit: Unit

    class Config:
        from_attributes = True


class AlertStatus(BaseModel):
    alert_id: int
    is_triggered_now: bool
    next_3_days_slots: List[datetime]
