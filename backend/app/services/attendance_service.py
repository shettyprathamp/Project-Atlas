from datetime import date

from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.employee import Employee
from app.schemas.attendance import AttendanceUpdate


# =========================================================
# CREATE
# =========================================================

def create_attendance(
    db: Session,
    employee_id: int,
    attendance_date: date,
    check_in=None,
    check_out=None,
    status: str = "Present",
):
    attendance = Attendance(
        employee_id=employee_id,
        date=attendance_date,
        check_in=check_in,
        check_out=check_out,
        status=status,
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return attendance


# =========================================================
# HR — ALL ATTENDANCE
# =========================================================

def get_all_attendance(
    db: Session,
):
    return (
        db.query(Attendance)
        .order_by(
            Attendance.date.desc()
        )
        .all()
    )


# =========================================================
# SINGLE ATTENDANCE
# =========================================================

def get_attendance_by_id(
    db: Session,
    attendance_id: int,
):
    return (
        db.query(Attendance)
        .filter(
            Attendance.id == attendance_id
        )
        .first()
    )


# =========================================================
# EMPLOYEE ATTENDANCE
# =========================================================

def get_employee_attendance(
    db: Session,
    employee_id: int,
):
    return (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == employee_id
        )
        .order_by(
            Attendance.date.desc()
        )
        .all()
    )


# =========================================================
# MANAGER ATTENDANCE
#
# Returns attendance for employees belonging
# to the manager's company.
# =========================================================

def get_manager_attendance(
    db: Session,
    company_id: int,
):
    return (
        db.query(Attendance)
        .join(
            Employee,
            Attendance.employee_id == Employee.id,
        )
        .filter(
            Employee.company_id == company_id,
        )
        .order_by(
            Attendance.date.desc()
        )
        .all()
    )


# =========================================================
# MANAGER'S OWN ATTENDANCE
# =========================================================

def get_manager_own_attendance(
    db: Session,
    employee_id: int,
):
    return (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == employee_id,
        )
        .order_by(
            Attendance.date.desc()
        )
        .all()
    )


# =========================================================
# UPDATE
# =========================================================

def update_attendance(
    db: Session,
    attendance_id: int,
    attendance_data: AttendanceUpdate,
):
    attendance = get_attendance_by_id(
        db,
        attendance_id,
    )

    if attendance is None:
        return None

    update_data = attendance_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            attendance,
            field,
            value,
        )

    db.commit()
    db.refresh(attendance)

    return attendance


# =========================================================
# DELETE
# =========================================================

def delete_attendance(
    db: Session,
    attendance_id: int,
):
    attendance = get_attendance_by_id(
        db,
        attendance_id,
    )

    if attendance is None:
        return None

    db.delete(attendance)
    db.commit()

    return attendance