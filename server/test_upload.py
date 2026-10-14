import io

from fastapi.testclient import TestClient
from PIL import Image

import main

client = TestClient(main.app)


def make_image_bytes(fmt="PNG", size=(120, 80)):
    buf = io.BytesIO()
    Image.new("RGB", size, "red").save(buf, format=fmt)
    return buf.getvalue()


def test_upload_valid_png():
    r = client.post(
        "/upload",
        files={"file": ("shirt.png", make_image_bytes("PNG"), "image/png")},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["filename"] == "shirt.png"
    assert body["width"] == 120
    assert body["height"] == 80


def test_upload_valid_jpeg():
    r = client.post(
        "/upload",
        files={"file": ("shirt.jpg", make_image_bytes("JPEG"), "image/jpeg")},
    )
    assert r.status_code == 200


def test_upload_rejects_non_image_type():
    r = client.post(
        "/upload",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "File must be an image"


def test_upload_rejects_corrupt_image():
    r = client.post(
        "/upload",
        files={"file": ("fake.png", b"not really an image", "image/png")},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Could not read image"


def test_upload_rejects_oversized_image(monkeypatch):
    monkeypatch.setattr(main, "MAX_SIZE", 100)  # 100 bytes
    r = client.post(
        "/upload",
        files={"file": ("big.png", make_image_bytes("PNG"), "image/png")},
    )
    assert r.status_code == 413


def test_upload_missing_file():
    r = client.post("/upload")
    assert r.status_code == 422