from datetime import datetime

from pydantic import BaseModel


class RecruitmentCreate(BaseModel):
    candidate_name: str
    email: str
    phone: str | None = None
    position: str
    department: str | None = None
    experience: str | None = None
    resume: str | None = None
    status: str = "Applied"
    notes: str | None = None


class RecruitmentUpdate(BaseModel):
    candidate_name: str | None = None
    email: str | None = None
    phone: str | None = None
    position: str | None = None
    department: str | None = None
    experience: str | None = None
    resume: str | None = None
    status: str | None = None
    notes: str | None = None


class RecruitmentResponse(BaseModel):
    id: int
    candidate_name: str
    email: str
    phone: str | None
    position: str
    department: str | None
    experience: str | None
    resume: str | None
    status: str
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True