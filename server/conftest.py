import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import main
import models
from auth import get_current_user
from database import Base, get_db


@pytest.fixture(autouse=True)
def test_db(tmp_path, monkeypatch, request):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False)

    def override_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    main.app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(main, "UPLOAD_DIR", tmp_path)

    if "real_auth" not in request.keywords:
        db = TestingSession()
        db.add(models.User(username="tester", password_hash="x"))
        db.commit()
        db.close()

        def override_user():
            db = TestingSession()
            try:
                return db.query(models.User).filter_by(username="tester").one()
            finally:
                db.close()

        main.app.dependency_overrides[get_current_user] = override_user

    yield TestingSession
    main.app.dependency_overrides.clear()