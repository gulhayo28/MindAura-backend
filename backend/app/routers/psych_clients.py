import json
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.auth import get_current_user
from app.models import User
import anthropic

router = APIRouter(prefix="/api/psychologist/clients", tags=["Psixolog - Mijozlar"])


def require_psychologist(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("psychologist", "admin"):
        raise HTTPException(status_code=403, detail="Faqat psixologlar uchun")
    return current_user


# ── GET client list ───────────────────────────────────────────────────────────
@router.get("")
def list_clients(
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    rows = db.execute(
        text("""
            SELECT
                u.id, u.full_name, u.email, u.avatar_url,
                u.level, u.balls, u.streak,
                latest.risk_level,
                latest.percentage  AS latest_percentage,
                latest.created_at  AS last_test_date
            FROM users u
            LEFT JOIN LATERAL (
                SELECT risk_level, percentage, created_at
                FROM test_results
                WHERE user_id = u.id
                ORDER BY created_at DESC
                LIMIT 1
            ) latest ON true
            WHERE u.assigned_psychologist_id = :pid
              AND u.role = 'user'
              AND u.is_active = true
            ORDER BY u.full_name
        """),
        {"pid": current_user.id}
    ).fetchall()
    return [dict(r._mapping) for r in rows]


# ── GET client detail ─────────────────────────────────────────────────────────
@router.get("/{client_id}")
def get_client(
    client_id: str,
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    row = db.execute(
        text("""
            SELECT
                u.id, u.full_name, u.email, u.avatar_url,
                u.level, u.balls, u.streak,
                latest.risk_level,
                latest.percentage  AS latest_percentage,
                latest.created_at  AS last_test_date
            FROM users u
            LEFT JOIN LATERAL (
                SELECT risk_level, percentage, created_at
                FROM test_results
                WHERE user_id = u.id
                ORDER BY created_at DESC
                LIMIT 1
            ) latest ON true
            WHERE u.id = :uid
              AND u.assigned_psychologist_id = :pid
              AND u.is_active = true
        """),
        {"uid": client_id, "pid": current_user.id}
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")

    history_rows = db.execute(
        text("""
            SELECT tr.id, t.title AS test_title, t.category,
                   tr.percentage, tr.risk_level, tr.created_at
            FROM test_results tr
            JOIN tests t ON tr.test_id = t.id
            WHERE tr.user_id = :uid
            ORDER BY tr.created_at ASC
        """),
        {"uid": client_id}
    ).fetchall()

    return {
        **dict(row._mapping),
        "test_history": [dict(r._mapping) for r in history_rows],
    }


# ── POST AI analysis ──────────────────────────────────────────────────────────
@router.post("/{client_id}/ai-analysis")
def generate_ai_analysis(
    client_id: str,
    current_user: User = Depends(require_psychologist),
    db: Session = Depends(get_db)
):
    client = db.execute(
        text("SELECT full_name FROM users WHERE id = :uid AND assigned_psychologist_id = :pid"),
        {"uid": client_id, "pid": current_user.id}
    ).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")

    history_rows = db.execute(
        text("""
            SELECT tr.percentage, tr.risk_level, tr.created_at,
                   t.title, t.category
            FROM test_results tr
            JOIN tests t ON tr.test_id = t.id
            WHERE tr.user_id = :uid
            ORDER BY tr.created_at DESC
            LIMIT 10
        """),
        {"uid": client_id}
    ).fetchall()

    if not history_rows:
        raise HTTPException(status_code=400, detail="Test natijalari mavjud emas")

    sessions_count = db.execute(
        text("""
            SELECT COUNT(*) FROM sessions
            WHERE user_id = :uid AND psychologist_id = :pid AND status = 'completed'
        """),
        {"uid": client_id, "pid": current_user.id}
    ).scalar()

    history_data = [
        {
            "test": r.title,
            "category": r.category,
            "percentage": r.percentage,
            "risk_level": r.risk_level,
            "date": r.created_at.strftime("%d.%m.%Y"),
        }
        for r in history_rows
    ]

    # Risk trend
    if len(history_rows) >= 2:
        diff = history_rows[0].percentage - history_rows[-1].percentage
        trend = f"{'Yomonlashgan' if diff > 0 else 'Yaxshilangan'} ({abs(diff)}% farq)"
    else:
        trend = "Yetarli ma'lumot yo'q"

    ai_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    response = ai_client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system="""Sen psixolog uchun mijoz tahlilini yozuvchi yordamchisan.
Psixologik klinik ko'rsatkichlar asosida, o'zbek tilida, professional tarzda yoz.
FAQAT JSON qaytargil, boshqa matn yo'q.""",
        messages=[{
            "role": "user",
            "content": f"""Mijoz: {client.full_name}
Bajarilgan seanslar: {sessions_count}
Risk trendi: {trend}
Test tarixi: {json.dumps(history_data, ensure_ascii=False)}

JSON formatda yoz:
{{
  "overall_assessment": "Umumiy holat (3-4 jumla)",
  "progress_note": "Dinamika (2-3 jumla)",
  "recommendations_for_psychologist": ["Tavsiya 1", "Tavsiya 2", "Tavsiya 3"],
  "risk_trend": "Risk tendentsiyasi"
}}"""
        }]
    )

    raw = response.content[0].text
    parsed = json.loads(raw.replace("```json", "").replace("```", "").strip())
    return parsed