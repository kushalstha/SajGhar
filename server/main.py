import io
import time

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image, ImageOps
from rembg import new_session, remove
from starlette.concurrency import run_in_threadpool

app = FastAPI(title="SajGhar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)

MAX_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_DIM = 1024

session = new_session("u2net")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
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
    elapsed = time.perf_counter() - start

    return Response(
        content=buf.getvalue(),
        media_type="image/png",
        headers={"X-Process-Time": f"{elapsed:.2f}"},
    )