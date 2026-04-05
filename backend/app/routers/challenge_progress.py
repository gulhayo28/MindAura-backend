from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.auth import get_current_user
from app.models import User

router = APIRouter()

class ChallengeProgressCreate(BaseModel):
    challenge_id: str
    challenge_title: str
    day_number: int

class ChallengeProgressResponse(BaseModel):
    id: str
    challenge_id: str
    challenge_title: str
    day_number: int
    completed_at: str

@router.post("/", response_model=ChallengeProgressResponse)
def save_progress(
    data: ChallengeProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        from app.models import ChallengeProgress
        progress = ChallengeProgress(
            user_id=current_user.id,
            challenge_id=data.challenge_id,
            challenge_title=data.challenge_title,
            day_number=data.day_number,
            completed=True,
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
        return ChallengeProgressResponse(
            id=str(progress.id),
            challenge_id=progress.challenge_id,
            challenge_title=progress.challenge_title,
            day_number=progress.day_number,
            completed_at=progress.completed_at.isoformat(),
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ✅ O'ZGARISH: /  →  /my
@router.get("/my", response_model=List[ChallengeProgressResponse])
def get_my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        from app.models import ChallengeProgress
        results = db.query(ChallengeProgress).filter(
            ChallengeProgress.user_id == current_user.id
        ).order_by(desc(ChallengeProgress.completed_at)).all()
        return [ChallengeProgressResponse(
            id=str(r.id),
            challenge_id=r.challenge_id,
            challenge_title=r.challenge_title,
            day_number=r.day_number,
            completed_at=r.completed_at.isoformat(),
        ) for r in results]
    except Exception as e:
        return []
