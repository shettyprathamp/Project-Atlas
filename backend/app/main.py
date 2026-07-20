from fastapi import FastAPI

from app.database.base import Base
from app.database.database import engine
from app.routers import setup
from app.routers import auth
from app.routers import protected

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Project Atlas API",
    version="1.0.0"
)

app.include_router(setup.router)
app.include_router(auth.router)
app.include_router(protected.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Project Atlas Backend!",
        "status": "running"
    }