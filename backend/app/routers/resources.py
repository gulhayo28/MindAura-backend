# app/routers/resources.py
# Bu faylni app/routers/ papkasiga qo'ying
# main.py ga qo'shing: from app.routers import resources
#                       app.include_router(resources.router, prefix="/resources", tags=["Resources"])

import os
import math
import shutil
from pathlib import Path
from typing import Optional, List

from fastapi import (
    APIRouter, Depends, HTTPException, UploadFile,
    File, Form, Query
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.resource_models import Resource, Category, ContentType  # pastda yaratamiz

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "files").mkdir(exist_ok=True)
(UPLOAD_DIR / "covers").mkdir(exist_ok=True)

MAX_FILE_MB = 50
ALLOWED_FILE_TYPES = {"application/pdf", "application/epub+zip"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


# ─── Yordamchi ───────────────────────────────────────────────────────────────

def save_file(upload: UploadFile, folder: str) -> tuple[str, int]:
    filename = f"{os.urandom(8).hex()}_{upload.filename}"
    dest = UPLOAD_DIR / folder / filename
    total = 0
    with open(dest, "wb") as f:
        while chunk := upload.file.read(1024 * 1024):
            total += len(chunk)
            if total > MAX_FILE_MB * 1024 * 1024:
                os.remove(dest)
                raise HTTPException(400, f"Fayl {MAX_FILE_MB}MB dan oshmasin")
            f.write(chunk)
    return str(dest), total // 1024


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/")
def list_resources(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    category: Optional[str] = None,
    content_type: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("newest", pattern="^(newest|popular|title)$"),
    db: Session = Depends(get_db),
):
    from app.resource_models import Resource
    q = db.query(Resource).filter(Resource.is_published == True)

    if category:
        q = q.filter(Resource.category == category)
    if content_type:
        q = q.filter(Resource.content_type == content_type)
    if search:
        q = q.filter(
            Resource.title.ilike(f"%{search}%") |
            Resource.description.ilike(f"%{search}%") |
            Resource.author.ilike(f"%{search}%")
        )

    if sort_by == "popular":
        q = q.order_by(Resource.download_count.desc())
    elif sort_by == "title":
        q = q.order_by(Resource.title)
    else:
        q = q.order_by(Resource.created_at.desc())

    total = q.count()
    items = q.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [resource_to_dict(r) for r in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page) if total > 0 else 1,
    }


@router.get("/{resource_id}")
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    from app.resource_models import Resource
    r = db.query(Resource).filter(Resource.id == resource_id, Resource.is_published == True).first()
    if not r:
        raise HTTPException(404, "Resurs topilmadi")
    r.view_count = (r.view_count or 0) + 1
    db.commit()
    return resource_to_dict(r)


@router.post("/", status_code=201)
def create_resource(
    title: str = Form(...),
    description: str = Form(""),
    author: str = Form(""),
    content_type: str = Form(...),   # book | guide | article
    category: str = Form(...),       # anxiety | self_growth | relationships | therapy | other
    language: str = Form("uz"),
    is_published: bool = Form(False),
    is_featured: bool = Form(False),
    file: Optional[UploadFile] = File(None),
    cover: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Faqat admin qo'sha oladi
    if current_user.role != "admin":
        raise HTTPException(403, "Admin huquqi kerak")

    from app.resource_models import Resource
    resource = Resource(
        title=title,
        description=description,
        author=author,
        content_type=content_type,
        category=category,
        language=language,
        is_published=is_published,
        is_featured=is_featured,
        uploaded_by=current_user.id,
    )

    if file:
        if file.content_type not in ALLOWED_FILE_TYPES:
            raise HTTPException(400, "Faqat PDF yoki EPUB qabul qilinadi")
        path, size_kb = save_file(file, "files")
        resource.file_path = path
        resource.file_size_kb = size_kb

        # PDF sahifalar sonini hisoblash
        if file.content_type == "application/pdf":
            try:
                import PyPDF2
                with open(path, "rb") as f:
                    resource.page_count = len(PyPDF2.PdfReader(f).pages)
            except Exception:
                pass

    if cover:
        if cover.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(400, "Faqat JPEG/PNG/WebP rasm qabul qilinadi")
        cover_path, _ = save_file(cover, "covers")
        resource.cover_image = cover_path

    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource_to_dict(resource)


@router.put("/{resource_id}")
def update_resource(
    resource_id: int,
    title: str = Form(None),
    description: str = Form(None),
    is_published: bool = Form(None),
    is_featured: bool = Form(None),
    cover: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin huquqi kerak")

    from app.resource_models import Resource
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(404, "Topilmadi")

    if title is not None: r.title = title
    if description is not None: r.description = description
    if is_published is not None: r.is_published = is_published
    if is_featured is not None: r.is_featured = is_featured

    if cover:
        cover_path, _ = save_file(cover, "covers")
        r.cover_image = cover_path

    db.commit()
    return resource_to_dict(r)


@router.delete("/{resource_id}", status_code=204)
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin huquqi kerak")

    from app.resource_models import Resource
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(404, "Topilmadi")

    if r.file_path and os.path.exists(r.file_path):
        os.remove(r.file_path)
    if r.cover_image and os.path.exists(r.cover_image):
        os.remove(r.cover_image)

    db.delete(r)
    db.commit()


@router.get("/{resource_id}/download")
def download_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.resource_models import Resource
    r = db.query(Resource).filter(Resource.id == resource_id, Resource.is_published == True).first()
    if not r or not r.file_path:
        raise HTTPException(404, "Fayl topilmadi")
    if not os.path.exists(r.file_path):
        raise HTTPException(404, "Fayl diskda yo'q")

    r.download_count = (r.download_count or 0) + 1
    db.commit()

    ext = Path(r.file_path).suffix
    return FileResponse(
        r.file_path,
        filename=f"{r.title}{ext}",
        media_type="application/octet-stream",
    )


# ─── Yordamchi funksiya ───────────────────────────────────────────────────────

def resource_to_dict(r):
    return {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "author": r.author,
        "content_type": r.content_type,
        "category": r.category,
        "language": r.language,
        "file_size_kb": r.file_size_kb,
        "page_count": r.page_count,
        "cover_image": f"/uploads/covers/{Path(r.cover_image).name}" if r.cover_image else None,
        "is_published": r.is_published,
        "is_featured": r.is_featured,
        "view_count": r.view_count or 0,
        "download_count": r.download_count or 0,
        "created_at": str(r.created_at),
        "file_path": r.file_path,  # ← BU QO'SHILMAGAN EDI!
    }
