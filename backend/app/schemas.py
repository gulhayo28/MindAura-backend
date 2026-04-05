from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models import DifficultyEnum, CategoryEnum, ChallengeStatusEnum

# AUTH SCHEMAS
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    full_name: Optional[str]
    level: int
    total_points: int
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# CHALLENGE SCHEMAS
class ChallengeCreate(BaseModel):
    title: str
    description: Optional[str]
    category: CategoryEnum
    difficulty: DifficultyEnum = DifficultyEnum.beginner
    duration_days: int
    emoji: Optional[str] = "🏆"
    color: Optional[str] = "#553c9a"
    tasks: Optional[List[str]] = []

class ChallengeResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    category: str
    difficulty: str
    duration_days: int
    points_reward: int
    emoji: str
    color: str
    participants_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# PROGRESS SCHEMAS
class DailyProgressCreate(BaseModel):
    user_challenge_id: UUID
    day_number: int
    note: Optional[str] = None

class DailyProgressResponse(BaseModel):
    id: UUID
    day_number: int
    completed: bool
    note: Optional[str]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class UserChallengeResponse(BaseModel):
    id: UUID
    challenge: ChallengeResponse
    status: str
    current_streak: int
    longest_streak: int
    completion_rate: float
    days_completed: int
    started_at: datetime

    class Config:
        from_attributes = True

class AnalyticsResponse(BaseModel):
    total_challenges: int
    completed_challenges: int
    total_days_completed: int
    current_streak: int
    completion_rate: float
    weekly_data: List[dict]
    monthly_data: List[dict]

# COMMUNITY SCHEMAS
class PostCreate(BaseModel):
    content: str
    challenge_id: Optional[UUID] = None

class PostResponse(BaseModel):
    id: UUID
    content: str
    likes_count: int
    user: UserResponse
    created_at: datetime

    class Config:
        from_attributes = True

# ACHIEVEMENT SCHEMAS
class AchievementResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    badge_icon: str
    points: int

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    rank: int
    user: UserResponse
    total_points: int
    challenges_completed: int
