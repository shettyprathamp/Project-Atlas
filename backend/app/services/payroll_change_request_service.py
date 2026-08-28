from datetime import datetime

from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.payroll import Payroll
from app.models.payroll_change_request import (
    PayrollChangeRequest,
)

from app.schemas.payroll_change_request import (
    PayrollChangeRequestCreate,
)


# =========================================================
# ALLOWED PAYROLL FIELDS
# =========================================================

ALLOWED_FIELDS = {
    "basic_salary",
    "allowances",
    "bonus",
    "overtime",
    "other_earnings",
    "tax_deduction",
    "provident_fund",
    "other_deductions",
}


# =========================================================
# GET PAYROLL CHANGE REQUEST
# =========================================================

def get_request_by_id(
    db: Session,
    request_id: int,
):
    return (
        db.query(PayrollChangeRequest)
        .filter(
            PayrollChangeRequest.id
            == request_id
        )
        .first()
    )


# =========================================================
# MANAGER REQUESTS
# =========================================================

def get_manager_requests(
    db: Session,
    manager_id: int,
):
    return (
        db.query(PayrollChangeRequest)
        .filter(
            PayrollChangeRequest.requested_by
            == manager_id
        )
        .order_by(
            PayrollChangeRequest.created_at.desc()
        )
        .all()
    )


# =========================================================
# HR REQUESTS
# =========================================================

def get_hr_requests(
    db: Session,
    company_id: int,
    status: str | None = None,
):
    query = (
        db.query(PayrollChangeRequest)
        .join(
            Employee,
            Employee.id
            == PayrollChangeRequest.employee_id,
        )
        .filter(
            Employee.company_id
            == company_id
        )
    )

    if status:
        query = query.filter(
            PayrollChangeRequest.status
            == status
        )

    return (
        query
        .order_by(
            PayrollChangeRequest.created_at.desc()
        )
        .all()
    )


# =========================================================
# CREATE REQUEST
# =========================================================

def create_change_request(
    db: Session,
    manager: Employee,
    request_data: PayrollChangeRequestCreate,
):
    # -----------------------------------------------------
    # Validate field
    # -----------------------------------------------------

    field_name = (
        request_data.field_name.strip()
    )

    if field_name not in ALLOWED_FIELDS:
        raise ValueError(
            "This payroll field cannot be changed through a manager request."
        )

    # -----------------------------------------------------
    # Find payroll
    # -----------------------------------------------------

    payroll = (
        db.query(Payroll)
        .filter(
            Payroll.id
            == request_data.payroll_id
        )
        .first()
    )

    if payroll is None:
        raise ValueError(
            "Payroll record not found."
        )

    # -----------------------------------------------------
    # Make sure payroll employee belongs
    # to manager's company
    # -----------------------------------------------------

    employee = (
        db.query(Employee)
        .filter(
            Employee.id
            == payroll.employee_id
        )
        .first()
    )

    if employee is None:
        raise ValueError(
            "Payroll employee not found."
        )

    if (
        employee.company_id
        != manager.company_id
    ):
        raise ValueError(
            "You cannot request changes for employees outside your company."
        )

    # -----------------------------------------------------
    # Do not allow duplicate pending requests
    # for the same payroll field
    # -----------------------------------------------------

    existing = (
        db.query(PayrollChangeRequest)
        .filter(
            PayrollChangeRequest.payroll_id
            == payroll.id,

            PayrollChangeRequest.field_name
            == field_name,

            PayrollChangeRequest.status
            == "Pending",
        )
        .first()
    )

    if existing is not None:
        raise ValueError(
            "A pending request already exists for this payroll field."
        )

    # -----------------------------------------------------
    # Current value
    # -----------------------------------------------------

    current_value = getattr(
        payroll,
        field_name,
        None,
    )

    if current_value is None:
        raise ValueError(
            "Invalid payroll field."
        )

    # -----------------------------------------------------
    # Do not create unnecessary request
    # -----------------------------------------------------

    if float(current_value) == float(
        request_data.proposed_value
    ):
        raise ValueError(
            "The proposed value is the same as the current value."
        )

    # -----------------------------------------------------
    # Create request
    # -----------------------------------------------------

    request = PayrollChangeRequest(
        payroll_id=payroll.id,

        employee_id=payroll.employee_id,

        requested_by=manager.id,

        field_name=field_name,

        current_value=float(
            current_value
        ),

        proposed_value=float(
            request_data.proposed_value
        ),

        reason=request_data.reason.strip(),

        status="Pending",
    )

    db.add(request)
    db.commit()
    db.refresh(request)

    return request


# =========================================================
# APPROVE REQUEST
# =========================================================

def approve_change_request(
    db: Session,
    request: PayrollChangeRequest,
    hr_employee: Employee,
    review_comment: str | None = None,
):
    if request.status != "Pending":
        raise ValueError(
            "Only pending requests can be approved."
        )

    payroll = (
        db.query(Payroll)
        .filter(
            Payroll.id
            == request.payroll_id
        )
        .first()
    )

    if payroll is None:
        raise ValueError(
            "Payroll record no longer exists."
        )

    employee = (
        db.query(Employee)
        .filter(
            Employee.id
            == request.employee_id
        )
        .first()
    )

    if employee is None:
        raise ValueError(
            "Employee no longer exists."
        )

    if (
        employee.company_id
        != hr_employee.company_id
    ):
        raise ValueError(
            "You cannot approve requests outside your company."
        )

    # -----------------------------------------------------
    # Verify payroll has not changed since request
    # -----------------------------------------------------

    current_value = getattr(
        payroll,
        request.field_name,
        None,
    )

    if current_value is None:
        raise ValueError(
            "Payroll field no longer exists."
        )

    if float(current_value) != float(
        request.current_value
    ):
        raise ValueError(
            "The payroll value has changed since this request was created. Please create a new request."
        )

    # -----------------------------------------------------
    # Apply approved change
    # -----------------------------------------------------

    setattr(
        payroll,
        request.field_name,
        request.proposed_value,
    )

    # -----------------------------------------------------
    # Recalculate payroll totals
    # -----------------------------------------------------

    payroll.total_earnings = (
        payroll.basic_salary
        + payroll.allowances
        + payroll.bonus
        + payroll.overtime
        + payroll.other_earnings
    )

    payroll.total_deductions = (
        payroll.tax_deduction
        + payroll.provident_fund
        + payroll.other_deductions
    )

    payroll.net_salary = (
        payroll.total_earnings
        - payroll.total_deductions
    )

    # -----------------------------------------------------
    # Update request
    # -----------------------------------------------------

    request.status = "Approved"

    request.reviewed_by = hr_employee.id

    request.review_comment = review_comment

    request.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(request)

    return request


# =========================================================
# REJECT REQUEST
# =========================================================

def reject_change_request(
    db: Session,
    request: PayrollChangeRequest,
    hr_employee: Employee,
    review_comment: str | None = None,
):
    if request.status != "Pending":
        raise ValueError(
            "Only pending requests can be rejected."
        )

    employee = (
        db.query(Employee)
        .filter(
            Employee.id
            == request.employee_id
        )
        .first()
    )

    if employee is None:
        raise ValueError(
            "Employee no longer exists."
        )

    if (
        employee.company_id
        != hr_employee.company_id
    ):
        raise ValueError(
            "You cannot reject requests outside your company."
        )

    request.status = "Rejected"

    request.reviewed_by = hr_employee.id

    request.review_comment = review_comment

    request.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(request)

    return request