from fastapi import APIRouter, Depends

from app.models.admin import Admin
from app.security.dependencies import get_current_admin

router = APIRouter(tags=["Protected"])


@router.get("/me")
def get_me(
    current_admin: Admin = Depends(get_current_admin),
):
    return {
        "id": current_admin.id,
        "username": current_admin.username,
        "email": current_admin.email,
    }