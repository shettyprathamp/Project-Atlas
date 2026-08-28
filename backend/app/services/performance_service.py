from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.team import Team
from app.models.attendance import Attendance
from app.models.leave import Leave
from app.models.payroll import Payroll


def get_manager_performance(
    db: Session,
    company_id: int,
):
    # =========================================================
    # EMPLOYEES
    # =========================================================

    employees = (
        db.query(Employee)
        .filter(
            Employee.company_id == company_id
        )
        .all()
    )

    total_employees = len(employees)

    active_employees = sum(
        1
        for employee in employees
        if (employee.status or "").lower() == "active"
    )

    inactive_employees = (
        total_employees - active_employees
    )

    employee_ids = [
        employee.id
        for employee in employees
    ]


    # =========================================================
    # TEAMS
    # =========================================================

    teams = (
        db.query(Team)
        .filter(
            Team.company_id == company_id
        )
        .order_by(Team.id.asc())
        .all()
    )


    # =========================================================
    # ATTENDANCE
    # =========================================================

    attendance_records = []

    if employee_ids:
        attendance_records = (
            db.query(Attendance)
            .filter(
                Attendance.employee_id.in_(employee_ids)
            )
            .order_by(
                Attendance.date.desc()
            )
            .all()
        )

    total_attendance = len(attendance_records)

    present_count = sum(
        1
        for record in attendance_records
        if (record.status or "").lower() == "present"
    )

    absent_count = sum(
        1
        for record in attendance_records
        if (record.status or "").lower() == "absent"
    )

    late_count = sum(
        1
        for record in attendance_records
        if (record.status or "").lower() == "late"
    )

    other_attendance_count = (
        total_attendance
        - present_count
        - absent_count
        - late_count
    )

    attendance_rate = (
        round(
            (present_count / total_attendance) * 100,
            2,
        )
        if total_attendance > 0
        else 0
    )


    # =========================================================
    # LEAVE
    # =========================================================

    leave_records = []

    if employee_ids:
        leave_records = (
            db.query(Leave)
            .filter(
                Leave.employee_id.in_(employee_ids)
            )
            .order_by(
                Leave.created_at.desc()
            )
            .all()
        )

    total_leaves = len(leave_records)

    pending_leaves = sum(
        1
        for leave in leave_records
        if (leave.status or "").lower() == "pending"
    )

    approved_leaves = sum(
        1
        for leave in leave_records
        if (leave.status or "").lower() == "approved"
    )

    rejected_leaves = sum(
        1
        for leave in leave_records
        if (leave.status or "").lower() == "rejected"
    )


    # =========================================================
    # PAYROLL
    # =========================================================

    payroll_records = []

    if employee_ids:
        payroll_records = (
            db.query(Payroll)
            .filter(
                Payroll.employee_id.in_(employee_ids)
            )
            .all()
        )

    total_payroll = sum(
        record.net_salary or 0
        for record in payroll_records
    )

    paid_payroll = sum(
        record.net_salary or 0
        for record in payroll_records
        if (record.status or "").lower() == "paid"
    )

    pending_payroll = sum(
        record.net_salary or 0
        for record in payroll_records
        if (record.status or "").lower() == "pending"
    )


    # =========================================================
    # EMPLOYEE PERFORMANCE
    #
    # Derived only from real attendance records.
    # No fake performance scores.
    # =========================================================

    employee_map = {
        employee.id: employee
        for employee in employees
    }

    employee_stats = {}

    for employee in employees:
        employee_stats[employee.id] = {
            "employee_id": employee.id,
            "employee_name": employee.name,
            "team_id": employee.team_id,
            "team_name": (
                employee.team.name
                if employee.team
                else None
            ),
            "role": employee.role,
            "status": employee.status,
            "total_days": 0,
            "present_days": 0,
            "absent_days": 0,
            "late_days": 0,
            "attendance_rate": 0,
        }

    for record in attendance_records:

        employee_stat = employee_stats.get(
            record.employee_id
        )

        if employee_stat is None:
            continue

        employee_stat["total_days"] += 1

        status = (
            record.status or ""
        ).lower()

        if status == "present":
            employee_stat["present_days"] += 1

        elif status == "absent":
            employee_stat["absent_days"] += 1

        elif status == "late":
            employee_stat["late_days"] += 1

    for employee_stat in employee_stats.values():

        total_days = employee_stat["total_days"]

        if total_days > 0:
            employee_stat["attendance_rate"] = round(
                (
                    employee_stat["present_days"]
                    / total_days
                )
                * 100,
                2,
            )


    employee_performance = sorted(
        employee_stats.values(),
        key=lambda item: (
            item["attendance_rate"],
            item["present_days"],
        ),
        reverse=True,
    )


    # =========================================================
    # TEAM PERFORMANCE
    # =========================================================

    team_stats = []

    for team in teams:

        team_employee_ids = [
            employee.id
            for employee in employees
            if employee.team_id == team.id
        ]

        team_attendance = [
            record
            for record in attendance_records
            if record.employee_id
            in team_employee_ids
        ]

        team_present = sum(
            1
            for record in team_attendance
            if (record.status or "").lower()
            == "present"
        )

        team_absent = sum(
            1
            for record in team_attendance
            if (record.status or "").lower()
            == "absent"
        )

        team_late = sum(
            1
            for record in team_attendance
            if (record.status or "").lower()
            == "late"
        )

        team_total_attendance = len(
            team_attendance
        )

        team_attendance_rate = (
            round(
                (
                    team_present
                    / team_total_attendance
                )
                * 100,
                2,
            )
            if team_total_attendance > 0
            else 0
        )

        team_leave_records = [
            leave
            for leave in leave_records
            if leave.employee_id
            in team_employee_ids
        ]

        team_pending_leaves = sum(
            1
            for leave in team_leave_records
            if (leave.status or "").lower()
            == "pending"
        )

        team_stats.append(
            {
                "team_id": team.id,
                "team_name": team.name,
                "employee_count": len(
                    team_employee_ids
                ),
                "attendance_records": (
                    team_total_attendance
                ),
                "present": team_present,
                "absent": team_absent,
                "late": team_late,
                "attendance_rate": (
                    team_attendance_rate
                ),
                "pending_leaves": (
                    team_pending_leaves
                ),
            }
        )


    # =========================================================
    # RECENT ATTENDANCE
    # =========================================================

    recent_attendance = []

    for record in attendance_records[:15]:

        employee = employee_map.get(
            record.employee_id
        )

        if employee is None:
            continue

        recent_attendance.append(
            {
                "attendance_id": record.id,
                "employee_id": employee.id,
                "employee_name": employee.name,
                "team_name": (
                    employee.team.name
                    if employee.team
                    else None
                ),
                "date": record.date,
                "check_in": record.check_in,
                "check_out": record.check_out,
                "status": record.status,
            }
        )


    # =========================================================
    # RESULT
    # =========================================================

    return {
        "summary": {
            "total_employees": total_employees,
            "active_employees": active_employees,
            "inactive_employees": inactive_employees,
            "total_attendance_records": (
                total_attendance
            ),
            "present": present_count,
            "absent": absent_count,
            "late": late_count,
            "other_attendance": (
                other_attendance_count
            ),
            "attendance_rate": attendance_rate,
            "total_leaves": total_leaves,
            "pending_leaves": pending_leaves,
            "approved_leaves": approved_leaves,
            "rejected_leaves": rejected_leaves,
            "total_payroll": total_payroll,
            "paid_payroll": paid_payroll,
            "pending_payroll": pending_payroll,
        },

        "teams": team_stats,

        "employees": employee_performance,

        "recent_attendance": recent_attendance,
    }