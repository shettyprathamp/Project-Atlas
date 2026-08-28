from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.employee import Employee
from app.security.auth import decode_access_token


security = HTTPBearer()


def get_current_employee(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(
        credentials.credentials
    )

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    if payload.get("user_type") != "employee":
        raise HTTPException(
            status_code=401,
            detail="Employee token required",
        )

    employee_id = payload.get("employee_id")

    if employee_id is None:
        raise HTTPException(
            status_code=401,
            detail="Employee ID missing from token",
        )

    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return employee


def get_current_hr(
    current_employee: Employee = Depends(
        get_current_employee
    ),
):
    if current_employee.role.lower() != "hr":
        raise HTTPException(
            status_code=403,
            detail="HR access required",
        )

    return current_employee


def get_current_manager(
    current_employee: Employee = Depends(
        get_current_employee
    ),
):
    if current_employee.role.lower() != "manager":
        raise HTTPException(
            status_code=403,
            detail="Manager access required",
        )

    return current_employee