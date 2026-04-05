"""
AI Chat endpoint — dokumentlar + suhbat tarixi + ixtiyoriy API
Fayl: backend/app/routers/ai_chat.py
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
import os
import re
import uuid
from datetime import datetime

from app.database import get_db
from app.auth import get_current_user
from app.models import User

router = APIRouter()

# ─── SCHEMAS ─────────────────────────────────────────────
class ChatMessageSchema(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    history: List[ChatMessageSchema] = []

class ChatResponse(BaseModel):
    reply: str
    sources: List[str] = []
    session_id: Optional[str] = None

class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: str
    message_count: int

# ─── RAG SINGLETON ───────────────────────────────────────
_rag = None

def get_rag():
    global _rag
    if _rag is None:
        try:
            from app.rag.processor import RAGProcessor
            docs_folder = os.getenv("DOCS_FOLDER", "./documents")
            db_path     = os.getenv("CHROMA_DB_PATH", "./chroma_db")
            _rag = RAGProcessor(docs_folder=docs_folder, db_path=db_path)
            print("✅ RAG tizimi yuklandi")
        except Exception as e:
            print(f"⚠ RAG yuklanmadi: {e}")
            _rag = None
    return _rag


# ─── MAHALLIY BILIMLAR BAZASI ────────────────────────────
KNOWLEDGE_BASE = {
    "salom|assalomu alaykum|hi|hello": {
        "reply": "Assalomu alaykum! Men Umid — AI psixolog yordamchisiman. Bugun sizga qanday yordam bera olaman?",
        "sources": []
    },
    "stress|bosim|nerv|asab": {
        "reply": """Stress bilan kurashish uchun bir necha samarali usullar mavjud:

**Nafas texnikasi:** 4-7-8 usuli — 4 soniya nafas oling, 7 soniya ushlab turing, 8 soniyada chiqaring. Bu nerv tizimini tinchlantiradi.

**Harakat:** Kuniga 20-30 daqiqa yurish yoki engil jismoniy mashqlar stress gormonlarini kamaytiradi.

**Rejalashtirish:** Ishlarni kichik qismlarga bo'lib, ustuvorliklarni belgilang. Hamma narsani bir vaqtda qilishga urinmang.

**Dam olish:** Kuniga 7-8 soat uxlash stressga chidamlilikni oshiradi.

