from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CommunityPost, User, Achievement, UserAchievement, UserChallenge, ChallengeStatusEnum
from app.schemas import PostCreate, PostResponse, AchievementResponse
from app.auth import get_current_user

# ─── COMMUNITY ───────────────────────────────────────────
router = APIRouter()

@router.get("/feed", response_model=List[PostResponse])
def get_feed(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(CommunityPost).order_by(
        CommunityPost.created_at.desc()
    ).offset(skip).limit(limit).all()

@router.post("/posts", response_model=PostResponse, status_code=201)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = CommunityPost(
        user_id=current_user.id,
        challenge_id=data.challenge_id,
        content=data.content,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.post("/posts/{post_id}/like")
def like_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post topilmadi")
    post.likes_count += 1
    db.commit()
    return {"likes_count": post.likes_count}

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.total_points.desc()).limit(10).all()
    return [
        {
            "rank": i + 1,
            "username": u.username,
            "full_name": u.full_name,
            "level": u.level,
            "total_points": u.total_points,
            "avatar_url": u.avatar_url,
        }
        for i, u in enumerate(users)
    ]
