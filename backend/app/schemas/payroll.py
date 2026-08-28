from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PayrollBase(BaseModel):
    employee_id: int = Field(gt=0)

    month: int = Field(
        ge=1,
        le=12,
    )

    year: int = Field(
        ge=2000,
        le=2100,
    )

    basic_salary: float = Field(
        default=0,
        ge=0,
    )

    allowances: float = Field(
        default=0,
        ge=0,
    )

    bonus: float = Field(
        default=0,
        ge=0,
    )

    overtime: float = Field(
        default=0,
        ge=0,
    )

    other_earnings: float = Field(
        default=0,
        ge=0,
    )

    tax_deduction: float = Field(
        default=0,
        ge=0,
    )

    provident_fund: float = Field(
        default=0,
        ge=0,
    )

    other_deductions: float = Field(
        default=0,
        ge=0,
    )

    status: str = "Pending"

    payment_date: date | None = None

    payment_method: str | None = None

    notes: str | None = None


class PayrollCreate(PayrollBase):
    pass


class PayrollUpdate(BaseModel):
    month: int | None = Field(
        default=None,
        ge=1,
        le=12,
    )

    year: int | None = Field(
        default=None,
        ge=2000,
        le=2100,
    )

    basic_salary: float | None = Field(
        default=None,
        ge=0,
    )

    allowances: float | None = Field(
        default=None,
        ge=0,
    )

    bonus: float | None = Field(
        default=None,
        ge=0,
    )

    overtime: float | None = Field(
        default=None,
        ge=0,
    )

    other_earnings: float | None = Field(
        default=None,
        ge=0,
    )

    tax_deduction: float | None = Field(
        default=None,
        ge=0,
    )

    provident_fund: float | None = Field(
        default=None,
        ge=0,
    )

    other_deductions: float | None = Field(
        default=None,
        ge=0,
    )

    status: str | None = None

    payment_date: date | None = None

    payment_method: str | None = None

    notes: str | None = None


class PayrollResponse(PayrollBase):
    id: int

    total_earnings: float

    total_deductions: float

    net_salary: float

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )