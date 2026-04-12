from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, text
from app.database import get_db
from app.auth import get_current_user
from app.models import User, TestResult

router = APIRouter(prefix="/api/user", tags=["Dashboard"])


def _risk_level_from_score(score) -> str:
    """Test balli (0–100) bo'yicha frontend RiskCard uchun daraja."""
    if score is None:
        return "medium"
    try:
        s = int(score)
    except (TypeError, ValueError):
        return "medium"
    s = max(0, min(100, s))
    if s < 40:
        return "low"
    if s < 60:
        return "medium"
    if s < 80:
        return "high"
    return "critical"


def _percentage_from_result(tr: TestResult) -> int:
    if tr.score is not None:
        return max(0, min(100, int(tr.score)))
    return 50


def _days_since(created_at: Optional[datetime]) -> Optional[int]:
    if created_at is None:
        return None
    now = datetime.now(timezone.utc)
    ct = created_at
    if ct.tzinfo is None:
        ct = ct.replace(tzinfo=timezone.utc)
    else:
        ct = ct.astimezone(timezone.utc)
    return max(0, (now - ct).days)


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.id

    # 1. Assigned psychologist (loyihada assigned_psychologist_id — psixolog user.id sifatida ishlatiladi)
    psych = None
    aid = getattr(current_user, "assigned_psychologist_id", None)
    if aid is not None:
        psych_user = db.query(User).filter(User.id == aid).first()
        if psych_user:
            psych = {
                "id": str(psych_user.id),
                "full_name": psych_user.full_name or psych_user.username,
                "avatar_url": psych_user.avatar_url,
                "specialization": getattr(psych_user, "specialization", None),
            }

    # 2–3. Test natijalari (TestResult modeli: test_name, score, result_label, …)
    latest = (
        db.query(TestResult)
        .filter(TestResult.user_id == user_id)
        .order_by(desc(TestResult.created_at))
        .first()
    )

    latest_risk = None
    days_since = None
    if latest:
        pct = _percentage_from_result(latest)
        lvl = _risk_level_from_score(latest.score)
        latest_risk = {
            "level": lvl,
            "percentage": pct,
            "last_test_date": latest.created_at.isoformat() if latest.created_at else None,
        }
        days_since = _days_since(latest.created_at)

    recent_rows = (
        db.query(TestResult)
        .filter(TestResult.user_id == user_id)
        .order_by(desc(TestResult.created_at))
        .limit(3)
        .all()
    )
    recent_results = [
        {
            "id": str(r.id),
            "test_title": r.test_name,
            "percentage": _percentage_from_result(r),
            "risk_level": _risk_level_from_score(r.score),
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in recent_rows
    ]

    # 4. Keyingi seans
    next_session = None
    try:
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
            {"uid": user_id},
        ).fetchone()
        if session_row:
            next_session = {
                "id": str(session_row.id),
                "scheduled_at": session_row.scheduled_at.isoformat(),
                "psychologist_name": session_row.psychologist_name,
                "duration_minutes": session_row.duration_minutes,
            }
    except Exception:
        db.rollback()
        next_session = None

    # 5. Bildirishnomalar (jadvalda is_read bo'lmasa, COUNT(*) ishlatamiz)
    notif_count = 0
    try:
        row = db.execute(
            text("SELECT COUNT(*) FROM notifications WHERE user_id = :uid"),
            {"uid": user_id},
        ).scalar()
        notif_count = int(row or 0)
    except Exception:
        db.rollback()
        notif_count = 0

    balls = getattr(current_user, "balls", None)
    if balls is None:
        balls = getattr(current_user, "total_points", 0) or 0

    return {
        "user": {
            "id": str(current_user.id),
            "full_name": current_user.full_name or current_user.username,
            "email": current_user.email,
            "level": getattr(current_user, "level", 1),
            "balls": balls,
            "streak": getattr(current_user, "streak", 0),
            "avatar_url": getattr(current_user, "avatar_url", None),
            "assigned_psychologist": psych,
        },
        "latest_risk": latest_risk,
        "recent_results": recent_results,
        "next_session": next_session,
        "unread_notifications": notif_count,
        "days_since_last_test": days_since,
    }
