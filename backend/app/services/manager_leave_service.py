from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.leave import Leave
from app.models.team import Team


# =========================================================
# GET EMPLOYEE LEAVE REQUESTS FOR MANAGER
#
# IMPORTANT:
#
# This returns leave requests from employees in the
# manager's company EXCEPT the manager's own leave.
#
# Manager's own leave belongs under:
#
# My Workspace → My Leave
#
# and will later be handled by HR.
# =========================================================

def get_manager_leave_requests(
    db: Session,
    company_id: int,
    manager_id: int,
):
    rows = (
        db.query(
            Leave,
            Employee,
            Team,
        )
        .join(
            Employee,
            Leave.employee_id == Employee.id,
        )
        .outerjoin(
            Team,
            Employee.team_id == Team.id,
        )
        .filter(
            Employee.company_id == company_id,
            Employee.id != manager_id,
        )
        .order_by(
            Leave.start_date.desc(),
            Leave.created_at.desc(),
        )
        .all()
    )

    results = []

    for leave, employee, team in rows:

        total_days = (
            leave.end_date - leave.start_date
        ).days + 1

        results.append(
            {
                "leave_id": leave.id,
                "employee_id": employee.id,
                "employee_name": employee.name,
                "employee_email": employee.email,
                "team_id": employee.team_id,
                "team_name": (
                    team.name
                    if team
                    else None
                ),
                "department": employee.department,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "total_days": total_days,
                "reason": leave.reason,
                "status": leave.status,
                "created_at": leave.created_at,
            }
        )

    return results


# =========================================================
# GET SINGLE EMPLOYEE LEAVE REQUEST
#
# IMPORTANT:
#
# Manager cannot access his/her own leave through this
# management endpoint.
# =========================================================

def get_manager_leave_by_id(
    db: Session,
    leave_id: int,
    company_id: int,
    manager_id: int,
):
    row = (
        db.query(
            Leave,
            Employee,
            Team,
        )
        .join(
            Employee,
            Leave.employee_id == Employee.id,
        )
        .outerjoin(
            Team,
            Employee.team_id == Team.id,
        )
        .filter(
            Leave.id == leave_id,
            Employee.company_id == company_id,
            Employee.id != manager_id,
        )
        .first()
    )

    if row is None:
        return None

    leave, employee, team = row

    total_days = (
        leave.end_date - leave.start_date
    ).days + 1

    return {
        "leave_id": leave.id,
        "employee_id": employee.id,
        "employee_name": employee.name,
        "employee_email": employee.email,
        "team_id": employee.team_id,
        "team_name": (
            team.name
            if team
            else None
        ),
        "department": employee.department,
        "leave_type": leave.leave_type,
        "start_date": leave.start_date,
        "end_date": leave.end_date,
        "total_days": total_days,
        "reason": leave.reason,
        "status": leave.status,
        "created_at": leave.created_at,
    }


# =========================================================
# UPDATE EMPLOYEE LEAVE STATUS
#
# Manager can only approve/reject an employee's leave.
#
# Manager's own leave is excluded.
# =========================================================

def update_leave_status(
    db: Session,
    leave_id: int,
    company_id: int,
    manager_id: int,
    status: str,
):
    row = (
        db.query(
            Leave,
            Employee,
        )
        .join(
            Employee,
            Leave.employee_id == Employee.id,
        )
        .filter(
            Leave.id == leave_id,
            Employee.company_id == company_id,
            Employee.id != manager_id,
        )
        .first()
    )

    if row is None:
        return None

    leave, employee = row

    leave.status = status

    db.commit()
    db.refresh(leave)

    return leave