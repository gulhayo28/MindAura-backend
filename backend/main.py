import re
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    auth, challenges, progress, community,
    achievements, recommendations, admin,
    ai_chat, resources, test_results,
    challenge_progress, psychologist
)
from app.routers.dashboard import router as dashboard_router
from app.routers.psych_sessions import router as sessions_router
from app.routers.psych_tasks import router as tasks_router
from app.routers.psych_clients import router as clients_router
from app.database import engine, Base

# ✅ FAQAT BIR MARTA yaratilsin
app = FastAPI(
    title="MindAura API",
    description="Psixologik yordam va shaxsiy rivojlanish platformasi",
    version="1.0.0"
)

# ✅ CORS — bitta, to'liq
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mind-aura-nnau.vercel.app",
        "https://mind-aura-zoqt.vercel.app",
        "https://mind-aura.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://mind-aura[\w-]*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routerlar
app.include_router(auth.router, prefix="/auth", tags=["Autentifikatsiya"])
app.include_router(challenges.router, prefix="/challenges", tags=["Challengelar"])
app.include_router(progress.router, prefix="/progress", tags=["Progress"])
app.include_router(community.router, prefix="/community", tags=["Jamiyat"])
app.include_router(achievements.router, prefix="/achievements", tags=["Achievementlar"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Tavsiyalar"])
app.include_router(ai_chat.router, prefix="/ai", tags=["AI Chat"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(resources.router, prefix="/resources", tags=["Kutubxona"])
app.include_router(test_results.router, prefix="/test-results", tags=["Test natijalari"])
app.include_router(challenge_progress.router, prefix="/challenge-progress", tags=["Challenge progress"])
app.include_router(psychologist.router, prefix="/psychologist", tags=["Psixolog"])
app.include_router(dashboard_router)
app.include_router(sessions_router)
app.include_router(tasks_router)
app.include_router(clients_router)

Base.metadata.create_all(bind=engine)

# ✅ Health check — Render uxlab qolmasligi uchun
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "MindAura API ishlayapti!", "version": "1.0.0"}

# ✅ Global exception handler — CORS headerlari bilan
_CORS_ALLOW_ORIGINS = {
    "https://mind-aura-nnau.vercel.app",
    "https://mind-aura-zoqt.vercel.app",
    "https://mind-aura.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
}
_CORS_VERCEL = re.compile(r"https://mind-aura[\w-]*\.vercel\.app\Z")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in _CORS_ALLOW_ORIGINS or _CORS_VERCEL.match(origin):
        headers = {
            "access-control-allow-origin": origin,
            "access-control-allow-credentials": "true",
        }
    return JSONResponse(
        status_code=500,
        content={"detail": "Server ichki xatosi yuz berdi"},
        headers=headers,
    )