from fastapi import FastAPI
from app.core.db import Base, engine
from app.api import auth as auth_api

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weather Alerts")

app.include_router(auth_api.router, prefix="/auth", tags=["auth"])


@app.get("/health")
def health():
    return {"status": "ok"}
