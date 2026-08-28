from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class PayrollChangeRequestCreate(BaseModel):
    payroll_id: int = Field(gt=0)

    field_name: str = Field(
        min_length=1,
        max_length=100,
    )

    proposed_value: float = Field(
        ge=0,
    )

    reason: str = Field(
        min_length=1,
        max_length=1000,
    )


class PayrollChangeRequestReview(BaseModel):
    review_comment: str | None = Field(
        default=None,
        max_length=1000,
    )


class PayrollChangeRequestResponse(BaseModel):
    id: int

    payroll_id: int

    employee_id: int

    requested_by: int

    reviewed_by: int | None

    field_name: str

    current_value: float

    proposed_value: float

    reason: str

    status: str

    review_comment: str | None

    created_at: datetime

    reviewed_at: datetime | None

    model_config = ConfigDict(
        from_attributes=True
    )