from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.database.base import Base


class PayrollChangeRequest(Base):
    __tablename__ = "payroll_change_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    payroll_id = Column(
        Integer,
        ForeignKey("payrolls.id"),
        nullable=False,
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    requested_by = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    reviewed_by = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True,
    )

    field_name = Column(
        String,
        nullable=False,
    )

    current_value = Column(
        Float,
        nullable=False,
    )

    proposed_value = Column(
        Float,
        nullable=False,
    )

    reason = Column(
        String,
        nullable=False,
    )

    status = Column(
        String,
        default="Pending",
        nullable=False,
    )

    review_comment = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    reviewed_at = Column(
        DateTime,
        nullable=True,
    )

    payroll = relationship(
        "Payroll",
    )

    employee = relationship(
        "Employee",
        foreign_keys=[employee_id],
    )

    requester = relationship(
        "Employee",
        foreign_keys=[requested_by],
    )

    reviewer = relationship(
        "Employee",
        foreign_keys=[reviewed_by],
    )