Qaysi sohadagi stress ko'proq bezovta qilmoqda?""",
        "sources": ["Sport_psixologiyasi.pdf"]
    },
    "depressiya|tushkunlik|qayg'u|xafa|yig'lash": {
        "reply": """Depressiya jiddiy holat, lekin u davolanadi. Asosiy belgilar:

• Uzoq vaqt davomida kayfiyatning pastligi
• Ilgari zavq bergan narsalarga qiziqishning yo'qolishi
• Charchoq va kuchsizlik
• Uyqu va ishtaha buzilishi

**Nima qilish kerak:**
1. Yaqinlaringiz bilan gaplashing — yolg'iz qolmang
2. Har kuni qisqa sayr qiling
3. Muntazam ovqatlaning
4. Professional psixolog bilan maslahatlashing

Siz hozir qanday his qilyapsiz?""",
        "sources": []
    },
    "uxlay olmayman|uyqu|beso'nmax|tunda|kechasi": {
        "reply": """Uyqu muammolari juda keng tarqalgan. Bir necha maslahat:

**Uyqu gigienasi:**
• Har kuni bir vaqtda yoting va turing
• Uxlashdan 1 soat oldin telefonni qo'ying
• Xona salqin (18-20°C) va qorong'i bo'lsin

**Kechki ritual:**
• Iliq dush qabul qiling
• Yengil cho'zilish mashqlari qiling
• Mindfulness yoki nafas mashqlari

**Qochish kerak:**
• Kechki qahva va choy
• Kech kuni og'ir ovqat
• Uxlashdan oldin janjal yoki stressli suhbat

Uyqu muammolingiz qachondan boshlangan?""",
        "sources": []
    },
    "oila|turmush|er|xotin|farzand|bola|ota|ona": {
        "reply": """Oilaviy munosabatlar murakkab, lekin ularni yaxshilash mumkin.

**Muloqot — asosiy kalit:**
• Bir-birini tinglang, uzmatoq bermang
• "Men" shaklida gapiring: "Sen qilmading" o'rniga "Men xafa bo'ldim"
• Muammoni kechqurun, ikkalangiz tinch bo'lganda muhokama qiling

**O'zaro hurmat:**
• Har birining shaxsiy maydonini hurmat qiling
• Minnatdorchilik bildiring, hatto kichik narsalar uchun

**Qiyin bo'lsa:**
• Oilaviy psixolog bilan maslahatlashish uyat emas
• Har ikki tomoning ham hislarini tushunishga harakat qiling

Nima sizni ko'proq bezovta qilmoqda?""",
        "sources": []
    },
    "o'zimga ishonch|o'ziga ishonch|ishonmasam|layoqatsiz|yomon|befoyda": {
        "reply": """O'ziga ishonchsizlik ko'pchilikda bo'ladi. Bu holat o'zgartirilishi mumkin.

**O'z-o'zingizni qabul qiling:**
• Kamchiliklaringiz bilan birga kuchli tomonlaringizni ham ko'ring
• Har kuni 3 ta yaxshi qilgan ish yozing

**Qadamba-qadam:**
• Kichik maqsadlar qo'ying va ularga erishing
• Har bir muvaffaqiyatni nishonlang, kichik bo'lsa ham

**Salbiy fikrlarni o'zgartiring:**
• "Men uddalay olmayman" o'rniga "Men harakat qilaman"
• O'zingizga do'stingizga gapirgandek gapiring

Qaysi sohada o'zingizga ishonchingiz yo'q?""",
        "sources": []
    },
    "tashvish|xavotir|qo'rquv|panic|vahima": {
        "reply": """Tashvish va xavotir bilan ishlash usullari:

**Hozir va shu yerda bo'ling (mindfulness):**
• 5 ta ko'rayotgan narsa nomi ayting
• 4 ta his qilayotgan narsa
• 3 ta eshitayotgan ovoz

**Nafas mashqi:**
Sekin va chuqur nafas oling. Qorin ko'tarilsin, ko'krak emas. Bu parasempatik nerv tizimini faollashtiradi.

**Tashvishingizni yozing:**
Fikrlarni qog'ozga tushirish miyani "ozod" qiladi.

**"Eng yomoni nima bo'ladi?" texnikasi:**
Ko'p hollarda qo'rqqan narsalar amalga oshmaydi.

Tashvishingiz nimaga bog'liq?""",
        "sources": []
    },
    "motivatsiya|maqsad|orzu|reja|kelajak": {
        "reply": """Motivatsiyani oshirish uchun:

**Aniq maqsad qo'ying:**
• Yirik maqsadni kichik qadamlarga bo'ling
• Har bir qadam bajarilganda o'zingizni mukofotlang

**Sabab toping:**
• Nima uchun bu maqsad sizga muhim? Chuqurroq sabab kuchli motivatsiya beradi

**Odatlar kuchi:**
• Har kuni bir xil vaqtda bir xil ish qilish orqali odat hosil qiling
• Birinchi 21 kun qiyin, keyin osonlashadi

Qaysi sohada motivatsiya kerak?""",
        "sources": []
    },
    "yolg'iz|tanho|do'st|muloqot|ijtimoiy": {
        "reply": """Yolg'izlik hissi og'ir bo'lishi mumkin, lekin siz yolg'iz emassiz.

**Muloqotni oshirish:**
• Yangi qiziqish to'garaklari yoki kurslarga qo'shiling
• Qo'shnilar yoki hamkasblar bilan kichik suhbatlar boshlang
• Ixtiyoriy ishlar orqali yangi odamlar bilan tanishing

**Yaqinlar bilan aloqani mustahkamlang:**
• Qo'ng'iroq qiling, kutmang
• Birgalikda qilish mumkin bo'lgan narsalar toping

**O'zingiz bilan do'st bo'ling:**
• Yolg'iz vaqtni sifatli o'tkazishni o'rganing
• Sevimli mashg'ulotingizga vaqt ajrating

Yolg'izlik hissi qachondan boshlandi?""",
        "sources": []
    },
    "suitsid|o'ldirish|o'lmoqchi|hayotdan|ketmoqchi": {
        "reply": """Siz bu fikrlarni men bilan bo'lishganingiz uchun rahmat. Bu juda qiyin holat.

**Hozir eng muhim narsa — siz xavfsiz bo'lishingiz.**

Iltimos, darhol quyidagilardan biriga murojaat qiling:
• **Ishonch telefoni:** 1050 (O'zbekiston)
• Yaqin odamingizga, do'stingizga qo'ng'iroq qiling
• Yaqin shifoxona yoki psixolog xizmatiga boring

Siz bu og'irlikni yolg'iz ko'tarishingiz shart emas. Yordam mavjud va siz unga loyiqsiz.

Hozir yoningizda kim bor?""",
        "sources": []
    },
}


