from pydantic import BaseModel, EmailStr


class EmployeeLoginRequest(BaseModel):
    email: EmailStr
    password: str


class EmployeeToken(BaseModel):
    access_token: str
    token_type: str