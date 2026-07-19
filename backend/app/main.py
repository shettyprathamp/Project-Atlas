from fastapi import FastAPI

from app.database.base import Base
from app.database.database import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Project Atlas API",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to Project Atlas Backend!",
        "status": "running"
    }