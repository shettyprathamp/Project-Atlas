from datetime import datetime

from pydantic import BaseModel


# =========================================================
# CREATE TEAM
# =========================================================

class TeamCreate(BaseModel):
    name: str
    description: str | None = None


# =========================================================
# UPDATE TEAM
# =========================================================

class TeamUpdate(BaseModel):
    name: str
    description: str | None = None


# =========================================================
# EMPLOYEE INSIDE TEAM
# =========================================================

class TeamEmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str | None
    status: str
    team_id: int | None

    class Config:
        from_attributes = True


# =========================================================
# BASIC TEAM RESPONSE
# =========================================================

class TeamResponse(BaseModel):
    id: int
    company_id: int
    name: str
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# TEAM DETAIL RESPONSE
# =========================================================

class TeamDetailResponse(BaseModel):
    id: int
    company_id: int
    name: str
    description: str | None
    created_at: datetime
    employees: list[TeamEmployeeResponse]

    class Config:
        from_attributes = True


# =========================================================
# ASSIGN EMPLOYEE TO TEAM
# =========================================================

class TeamAssignEmployee(BaseModel):
    employee_id: int