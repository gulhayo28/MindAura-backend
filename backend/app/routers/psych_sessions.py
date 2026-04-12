from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from app.database import get_db
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/psychologist/sessions", tags=["Psixolog - Seanslar"])


def require_psychologist(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("psychologist", "admin"):
        raise HTTPException(status_code=403, detail="Faqat psixologlar uchun")
    return current_user


class SessionCreate(BaseModel):
    user_id: str
    scheduled_at: datetime
    duration_minutes: int = 50
    private_notes: Optional[str] = None
    summary: Optional[str] = None
    next_steps: Optional[str] = None


class SessionUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    private_notes: Optional[str] = None
    summary: Optional[str] = None
    next_steps: Optional[str] = None


# ── GET all sessions ──────────────────────────────────────────────────────────
@router.get("")
def list_sessions(
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    rows = db.execute(
        text("""
            SELECT s.id, s.psychologist_id, s.user_id,
                   u.full_name  AS client_name,
                   u.avatar_url AS client_avatar,
                   s.scheduled_at, s.duration_minutes, s.status,
                   s.private_notes, s.summary, s.next_steps, s.created_at
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.psychologist_id = :pid
            ORDER BY s.scheduled_at DESC
        """),
        {"pid": current_user.id}
    ).fetchall()

    return [dict(r._mapping) for r in rows]


# ── POST create session ───────────────────────────────────────────────────────
@router.post("", status_code=201)
def create_session(
    body: SessionCreate,
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    # Verify client belongs to this psychologist
    client = db.execute(
        text("SELECT id, full_name FROM users WHERE id = :uid AND assigned_psychologist_id = :pid"),
        {"uid": body.user_id, "pid": current_user.id}
    ).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")

    row = db.execute(
        text("""
            INSERT INTO sessions
              (psychologist_id, user_id, scheduled_at, duration_minutes,
               private_notes, summary, next_steps)
            VALUES (:pid, :uid, :scheduled_at, :duration, :notes, :summary, :next_steps)
            RETURNING id, scheduled_at, duration_minutes, status
        """),
        {
            "pid": current_user.id,
            "uid": body.user_id,
            "scheduled_at": body.scheduled_at,
            "duration": body.duration_minutes,
            "notes": body.private_notes,
            "summary": body.summary,
            "next_steps": body.next_steps,
        }
    ).fetchone()
    db.commit()

    # Notify client
    db.execute(
        text("""
            INSERT INTO notifications (user_id, type, title, body, metadata)
            VALUES (:uid, 'session', 'Yangi seans belgilandi', :body, :meta::jsonb)
        """),
        {
            "uid": body.user_id,
            "body": f"Dr. {current_user.full_name} seans belgiladi: {body.scheduled_at.strftime('%d.%m.%Y %H:%M')}",
            "meta": f'{{"session_id": "{row.id}", "psychologist_id": "{current_user.id}"}}',
        }
    )
    db.commit()

    return {
        "id": str(row.id),
        "client_name": client.full_name,
        "scheduled_at": row.scheduled_at.isoformat(),
        "duration_minutes": row.duration_minutes,
        "status": row.status,
    }


# ── PATCH update session ──────────────────────────────────────────────────────
@router.patch("/{session_id}")
def update_session(
    session_id: str,
    body: SessionUpdate,
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    existing = db.execute(
        text("SELECT id FROM sessions WHERE id = :sid AND psychologist_id = :pid"),
        {"sid": session_id, "pid": current_user.id}
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Seans topilmadi")

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Yangilanadigan maydon yo'q")

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["session_id"] = session_id
    db.execute(text(f"UPDATE sessions SET {set_clause} WHERE id = :session_id"), updates)
    db.commit()
    return {"ok": True}


# ── DELETE (cancel) session ───────────────────────────────────────────────────
@router.delete("/{session_id}", status_code=204)
def cancel_session(
    session_id: str,
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("UPDATE sessions SET status = 'cancelled' WHERE id = :sid AND psychologist_id = :pid"),
        {"sid": session_id, "pid": current_user.id}
    )
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Seans topilmadi")