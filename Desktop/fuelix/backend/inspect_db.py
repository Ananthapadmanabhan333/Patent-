from sqlalchemy import create_engine, inspect
from app.core.config import settings

# Adjust DB URL if needed, assuming sqlite:///./fuelix.db based on config
SQLALCHEMY_DATABASE_URL = "sqlite:///./fuelix.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
inspector = inspect(engine)

print("Tables:", inspector.get_table_names())

if "users" in inspector.get_table_names():
    print("\nColumns in 'users' table:")
    columns = inspector.get_columns("users")
    for column in columns:
        print(f"- {column['name']} ({column['type']})")
else:
    print("'users' table not found.")
