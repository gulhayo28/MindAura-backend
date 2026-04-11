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