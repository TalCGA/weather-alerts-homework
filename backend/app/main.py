from fastapi import FastAPI
from app.core.db import Base, engine
from app.api import auth as auth_api
from app.api import alerts as alerts_api
from app.api import notifications as notifications_api
from app.models import user, alert, notification


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weather Alerts")

app.include_router(auth_api.router, prefix="/auth", tags=["auth"])
app.include_router(alerts_api.router, prefix="/alerts", tags=["alerts"])
app.include_router(
    notifications_api.router, prefix="/notifications", tags=["notifications"]
)

@app.get("/health")
def health():
    return {"status": "ok"}
