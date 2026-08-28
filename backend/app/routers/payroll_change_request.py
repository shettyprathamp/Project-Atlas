from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.payroll_change_request import (
    PayrollChangeRequestCreate,
    PayrollChangeRequestReview,
    PayrollChangeRequestResponse,
)

from app.security.employee_dependencies import (
    get_current_manager,
    get_current_hr,
)

from app.services.payroll_change_request_service import (
    get_request_by_id,
    get_manager_requests,
    get_hr_requests,
    create_change_request,
    approve_change_request,
    reject_change_request,
)


router = APIRouter(
    tags=["Payroll Change Requests"],
)


# =========================================================
# MANAGER
# CREATE PAYROLL CHANGE REQUEST
# =========================================================

@router.post(
    "/manager/payroll-requests",
    response_model=PayrollChangeRequestResponse,
)
def request_payroll_change(
    request_data: PayrollChangeRequestCreate,
    db: Session = Depends(get_db),
    current_manager=Depends(
        get_current_manager
    ),
):
    try:
        return create_change_request(
            db=db,
            manager=current_manager,
            request_data=request_data,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# =========================================================
# MANAGER
# VIEW OWN REQUESTS
# =========================================================

@router.get(
    "/manager/payroll-requests",
    response_model=list[
        PayrollChangeRequestResponse
    ],
)
def read_manager_payroll_requests(
    db: Session = Depends(get_db),
    current_manager=Depends(
        get_current_manager
    ),
):
    return get_manager_requests(
        db=db,
        manager_id=current_manager.id,
    )


# =========================================================
# HR
# VIEW PAYROLL CHANGE REQUESTS
# =========================================================

@router.get(
    "/hr/payroll-requests",
    response_model=list[
        PayrollChangeRequestResponse
    ],
)
def read_hr_payroll_requests(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_hr=Depends(
        get_current_hr
    ),
):
    return get_hr_requests(
        db=db,
        company_id=current_hr.company_id,
        status=status,
    )


# =========================================================
# HR
# APPROVE REQUEST
# =========================================================

@router.patch(
    "/hr/payroll-requests/{request_id}/approve",
    response_model=PayrollChangeRequestResponse,
)
def approve_payroll_change(
    request_id: int,
    review_data: PayrollChangeRequestReview,
    db: Session = Depends(get_db),
    current_hr=Depends(
        get_current_hr
    ),
):
    request = get_request_by_id(
        db,
        request_id,
    )

    if request is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll change request not found.",
        )

    try:
        return approve_change_request(
            db=db,
            request=request,
            hr_employee=current_hr,
            review_comment=(
                review_data.review_comment
            ),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# =========================================================
# HR
# REJECT REQUEST
# =========================================================

@router.patch(
    "/hr/payroll-requests/{request_id}/reject",
    response_model=PayrollChangeRequestResponse,
)
def reject_payroll_change(
    request_id: int,
    review_data: PayrollChangeRequestReview,
    db: Session = Depends(get_db),
    current_hr=Depends(
        get_current_hr
    ),
):
    request = get_request_by_id(
        db,
        request_id,
    )

    if request is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll change request not found.",
        )

    try:
        return reject_change_request(
            db=db,
            request=request,
            hr_employee=current_hr,
            review_comment=(
                review_data.review_comment
            ),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )