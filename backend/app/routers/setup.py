from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.admin import AdminSetup
from app.services.admin_service import create_first_admin

router = APIRouter(
    prefix="/setup",
    tags=["Setup"]
)


@router.post("/")
def setup_admin(admin: AdminSetup, db: Session = Depends(get_db)):
    created_admin = create_first_admin(
        db=db,
        username=admin.username,
        email=admin.email,
        password=admin.password,
    )

    if created_admin is None:
        raise HTTPException(
            status_code=400,
            detail="Setup has already been completed."
        )

    return {
        "message": "First administrator created successfully."
    }