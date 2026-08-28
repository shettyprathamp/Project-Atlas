from app.models.company import Company
from app.models.role import Role
from app.models.employee import Employee
from app.database.database import SessionLocal

db = SessionLocal()

try:
    employee = (
        db.query(Employee)
        .filter(Employee.email == "rahul.sharma@atlastech.com")
        .first()
    )

    if employee is None:
        print("Employee not found.")
    else:
        employee.password_hash = "$2b$12$ZQpyFYCMdQV86Z3puyF12uZKAHJj3eBdx5dNYWvrhUHbcIy1m.ta2"

        db.commit()

        print("Rahul password updated successfully.")
        print("Email: rahul.sharma@atlastech.com")

finally:
    db.close()