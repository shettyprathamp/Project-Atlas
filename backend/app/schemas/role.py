from pydantic import BaseModel


class RoleCreate(BaseModel):
    company_id: int
    name: str
    description: str | None = None


class RoleUpdate(BaseModel):
    name: str
    description: str | None = None


class RoleResponse(BaseModel):
    id: int
    company_id: int
    name: str
    description: str | None

    class Config:
        from_attributes = True