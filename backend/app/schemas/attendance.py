from datetime import date as Date, time as Time

from pydantic import BaseModel, ConfigDict


class AttendanceCreate(BaseModel):
    employee_id: int
    date: Date
    check_in: Time | None = None
    check_out: Time | None = None
    status: str = "Present"


class AttendanceUpdate(BaseModel):
    date: Date | None = None
    check_in: Time | None = None
    check_out: Time | None = None
    status: str | None = None


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: Date
    check_in: Time | None
    check_out: Time | None
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )