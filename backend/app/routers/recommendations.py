from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Challenge, UserChallenge, User
from app.auth import get_current_user

router = APIRouter()

@router.get("")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    joined_ids = [
        uc.challenge_id for uc in
        db.query(UserChallenge).filter(UserChallenge.user_id == current_user.id).all()
    ]
    challenges = db.query(Challenge).filter(
        Challenge.id.notin_(joined_ids)
    ).order_by(Challenge.participants_count.desc()).limit(6).all()

    return [
        {
            "id": str(c.id),
            "title": c.title,
            "category": c.category,
            "difficulty": c.difficulty,
            "duration_days": c.duration_days,
            "emoji": c.emoji,
            "participants_count": c.participants_count,
            "reason": "Mashhur challenge" if c.participants_count > 10 else "Siz uchun tavsiya",
        }
        for c in challenges
    ]

@router.get("/trending")
def get_trending(db: Session = Depends(get_db)):
    challenges = db.query(Challenge).order_by(
        Challenge.participants_count.desc()
    ).limit(5).all()
    return challenges
