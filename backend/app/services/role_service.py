from sqlalchemy.orm import Session

from app.models.role import Role


def create_role(
    db: Session,
    company_id: int,
    name: str,
    description: str | None,
):
    existing = (
        db.query(Role)
        .filter(
            Role.company_id == company_id,
            Role.name == name,
        )
        .first()
    )

    if existing:
        return None

    role = Role(
        company_id=company_id,
        name=name,
        description=description,
    )

    db.add(role)
    db.commit()
    db.refresh(role)

    return role


def get_all_roles(db: Session):
    return db.query(Role).all()


def get_role_by_id(
    db: Session,
    role_id: int,
):
    return (
        db.query(Role)
        .filter(Role.id == role_id)
        .first()
    )


def update_role(
    db: Session,
    role_id: int,
    role_data,
):
    role = (
        db.query(Role)
        .filter(Role.id == role_id)
        .first()
    )

    if role is None:
        return None

    role.name = role_data.name
    role.description = role_data.description

    db.commit()
    db.refresh(role)

    return role


def delete_role(
    db: Session,
    role_id: int,
):
    role = (
        db.query(Role)
        .filter(Role.id == role_id)
        .first()
    )

    if role is None:
        return None

    db.delete(role)
    db.commit()

    return role