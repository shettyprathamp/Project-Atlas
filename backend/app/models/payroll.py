from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.database.base import Base


class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    month = Column(
        Integer,
        nullable=False,
    )

    year = Column(
        Integer,
        nullable=False,
    )

    basic_salary = Column(
        Float,
        default=0,
        nullable=False,
    )

    allowances = Column(
        Float,
        default=0,
        nullable=False,
    )

    bonus = Column(
        Float,
        default=0,
        nullable=False,
    )

    overtime = Column(
        Float,
        default=0,
        nullable=False,
    )

    other_earnings = Column(
        Float,
        default=0,
        nullable=False,
    )

    tax_deduction = Column(
        Float,
        default=0,
        nullable=False,
    )

    provident_fund = Column(
        Float,
        default=0,
        nullable=False,
    )

    other_deductions = Column(
        Float,
        default=0,
        nullable=False,
    )

    total_earnings = Column(
        Float,
        default=0,
        nullable=False,
    )

    total_deductions = Column(
        Float,
        default=0,
        nullable=False,
    )

    net_salary = Column(
        Float,
        default=0,
        nullable=False,
    )

    status = Column(
        String,
        default="Pending",
        nullable=False,
    )

    payment_date = Column(
        Date,
        nullable=True,
    )

    payment_method = Column(
        String,
        nullable=True,
    )

    notes = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    employee = relationship(
        "Employee",
        back_populates="payroll_records",
    )