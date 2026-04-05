"""
Test natijalari saqlash va ko'rish
Fayl: backend/app/routers/test_results.py
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

from app.database import get_db
from app.auth import get_current_user
from app.models import User

router = APIRouter()

# ─── SCHEMAS ─────────────────────────────────────────────
class TestResultCreate(BaseModel):
    test_id: str           # "temperament", "depression", "stress" va h.k.
    test_name: str         # "Temperament Testi"
    score: Optional[int] = None        # ball (agar bo'lsa)
    result_label: str      # "Sangvinik", "O'rtacha stress" va h.k.
    result_desc: Optional[str] = None  # batafsil tavsif
    duration_sec: Optional[int] = None # qancha vaqt ketdi

class TestResultResponse(BaseModel):
    id: str
    user_id: str        # ← qo'shing
    username: str
    test_id: str
    test_name: str
    score: Optional[int]
    result_label: str
    result_desc: Optional[str]
    duration_sec: Optional[int]
    created_at: str

class TestStatsResponse(BaseModel):
    total_tests: int
    unique_tests: int
    last_test: Optional[str]
    most_taken: Optional[str]
    results: List[TestResultResponse]


# ─── ENDPOINTLAR ─────────────────────────────────────────

@router.post("/", response_model=TestResultResponse)
def save_result(
    data: TestResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Test natijasini saqlash"""
    try:
        from app.models import TestResult
        result = TestResult(
            user_id=current_user.id,
            test_id=data.test_id,
            test_name=data.test_name,
            score=data.score,
            result_label=data.result_label,
            result_desc=data.result_desc,
            duration_sec=data.duration_sec,
        )
        db.add(result)
        db.commit()
        db.refresh(result)
        return _to_response(result, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[TestResultResponse])
def get_my_results(
    limit: int = 50,
    test_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Foydalanuvchining barcha test natijalari"""
    try:
        from app.models import TestResult
        query = db.query(TestResult).filter(TestResult.user_id == current_user.id)
        if test_id:
            query = query.filter(TestResult.test_id == test_id)
        results = query.order_by(desc(TestResult.created_at)).limit(limit).all()
        return [_to_response(r, db) for r in results]
    except Exception as e:
        return []


@router.get("/stats", response_model=TestStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Foydalanuvchi statistikasi"""
    try:
        from app.models import TestResult
        results = db.query(TestResult).filter(
            TestResult.user_id == current_user.id
        ).order_by(desc(TestResult.created_at)).all()

        total = len(results)
        unique = len(set(r.test_id for r in results))
        last = results[0].test_name if results else None

        # Eng ko'p o'tilgan test
        if results:
            counts = {}
            for r in results:
                counts[r.test_name] = counts.get(r.test_name, 0) + 1
            most_taken = max(counts, key=counts.get)
        else:
            most_taken = None

        return TestStatsResponse(
            total_tests=total,
            unique_tests=unique,
            last_test=last,
            most_taken=most_taken,
            results=[_to_response(r, db) for r in results[:10]],
        )
    except Exception as e:
        return TestStatsResponse(
            total_tests=0, unique_tests=0,
            last_test=None, most_taken=None, results=[]
        )


@router.delete("/{result_id}")
def delete_result(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        from app.models import TestResult
        result = db.query(TestResult).filter(
            TestResult.id == result_id,
            TestResult.user_id == current_user.id
        ).first()
        if not result:
            raise HTTPException(status_code=404, detail="Topilmadi")
        db.delete(result)
        db.commit()
        return {"message": "O'chirildi"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _to_response(r, db=None) -> TestResultResponse:
    username = "Noma'lum"
    if db:
        user = db.query(User).filter(User.id == r.user_id).first()
        if user:
            username = user.username or user.email
    return TestResultResponse(
        id=str(r.id),
        user_id=str(r.user_id),
        username=username,
        test_id=r.test_id,
        test_name=r.test_name,
        score=r.score,
        result_label=r.result_label,
        result_desc=r.result_desc,
        duration_sec=r.duration_sec,
        created_at=r.created_at.isoformat(),
    )
