from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=True,
    )

    team_id = Column(
        Integer,
        ForeignKey("teams.id"),
        nullable=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
    )

    password_hash = Column(
        String,
        nullable=False,
    )

    role = Column(
        String,
        default="Employee",
    )

    department = Column(String)

    status = Column(
        String,
        default="Active",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    company = relationship(
        "Company",
        back_populates="employees",
    )

    role_relation = relationship(
        "Role",
        back_populates="employees",
    )

    team = relationship(
        "Team",
        back_populates="employees",
    )

    attendance_records = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    leaves = relationship(
        "Leave",
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    payroll_records = relationship(
        "Payroll",
        back_populates="employee",
        cascade="all, delete-orphan",
    )