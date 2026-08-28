from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.database.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    slug = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    email = Column(
        String,
        nullable=False,
    )

    phone = Column(String)

    address = Column(String)

    subscription_plan = Column(
        String,
        default="Starter",
    )

    status = Column(
        String,
        default="Active",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    employees = relationship(
        "Employee",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    roles = relationship(
        "Role",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    teams = relationship(
        "Team",
        back_populates="company",
        cascade="all, delete-orphan",
    )