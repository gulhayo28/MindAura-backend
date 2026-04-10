from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, challenges, progress, community, achievements, recommendations
from app.database import engine, Base
from app.routers import admin         
from app.routers import auth, challenges, progress, community, achievements, recommendations, admin
from app.routers import ai_chat
from app.routers import resources  
from app.routers import test_results
from app.routers import challenge_progress








app = FastAPI(
    title="MindAura API",
    description="Psixologik yordam va shaxsiy rivojlanish platformasi",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mind-aura-nnau.vercel.app"],  # * emas, aniq URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Umidnoma API ishlayapti!", "version": "1.0.0"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Server ichki xatosi yuz berdi, iltimos keyinroq urinib ko'ring"},
        
    )