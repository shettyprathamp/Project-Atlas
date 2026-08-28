from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.manager_leave import (
    ManagerLeaveResponse,
    LeaveStatusResponse,
)

from app.security.employee_dependencies import (
    get_current_manager,
)

from app.services.manager_leave_service import (
    get_manager_leave_requests,
    get_manager_leave_by_id,
    update_leave_status,
)


router = APIRouter(
    prefix="/manager/leave",
    tags=["Manager Leave"],
)


# =========================================================
# GET EMPLOYEE LEAVE REQUESTS
#
# Manager sees employee requests only.
#
# Manager's own leave is excluded.
# =========================================================

@router.get(
    "/",
    response_model=list[ManagerLeaveResponse],
)
def list_manager_leave_requests(
    db: Session = Depends(get_db),
    current_manager=Depends(
        get_current_manager
    ),
):
    return get_manager_leave_requests(
        db=db,
        company_id=current_manager.company_id,
        manager_id=current_manager.id,
    )


# =========================================================
# GET SINGLE EMPLOYEE LEAVE REQUEST
# =========================================================

@router.get(
    "/{leave_id}",
    response_model=ManagerLeaveResponse,
)
def get_manager_leave_request(
    leave_id: int,
    db: Session = Depends(get_db),
    current_manager=Depends(
        get_current_manager
    ),
):
    leave = get_manager_leave_by_id(
        db=db,
        leave_id=leave_id,
        company_id=current_manager.company_id,
        manager_id=current_manager.id,
    )

    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found.",
        )

    return leave


# =========================================================
# APPROVE EMPLOYEE LEAVE
# =========================================================

@router.patch(
    "/{leave_id}/approve",
    response_model=LeaveStatusResponse,
)
def approve_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_manager=Depends(
        get_current_manager
    ),
):
    leave = get_manager_leave_by_id(
        db=db,
        leave_id=leave_id,
        company_id=current_manager.company_id,
        manager_id=current_manager.id,
    )

    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found.",
        )

    if leave["status"].lower() != "pending":
        raise HTTPException(
            status_code=400,
            detail=(
                "Only pending leave requests "
                "can be approved."
            ),
        )

    updated = update_leave_status(
        db=db,
        leave_id=leave_id,
        company_id=current_manager.company_id,
        manager_id=current_manager.id,
        status="Approved",
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found.",
        )

    return {
        "message": (
            "Leave request approved successfully."
        ),
        "leave_id": updated.id,
        "status": updated.status,
    }


# =========================================================
# REJECT EMPLOYEE LEAVE
# =========================================================

@router.patch(
    "/{leave_id}/reject",
    response_model=LeaveStatusResponse,
)
def reject_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_manager=Depends(
        get_current_manager
    ),
):
    leave = get_manager_leave_by_id(
        db=db,
        leave_id=leave_id,
        company_id=current_manager.company_id,
        manager_id=current_manager.id,
    )

    if leave is None:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found.",
        )

    if leave["status"].lower() != "pending":
        raise HTTPException(
            status_code=400,
            detail=(
                "Only pending leave requests "
                "can be rejected."
            ),
        )

    updated = update_leave_status(
        db=db,
        leave_id=leave_id,
        company_id=current_manager.company_id,
        manager_id=current_manager.id,
        status="Rejected",
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found.",
        )

    return {
        "message": (
            "Leave request rejected successfully."
        ),
        "leave_id": updated.id,
        "status": updated.status,
    }