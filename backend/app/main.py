from fastapi import FastAPI

app = FastAPI(title="Weather Alerts")

@app.get("/health")
def health():
    return {"status": "ok"}