def keyword_search(message: str) -> Optional[dict]:
    """Keyword asosida javob qidirish"""
    msg_lower = message.lower()
    for pattern, response in KNOWLEDGE_BASE.items():
        keywords = pattern.split("|")
        if any(kw in msg_lower for kw in keywords):
            return response
    return None


def rag_search(message: str) -> Optional[dict]:
    """RAG tizimi orqali dokumentlardan qidirish"""
    rag = get_rag()
    if not rag:
        return None
    try:
        results = rag.query(message, n_results=3)
        good_results = [r for r in results if r.get("distance", 1) < 0.6]
        if not good_results:
            return None
        context_parts = [r["text"][:300] for r in good_results]
        sources = list(set([r["source"] for r in good_results]))
        context = "\n".join(context_parts)
        return {"context": context, "sources": sources}
    except Exception as e:
        print(f"RAG qidirish xatosi: {e}")
        return None


def api_reply(message: str, context: str, history: List[ChatMessageSchema]) -> Optional[str]:
    """Gemini API orqali javob (ixtiyoriy)"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        SYSTEM = """Siz "Umid" — Umidnoma psixologik yordam platformasining AI yordamchisisiz.
O'zbek tilida qisqa, mehribon va foydali javob bering (3-5 gap).
Tibbiy tashxis qo'ymang. Jiddiy hollarda mutaxassisga murojaat tavsiya eting."""

        parts = [SYSTEM, ""]
        if context:
            parts.append(f"Ma'lumotlar bazasidan:\n{context}\n")
        if history:
            for msg in history[-6:]:
                role = "Foydalanuvchi" if msg.role == "user" else "Umid"
                parts.append(f"{role}: {msg.content}")
        parts.append(f"Foydalanuvchi: {message}")
        parts.append("Umid:")

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-1.5-flash-latest",
            contents="\n".join(parts)
        )
        return response.text
    except Exception as e:
        print(f"API xatosi: {e}")
        return None


def generate_reply(message: str, history: List[ChatMessageSchema]) -> dict:
    """
    Asosiy javob generatsiya funksiyasi:
    1. Keyword tizim
    2. RAG dokumentlar
    3. API (agar mavjud bo'lsa)
    4. Fallback
    """
    # 1. Keyword tizim
    kw_result = keyword_search(message)
    if kw_result:
        return {"reply": kw_result["reply"], "sources": kw_result.get("sources", [])}

    # 2. RAG dokumentlardan qidirish
    rag_result = rag_search(message)
    context = ""
    sources = []
    if rag_result:
        context = rag_result["context"]
        sources = rag_result["sources"]

    # 3. API mavjud bo'lsa — undan javob ol
    api_result = api_reply(message, context, history)
    if api_result:
        return {"reply": api_result, "sources": sources}

    # 4. RAG konteksti bor lekin API yo'q — kontekstni qaytarish
    if context:
        return {
            "reply": f"Dokumentlarimizdan topilgan ma'lumot:\n\n{context[:500]}...\n\nBatafsil ma'lumot uchun psixolog bilan maslahatlashing.",
            "sources": sources
        }

    # 5. Fallback javob
    fallback_replies = {
        "qanday": "Bu mavzu bo'yicha ko'proq ma'lumot bera olishim uchun savolingizni aniqroq qilib yozib bering.",
        "yordam": "Albatta yordam beraman! Qaysi sohadagi muammo haqida gapirishni xohlaysiz?",
    }
    msg_lower = message.lower()
    for kw, reply in fallback_replies.items():
        if kw in msg_lower:
            return {"reply": reply, "sources": []}

    return {
        "reply": "Tushundim. Bu mavzu bo'yicha yaxshiroq yordam bera olishim uchun biroz batafsil gapirib bersangiz? Masalan, bu holat qachondan boshlangan va qanday his qilayapsiz?",
        "sources": []
    }


