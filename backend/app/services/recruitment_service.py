from sqlalchemy.orm import Session

from app.models.recruitment import Recruitment
from app.schemas.recruitment import (
    RecruitmentCreate,
    RecruitmentUpdate,
)


def get_all_recruitments(db: Session):
    return (
        db.query(Recruitment)
        .order_by(Recruitment.created_at.desc())
        .all()
    )


def get_recruitment_by_id(
    db: Session,
    recruitment_id: int,
):
    return (
        db.query(Recruitment)
        .filter(
            Recruitment.id == recruitment_id
        )
        .first()
    )


def create_recruitment(
    db: Session,
    recruitment_data: RecruitmentCreate,
):
    recruitment = Recruitment(
        **recruitment_data.model_dump()
    )

    db.add(recruitment)
    db.commit()
    db.refresh(recruitment)

    return recruitment


def update_recruitment(
    db: Session,
    recruitment: Recruitment,
    recruitment_data: RecruitmentUpdate,
):
    update_data = recruitment_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(
            recruitment,
            key,
            value,
        )

    db.commit()
    db.refresh(recruitment)

    return recruitment


def delete_recruitment(
    db: Session,
    recruitment: Recruitment,
):
    db.delete(recruitment)
    db.commit()

    return recruitment