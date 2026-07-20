from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.admin import Admin
from app.security.auth import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    admin_id = payload.get("admin_id")

    if admin_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    admin = db.query(Admin).filter(
        Admin.id == admin_id
    ).first()

    if admin is None:
        raise HTTPException(
            status_code=401,
            detail="Administrator not found",
        )

    return admin