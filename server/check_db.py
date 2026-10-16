from sqlalchemy import text

from database import engine

with engine.connect() as conn:
    print("Connected:", conn.execute(text("SELECT version()")).scalar())
