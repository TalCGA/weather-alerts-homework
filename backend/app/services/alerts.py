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
from fastapi import HTTPException
from app.schemas.weather import WeatherPoint
from app.services.weather import get_hourly_forecast_for_city, WeatherServiceError


def _validate_city(city_name: str) -> None:
    try:
        get_hourly_forecast_for_city(
            city_name=city_name,
            hours_ahead=24,
        )
    except WeatherServiceError as e:
        text = str(e)

        if "Too Many Calls" in text or "429" in text:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Weather provider rate limit reached. "
                    "Please try again in a few minutes."
                ),
            )

        raise HTTPException(
            status_code=400,
            detail=f"City '{city_name}' is invalid or could not be found.",
        )
    

def create_alert(db: Session, user: User, alert_in: AlertCreate) -> Alert:
    _validate_city(alert_in.city_name)
    unit = DEFAULT_UNITS_BY_PARAM[alert_in.parameter]

    alert = Alert(
        user_id=user.id,
        name=alert_in.name,
        city_name=alert_in.city_name,
        parameter=alert_in.parameter.value,        # "temperature" / "windSpeed" / "precipitation"
        comparison=alert_in.comparison.value,      # "GT" / "GTE" / "LT" / "LTE"
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


# ------------- Evaluation helpers -------------


def _value_series_for_metric(parameter: str, forecast: List[WeatherPoint]) -> list[float]:
    if parameter == "temperature":
        return [p.temperature for p in forecast]
    if parameter == "windSpeed":
        return [p.wind_speed for p in forecast]
    if parameter == "precipitation":
        return [p.precipitation for p in forecast]
    # default fallback – not expected
    return [p.temperature for p in forecast]


def _is_condition_met(
    values: list[float],
    comparison: str,
    threshold: float,
) -> bool:
    if comparison == "GT":   # Greater Than
        return any(v > threshold for v in values)
    if comparison == "GTE":  # Greater Than or Equal
        return any(v >= threshold for v in values)
    if comparison == "LT":   # Less Than
        return any(v < threshold for v in values)
    if comparison == "LTE":  # Less Than or Equal
        return any(v <= threshold for v in values)
    # default fallback – no trigger
    return False


def evaluate_single_alert(db: Session, alert: Alert) -> tuple[bool, list[str]]:
    try:
        forecast = get_hourly_forecast_for_city(
            city_name=alert.city_name,
            hours_ahead=72,
        )
    except:
        forecast = []

    triggered_slots: list[str] = []

    for point in forecast:
        if alert.parameter == "temperature":
            value = point.temperature
        elif alert.parameter == "windSpeed":
            value = point.wind_speed
        elif alert.parameter == "precipitation":
            value = point.precipitation
        else:
            value = point.temperature

        if _is_condition_met([value], alert.comparison, alert.threshold):
            triggered_slots.append(str(point.time))

    is_on = len(triggered_slots) > 0

    old_state = getattr(alert, "is_active", False)
    alert.is_active = is_on

    if old_state != is_on:
        db.add(alert)
        db.commit()
        db.refresh(alert)

    return is_on, triggered_slots


def evaluate_alerts_for_user(db: Session, user: User) -> list[AlertStatus]:
    alerts = list_alerts(db, user)
    statuses: list[AlertStatus] = []

    for alert in alerts:
        is_on, slots = evaluate_single_alert(db, alert)

        statuses.append(
            AlertStatus(
                alert_id=alert.id,
                is_triggered_now=is_on,
                next_3_days_slots=slots,
            )
        )

    return statuses
