from sqlalchemy.orm import Session

from app.models.company import Company


def create_company(
    db: Session,
    name: str,
    slug: str,
    email: str,
    phone: str,
    address: str,
    subscription_plan: str,
):
    existing_company = (
        db.query(Company)
        .filter(Company.slug == slug)
        .first()
    )

    if existing_company:
        return None

    company = Company(
        name=name,
        slug=slug,
        email=email,
        phone=phone,
        address=address,
        subscription_plan=subscription_plan,
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    return company


def get_all_companies(db: Session):
    return db.query(Company).all()


def get_company_by_id(
    db: Session,
    company_id: int,
):
    return (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )


def update_company(
    db: Session,
    company_id: int,
    company_data,
):
    company = (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )

    if company is None:
        return None

    company.name = company_data.name
    company.slug = company_data.slug
    company.email = company_data.email
    company.phone = company_data.phone
    company.address = company_data.address
    company.subscription_plan = company_data.subscription_plan
    company.status = company_data.status

    db.commit()
    db.refresh(company)

    return company


def delete_company(
    db: Session,
    company_id: int,
):
    company = (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )

    if company is None:
        return False

    db.delete(company)
    db.commit()

    return True