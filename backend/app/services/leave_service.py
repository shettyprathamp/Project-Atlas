
from sqlalchemy.orm import Session

from app.models.leave import Leave
from app.schemas.leave import (
    LeaveCreate,
    LeaveUpdate,
)


# =========================================================
# GET ALL LEAVES
# =========================================================

def get_all_leaves(
    db: Session,
):
    return (
        db.query(Leave)
        .order_by(
            Leave.start_date.desc()
        )
        .all()
    )


# =========================================================
# GET LEAVE BY ID
# =========================================================

def get_leave_by_id(
    db: Session,
    leave_id: int,
):
    return (
        db.query(Leave)
        .filter(
            Leave.id == leave_id
        )
        .first()
    )


# =========================================================
# GET EMPLOYEE LEAVES
# =========================================================

def get_employee_leaves(
    db: Session,
    employee_id: int,
):
    return (
        db.query(Leave)
        .filter(
            Leave.employee_id == employee_id
        )
        .order_by(
            Leave.start_date.desc()
        )
        .all()
    )


# =========================================================
# CREATE LEAVE
# =========================================================

def create_leave(
    db: Session,
    leave_data: LeaveCreate,
    employee_id: int | None = None,
):
    if employee_id is None:
        employee_id = leave_data.employee_id

    leave = Leave(
        employee_id=employee_id,
        leave_type=leave_data.leave_type,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        reason=leave_data.reason,
        status="Pending",
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


# =========================================================
# UPDATE LEAVE
# =========================================================

def update_leave(
    db: Session,
    leave: Leave,
    leave_data: LeaveUpdate,
):
    update_data = leave_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(
            leave,
            key,
            value,
        )

    db.commit()
    db.refresh(leave)

    return leave


# =========================================================
# DELETE LEAVE
# =========================================================

def delete_leave(
    db: Session,
    leave: Leave,
):
    db.delete(leave)
    db.commit()