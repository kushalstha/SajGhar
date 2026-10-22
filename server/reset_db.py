import models  # noqa: F401
from database import Base, engine

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Tables recreated:", list(Base.metadata.tables.keys()))