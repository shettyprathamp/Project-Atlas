from pydantic import BaseModel, EmailStr


class EmployeeCreate(BaseModel):
    company_id: int
    name: str
    email: EmailStr
    password: str
    role: str = "Employee"
    department: str | None = None


class EmployeeUpdate(BaseModel):
    name: str
    email: EmailStr
    role: str
    department: str | None = None
    status: str


class EmployeeProfileUpdate(BaseModel):
    name: str
    email: EmailStr
    department: str | None = None


class EmployeeResponse(BaseModel):
    id: int
    company_id: int
    name: str
    email: EmailStr
    role: str
    department: str | None
    status: str

    class Config:
        from_attributes = True


class EmployeeProfile(BaseModel):
    id: int
    company_id: int
    name: str
    email: EmailStr
    role: str
    department: str | None
    status: str

    class Config:
        from_attributes = True