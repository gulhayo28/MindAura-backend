import os, sys, math
sys.path.append(os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.resource_models import Resource

DOCS_DIR = os.path.join(os.path.dirname(__file__), "documents")

CATEGORY_MAP = {
    "tashvish": "anxiety", "stress": "anxiety", "anxiety": "anxiety",
    "depressiya": "depression", "depression": "depression",
    "mindfulness": "mindfulness", "meditatsiya": "mindfulness",
    "munosabat": "relationships", "oila": "relationships",
    "terapiya": "therapy", "therapy": "therapy",
    "rivojlan": "self_growth", "growth": "self_growth",
    "motivat": "self_growth",
}

def guess_category(name: str) -> str:
    name_lower = name.lower()
    for key, cat in CATEGORY_MAP.items():
        if key in name_lower:
            return cat
    return "other"

def import_files():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    if not os.path.exists(DOCS_DIR):
        print(f"❌ documents papkasi topilmadi: {DOCS_DIR}")
        return
    
    files = [f for f in sorted(os.listdir(DOCS_DIR)) 
             if f.lower().endswith((".pdf", ".epub"))]
    
    print(f"📂 {len(files)} ta fayl topildi")
    added = 0
    
    for fname in files:
        fpath = os.path.join(DOCS_DIR, fname)
        
        # Allaqachon mavjudmi?
        existing = db.query(Resource).filter(Resource.file_path == fname).first()
        if existing:
            print(f"⏭️  Mavjud: {fname}")
            continue
        
        name = os.path.splitext(fname)[0].replace("_", " ").replace("-", " ")
        size_kb = os.path.getsize(fpath) // 1024
        
        resource = Resource(
            title=name,
            author="",
            description="",
            content_type="book",
            category=guess_category(fname),
            language="uz",
            file_path=f"documents/{fname}",
            file_size_kb=size_kb,
            is_published=True,
            is_featured=False,
            download_count=0,
        )
        db.add(resource)
        added += 1
        print(f"✅ Qo'shildi: {name}")
    
    db.commit()
    db.close()
    print(f"\n🎉 Tugadi! {added} ta yangi fayl qo'shildi.")

if __name__ == "__main__":
    import_files()