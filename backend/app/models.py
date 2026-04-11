import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class DifficultyEnum(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class CategoryEnum(str, enum.Enum):
    daily_habit = "daily_habit"
    thirty_day = "thirty_day"
    language = "language"
    sport = "sport"
    mental = "mental"
    learning = "learning"

class ChallengeStatusEnum(str, enum.Enum):
    active = "active"
    completed = "completed"
    abandoned = "abandoned"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    avatar_url = Column(String)
    level = Column(Integer, default=1)
    total_points = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="user")  # ← QO'SHING
    notes = Column(Text, nullable=True)    # ← QO'SHING
    risk_level = Column(String, default="low")   # ← QO'SHING
    mood_score = Column(Integer, default=70)     # ← QO'SHING
    stress_score = Column(Integer, default=40)   # ← QO'SHING
    anxiety_score = Column(Integer, default=35) 
    created_at = Column(DateTime, default=datetime.utcnow)

    challenges = relationship("UserChallenge", back_populates="user")
    posts = relationship("CommunityPost", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(Enum(CategoryEnum), nullable=False)
    difficulty = Column(Enum(DifficultyEnum), default=DifficultyEnum.beginner)
    duration_days = Column(Integer, nullable=False)
    points_reward = Column(Integer, default=100)
    emoji = Column(String, default="🏆")
    color = Column(String, default="#553c9a")
    is_custom = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    participants_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("ChallengeTask", back_populates="challenge")
    user_challenges = relationship("UserChallenge", back_populates="challenge")

class ChallengeTask(Base):
    __tablename__ = "challenge_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)

    challenge = relationship("Challenge", back_populates="tasks")

class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    status = Column(Enum(ChallengeStatusEnum), default=ChallengeStatusEnum.active)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)
    days_completed = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="challenges")
    challenge = relationship("Challenge", back_populates="user_challenges")
    daily_progress = relationship("DailyProgress", back_populates="user_challenge")

class DailyProgress(Base):
    __tablename__ = "daily_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_challenge_id = Column(UUID(as_uuid=True), ForeignKey("user_challenges.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    note = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    user_challenge = relationship("UserChallenge", back_populates="daily_progress")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    badge_icon = Column(String, default="🏅")
    points = Column(Integer, default=50)
    condition_type = Column(String)
    condition_value = Column(Integer)

    user_achievements = relationship("UserAchievement", back_populates="achievement")

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")

class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=True)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="posts")

# models.py ga qo'shish kerak bo'lgan qismlar

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, default="Yangi suhbat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")
    user = relationship("User")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" yoki "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False)
    content = Column(Text, nullable=False)       # to'liq matn
    chunk_index = Column(Integer, default=0)     # qaysi bo'lak
    created_at = Column(DateTime, default=datetime.utcnow)
    # embedding vectorini pgvector bilan saqlaymiz (keyingi bosqichda)

class TestResult(Base):
    __tablename__ = "test_results"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    test_id      = Column(String(50), nullable=False)
    test_name    = Column(String(200), nullable=False)
    score        = Column(Integer, nullable=True)
    result_label = Column(String(200), nullable=False)
    result_desc  = Column(Text, nullable=True)
    duration_sec = Column(Integer, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)

class ChallengeProgress(Base):
    __tablename__ = "challenge_progress"
    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id    = Column(String(50), nullable=False)
    challenge_title = Column(String(200), nullable=False)
    day_number      = Column(Integer, nullable=False)
    completed       = Column(Boolean, default=True)
    completed_at    = Column(DateTime, default=datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title      = Column(String(200), default="Yangi suhbat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    messages   = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)
    role       = Column(String(20), nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    session    = relationship("ChatSession", back_populates="messages")

    class Psychologist(Base):
        __tablename__ = "psychologists"

        id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
        user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
        full_name = Column(String, nullable=False)
        specialization = Column(String, nullable=False)
        experience_years = Column(Integer, default=0)
        bio = Column(Text, nullable=True)
        phone = Column(String, nullable=True)
        email = Column(String, nullable=True)
        photo_url = Column(String, nullable=True)
        rating = Column(Float, default=0.0)
        patients_count = Column(Integer, default=0)
        status = Column(String, default="pending")  # pending, approved, rejected
        created_at = Column(DateTime, default=datetime.utcnow)


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, TestResult
from app.auth import get_current_user

router = APIRouter()

@router.get("/clients")
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["psychologist", "admin"]:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")

    clients = db.query(User).filter(User.role == "client").all()

    return [
        {
            "id": str(c.id),
            "full_name": c.full_name,
            "email": c.email,
            "risk_level": c.risk_level or "low",
            "mood_score": c.mood_score or 70,
            "stress_score": c.stress_score or 40,
            "anxiety_score": c.anxiety_score or 35,
            "notes": c.notes,
            "created_at": str(c.created_at),
        }
        for c in clients
    ]

@router.get("/clients/{client_id}")
def get_client(
    client_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["psychologist", "admin"]:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")

    client = db.query(User).filter(User.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Topilmadi")

    # Test natijalari
    tests = db.query(TestResult).filter(TestResult.user_id == client_id).all()

    return {
        "id": str(client.id),
        "full_name": client.full_name,
        "email": client.email,
        "risk_level": client.risk_level,
        "mood_score": client.mood_score,
        "stress_score": client.stress_score,
        "notes": client.notes,
        "test_results": [
            {
                "test_name": t.test_name,
                "score": t.score,
                "result_label": t.result_label,
                "created_at": str(t.created_at)
            }
            for t in tests
        ]
    }

@router.put("/clients/{client_id}/notes")
def update_notes(
    client_id: str,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["psychologist", "admin"]:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")

    client = db.query(User).filter(User.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Topilmadi")

    client.notes = data.get("notes")
    client.risk_level = data.get("risk_level", client.risk_level)
    db.commit()

    return {"message": "Saqlandi"}