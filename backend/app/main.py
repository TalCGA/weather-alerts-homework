from fastapi import FastAPI
from app.core.db import Base, engine
from app.api import auth as auth_api
from app.api import alerts as alerts_api
from app.api import notifications as notifications_api
from app.api import weather as weather_api

from fastapi.middleware.cors import CORSMiddleware

from app.models import user, alert, notification


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weather Alerts")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_api.router, prefix="/auth", tags=["auth"])
app.include_router(alerts_api.router, prefix="/alerts", tags=["alerts"])
app.include_router(
    notifications_api.router, prefix="/notifications", tags=["notifications"]
)
app.include_router(weather_api.router, prefix="/weather", tags=["weather"])


@app.get("/health")
def health():
    return {"status": "ok"}
