from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.team import Team

from app.schemas.manager_attendance import (
    ManagerAttendanceResponse,
)

from app.security.employee_dependencies import (
    get_current_manager,
)


router = APIRouter(
    prefix="/manager/attendance",
    tags=["Manager Attendance"],
)


# =========================================================
# GET MANAGER ATTENDANCE
# =========================================================

@router.get(
    "/",
    response_model=list[ManagerAttendanceResponse],
)
def get_manager_attendance(
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    records = (
        db.query(
            Attendance,
            Employee,
            Team,
        )
        .join(
            Employee,
            Attendance.employee_id == Employee.id,
        )
        .outerjoin(
            Team,
            Employee.team_id == Team.id,
        )
        .filter(
            Employee.company_id == current_manager.company_id,
        )
        .order_by(
            Attendance.date.desc(),
            Attendance.id.desc(),
        )
        .all()
    )

    response = []

    for attendance, employee, team in records:
        response.append(
            ManagerAttendanceResponse(
                attendance_id=attendance.id,

                employee_id=employee.id,
                employee_name=employee.name,

                team_id=team.id if team else None,
                team_name=team.name if team else None,

                date=attendance.date,

                check_in=attendance.check_in,
                check_out=attendance.check_out,

                status=attendance.status,
            )
        )

    return response