from pydantic import BaseModel, EmailStr


class AdminSetup(BaseModel):
    username: str
    email: EmailStr
    password: str