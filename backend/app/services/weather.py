from datetime import datetime, timedelta, timezone
from typing import List

import httpx

from app.core.config import settings
from app.schemas.weather import WeatherPoint


class WeatherServiceError(Exception):
    """
    Raised when an error occurs while communicating with the weather provider.
    """


def _build_time_range(hours_ahead: int) -> tuple[str, str]:
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    end = now + timedelta(hours=hours_ahead)
    return now.isoformat().replace("+00:00", "Z"), end.isoformat().replace("+00:00", "Z")


def get_hourly_forecast_for_city(
    city_name: str,
    hours_ahead: int = 72,
) -> List[WeatherPoint]:
    if not settings.TOMORROW_IO_API_KEY or settings.TOMORROW_IO_API_KEY == "change_me":
        raise WeatherServiceError("Tomorrow.io API key is not configured")

    start_time, end_time = _build_time_range(hours_ahead)

    params = {
        "location": city_name,
        "timesteps": "1h",
        "units": "metric",
        "apikey": settings.TOMORROW_IO_API_KEY,
        "startTime": start_time,
        "endTime": end_time,
        "fields": ",".join(
            [
                "temperature",
                "windSpeed",
                "precipitationIntensity",
            ]
        ),
    }

    url = f"{settings.TOMORROW_IO_BASE_URL}/weather/forecast"

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(url, params=params)
    except httpx.HTTPError as exc:
        raise WeatherServiceError(f"HTTP error calling Tomorrow.io: {exc}") from exc

    if resp.status_code != 200:
        raise WeatherServiceError(
            f"Tomorrow.io returned {resp.status_code}: {resp.text}"
        )

    data = resp.json()

    try:
        hourly = data["timelines"]["hourly"]
    except KeyError as exc:
        raise WeatherServiceError("Unexpected Tomorrow.io response shape") from exc

    points: List[WeatherPoint] = []

    for item in hourly:
        time_str = item.get("time")
        values = item.get("values", {})

        if not time_str:
            continue

        time = datetime.fromisoformat(time_str.replace("Z", "+00:00"))

        temperature = float(values.get("temperature"))
        wind_speed = float(values.get("windSpeed"))
        precipitation = float(values.get("precipitationIntensity", 0.0))

        points.append(
            WeatherPoint(
                time=time,
                temperature=temperature,
                wind_speed=wind_speed,
                precipitation=precipitation,
            )
        )

    return points
