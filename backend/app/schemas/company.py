from pydantic import BaseModel, EmailStr


class CompanyCreate(BaseModel):
    name: str
    slug: str
    email: EmailStr
    phone: str | None = None
    address: str | None = None
    subscription_plan: str = "Starter"


class CompanyUpdate(BaseModel):
    name: str
    slug: str
    email: EmailStr
    phone: str | None = None
    address: str | None = None
    subscription_plan: str
    status: str


class CompanyResponse(BaseModel):
    id: int
    name: str
    slug: str
    email: EmailStr
    phone: str | None
    address: str | None
    subscription_plan: str
    status: str

    class Config:
        from_attributes = True