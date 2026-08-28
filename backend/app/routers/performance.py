from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.security.employee_dependencies import (
    get_current_manager,
)

from app.schemas.performance import (
    PerformanceResponse,
)

from app.services.performance_service import (
    get_manager_performance,
)


router = APIRouter(
    prefix="/manager/performance",
    tags=["Manager Performance"],
)


# =========================================================
# GET MANAGER PERFORMANCE
# =========================================================

@router.get(
    "/",
    response_model=PerformanceResponse,
)
def get_performance(
    db: Session = Depends(get_db),
    current_manager=Depends(get_current_manager),
):
    return get_manager_performance(
        db=db,
        company_id=current_manager.company_id,
    )