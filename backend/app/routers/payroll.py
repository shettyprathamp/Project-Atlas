from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.payroll import (
    PayrollCreate,
    PayrollUpdate,
    PayrollResponse,
)

from app.security.employee_dependencies import (
    get_current_hr,
)

from app.services.payroll_service import (
    get_all_payroll,
    get_payroll_by_id,
    get_employee_payroll,
    create_payroll,
    update_payroll,
    delete_payroll,
    mark_payroll_paid,
)


router = APIRouter(
    prefix="/payroll",
    tags=["Payroll"],
)


# =========================================================
# GET ALL PAYROLL
# =========================================================

@router.get(
    "/",
    response_model=list[PayrollResponse],
)
def read_payroll(
    db: Session = Depends(get_db),
):
    return get_all_payroll(db)


# =========================================================
# GET EMPLOYEE PAYROLL
# =========================================================

@router.get(
    "/employee/{employee_id}",
    response_model=list[PayrollResponse],
)
def read_employee_payroll(
    employee_id: int,
    db: Session = Depends(get_db),
):
    return get_employee_payroll(
        db,
        employee_id,
    )


# =========================================================
# GET SINGLE PAYROLL
# =========================================================

@router.get(
    "/{payroll_id}",
    response_model=PayrollResponse,
)
def read_payroll_record(
    payroll_id: int,
    db: Session = Depends(get_db),
):
    payroll = get_payroll_by_id(
        db,
        payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll record not found.",
        )

    return payroll


# =========================================================
# CREATE PAYROLL
# HR ONLY
# =========================================================

@router.post(
    "/",
    response_model=PayrollResponse,
)
def create_payroll_record(
    payroll_data: PayrollCreate,
    db: Session = Depends(get_db),
    current_hr=Depends(
        get_current_hr
    ),
):
    try:
        return create_payroll(
            db,
            payroll_data,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# =========================================================
# UPDATE PAYROLL
# HR DIRECT EDIT
# =========================================================

@router.put(
    "/{payroll_id}",
    response_model=PayrollResponse,
)
def update_payroll_record(
    payroll_id: int,
    payroll_data: PayrollUpdate,
    db: Session = Depends(get_db),
    current_hr=Depends(
        get_current_hr
    ),
):
    payroll = get_payroll_by_id(
        db,
        payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll record not found.",
        )

    try:
        return update_payroll(
            db,
            payroll,
            payroll_data,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# =========================================================
# MARK PAYROLL AS PAID
# HR ONLY
# =========================================================

@router.patch(
    "/{payroll_id}/paid",
    response_model=PayrollResponse,
)
def mark_as_paid(
    payroll_id: int,
    payment_date: date | None = None,
    payment_method: str | None = None,
    db: Session = Depends(get_db),
    current_hr=Depends(
        get_current_hr
    ),
):
    payroll = get_payroll_by_id(
        db,
        payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll record not found.",
        )

    return mark_payroll_paid(
        db,
        payroll,
        payment_date,
        payment_method,
    )


# =========================================================
# DELETE PAYROLL
# HR ONLY
# =========================================================

@router.delete(
    "/{payroll_id}",
)
def remove_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_hr=Depends(
        get_current_hr
    ),
):
    payroll = get_payroll_by_id(
        db,
        payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll record not found.",
        )

    delete_payroll(
        db,
        payroll,
    )

    return {
        "message": "Payroll record deleted successfully."
    }