
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
)

from app.services.employee_service import (
    create_employee,
    get_all_employees,
    get_employee_by_id,
    update_employee,
    delete_employee,
)


router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
)


# =========================================================
# GET ALL EMPLOYEES
# =========================================================

@router.get(
    "/",
    response_model=list[EmployeeResponse],
)
def read_employees(
    db: Session = Depends(get_db),
):
    return get_all_employees(db)


# =========================================================
# GET SINGLE EMPLOYEE
# =========================================================

@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def read_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = get_employee_by_id(
        db,
        employee_id,
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found.",
        )

    return employee


# =========================================================
# CREATE EMPLOYEE
# =========================================================

@router.post(
    "/",
    response_model=EmployeeResponse,
)
def create_employee_record(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
):
    try:
        employee = create_employee(
            db=db,
            company_id=employee_data.company_id,
            name=employee_data.name,
            email=employee_data.email,
            password=employee_data.password,
            role=employee_data.role,
            department=employee_data.department,
        )

        if employee is None:
            raise HTTPException(
                status_code=400,
                detail="Employee email already exists.",
            )

        return employee

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# =========================================================
# UPDATE EMPLOYEE
# =========================================================

@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def update_employee_record(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
):
    try:
        employee = update_employee(
            db=db,
            employee_id=employee_id,
            employee_data=employee_data,
        )

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found.",
            )

        return employee

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# =========================================================
# DELETE EMPLOYEE
# =========================================================

@router.delete(
    "/{employee_id}",
)
def remove_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = delete_employee(
        db,
        employee_id,
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found.",
        )

    return {
        "message": "Employee deleted successfully.",
    }
