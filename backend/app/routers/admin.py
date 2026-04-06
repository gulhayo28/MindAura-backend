from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models import User, Challenge, UserChallenge, DailyProgress, CommunityPost
from app.auth import get_current_user

router = APIRouter()

# ─── ADMIN AUTH CHECK ────────────────────────────────
ADMIN_EMAIL = "admin@umidnoma.uz"

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin huquqi talab etiladi"
        )
    return current_user

# ─── SCHEMAS ─────────────────────────────────────────
class UserAdminResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    level: int
    total_points: int
    created_at: datetime
    challenges_count: int = 0

    class Config:
        from_attributes = True

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_challenges_taken: int
    total_days_completed: int
    new_users_this_week: int
    new_users_this_month: int

# ─── DASHBOARD STATS ─────────────────────────────────
@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    now = datetime.utcnow()
    week_ago  = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_users             = db.query(func.count(User.id)).scalar()
    active_users            = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    total_challenges_taken  = db.query(func.count(UserChallenge.id)).scalar()
    total_days_completed    = db.query(func.count(DailyProgress.id)).filter(DailyProgress.completed == True).scalar()
    new_users_this_week     = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar()
    new_users_this_month    = db.query(func.count(User.id)).filter(User.created_at >= month_ago).scalar()

    return {
        "total_users":            total_users or 0,
        "active_users":           active_users or 0,
        "total_challenges_taken": total_challenges_taken or 0,
        "total_days_completed":   total_days_completed or 0,
        "new_users_this_week":    new_users_this_week or 0,
        "new_users_this_month":   new_users_this_month or 0,
    }

@router.get("/recent-users")
def get_recent_users(
    limit: int = 5,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    users = db.query(User).order_by(desc(User.created_at)).limit(limit).all()
    return [
        {
            "id": str(u.id),
            "name": u.full_name or u.username,
            "email": u.email,
            "username": u.username,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]

# ─── USERS ───────────────────────────────────────────
@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(User)

    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) |
            (User.username.ilike(f"%{search}%"))
        )
    if status == "faol":
        query = query.filter(User.is_active == True)
    elif status == "bloklangan":
        query = query.filter(User.is_active == False)

    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()

    result = []
    for u in users:
        challenges_count = db.query(func.count(UserChallenge.id)).filter(
            UserChallenge.user_id == u.id
        ).scalar()
        result.append({
            "id":               str(u.id),
            "email":            u.email,
            "username":         u.username,
            "full_name":        u.full_name,
            "is_active":        u.is_active,
            "level":            u.level,
            "total_points":     u.total_points,
            "created_at":       u.created_at.isoformat(),
            "challenges_count": challenges_count or 0,
        })
    return result

@router.patch("/users/{user_id}/block")
def toggle_block_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    user.is_active = not user.is_active
    db.commit()
    return {"id": str(user.id), "is_active": user.is_active}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    db.delete(user)
    db.commit()
    return {"message": "O'chirildi"}

# ─── CHALLENGES STATS ────────────────────────────────
@router.get("/challenge-stats")
def get_challenge_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    challenges = db.query(Challenge).all()
    result = []
    for ch in challenges:
        taken = db.query(func.count(UserChallenge.id)).filter(
            UserChallenge.challenge_id == ch.id
        ).scalar()
        completed = db.query(func.count(UserChallenge.id)).filter(
            UserChallenge.challenge_id == ch.id,
            UserChallenge.status == "completed"
        ).scalar()
        result.append({
            "id":            str(ch.id),
            "title":         ch.title,
            "category":      ch.category,
            "difficulty":    ch.difficulty,
            "duration_days": ch.duration_days,
            "taken":         taken or 0,
            "completed":     completed or 0,
            "completion_rate": round((completed / taken * 100) if taken else 0, 1),
        })
    return sorted(result, key=lambda x: x["taken"], reverse=True)

