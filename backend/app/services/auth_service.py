from sqlalchemy.orm import Session

from app.models.admin import Admin
from app.security.hashing import verify_password
from app.security.auth import create_access_token


def login_admin(
    db: Session,
    email: str,
    password: str,
):
    admin = db.query(Admin).filter(
        Admin.email == email
    ).first()

    if not admin:
        return None

    if not verify_password(
        password,
        admin.password_hash
    ):
        return None

    token = create_access_token(
        {
            "sub": admin.email,
            "admin_id": admin.id,
        }
    )

    return token