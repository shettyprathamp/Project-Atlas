from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.auth import Token
from app.schemas.employee import EmployeeProfile
from app.services.employee_auth_service import login_employee
from app.security.employee_dependencies import get_current_employee

router = APIRouter(
    prefix="/employee",
    tags=["Employee Authentication"],
)


@router.post(
    "/login",
    response_model=Token,
)
def employee_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    token = login_employee(
        db,
        form_data.username,
        form_data.password,
    )

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response_model=EmployeeProfile,
)
def get_my_profile(
    current_employee=Depends(get_current_employee),
):
    return current_employee