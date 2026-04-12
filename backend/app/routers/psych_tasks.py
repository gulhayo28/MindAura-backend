from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from app.database import get_db
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/psychologist/tasks", tags=["Psixolog - Vazifalar"])


def require_psychologist(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("psychologist", "admin"):
        raise HTTPException(status_code=403, detail="Faqat psixologlar uchun")
    return current_user


class TaskCreate(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = None
    category: str = "other"
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None


# ── GET all tasks ─────────────────────────────────────────────────────────────
@router.get("")
def list_tasks(
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    rows = db.execute(
        text("""
            SELECT t.*, u.full_name AS client_name
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            WHERE t.psychologist_id = :pid
            ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
        """),
        {"pid": current_user.id}
    ).fetchall()
    return [dict(r._mapping) for r in rows]


# ── POST create task ──────────────────────────────────────────────────────────
@router.post("", status_code=201)
def create_task(
    body: TaskCreate,
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    client = db.execute(
        text("SELECT id, full_name FROM users WHERE id = :uid AND assigned_psychologist_id = :pid"),
        {"uid": body.user_id, "pid": current_user.id}
    ).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")

    row = db.execute(
        text("""
            INSERT INTO tasks (psychologist_id, user_id, title, description, category, due_date)
            VALUES (:pid, :uid, :title, :desc, :category, :due_date)
            RETURNING id, title, status, created_at
        """),
        {
            "pid": current_user.id,
            "uid": body.user_id,
            "title": body.title,
            "desc": body.description,
            "category": body.category,
            "due_date": body.due_date,
        }
    ).fetchone()
    db.commit()

    # Notify client
    db.execute(
        text("""
            INSERT INTO notifications (user_id, type, title, body, metadata)
            VALUES (:uid, 'task', 'Yangi vazifa', :body, :meta::jsonb)
        """),
        {
            "uid": body.user_id,
            "body": f"Dr. {current_user.full_name} yangi vazifa berdi: {body.title}",
            "meta": f'{{"task_id": "{row.id}", "psychologist_id": "{current_user.id}"}}',
        }
    )
    db.commit()

    return {
        "id": str(row.id),
        "client_name": client.full_name,
        "title": row.title,
        "status": row.status,
        "created_at": row.created_at.isoformat(),
    }


# ── PATCH update task ─────────────────────────────────────────────────────────
@router.patch("/{task_id}")
def update_task(
    task_id: str,
    body: TaskUpdate,
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    existing = db.execute(
        text("SELECT id FROM tasks WHERE id = :tid AND psychologist_id = :pid"),
        {"tid": task_id, "pid": current_user.id}
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Vazifa topilmadi")

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Yangilanadigan maydon yo'q")

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["task_id"] = task_id
    db.execute(text(f"UPDATE tasks SET {set_clause} WHERE id = :task_id"), updates)
    db.commit()
    return {"ok": True}


# ── DELETE task ───────────────────────────────────────────────────────────────
@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("DELETE FROM tasks WHERE id = :tid AND psychologist_id = :pid"),
        {"tid": task_id, "pid": current_user.id}
    )
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Vazifa topilmadi")