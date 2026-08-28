from app.database.database import SessionLocal
from app.models.admin import Admin
from app.security.hashing import hash_password


EMAIL = "shettyprathamp147@gmail.com"
PASSWORD = "Admin123"


def create_or_reset_admin():
    db = SessionLocal()

    try:
        admin = (
            db.query(Admin)
            .filter(Admin.email == EMAIL)
            .first()
        )

        if admin:
            admin.password_hash = hash_password(PASSWORD)

            db.commit()
            db.refresh(admin)

            print("Admin password reset successfully.")
            print(f"Email: {EMAIL}")
            print(f"Password: {PASSWORD}")

        else:
            admin = Admin(
                email=EMAIL,
                password_hash=hash_password(PASSWORD),
            )

            db.add(admin)
            db.commit()
            db.refresh(admin)

            print("Admin created successfully.")
            print(f"Email: {EMAIL}")
            print(f"Password: {PASSWORD}")

    finally:
        db.close()


if __name__ == "__main__":
    create_or_reset_admin()