# ─── DB MODELLAR (agar mavjud bo'lsa) ───────────────────
def get_or_create_session(db: Session, user_id, session_id: Optional[str], first_message: str):
    """Suhbat sessiyasini olish yoki yaratish"""
    try:
        from app.models import ChatSession
        if session_id:
            session = db.query(ChatSession).filter(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id
            ).first()
            if session:
                return session

        # Yangi sessiya
        title = first_message[:50] + ("..." if len(first_message) > 50 else "")
        session = ChatSession(user_id=user_id, title=title)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    except Exception as e:
        print(f"Sessiya xatosi: {e}")
        return None


def save_messages(db: Session, session_id, user_msg: str, assistant_msg: str):
    """Xabarlarni DB ga saqlash"""
    try:
        from app.models import ChatMessage as ChatMessageModel
        user_message = ChatMessageModel(
            session_id=session_id, role="user", content=user_msg
        )
        assistant_message = ChatMessageModel(
            session_id=session_id, role="assistant", content=assistant_msg
        )
        db.add(user_message)
        db.add(assistant_message)
        db.commit()
    except Exception as e:
        print(f"Xabar saqlash xatosi: {e}")


# ─── ENDPOINTLAR ─────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Javob generatsiya
    result = generate_reply(request.message, request.history)

    # Sessiya va xabarlarni saqlash
    session_id = None
    try:
        session = get_or_create_session(
            db, current_user.id, request.session_id, request.message
        )
        if session:
            save_messages(db, session.id, request.message, result["reply"])
            session_id = str(session.id)
    except Exception as e:
        print(f"DB saqlash xatosi: {e}")

    return ChatResponse(
        reply=result["reply"],
        sources=result["sources"],
        session_id=session_id
    )


@router.post("/chat/anonymous", response_model=ChatResponse)
async def chat_anonymous(request: ChatRequest):
    """Login qilmasdan — faqat keyword va RAG"""
    result = generate_reply(request.message, request.history)
    return ChatResponse(reply=result["reply"], sources=result["sources"])


@router.get("/sessions")
async def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Foydalanuvchi suhbat tarixini olish"""
    try:
        from app.models import ChatSession, ChatMessage as ChatMessageModel
        from sqlalchemy import func
        sessions = db.query(ChatSession).filter(
            ChatSession.user_id == current_user.id
        ).order_by(desc(ChatSession.updated_at)).limit(20).all()

        result = []
        for s in sessions:
            count = db.query(func.count(ChatMessageModel.id)).filter(
                ChatMessageModel.session_id == s.id
            ).scalar()
            result.append({
                "id": str(s.id),
                "title": s.title,
                "created_at": s.created_at.isoformat(),
                "message_count": count or 0
            })
        return result
    except Exception as e:
        return []


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bitta sessiya xabarlarini olish"""
    try:
        from app.models import ChatSession, ChatMessage as ChatMessageModel
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            raise HTTPException(status_code=404, detail="Sessiya topilmadi")

        messages = db.query(ChatMessageModel).filter(
            ChatMessageModel.session_id == session_id
        ).order_by(ChatMessageModel.created_at).all()

        return [{"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()} for m in messages]
    except HTTPException:
        raise
    except Exception as e:
        return []


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sessiyani o'chirish"""
    try:
        from app.models import ChatSession
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if session:
            db.delete(session)
            db.commit()
        return {"message": "O'chirildi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
