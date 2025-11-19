from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.weather import WeatherPoint
from app.services import weather as weather_service
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/preview", response_model=List[WeatherPoint])
def preview_weather_for_city(
    city: str = Query(..., description="City name, e.g. 'new york' or 'tel aviv'"),
    hours: int = Query(24, ge=1, le=72, description="How many hours ahead"),
    _: User = Depends(get_current_user),
    __: Session = Depends(get_db),
):
    """
    Debug endpoint:
    City name -> Tomorrow.io forecast -> list of hourly WeatherPoint objects.
    """
    try:
        return weather_service.get_hourly_forecast_for_city(
            city_name=city,
            hours_ahead=hours,
        )
    except weather_service.WeatherServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
