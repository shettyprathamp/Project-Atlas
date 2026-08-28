from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
)
from app.security.dependencies import get_current_admin
from app.services.role_service import (
    create_role,
    get_all_roles,
    get_role_by_id,
    update_role,
    delete_role,
)

router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
)


@router.post(
    "/",
    response_model=RoleResponse,
)
def create_new_role(
    role: RoleCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    created = create_role(
        db=db,
        company_id=role.company_id,
        name=role.name,
        description=role.description,
    )

    if created is None:
        raise HTTPException(
            status_code=400,
            detail="Role already exists for this company.",
        )

    return created


@router.get(
    "/",
    response_model=list[RoleResponse],
)
def list_roles(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    return get_all_roles(db)


@router.get(
    "/{role_id}",
    response_model=RoleResponse,
)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    role = get_role_by_id(
        db,
        role_id,
    )

    if role is None:
        raise HTTPException(
            status_code=404,
            detail="Role not found.",
        )

    return role


@router.put(
    "/{role_id}",
    response_model=RoleResponse,
)
def update_existing_role(
    role_id: int,
    role: RoleUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    updated = update_role(
        db,
        role_id,
        role,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Role not found.",
        )

    return updated


@router.delete(
    "/{role_id}",
)
def delete_existing_role(
    role_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    deleted = delete_role(
        db,
        role_id,
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Role not found.",
        )

    return {
        "message": "Role deleted successfully."
    }