from datetime import datetime

from pydantic import BaseModel


class WeatherPoint(BaseModel):
    time: datetime
    temperature: float
    wind_speed: float
    precipitation: float
