
import sqlite3

from sqlalchemy import create_engine, inspect, text


# =========================================================
# DATABASE URLs
# =========================================================

SQLITE_DATABASE = "project_atlas.db"

POSTGRES_URL = input(
    "Paste PostgreSQL External Database URL: "
).strip()

if not POSTGRES_URL:
    raise RuntimeError(
        "PostgreSQL URL was not provided."
    )

# Render may provide postgres:// URLs.
# SQLAlchemy expects postgresql://.
if POSTGRES_URL.startswith("postgres://"):
    POSTGRES_URL = POSTGRES_URL.replace(
        "postgres://",
        "postgresql://",
        1,
    )


# =========================================================
# SQLITE CONNECTION
# =========================================================

print("\nConnecting to SQLite...")

sqlite_connection = sqlite3.connect(
    SQLITE_DATABASE
)

sqlite_connection.row_factory = sqlite3.Row

sqlite_cursor = sqlite_connection.cursor()

print("SQLite connected.")


# =========================================================
# POSTGRESQL CONNECTION
# =========================================================

print("\nConnecting to PostgreSQL...")

postgres_engine = create_engine(
    POSTGRES_URL,
    pool_pre_ping=True,
)

# Test PostgreSQL connection.
with postgres_engine.connect() as connection:
    connection.execute(text("SELECT 1"))

print("PostgreSQL connected.")


# =========================================================
# IMPORT ATLAS MODELS
# =========================================================

print("\nLoading Atlas models...")

from app.database.base import Base

from app.models.admin import Admin
from app.models.company import Company
from app.models.employee import Employee
from app.models.role import Role
from app.models.team import Team
from app.models.attendance import Attendance
from app.models.leave import Leave
from app.models.recruitment import Recruitment
from app.models.payroll import Payroll
from app.models.payroll_change_request import (
    PayrollChangeRequest
)

print("Atlas models loaded.")


# =========================================================
# CREATE POSTGRESQL TABLES
# =========================================================

print("\nCreating PostgreSQL tables...")

Base.metadata.create_all(
    bind=postgres_engine
)

print("PostgreSQL tables created.")


# =========================================================
# FIND SQLITE TABLES
# =========================================================

tables = sqlite_cursor.execute(
    """
    SELECT name
    FROM sqlite_master
    WHERE type='table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
    """
).fetchall()

sqlite_tables = [
    row["name"]
    for row in tables
]

print("\nSQLite tables found:")

for table in sqlite_tables:
    print(f"  - {table}")


# =========================================================
# MIGRATION ORDER
#
# IMPORTANT:
# Parent tables must be migrated before child tables.
#
# companies -> roles/teams/employees
# employees -> attendance/payroll
# payrolls + employees -> payroll_change_requests
# =========================================================

preferred_order = [
    "admins",
    "companies",
    "roles",
    "teams",
    "employees",
    "attendance",
    "leaves",
    "recruitments",
    "payrolls",
    "payroll_change_requests",
]


# Only migrate tables that actually exist in SQLite.
table_names = [
    table
    for table in preferred_order
    if table in sqlite_tables
]

# Add any unexpected tables at the end.
for table in sqlite_tables:
    if table not in table_names:
        table_names.append(table)


# =========================================================
# POSTGRES INSPECTOR
# =========================================================

postgres_inspector = inspect(
    postgres_engine
)


# =========================================================
# CLEAR EXISTING DATA
#
# This makes the migration safe to re-run after a failed
# attempt. We only delete data from the Atlas tables.
# =========================================================

print("\nPreparing PostgreSQL tables...")

existing_postgres_tables = set(
    postgres_inspector.get_table_names()
)

tables_to_clear = [
    table
    for table in table_names
    if table in existing_postgres_tables
]


# Delete child tables first so foreign keys do not block us.
delete_order = list(reversed(table_names))

with postgres_engine.begin() as connection:

    for table_name in delete_order:

        if table_name not in existing_postgres_tables:
            continue

        try:
            connection.execute(
                text(
                    f'DELETE FROM "{table_name}"'
                )
            )

        except Exception as error:

            print(
                f"Warning: could not clear "
                f"{table_name}: {error}"
            )

print("PostgreSQL tables prepared.")


# =========================================================
# DATA MIGRATION
# =========================================================

print("\n========================================")
print("STARTING DATABASE MIGRATION")
print("========================================\n")


