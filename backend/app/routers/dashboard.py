from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/user", tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id

    # 1. Assigned psychologist
    psych = None
    if current_user.assigned_psychologist_id:
        psych_row = db.execute(
            text("SELECT id, full_name, avatar_url, specialization FROM users WHERE id = :id"),
            {"id": current_user.assigned_psychologist_id}
        ).fetchone()
        if psych_row:
            psych = {
                "id": str(psych_row.id),
                "full_name": psych_row.full_name,
                "avatar_url": psych_row.avatar_url,
                "specialization": psych_row.specialization,
            }

    # 2. Latest risk
    latest_risk = None
    days_since = None
    risk_row = db.execute(
        text("""
            SELECT risk_level, percentage, created_at
            FROM test_results
            WHERE user_id = :uid
            ORDER BY created_at DESC
            LIMIT 1
        """),
        {"uid": user_id}
    ).fetchone()
    if risk_row:
        latest_risk = {
            "level": risk_row.risk_level,
            "percentage": risk_row.percentage,
            "last_test_date": risk_row.created_at.isoformat(),
        }
        delta = datetime.now(timezone.utc) - risk_row.created_at.replace(tzinfo=timezone.utc)
        days_since = delta.days

    # 3. Recent 3 test results
    result_rows = db.execute(
        text("""
            SELECT tr.id, t.title AS test_title, tr.percentage,
                   tr.risk_level, tr.created_at
            FROM test_results tr
            JOIN tests t ON tr.test_id = t.id
            WHERE tr.user_id = :uid
            ORDER BY tr.created_at DESC
            LIMIT 3
        """),
        {"uid": user_id}
    ).fetchall()
    recent_results = [
        {
            "id": str(r.id),
            "test_title": r.test_title,
            "percentage": r.percentage,
            "risk_level": r.risk_level,
            "created_at": r.created_at.isoformat(),
        }
        for r in result_rows
    ]

    # 4. Next session
    next_session = None
    session_row = db.execute(
        text("""
            SELECT s.id, s.scheduled_at, s.duration_minutes,
                   p.full_name AS psychologist_name
            FROM sessions s
            JOIN users p ON s.psychologist_id = p.id
            WHERE s.user_id = :uid
              AND s.status = 'scheduled'
              AND s.scheduled_at > NOW()
            ORDER BY s.scheduled_at ASC
            LIMIT 1
        """),
        {"uid": user_id}
    ).fetchone()
    if session_row:
        next_session = {
            "id": str(session_row.id),
            "scheduled_at": session_row.scheduled_at.isoformat(),
            "psychologist_name": session_row.psychologist_name,
            "duration_minutes": session_row.duration_minutes,
        }

    # 5. Unread notifications
    notif_count = db.execute(
        text("SELECT COUNT(*) FROM notifications WHERE user_id = :uid AND is_read = false"),
        {"uid": user_id}
    ).scalar()

    return {
        "user": {
            "id": str(current_user.id),
            "full_name": current_user.full_name,
            "email": current_user.email,
            "level": getattr(current_user, "level", 1),
            "balls": getattr(current_user, "balls", 0),
            "streak": getattr(current_user, "streak", 0),
            "avatar_url": getattr(current_user, "avatar_url", None),
            "assigned_psychologist": psych,
        },
        "latest_risk": latest_risk,
        "recent_results": recent_results,
        "next_session": next_session,
        "unread_notifications": notif_count or 0,
        "days_since_last_test": days_since,
    }