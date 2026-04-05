from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Challenge, UserChallenge, ChallengeTask, User, ChallengeStatusEnum
from app.schemas import ChallengeCreate, ChallengeResponse, UserChallengeResponse
from app.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[ChallengeResponse])
def get_challenges(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Challenge)
    if category:
        query = query.filter(Challenge.category == category)
    if difficulty:
        query = query.filter(Challenge.difficulty == difficulty)
    return query.all()

@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge topilmadi")
    return challenge

@router.post("", response_model=ChallengeResponse, status_code=201)
def create_challenge(
    data: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    challenge = Challenge(
        title=data.title,
        description=data.description,
        category=data.category,
        difficulty=data.difficulty,
        duration_days=data.duration_days,
        emoji=data.emoji,
        color=data.color,
        is_custom=True,
        created_by=current_user.id,
    )
    db.add(challenge)
    db.flush()

    for i, task_title in enumerate(data.tasks or [], start=1):
        task = ChallengeTask(
            challenge_id=challenge.id,
            day_number=i,
            title=task_title,
        )
        db.add(task)

    db.commit()
    db.refresh(challenge)
    return challenge

@router.post("/{challenge_id}/join", response_model=UserChallengeResponse)
def join_challenge(
    challenge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge topilmadi")

    existing = db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id,
        UserChallenge.challenge_id == challenge_id,
        UserChallenge.status == ChallengeStatusEnum.active,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Siz allaqachon bu challengeda qatnashyapsiz")

    user_challenge = UserChallenge(
        user_id=current_user.id,
        challenge_id=challenge_id,
    )
    challenge.participants_count += 1
    db.add(user_challenge)
    db.commit()
    db.refresh(user_challenge)
    return user_challenge

@router.get("/my/active", response_model=List[UserChallengeResponse])
def get_my_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(UserChallenge).filter(
        UserChallenge.user_id == current_user.id,
        UserChallenge.status == ChallengeStatusEnum.active,
    ).all()