for table_name in table_names:

    print(f"Migrating: {table_name}")

    # -----------------------------------------------------
    # Get SQLite columns
    # -----------------------------------------------------

    sqlite_columns = sqlite_cursor.execute(
        f'PRAGMA table_info("{table_name}")'
    ).fetchall()

    if not sqlite_columns:

        print(
            "  Skipped: no columns found."
        )

        continue

    column_names = [
        column["name"]
        for column in sqlite_columns
    ]


    # -----------------------------------------------------
    # Get SQLite rows
    # -----------------------------------------------------

    rows = sqlite_cursor.execute(
        f'SELECT * FROM "{table_name}"'
    ).fetchall()

    if not rows:

        print(
            "  No rows."
        )

        continue


    # -----------------------------------------------------
    # Get PostgreSQL columns
    # -----------------------------------------------------

    try:

        postgres_columns = {
            column["name"]
            for column in postgres_inspector.get_columns(
                table_name
            )
        }

    except Exception as error:

        print(
            f"  Skipped: could not inspect "
            f"PostgreSQL table: {error}"
        )

        continue


    # -----------------------------------------------------
    # Only migrate columns that exist in PostgreSQL
    # -----------------------------------------------------

    usable_columns = [
        column
        for column in column_names
        if column in postgres_columns
    ]

    if not usable_columns:

        print(
            "  Skipped: no matching PostgreSQL columns."
        )

        continue


    # -----------------------------------------------------
    # Build INSERT query
    # -----------------------------------------------------

    quoted_columns = ", ".join(
        f'"{column}"'
        for column in usable_columns
    )

    parameter_names = ", ".join(
        f":{column}"
        for column in usable_columns
    )

    insert_sql = text(
        f"""
        INSERT INTO "{table_name}"
        ({quoted_columns})
        VALUES
        ({parameter_names})
        """
    )


    # -----------------------------------------------------
    # Insert rows individually
    #
    # Each row gets its own transaction.
    # This is important because PostgreSQL aborts a
    # transaction after a failed statement.
    # -----------------------------------------------------

    inserted = 0
    failed = 0

    for row in rows:

        data = {
            column: row[column]
            for column in usable_columns
        }

        try:

            with postgres_engine.begin() as connection:

                connection.execute(
                    insert_sql,
                    data
                )

            inserted += 1

        except Exception as error:

            failed += 1

            print(
                f"  Warning: could not insert row "
                f"into {table_name}: {error}"
            )


    print(
        f"  Inserted {inserted} row(s)."
    )

    if failed:

        print(
            f"  Failed {failed} row(s)."
        )


# =========================================================
# RESET POSTGRESQL SEQUENCES
#
# SQLite IDs are manually copied. PostgreSQL sequences
# therefore need to be moved past the highest existing ID.
# =========================================================

print("\nResetting PostgreSQL ID sequences...")

sequence_tables = [
    table
    for table in table_names
    if table in existing_postgres_tables
]


for table_name in sequence_tables:

    try:

        columns = postgres_inspector.get_columns(
            table_name
        )

        has_id = any(
            column["name"] == "id"
            for column in columns
        )

        if not has_id:
            continue


        with postgres_engine.begin() as connection:

            result = connection.execute(
                text(
                    f'''
                    SELECT setval(
                        pg_get_serial_sequence(
                            '"{table_name}"',
                            'id'
                        ),
                        COALESCE(
                            (SELECT MAX(id)
                             FROM "{table_name}"),
                            1
                        ),
                        true
                    )
                    '''
                )
            )


    except Exception as error:

        print(
            f"  Warning: could not reset "
            f"{table_name} sequence: {error}"
        )


print("Sequences reset.")


# =========================================================
# VERIFY DATA
# =========================================================

print("\n========================================")
print("MIGRATION SUMMARY")
print("========================================\n")


for table_name in table_names:

    if table_name not in existing_postgres_tables:
        continue

    try:

        with postgres_engine.connect() as connection:

            result = connection.execute(
                text(
                    f'SELECT COUNT(*) '
                    f'FROM "{table_name}"'
                )
            )

            count = result.scalar()

        print(
            f"{table_name}: {count} row(s)"
        )

    except Exception as error:

        print(
            f"{table_name}: verification failed - "
            f"{error}"
        )


# =========================================================
# CLOSE SQLITE
# =========================================================

sqlite_connection.close()


# =========================================================
# FINISHED
# =========================================================

print("\n========================================")
print("DATABASE MIGRATION FINISHED")
print("========================================")
print("\nYour SQLite data has been migrated to PostgreSQL.")
