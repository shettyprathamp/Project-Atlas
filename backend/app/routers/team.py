from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.employee import Employee

from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamDetailResponse,
    TeamEmployeeResponse,
    TeamAssignEmployee,
)

from app.security.employee_dependencies import (
    get_current_manager,
)

from app.services.team_service import (
    create_team,
    get_all_teams,
    get_team_by_id,
    update_team,
    delete_team,
    assign_employee_to_team,
    remove_employee_from_team,
)


router = APIRouter(
    prefix="/manager/teams",
    tags=["Manager Teams"],
)


# =========================================================
# GET ALL TEAMS
# =========================================================

@router.get(
    "/",
    response_model=list[TeamResponse],
)
def list_teams(
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    return get_all_teams(
        db=db,
        company_id=current_manager.company_id,
    )


# =========================================================
# GET SINGLE TEAM
# =========================================================

@router.get(
    "/{team_id}",
    response_model=TeamDetailResponse,
)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    team = get_team_by_id(
        db=db,
        team_id=team_id,
        company_id=current_manager.company_id,
    )

    if team is None:
        raise HTTPException(
            status_code=404,
            detail="Team not found.",
        )

    return team


# =========================================================
# CREATE TEAM
# =========================================================

@router.post(
    "/",
    response_model=TeamResponse,
)
def create_new_team(
    team_data: TeamCreate,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    try:
        team = create_team(
            db=db,
            company_id=current_manager.company_id,
            name=team_data.name,
            description=team_data.description,
        )

        if team is None:
            raise HTTPException(
                status_code=400,
                detail="A team with this name already exists.",
            )

        return team

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# =========================================================
# UPDATE TEAM
# =========================================================

@router.put(
    "/{team_id}",
    response_model=TeamResponse,
)
def update_existing_team(
    team_id: int,
    team_data: TeamUpdate,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    try:
        team = update_team(
            db=db,
            team_id=team_id,
            company_id=current_manager.company_id,
            team_data=team_data,
        )

        if team is None:
            raise HTTPException(
                status_code=404,
                detail="Team not found.",
            )

        return team

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# =========================================================
# DELETE TEAM
# =========================================================

@router.delete(
    "/{team_id}",
)
def remove_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    team = delete_team(
        db=db,
        team_id=team_id,
        company_id=current_manager.company_id,
    )

    if team is None:
        raise HTTPException(
            status_code=404,
            detail="Team not found.",
        )

    return {
        "message": "Team deleted successfully.",
    }


# =========================================================
# GET EMPLOYEES
# =========================================================

@router.get(
    "/{team_id}/employees",
    response_model=list[TeamEmployeeResponse],
)
def get_team_employees(
    team_id: int,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    team = get_team_by_id(
        db=db,
        team_id=team_id,
        company_id=current_manager.company_id,
    )

    if team is None:
        raise HTTPException(
            status_code=404,
            detail="Team not found.",
        )

    return (
        db.query(Employee)
        .filter(
            Employee.team_id == team_id,
            Employee.company_id == current_manager.company_id,
        )
        .order_by(Employee.id.asc())
        .all()
    )


# =========================================================
# ASSIGN EMPLOYEE TO TEAM
# =========================================================

@router.post(
    "/{team_id}/employees",
    response_model=TeamEmployeeResponse,
)
def assign_employee(
    team_id: int,
    assignment: TeamAssignEmployee,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    employee, error_type = assign_employee_to_team(
        db=db,
        employee_id=assignment.employee_id,
        team_id=team_id,
        company_id=current_manager.company_id,
    )

    if employee is None:

        if error_type == "employee":
            raise HTTPException(
                status_code=404,
                detail="Employee not found.",
            )

        if error_type == "team":
            raise HTTPException(
                status_code=404,
                detail="Team not found.",
            )

        raise HTTPException(
            status_code=400,
            detail="Unable to assign employee.",
        )

    return employee


# =========================================================
# REMOVE EMPLOYEE FROM TEAM
# =========================================================

@router.delete(
    "/{team_id}/employees/{employee_id}",
    response_model=TeamEmployeeResponse,
)
def remove_employee(
    team_id: int,
    employee_id: int,
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    team = get_team_by_id(
        db=db,
        team_id=team_id,
        company_id=current_manager.company_id,
    )

    if team is None:
        raise HTTPException(
            status_code=404,
            detail="Team not found.",
        )

    employee = remove_employee_from_team(
        db=db,
        employee_id=employee_id,
        company_id=current_manager.company_id,
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found.",
        )

    return employee