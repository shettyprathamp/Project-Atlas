from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.company import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
)
from app.security.dependencies import get_current_admin
from app.services.company_service import (
    create_company,
    get_all_companies,
    get_company_by_id,
    update_company,
    delete_company,
)

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)


@router.post(
    "/",
    response_model=CompanyResponse,
)
def create_new_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    created_company = create_company(
        db=db,
        name=company.name,
        slug=company.slug,
        email=company.email,
        phone=company.phone,
        address=company.address,
        subscription_plan=company.subscription_plan,
    )

    if created_company is None:
        raise HTTPException(
            status_code=400,
            detail="Company slug already exists.",
        )

    return created_company


@router.get(
    "/",
    response_model=list[CompanyResponse],
)
def list_companies(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    return get_all_companies(db)


@router.get(
    "/{company_id}",
    response_model=CompanyResponse,
)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    company = get_company_by_id(
        db,
        company_id,
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found.",
        )

    return company


@router.put(
    "/{company_id}",
    response_model=CompanyResponse,
)
def update_existing_company(
    company_id: int,
    company: CompanyUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    updated_company = update_company(
        db,
        company_id,
        company,
    )

    if updated_company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found.",
        )

    return updated_company


@router.delete("/{company_id}")
def delete_existing_company(
    company_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    deleted = delete_company(
        db,
        company_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Company not found.",
        )

    return {
        "message": "Company deleted successfully."
    }