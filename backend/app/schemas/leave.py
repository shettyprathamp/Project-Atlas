from datetime import date

from pydantic import BaseModel, ConfigDict


class LeaveCreate(BaseModel):
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str | None = None


class LeaveUpdate(BaseModel):
    leave_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    reason: str | None = None
    status: str | None = None


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str | None = None
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )