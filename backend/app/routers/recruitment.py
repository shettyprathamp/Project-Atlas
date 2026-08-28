from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.recruitment import (
    RecruitmentCreate,
    RecruitmentUpdate,
    RecruitmentResponse,
)

from app.services.recruitment_service import (
    get_all_recruitments,
    get_recruitment_by_id,
    create_recruitment,
    update_recruitment,
    delete_recruitment,
)


router = APIRouter(
    prefix="/recruitment",
    tags=["Recruitment"],
)


@router.get(
    "/",
    response_model=list[RecruitmentResponse],
)
def read_recruitments(
    db: Session = Depends(get_db),
):
    return get_all_recruitments(db)


@router.get(
    "/{recruitment_id}",
    response_model=RecruitmentResponse,
)
def read_recruitment(
    recruitment_id: int,
    db: Session = Depends(get_db),
):
    recruitment = get_recruitment_by_id(
        db,
        recruitment_id,
    )

    if recruitment is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    return recruitment


@router.post(
    "/",
    response_model=RecruitmentResponse,
)
def create_recruitment_request(
    recruitment_data: RecruitmentCreate,
    db: Session = Depends(get_db),
):
    return create_recruitment(
        db,
        recruitment_data,
    )


@router.put(
    "/{recruitment_id}",
    response_model=RecruitmentResponse,
)
def update_recruitment_request(
    recruitment_id: int,
    recruitment_data: RecruitmentUpdate,
    db: Session = Depends(get_db),
):
    recruitment = get_recruitment_by_id(
        db,
        recruitment_id,
    )

    if recruitment is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    return update_recruitment(
        db,
        recruitment,
        recruitment_data,
    )


@router.delete(
    "/{recruitment_id}",
)
def remove_recruitment(
    recruitment_id: int,
    db: Session = Depends(get_db),
):
    recruitment = get_recruitment_by_id(
        db,
        recruitment_id,
    )

    if recruitment is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    delete_recruitment(
        db,
        recruitment,
    )

    return {
        "message": "Candidate deleted successfully"
    }