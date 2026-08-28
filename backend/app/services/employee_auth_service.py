from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.security.hashing import verify_password
from app.security.auth import create_access_token


def login_employee(
    db: Session,
    email: str,
    password: str,
):
    employee = (
        db.query(Employee)
        .filter(Employee.email == email)
        .first()
    )

    if employee is None:
        return None

    if not verify_password(
        password,
        employee.password_hash,
    ):
        return None

    token = create_access_token(
        {
            "sub": employee.email,
            "employee_id": employee.id,
            "company_id": employee.company_id,
            "role": employee.role,
            "user_type": "employee",
        }
    )

    return token