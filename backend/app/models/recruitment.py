from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database.base import Base


class Recruitment(Base):
    __tablename__ = "recruitments"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    candidate_name = Column(
        String,
        nullable=False,
    )

    email = Column(
        String,
        nullable=False,
    )

    phone = Column(
        String,
        nullable=True,
    )

    position = Column(
        String,
        nullable=False,
    )

    department = Column(
        String,
        nullable=True,
    )

    experience = Column(
        String,
        nullable=True,
    )

    resume = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        default="Applied",
        nullable=False,
    )

    notes = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )