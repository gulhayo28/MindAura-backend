from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from app.database import get_db
from app.models import UserChallenge, DailyProgress, User, ChallengeStatusEnum
from app.schemas import DailyProgressCreate, DailyProgressResponse, AnalyticsResponse
from app.auth import get_current_user

router = APIRouter()

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        from app.models import ChallengeProgress
        from datetime import datetime, timedelta
        
        results = db.query(ChallengeProgress).filter(
            ChallengeProgress.user_id == current_user.id
        ).all()
        
        total_days = len(results)
        unique_challenges = len(set(r.challenge_id for r in results))
        
        # Haftalik ma'lumot
        days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"]
        weekly = []
        for i, day in enumerate(days):
            count = sum(1 for r in results 
                if r.completed_at.weekday() == i)
            weekly.append({"day": day, "completed": count})
        
        return {
            "total_days_completed": total_days,
            "total_challenges": unique_challenges,
            "completed_challenges": unique_challenges,
            "completion_rate": min(100, round((total_days / max(unique_challenges * 7, 1)) * 100)),
            "weekly_data": weekly,
            "current_streak": min(total_days, 7),
        }
    except Exception as e:
        return {
            "total_days_completed": 0,
            "total_challenges": 0,
            "completed_challenges": 0,
            "completion_rate": 0,
            "weekly_data": [],
            "current_streak": 0,
        }

@router.get("/streak")
def get_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        from app.models import ChallengeProgress
        results = db.query(ChallengeProgress).filter(
            ChallengeProgress.user_id == current_user.id
        ).all()
        return {"current_streak": min(len(results), 7)}
    except:
        return {"current_streak": 0}

@router.post("/daily", response_model=DailyProgressResponse)
def complete_daily(
    data: DailyProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_challenge = db.query(UserChallenge).filter(
        UserChallenge.id == data.user_challenge_id,
        UserChallenge.user_id == current_user.id,
    ).first()
    if not user_challenge:
        raise HTTPException(status_code=404, detail="Challenge topilmadi")

    existing = db.query(DailyProgress).filter(
        DailyProgress.user_challenge_id == data.user_challenge_id,
        DailyProgress.day_number == data.day_number,
    ).first()
    if existing and existing.completed:
        raise HTTPException(status_code=400, detail="Bu kun allaqachon bajarilgan")

    if existing:
        existing.completed = True
        existing.note = data.note
        existing.completed_at = datetime.utcnow()
        progress = existing
    else:
        progress = DailyProgress(
            user_challenge_id=data.user_challenge_id,
            day_number=data.day_number,
            completed=True,
            note=data.note,
            completed_at=datetime.utcnow(),
        )
        db.add(progress)

    user_challenge.days_completed += 1
    user_challenge.current_streak += 1
    if user_challenge.current_streak > user_challenge.longest_streak:
        user_challenge.longest_streak = user_challenge.current_streak
    user_challenge.completion_rate = (
        user_challenge.days_completed / user_challenge.challenge.duration_days * 100
    )

    if user_challenge.days_completed >= user_challenge.challenge.duration_days:
        user_challenge.status = ChallengeStatusEnum.completed
        user_challenge.completed_at = datetime.utcnow()
        current_user.total_points += user_challenge.challenge.points_reward
        _update_level(current_user)

    db.commit()
    db.refresh(progress)
    return progress

@router.get("/my", response_model=List[dict])
def get_my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_challenges = db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id
    ).all()

    result = []
    for uc in user_challenges:
        daily = db.query(DailyProgress).filter(
            DailyProgress.user_challenge_id == uc.id
        ).all()
        result.append({
            "challenge_id": str(uc.challenge_id),
            "challenge_title": uc.challenge.title,
            "status": uc.status,
            "current_streak": uc.current_streak,
            "completion_rate": round(uc.completion_rate, 1),
            "days_completed": uc.days_completed,
            "total_days": uc.challenge.duration_days,
            "daily_progress": [
                {"day": d.day_number, "completed": d.completed}
                for d in daily
            ],
        })
    return result

@router.get("/analytics", response_model=dict)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    all_uc = db.query(UserChallenge).filter(UserChallenge.user_id == current_user.id).all()
    completed = [uc for uc in all_uc if uc.status == ChallengeStatusEnum.completed]
    total_days = sum(uc.days_completed for uc in all_uc)
    max_streak = max((uc.current_streak for uc in all_uc), default=0)

    weekly = []
    for i in range(7):
        day = datetime.utcnow() - timedelta(days=6 - i)
        count = db.query(DailyProgress).filter(
            DailyProgress.completed == True,
            func.date(DailyProgress.completed_at) == day.date()
        ).count()
        weekly.append({"day": day.strftime("%a"), "completed": count})

    monthly = []
    for i in range(4):
        week_start = datetime.utcnow() - timedelta(weeks=3 - i)
        week_end = week_start + timedelta(weeks=1)
        count = db.query(DailyProgress).filter(
            DailyProgress.completed == True,
            DailyProgress.completed_at >= week_start,
            DailyProgress.completed_at < week_end,
        ).count()
        monthly.append({"week": f"{i+1}-hafta", "completed": count})

    return {
        "total_challenges": len(all_uc),
        "completed_challenges": len(completed),
        "total_days_completed": total_days,
        "current_streak": max_streak,
        "completion_rate": round(len(completed) / len(all_uc) * 100 if all_uc else 0, 1),
        "weekly_data": weekly,
        "monthly_data": monthly,
    }

@router.get("/streak")
def get_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    best = db.query(func.max(UserChallenge.current_streak)).filter(
        UserChallenge.user_id == current_user.id
    ).scalar() or 0
    return {"current_streak": best, "level": current_user.level, "points": current_user.total_points}

def _update_level(user: User):
    thresholds = [0, 100, 300, 700, 1500, 3000, 6000, 10000]
    for level, threshold in enumerate(thresholds, start=1):
        if user.total_points >= threshold:
            user.level = level
