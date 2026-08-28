from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.base import Base
from app.database.database import engine


# =========================================================
# MODELS
# =========================================================

from app.models.admin import Admin
from app.models.company import Company
from app.models.employee import Employee
from app.models.role import Role
from app.models.team import Team
from app.models.attendance import Attendance
from app.models.recruitment import Recruitment
from app.models.payroll import Payroll
from app.models.payroll_change_request import PayrollChangeRequest


# =========================================================
# ROUTERS
# =========================================================

from app.routers import setup
from app.routers import auth
from app.routers import protected
from app.routers import company
from app.routers import employee
from app.routers import employee_auth
from app.routers import role
from app.routers import attendance
from app.routers import recruitment
from app.routers import payroll
from app.routers import employee_portal
from app.routers import team
from app.routers import performance
from app.routers import manager_attendance
from app.routers import manager_leave
from app.routers import leave
from app.routers import payroll_change_request


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Project Atlas API",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================
#
# Atlas runs in different environments:
#
# Browser development:
#   http://localhost:5173
#   http://127.0.0.1:5173
#
# Electron production:
#   http://127.0.0.1:<random-port>
#
# The Electron port is intentionally random, so we use
# allow_origin_regex for localhost/127.0.0.1 with any port.
#
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://127.0.0.1",
    ],

    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(setup.router)
app.include_router(auth.router)
app.include_router(protected.router)
app.include_router(company.router)
app.include_router(employee_auth.router)
app.include_router(employee.router)
app.include_router(role.router)
app.include_router(attendance.router)
app.include_router(recruitment.router)
app.include_router(employee_portal.router)
app.include_router(payroll.router)
app.include_router(team.router)
app.include_router(performance.router)
app.include_router(manager_attendance.router)
app.include_router(manager_leave.router)
app.include_router(leave.router)

# Payroll change requests
app.include_router(
    payroll_change_request.router
)


# =========================================================
# DEFAULT ROUTE
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to Project Atlas Backend!",
        "status": "running",
    }