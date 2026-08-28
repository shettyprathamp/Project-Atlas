from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse,
)

from app.security.employee_dependencies import (
    get_current_employee,
    get_current_hr,
)

from app.services.attendance_service import (
    create_attendance,
    get_all_attendance,
    get_attendance_by_id,
    get_employee_attendance,
    update_attendance,
    delete_attendance,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


# =========================================================
# MY ATTENDANCE
#
# This endpoint is for the currently logged-in employee.
#
# IMPORTANT:
# - Employee can access their own attendance.
# - Manager can access their own attendance.
# - HR can access their own attendance.
#
# It does NOT require HR access.
# =========================================================

@router.get(
    "/me",
    response_model=list[AttendanceResponse],
)
def get_my_attendance(
    db: Session = Depends(get_db),
    current_employee=Depends(get_current_employee),
):
    return get_employee_attendance(
        db=db,
        employee_id=current_employee.id,
    )


# =========================================================
# CREATE ATTENDANCE
#
# HR only.
# =========================================================

@router.post(
    "/",
    response_model=AttendanceResponse,
)
def create_new_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_hr=Depends(get_current_hr),
):
    created = create_attendance(
        db=db,
        employee_id=attendance.employee_id,
        attendance_date=attendance.date,
        check_in=attendance.check_in,
        check_out=attendance.check_out,
        status=attendance.status,
    )

    return created


# =========================================================
# GET ALL ATTENDANCE
#
# HR only.
#
# This is the organization-wide attendance endpoint.
# =========================================================

@router.get(
    "/",
    response_model=list[AttendanceResponse],
)
def list_attendance(
    db: Session = Depends(get_db),
    current_hr=Depends(get_current_hr),
):
    return get_all_attendance(db)


# =========================================================
# GET ATTENDANCE FOR SPECIFIC EMPLOYEE
#
# HR only.
# =========================================================

@router.get(
    "/employee/{employee_id}",
    response_model=list[AttendanceResponse],
)
def list_employee_attendance(
    employee_id: int,
    db: Session = Depends(get_db),
    current_hr=Depends(get_current_hr),
):
    return get_employee_attendance(
        db,
        employee_id,
    )


# =========================================================
# GET ATTENDANCE BY ID
#
# HR only.
#
# IMPORTANT:
# This route comes AFTER /me.
# Otherwise FastAPI could interpret "me" as an attendance_id.
# =========================================================

@router.get(
    "/{attendance_id}",
    response_model=AttendanceResponse,
)
def get_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_hr=Depends(get_current_hr),
):
    attendance = get_attendance_by_id(
        db,
        attendance_id,
    )

    if attendance is None:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found.",
        )

    return attendance


# =========================================================
# UPDATE ATTENDANCE
#
# HR only.
# =========================================================

@router.put(
    "/{attendance_id}",
    response_model=AttendanceResponse,
)
def update_existing_attendance(
    attendance_id: int,
    attendance: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_hr=Depends(get_current_hr),
):
    updated = update_attendance(
        db,
        attendance_id,
        attendance,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found.",
        )

    return updated


# =========================================================
# DELETE ATTENDANCE
#
# HR only.
# =========================================================

@router.delete(
    "/{attendance_id}"
)
def remove_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_hr=Depends(get_current_hr),
):
    deleted = delete_attendance(
        db,
        attendance_id,
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found.",
        )

    return {
        "message": "Attendance record deleted successfully."
    }