# ─── DAILY ACTIVITY ──────────────────────────────────
@router.get("/activity")
def get_daily_activity(
    days: int = 30,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    result = []
    for i in range(days - 1, -1, -1):
        day = datetime.utcnow().date() - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end   = datetime.combine(day, datetime.max.time())

        new_users = db.query(func.count(User.id)).filter(
            User.created_at.between(day_start, day_end)
        ).scalar()

        tasks_done = db.query(func.count(DailyProgress.id)).filter(
            DailyProgress.completed == True,
            DailyProgress.completed_at.between(day_start, day_end)
        ).scalar()

        result.append({
            "date":      day.isoformat(),
            "new_users": new_users or 0,
            "tasks_done": tasks_done or 0,
        })
    return result

# ─── FINANCE SUMMARY ─────────────────────────────────
@router.get("/finance")
def get_finance_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    # Hozircha mock — real to'lov tizimi qo'shilganda yangilanadi
    return {
        "total_revenue":    4200000,
        "this_month":       4200000,
        "last_month":       3600000,
        "total_payments":   38,
        "avg_payment":      110526,
        "refunds":          2,
        "growth_percent":   18,
        "monthly_data": [
            {"month": "Okt", "amount": 1800000},
            {"month": "Nov", "amount": 2100000},
            {"month": "Dek", "amount": 2400000},
            {"month": "Yan", "amount": 2900000},
            {"month": "Fev", "amount": 3600000},
            {"month": "Mar", "amount": 4200000},
        ]
    }

from app.models import TestResult

@router.get("/users/{user_id}/detail")
def get_user_detail(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Topilmadi")

    # Test natijalari
    tests = db.query(TestResult).filter(
        TestResult.user_id == user_id
    ).order_by(desc(TestResult.created_at)).limit(10).all()

    # Challenge statistikasi
    challenges = db.query(UserChallenge).filter(
        UserChallenge.user_id == user_id
    ).all()

    # Bajarilgan kunlar
    days_done = db.query(func.count(DailyProgress.id)).filter(
        DailyProgress.user_id == user_id,
        DailyProgress.completed == True
    ).scalar()

    return {
        "id":           str(user.id),
        "full_name":    user.full_name,
        "username":     user.username,
        "email":        user.email,
        "level":        user.level,
        "total_points": user.total_points,
        "is_active":    user.is_active,
        "created_at":   user.created_at.isoformat(),
        "days_completed": days_done or 0,
        "challenges_total": len(challenges),
        "challenges_completed": len([c for c in challenges if c.status == "completed"]),
        "test_results": [
            {
                "test_name":    t.test_name,
                "result_label": t.result_label,
                "score":        t.score,
                "created_at":   t.created_at.isoformat(),
            }
            for t in tests
        ]
    }
# ─── PSYCHOLOGISTS ───────────────────────────────────
@router.get("/psychologists")
def get_psychologists(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    from app.models import Psychologist
    psychs = db.query(Psychologist).order_by(desc(Psychologist.created_at)).all()
    return [
        {
            "id": str(p.id),
            "full_name": p.full_name,
            "specialization": p.specialization,
            "experience_years": p.experience_years,
            "bio": p.bio,
            "phone": p.phone,
            "email": p.email,
            "photo_url": p.photo_url,
            "rating": p.rating,
            "patients_count": p.patients_count,
            "status": p.status,
            "created_at": p.created_at.isoformat(),
        }
        for p in psychs
    ]

@router.patch("/psychologists/{psych_id}/approve")
def approve_psychologist(
    psych_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    from app.models import Psychologist
    p = db.query(Psychologist).filter(Psychologist.id == psych_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Topilmadi")
    p.status = "approved"
    db.commit()
    return {"status": "approved"}

@router.patch("/psychologists/{psych_id}/reject")
def reject_psychologist(
    psych_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    from app.models import Psychologist
    p = db.query(Psychologist).filter(Psychologist.id == psych_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Topilmadi")
    p.status = "rejected"
    db.commit()
    return {"status": "rejected"}

@router.delete("/psychologists/{psych_id}")
def delete_psychologist(
    psych_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    from app.models import Psychologist
    p = db.query(Psychologist).filter(Psychologist.id == psych_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Topilmadi")
    db.delete(p)
    db.commit()
    return {"message": "O'chirildi"}


