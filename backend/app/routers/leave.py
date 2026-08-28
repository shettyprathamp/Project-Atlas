
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.leave import (
    LeaveCreate,
    LeaveUpdate,
    LeaveResponse,
)

from app.security.employee_dependencies import (
    get_current_employee,
)

from app.services.leave_service import (
    get_all_leaves,
    get_leave_by_id,
    get_employee_leaves,
    create_leave,
    update_leave,
    delete_leave,
)


router = APIRouter(
    prefix="/leave",
    tags=["Leave"],
)


# =========================================================
# MY LEAVE
# =========================================================

@router.get(
    "/me",
    response_model=list[LeaveResponse],
)
def read_my_leaves(
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    return get_employee_leaves(
        db,
        current_employee.id,
    )


# =========================================================
# CREATE MY LEAVE
# =========================================================

@router.post(
    "/me",
    response_model=LeaveResponse,
)
def create_my_leave_request(
    leave_data: LeaveCreate,
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    return create_leave(
        db=db,
        leave_data=leave_data,
        employee_id=current_employee.id,
    )


# =========================================================
# ALL LEAVES
#
# Existing endpoint retained.
# =========================================================

@router.get(
    "/",
    response_model=list[LeaveResponse],
)
def read_leaves(
    db: Session = Depends(get_db),
):
    return get_all_leaves(db)


# =========================================================
# EMPLOYEE LEAVES
#
# Existing endpoint retained.
# =========================================================

@router.get(
    "/employee/{employee_id}",
    response_model=list[LeaveResponse],
)
def read_employee_leaves(
    employee_id: int,
    db: Session = Depends(get_db),
):
    return get_employee_leaves(
        db,
        employee_id,
    )


# =========================================================
# SINGLE LEAVE
# =========================================================

@router.get(
    "/{leave_id}",
    response_model=LeaveResponse,
)
def read_leave(
    leave_id: int,
    db: Session = Depends(get_db),
):
    leave = get_leave_by_id(
        db,
        leave_id,
    )

    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found",
        )

    return leave


# =========================================================
# CREATE LEAVE
#
# Existing endpoint retained for internal/admin usage.
# =========================================================

@router.post(
    "/",
    response_model=LeaveResponse,
)
def create_leave_request(
    leave_data: LeaveCreate,
    db: Session = Depends(get_db),
):
    return create_leave(
        db=db,
        leave_data=leave_data,
        employee_id=leave_data.employee_id,
    )


# =========================================================
# UPDATE LEAVE
# =========================================================

@router.put(
    "/{leave_id}",
    response_model=LeaveResponse,
)
def update_leave_request(
    leave_id: int,
    leave_data: LeaveUpdate,
    db: Session = Depends(get_db),
):
    leave = get_leave_by_id(
        db,
        leave_id,
    )

    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found",
        )

    return update_leave(
        db,
        leave,
        leave_data,
    )


# =========================================================
# DELETE LEAVE
# =========================================================

@router.delete(
    "/{leave_id}",
)
def remove_leave_request(
    leave_id: int,
    db: Session = Depends(get_db),
):
    leave = get_leave_by_id(
        db,
        leave_id,
    )

    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found",
        )

    delete_leave(
        db,
        leave,
    )

    return {
        "message": "Leave request deleted successfully"
    }