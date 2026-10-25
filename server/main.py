import io
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps
from pydantic import BaseModel, Field, field_validator
from rembg import new_session, remove
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

import models
from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from database import Base, engine, get_db

MAX_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_DIM = 1024
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="SajGhar API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time", "X-Item-Id"],
)

# Files have random unguessable names, so <img> tags can load them
# without an auth header.
app.mount("/files", StaticFiles(directory="uploads"), name="files")

session = new_session("u2net")


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=64)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, v):
        if len(v.encode()) > 72:  # bcrypt's hard limit
            raise ValueError("Password too long")
        return v


def item_to_dict(item: models.WardrobeItem) -> dict:
    return {
        "id": item.id,
        "original_name": item.original_name,
        "image_url": f"/files/{item.image_path}",
        "process_time": item.process_time,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


# ---------- Health ----------
@app.get("/health")
def health():
    return {"status": "ok"}


# ---------- Auth ----------
@app.post("/auth/register", status_code=201)
def register(body: Credentials, db: Session = Depends(get_db)):
    username = body.username.strip().lower()
    if db.query(models.User).filter(models.User.username == username).first():
        raise HTTPException(status_code=409, detail="Username already taken")

    user = models.User(username=username, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username}


@app.post("/auth/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    username = form.username.strip().lower()
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None or not verify_password(form.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": create_access_token(user.id), "token_type": "bearer"}


@app.get("/auth/me")
def me(user: models.User = Depends(get_current_user)):
    return {"id": user.id, "username": user.username}


# ---------- Upload (protected) ----------
@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="Image larger than 10 MB")

    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
        img = Image.open(io.BytesIO(data))
        img = ImageOps.exif_transpose(img).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image")

    start = time.perf_counter()

    img.thumbnail((MAX_DIM, MAX_DIM))
    result = await run_in_threadpool(remove, img, session=session)

    buf = io.BytesIO()
    result.save(buf, format="PNG")
    png_bytes = buf.getvalue()
    elapsed = time.perf_counter() - start

    filename = f"{uuid.uuid4().hex}.png"
    (UPLOAD_DIR / filename).write_bytes(png_bytes)

    item = models.WardrobeItem(
        user_id=user.id,
        original_name=file.filename,
        image_path=filename,
        process_time=round(elapsed, 2),
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={
            "X-Process-Time": f"{elapsed:.2f}",
            "X-Item-Id": str(item.id),
        },
    )


# ---------- Items (protected, per user) ----------
@app.get("/items")
def list_items(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    items = (
        db.query(models.WardrobeItem)
        .filter(models.WardrobeItem.user_id == user.id)
        .order_by(models.WardrobeItem.id.desc())
        .all()
    )
    return [item_to_dict(i) for i in items]


@app.delete("/items/{item_id}", status_code=204)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    item = (
        db.query(models.WardrobeItem)
        .filter(
            models.WardrobeItem.id == item_id,
            models.WardrobeItem.user_id == user.id,
        )
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    (UPLOAD_DIR / item.image_path).unlink(missing_ok=True)
    db.delete(item)
    db.commit()
    return Response(status_code=204)