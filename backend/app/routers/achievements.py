from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Achievement, UserAchievement, Challenge, UserChallenge, User
from app.schemas import AchievementResponse
from app.auth import get_current_user

# ─── ACHIEVEMENTS ─────────────────────────────────────────
router = APIRouter()
@router.get("/my")
def get_my_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return []


@router.get("", response_model=List[AchievementResponse])
def get_all_achievements(db: Session = Depends(get_db)):
    return db.query(Achievement).all()

@router.get("/my")
def get_my_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    earned = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).all()
    return [
        {
            "achievement": {
                "name": ua.achievement.name,
                "badge_icon": ua.achievement.badge_icon,
                "description": ua.achievement.description,
                "points": ua.achievement.points,
            },
            "earned_at": ua.earned_at,
        }
        for ua in earned
    ]
