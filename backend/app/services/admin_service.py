from sqlalchemy.orm import Session

from app.models.admin import Admin
from app.security.hashing import hash_password


def create_first_admin(
    db: Session,
    username: str,
    email: str,
    password: str,
):
    existing_admin = db.query(Admin).first()

    if existing_admin:
        return None

    admin = Admin(
        username=username,
        email=email,
        password_hash=hash_password(password),
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin