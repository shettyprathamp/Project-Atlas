from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.attendance import Attendance
from app.models.leave import Leave
from app.models.payroll import Payroll

from app.security.employee_dependencies import (
    get_current_employee,
)

from app.schemas.attendance import AttendanceResponse
from app.schemas.leave import (
    LeaveCreate,
    LeaveResponse,
)
from app.schemas.payroll import PayrollResponse
from app.schemas.employee import (
    EmployeeProfile,
    EmployeeProfileUpdate,
)


router = APIRouter(
    prefix="/employee",
    tags=["Employee Portal"],
)


# =========================================================
# PROFILE — GET
# =========================================================

@router.get(
    "/profile",
    response_model=EmployeeProfile,
)
def get_employee_profile(
    current_employee=Depends(
        get_current_employee
    ),
):
    return current_employee


# =========================================================
# PROFILE — UPDATE
# =========================================================

@router.put(
    "/profile",
    response_model=EmployeeProfile,
)
def update_employee_profile(
    profile_data: EmployeeProfileUpdate,
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    # -----------------------------------------------------
    # Check whether another employee already uses
    # the requested email address.
    # -----------------------------------------------------

    existing_employee = (
        db.query(type(current_employee))
        .filter(
            type(current_employee).email
            == profile_data.email,
            type(current_employee).id
            != current_employee.id,
        )
        .first()
    )

    if existing_employee is not None:
        raise HTTPException(
            status_code=400,
            detail="This email address is already in use.",
        )

    # -----------------------------------------------------
    # Update allowed profile fields.
    #
    # We intentionally do NOT allow the employee to
    # modify role, status, company_id or password here.
    # -----------------------------------------------------

    current_employee.name = (
        profile_data.name.strip()
    )

    current_employee.email = (
        str(profile_data.email).strip()
    )

    current_employee.department = (
        profile_data.department.strip()
        if profile_data.department
        else None
    )

    db.commit()
    db.refresh(current_employee)

    return current_employee


# =========================================================
# ATTENDANCE
# =========================================================

@router.get(
    "/attendance",
    response_model=list[AttendanceResponse],
)
def get_my_attendance(
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    return (
        db.query(Attendance)
        .filter(
            Attendance.employee_id
            == current_employee.id
        )
        .order_by(
            Attendance.date.desc()
        )
        .all()
    )


# =========================================================
# TODAY'S ATTENDANCE
# =========================================================

@router.get(
    "/attendance/today",
    response_model=AttendanceResponse | None,
)
def get_today_attendance(
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    today = date.today()

    return (
        db.query(Attendance)
        .filter(
            Attendance.employee_id
            == current_employee.id,
            Attendance.date == today,
        )
        .first()
    )


# =========================================================
# CHECK IN
# =========================================================

@router.post(
    "/attendance/check-in",
    response_model=AttendanceResponse,
)
def employee_check_in(
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    today = date.today()

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id
            == current_employee.id,
            Attendance.date == today,
        )
        .first()
    )

    if existing is not None:

        if existing.check_in is not None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "You have already checked "
                    "in today."
                ),
            )

        existing.check_in = (
            datetime.now().time()
        )

        existing.status = "Present"

        db.commit()
        db.refresh(existing)

        return existing

    attendance = Attendance(
        employee_id=current_employee.id,
        date=today,
        check_in=datetime.now().time(),
        status="Present",
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return attendance


# =========================================================
# CHECK OUT
# =========================================================

@router.post(
    "/attendance/check-out",
    response_model=AttendanceResponse,
)
def employee_check_out(
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    today = date.today()

    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id
            == current_employee.id,
            Attendance.date == today,
        )
        .first()
    )

    if attendance is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "You have not checked "
                "in today."
            ),
        )

    if attendance.check_in is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "You have not checked "
                "in today."
            ),
        )

    if attendance.check_out is not None:
        raise HTTPException(
            status_code=400,
            detail=(
                "You have already checked "
                "out today."
            ),
        )

    attendance.check_out = (
        datetime.now().time()
    )

    db.commit()
    db.refresh(attendance)

    return attendance


# =========================================================
# LEAVE
# =========================================================

@router.get(
    "/leave",
    response_model=list[LeaveResponse],
)
def get_my_leave(
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    return (
        db.query(Leave)
        .filter(
            Leave.employee_id
            == current_employee.id
        )
        .order_by(
            Leave.start_date.desc()
        )
        .all()
    )


# =========================================================
# APPLY LEAVE
# =========================================================

@router.post(
    "/leave",
    response_model=LeaveResponse,
)
def apply_leave(
    leave_data: LeaveCreate,
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    if (
        leave_data.start_date
        > leave_data.end_date
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Start date cannot be "
                "after end date."
            ),
        )

    leave = Leave(
        employee_id=current_employee.id,
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
# PAYROLL
# =========================================================

@router.get(
    "/payroll",
    response_model=list[PayrollResponse],
)
def get_my_payroll(
    db: Session = Depends(get_db),
    current_employee=Depends(
        get_current_employee
    ),
):
    return (
        db.query(Payroll)
        .filter(
            Payroll.employee_id
            == current_employee.id
        )
        .order_by(
            Payroll.year.desc(),
            Payroll.month.desc(),
            Payroll.id.desc(),
        )
        .all()
    )