from datetime import date as Date, time as Time

from pydantic import BaseModel


class ManagerAttendanceResponse(BaseModel):
    attendance_id: int

    employee_id: int
    employee_name: str

    team_id: int | None = None
    team_name: str | None = None

    date: Date

    check_in: Time | None = None
    check_out: Time | None = None

    status: str