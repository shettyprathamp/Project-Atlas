from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.security.hashing import hash_password


def create_employee(
    db: Session,
    company_id: int,
    name: str,
    email: str,
    password: str,
    role: str,
    department: str,
):
    existing = (
        db.query(Employee)
        .filter(Employee.email == email)
        .first()
    )

    if existing:
        return None

    employee = Employee(
        company_id=company_id,
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=role,
        department=department,
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


def get_all_employees(db: Session):
    return db.query(Employee).all()


def get_employee_by_id(
    db: Session,
    employee_id: int,
):
    return (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )


def update_employee(
    db: Session,
    employee_id: int,
    employee_data,
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if employee is None:
        return None

    # Check whether another employee already uses this email
    existing = (
        db.query(Employee)
        .filter(
            Employee.email == employee_data.email,
            Employee.id != employee_id,
        )
        .first()
    )

    if existing:
        raise ValueError(
            "Employee email already exists."
        )

    employee.name = employee_data.name
    employee.email = employee_data.email
    employee.role = employee_data.role
    employee.department = employee_data.department
    employee.status = employee_data.status

    db.commit()
    db.refresh(employee)

    return employee


def delete_employee(
    db: Session,
    employee_id: int,
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if employee is None:
        return None

    db.delete(employee)
    db.commit()

    return employee