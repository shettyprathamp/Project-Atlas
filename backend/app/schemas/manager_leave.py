from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ManagerLeaveResponse(BaseModel):
    leave_id: int

    employee_id: int
    employee_name: str
    employee_email: str

    team_id: int | None = None
    team_name: str | None = None

    department: str | None = None

    leave_type: str

    start_date: date
    end_date: date

    total_days: int

    reason: str | None = None

    status: str

    created_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


class LeaveStatusResponse(BaseModel):
    message: str
    leave_id: int
    status: str