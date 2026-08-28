from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.payroll import Payroll
from app.schemas.payroll import (
    PayrollCreate,
    PayrollUpdate,
)


def calculate_payroll(
    basic_salary,
    allowances,
    bonus,
    overtime,
    other_earnings,
    tax_deduction,
    provident_fund,
    other_deductions,
):
    total_earnings = (
        basic_salary
        + allowances
        + bonus
        + overtime
        + other_earnings
    )

    total_deductions = (
        tax_deduction
        + provident_fund
        + other_deductions
    )

    net_salary = (
        total_earnings
        - total_deductions
    )

    return (
        total_earnings,
        total_deductions,
        net_salary,
    )


# =========================================
# GET ALL PAYROLL
# =========================================

def get_all_payroll(db: Session):
    return (
        db.query(Payroll)
        .order_by(
            Payroll.year.desc(),
            Payroll.month.desc(),
            Payroll.id.desc(),
        )
        .all()
    )


# =========================================
# GET PAYROLL BY ID
# =========================================

def get_payroll_by_id(
    db: Session,
    payroll_id: int,
):
    return (
        db.query(Payroll)
        .filter(
            Payroll.id == payroll_id
        )
        .first()
    )


# =========================================
# GET EMPLOYEE PAYROLL
# =========================================

def get_employee_payroll(
    db: Session,
    employee_id: int,
):
    return (
        db.query(Payroll)
        .filter(
            Payroll.employee_id == employee_id
        )
        .order_by(
            Payroll.year.desc(),
            Payroll.month.desc(),
            Payroll.id.desc(),
        )
        .all()
    )


# =========================================
# CREATE PAYROLL
# =========================================

def create_payroll(
    db: Session,
    payroll_data: PayrollCreate,
):
    # Check employee exists
    employee = (
        db.query(Employee)
        .filter(
            Employee.id == payroll_data.employee_id
        )
        .first()
    )

    if employee is None:
        raise ValueError(
            "Employee not found."
        )

    # Prevent duplicate payroll
    existing = (
        db.query(Payroll)
        .filter(
            Payroll.employee_id
            == payroll_data.employee_id,
            Payroll.month
            == payroll_data.month,
            Payroll.year
            == payroll_data.year,
        )
        .first()
    )

    if existing is not None:
        raise ValueError(
            "Payroll already exists for this employee and period."
        )

    (
        total_earnings,
        total_deductions,
        net_salary,
    ) = calculate_payroll(
        payroll_data.basic_salary,
        payroll_data.allowances,
        payroll_data.bonus,
        payroll_data.overtime,
        payroll_data.other_earnings,
        payroll_data.tax_deduction,
        payroll_data.provident_fund,
        payroll_data.other_deductions,
    )

    payroll = Payroll(
        employee_id=payroll_data.employee_id,

        month=payroll_data.month,
        year=payroll_data.year,

        basic_salary=payroll_data.basic_salary,
        allowances=payroll_data.allowances,
        bonus=payroll_data.bonus,
        overtime=payroll_data.overtime,
        other_earnings=payroll_data.other_earnings,

        tax_deduction=payroll_data.tax_deduction,
        provident_fund=payroll_data.provident_fund,
        other_deductions=payroll_data.other_deductions,

        total_earnings=total_earnings,
        total_deductions=total_deductions,
        net_salary=net_salary,

        status=payroll_data.status,

        payment_date=payroll_data.payment_date,
        payment_method=payroll_data.payment_method,

        notes=payroll_data.notes,
    )

    db.add(payroll)
    db.commit()
    db.refresh(payroll)

    return payroll


# =========================================
# UPDATE PAYROLL
# =========================================

def update_payroll(
    db: Session,
    payroll: Payroll,
    payroll_data: PayrollUpdate,
):
    update_data = payroll_data.model_dump(
        exclude_unset=True
    )

    # Check duplicate period if month/year changed
    new_month = update_data.get(
        "month",
        payroll.month,
    )

    new_year = update_data.get(
        "year",
        payroll.year,
    )

    existing = (
        db.query(Payroll)
        .filter(
            Payroll.employee_id
            == payroll.employee_id,
            Payroll.month
            == new_month,
            Payroll.year
            == new_year,
            Payroll.id
            != payroll.id,
        )
        .first()
    )

    if existing is not None:
        raise ValueError(
            "Another payroll record already exists for this employee and period."
        )

    for field, value in update_data.items():
        setattr(
            payroll,
            field,
            value,
        )

    (
        total_earnings,
        total_deductions,
        net_salary,
    ) = calculate_payroll(
        payroll.basic_salary,
        payroll.allowances,
        payroll.bonus,
        payroll.overtime,
        payroll.other_earnings,
        payroll.tax_deduction,
        payroll.provident_fund,
        payroll.other_deductions,
    )

    payroll.total_earnings = total_earnings
    payroll.total_deductions = total_deductions
    payroll.net_salary = net_salary

    db.commit()
    db.refresh(payroll)

    return payroll


# =========================================
# DELETE PAYROLL
# =========================================

def delete_payroll(
    db: Session,
    payroll: Payroll,
):
    db.delete(payroll)
    db.commit()


# =========================================
# MARK AS PAID
# =========================================

def mark_payroll_paid(
    db: Session,
    payroll: Payroll,
    payment_date=None,
    payment_method=None,
):
    payroll.status = "Paid"

    if payment_date is not None:
        payroll.payment_date = payment_date

    if payment_method is not None:
        payroll.payment_method = payment_method

    db.commit()
    db.refresh(payroll)

    return payroll