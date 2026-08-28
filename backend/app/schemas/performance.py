from datetime import date, time

from pydantic import BaseModel


class PerformanceSummary(BaseModel):
    total_employees: int
    active_employees: int
    inactive_employees: int

    total_attendance_records: int

    present: int
    absent: int
    late: int
    other_attendance: int

    attendance_rate: float

    total_leaves: int
    pending_leaves: int
    approved_leaves: int
    rejected_leaves: int

    total_payroll: float
    paid_payroll: float
    pending_payroll: float


class TeamPerformance(BaseModel):
    team_id: int
    team_name: str

    employee_count: int
    attendance_records: int

    present: int
    absent: int
    late: int

    attendance_rate: float

    pending_leaves: int


class EmployeePerformance(BaseModel):
    employee_id: int
    employee_name: str

    team_id: int | None
    team_name: str | None

    role: str | None
    status: str | None

    total_days: int
    present_days: int
    absent_days: int
    late_days: int

    attendance_rate: float


class RecentAttendance(BaseModel):
    attendance_id: int
    employee_id: int
    employee_name: str
    team_name: str | None

    date: date
    check_in: time | None
    check_out: time | None

    status: str


class PerformanceResponse(BaseModel):
    summary: PerformanceSummary
    teams: list[TeamPerformance]
    employees: list[EmployeePerformance]
    recent_attendance: list[RecentAttendance]