from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    date = Column(
        Date,
        nullable=False,
    )

    check_in = Column(
        Time,
        nullable=True,
    )

    check_out = Column(
        Time,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Present",
    )

    employee = relationship(
        "Employee",
        back_populates="attendance_records",
    )