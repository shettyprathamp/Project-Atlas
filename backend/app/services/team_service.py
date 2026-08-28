from sqlalchemy.orm import Session

from app.models.team import Team
from app.models.employee import Employee


def create_team(
    db: Session,
    company_id: int,
    name: str,
    description: str | None,
):
    existing = (
        db.query(Team)
        .filter(
            Team.company_id == company_id,
            Team.name == name,
        )
        .first()
    )

    if existing:
        return None

    team = Team(
        company_id=company_id,
        name=name.strip(),
        description=(
            description.strip()
            if description
            else None
        ),
    )

    db.add(team)
    db.commit()
    db.refresh(team)

    return team


def get_all_teams(
    db: Session,
    company_id: int,
):
    return (
        db.query(Team)
        .filter(
            Team.company_id == company_id
        )
        .order_by(Team.id.asc())
        .all()
    )


def get_team_by_id(
    db: Session,
    team_id: int,
    company_id: int,
):
    return (
        db.query(Team)
        .filter(
            Team.id == team_id,
            Team.company_id == company_id,
        )
        .first()
    )


def update_team(
    db: Session,
    team_id: int,
    company_id: int,
    team_data,
):
    team = get_team_by_id(
        db,
        team_id,
        company_id,
    )

    if team is None:
        return None

    existing = (
        db.query(Team)
        .filter(
            Team.company_id == company_id,
            Team.name == team_data.name,
            Team.id != team_id,
        )
        .first()
    )

    if existing:
        raise ValueError(
            "A team with this name already exists."
        )

    team.name = team_data.name.strip()
    team.description = (
        team_data.description.strip()
        if team_data.description
        else None
    )

    db.commit()
    db.refresh(team)

    return team


def delete_team(
    db: Session,
    team_id: int,
    company_id: int,
):
    team = get_team_by_id(
        db,
        team_id,
        company_id,
    )

    if team is None:
        return None

    # Employees are not deleted when their team is deleted.
    # Their team assignment is simply removed.
    for employee in team.employees:
        employee.team_id = None

    db.delete(team)
    db.commit()

    return team


def assign_employee_to_team(
    db: Session,
    employee_id: int,
    team_id: int,
    company_id: int,
):
    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_id,
            Employee.company_id == company_id,
        )
        .first()
    )

    if employee is None:
        return None, "employee"

    team = get_team_by_id(
        db,
        team_id,
        company_id,
    )

    if team is None:
        return None, "team"

    employee.team_id = team.id

    db.commit()
    db.refresh(employee)

    return employee, None


def remove_employee_from_team(
    db: Session,
    employee_id: int,
    company_id: int,
):
    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_id,
            Employee.company_id == company_id,
        )
        .first()
    )

    if employee is None:
        return None

    employee.team_id = None

    db.commit()
    db.refresh(employee)

    return employee