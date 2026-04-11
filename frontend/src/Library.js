import { useState } from "react";
import "./Library.css";

const CDN = "https://PSCHOLOGY.b-cdn.net/documents";

const DOCUMENTS = [
  { id: 1, title: "04. Muloqot, Deviant, Konfliktlar", file: "04.%20Muloqot%2C%20Deviant%2C%20Konfliktlar%2C%20yosh%20inqirozlari.pdf", cat: "relationships", type: "book" },
  { id: 2, title: "4-Muvaffaqiyatli inson bo'lish", file: "4-Muvaffaqiyatli%20inson%20bo%E2%80%98lish.docx", cat: "self_growth", type: "guide" },
  { id: 3, title: "AQL XARITASI", file: "AQL%20XARITASI.pdf", cat: "self_growth", type: "guide" },
  { id: 4, title: "Asab va ruhiyat kitobi", file: "Asab%20va%20ruhiyat%20kitobi.pdf", cat: "therapy", type: "book" },
  { id: 5, title: "Baxt kaliti. Paolo Koelo", file: "Baxt%20kaliti.%20Paolo%20Koelo%5B%40KitobL%5D.txt", cat: "self_growth", type: "book" },
  { id: 6, title: "Eksperimental psixologiya", file: "EKSPERIMENTAL%20PSIXOLOGIYA.docx", cat: "other", type: "article" },
  { id: 7, title: "Eksperimental psixologiyasi", file: "eksperimentalnoj_psixologii.pdf", cat: "other", type: "book" },
  { id: 8, title: "Faoliyat va xulq-atvor motivatsiyasi", file: "faoliyat_va_xulq-atvor_motivatsiyasi.pdf", cat: "self_growth", type: "book" },
  { id: 9, title: "Freyd nazariyasi", file: "frejd_nazariyasi._psixoanaliz_talimoti._neofrejdizm..pdf", cat: "therapy", type: "article" },
  { id: 10, title: "Ijtimoiy treninglar", file: "Ijdimoiy%20treninglar.pdf", cat: "self_growth", type: "guide" },
  { id: 11, title: "Ijtimoiy xavf guruhi Art-terapiya", file: "Ijtimoiy%20xavf%20guruhi%20Art-terapiya.pptx", cat: "therapy", type: "guide" },
  { id: 12, title: "Kasbga yo'naltiruvchi test", file: "Kasbga%20yo'naltiruvchi%20test.docx", cat: "other", type: "guide" },
  { id: 13, title: "Muloqot ko'nikmalari trening", file: "Muloqot%20ko'nikmalari%20trening.ppt", cat: "relationships", type: "guide" },
  { id: 14, title: "Noverbal muloqot sirlari", file: "noverbal_muloqot_sirlarining_psixologik_xususiyatlari.pdf", cat: "relationships", type: "book" },
  { id: 15, title: "Oila metodikasi", file: "Oila%20metodikasi.docx", cat: "relationships", type: "guide" },
  { id: 16, title: "Oilada shaxslararo munosabatlar", file: "oilada%20shaxslararo%20munosabatlar.docx", cat: "relationships", type: "book" },
  { id: 17, title: "Ongsizlik muammolari", file: "ongsizlik__muammolari.doc", cat: "therapy", type: "article" },
  { id: 18, title: "O'smirlik davri psixodiagnostikasi", file: "O'smirlik_davri_psixodiagnostikasi.pdf", cat: "other", type: "book" },
  { id: 19, title: "O'zingizga ishonch trening", file: "O'zingizga%20ishonch%20trening.pdf", cat: "self_growth", type: "guide" },
  { id: 20, title: "Psixodiagnostika va amaliy psixologiya", file: "Psixodiagnostika%20va%20amaliy%20p.%20%20E.G%60oziyev.pdf", cat: "other", type: "book" },
  { id: 21, title: "Psixologik maslaxat daftari", file: "psixologik%20maslaxat%20daftari.docx", cat: "therapy", type: "guide" },
  { id: 22, title: "Psixologik testlar", file: "Psixologik%20testlar.pdf", cat: "other", type: "guide" },
  { id: 23, title: "Samarali muloqot ko'nikmalari", file: "Samarali%20muloqot%20ko'nikmalari.pptx", cat: "relationships", type: "guide" },
  { id: 24, title: "Somatik va asab kasalliklari", file: "somatik_va_asab_kasalliklarda_psixoterapiya.pdf", cat: "therapy", type: "book" },
  { id: 25, title: "Sport psixologiyasi", file: "Sport%20psixologiyasi.pdf", cat: "self_growth", type: "book" },
  { id: 26, title: "Suitsid xavf xaritasi", file: "Suitsid%20xavf%20xaritasi.pdf", cat: "depression", type: "guide" },
  { id: 27, title: "Tasavvurlarning yorqinligi", file: "Tasavvurlarning%20yorqinligi%20va%20aniqligini%20baholash.pdf", cat: "therapy", type: "article" },
  { id: 28, title: "Testa raven IQ", file: "testa%20raven%20IQ.doc", cat: "other", type: "guide" },
  { id: 29, title: "Tibbiyot psixologiyasi 2019", file: "Tibbiyot_psixologiyasi%202019.pdf", cat: "therapy", type: "book" },
  { id: 30, title: "Xotirani oshirishning 10 usuli", file: "Xotirani%20oshirishning%2010%20usuli.txt", cat: "self_growth", type: "guide" },
  { id: 31, title: "Yosh davrlar psixologiyasi", file: "yosh_davrlar_psixologiyasi.pdf", cat: "other", type: "book" },
  { id: 32, title: "Айзенкнинг суровнома", file: "%D0%90%D0%B9%D0%B7%D0%B5%D0%BD%D0%BA%D0%BD%D0%B8%D0%BD%D0%B3%20%20%D1%81%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D0%BE%D0%BC%D0%B0.doc", cat: "other", type: "guide" },
  { id: 33, title: "Алланз Пиз - Тана тили", file: "%D0%90%D0%BB%D0%BB%D0%B0%D0%BD%D0%B7%20%D0%9F%D0%B8%D0%B7%20-%20%D0%A2%D0%B0%D0%BD%D0%B0%20%D1%82%D0%B8%D0%BB%D0%B8.pdf", cat: "relationships", type: "book" },
  { id: 34, title: "Диккатни коррекциялаш", file: "%D0%B4%D0%B8%D0%BA%D0%BA%D0%B0%D1%82%D0%BD%D0%B8%20%D0%BA%D0%BE%D1%80%D1%80%D0%B5%D0%BA%D1%86%D0%B8%D1%8F%D0%BB%D0%B0%D1%88.ppt", cat: "therapy", type: "guide" },
  { id: 35, title: "Психологик тренинглар", file: "%D0%9F%D1%81%D0%B8%D1%85%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D0%BA%20%D1%82%D1%80%D0%B5%D0%BD%D0%B8%D0%BD%D0%B3%D0%BB%D0%B0%D1%80.doc", cat: "self_growth", type: "guide" },  { id: 36, title: "Равен (тест)", file: "%D0%A0%D0%B0%D0%B2%D0%B5%D0%BD%20(%D1%82%D0%B5%D1%81%D1%82)%20(2).doc", cat: "other", type: "guide" },
  { id: 37, title: "Тренинг машғулотлар", file: "%D1%82%D1%80%D0%B5%D0%BD%D0%B8%D0%BD%D0%B3%20%D0%BC%D0%B0%D1%88%D2%93%D1%83%D0%BB%D0%BE%D1%82%D0%BB%D0%B0%D1%80.doc", cat: "self_growth", type: "guide" },
  { id: 38, title: "Ўсмирлик эҳтиёжлари", file: "%D0%8E%D1%81%D0%BC%D0%B8%D1%80%D0%BB%D0%B8%D0%BA%20%D1%8D%D2%B3%D1%82%D0%B8%D1%91%D0%B6%D0%BB%D0%B0%D1%80%D0%B8.pptx", cat: "other", type: "guide" },
  { id: 39, title: "ФРЕЙД ТАЪЛИМОТИ", file: "%D0%A4%D0%A0%D0%95%D0%99%D0%94%20%D0%A2%D0%90%D0%AA%D0%9B%D0%98%D0%9C%D0%9E%D0%A2%D0%98.ppt", cat: "therapy", type: "article" },
  { id: 40, title: "ХУДОСИЗ БИЛАН БАХС", file: "%D0%A5%D0%A3%D0%94%D0%9E%D0%A1%D0%98%D0%97%20%D0%91%D0%98%D0%9B%D0%90%D0%9D%20%D0%91%D0%90%D0%A5%D0%A1.doc", cat: "other", type: "book" },
  { id: 41, title: "ШАХС СУРОВНОМАСИ", file: "%D0%A8%D0%90%D0%A5%D0%A1%20%D0%A1%D0%A3%D0%A0%D0%9E%D0%92%D0%9D%D0%9E%D0%9C%D0%90%D0%A1%D0%98.rtf", cat: "other", type: "guide" },
];

const CATEGORIES = [
  { value: "", label: "Barchasi" },
  { value: "anxiety", label: "😰 Tashvish & Stress" },
  { value: "self_growth", label: "🌱 Rivojlanish" },
  { value: "relationships", label: "💞 Munosabatlar" },
  { value: "therapy", label: "🧘 Terapiya" },
  { value: "depression", label: "🌧️ Depressiya" },
  { value: "mindfulness", label: "🌸 Mindfulness" },
  { value: "other", label: "📁 Boshqalar" },
];

const TYPES = [
  { value: "", label: "Barchasi" },
  { value: "book", label: "📚 Kitob" },
  { value: "guide", label: "📋 Qo'llanma" },
  { value: "article", label: "📄 Maqola" },
];

const TYPE_ICONS = { book: "📚", guide: "📋", article: "📄" };

export default function Library() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const filtered = DOCUMENTS.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category ? d.cat === category : true;
    const matchType = type ? d.type === type : true;
    return matchSearch && matchCat && matchType;
  });

  function handleDownload(doc) {
    const url = `${CDN}/${doc.file}`;
    const ext = doc.file.split('.').pop().toLowerCase();
    
    if (ext === 'pdf') {
      // PDF ni yangi tabda ochish
      window.open(url, '_blank');
    } else {
      // docx, doc, ppt, txt — yuklab olish
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.title;
      a.target = "_blank";
      a.click();
    }
  }

  return (
    <div className="library-root">
      <div className="lib-header">
        <h2 className="lib-header-title">
          📚 Kutubxona
          <span className="lib-count">{filtered.length} ta material</span>
        </h2>
        <div className="lib-search-wrap">
          <span className="lib-search-icon">🔍</span>
          <input
            className="lib-search-input"
            type="text"
            placeholder="Kitob, qidiring..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="lib-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      <div className="lib-mobile-cats">
        {CATEGORIES.map(cat => (
          <button key={cat.value} className={`lib-chip ${category === cat.value ? "active" : ""}`}
            onClick={() => setCategory(cat.value)}>{cat.label}</button>
        ))}
      </div>

      <div className="lib-layout">
        <aside className="lib-sidebar">
          <p className="lib-filter-label">Kategoriya</p>
          <div className="lib-filter-group">
            {CATEGORIES.map(cat => (
              <button key={cat.value} className={`lib-filter-btn ${category === cat.value ? "active" : ""}`}
                onClick={() => setCategory(cat.value)}>{cat.label}</button>
            ))}
          </div>
          <p className="lib-filter-label">Tur</p>
          <div className="lib-filter-group">
            {TYPES.map(t => (
              <button key={t.value} className={`lib-filter-btn ${type === t.value ? "active" : ""}`}
                onClick={() => setType(t.value)}>{t.label}</button>
            ))}
          </div>
          {(category || type || search) && (
            <button className="lib-filter-reset" onClick={() => { setCategory(""); setType(""); setSearch(""); }}>
              ✕ Filterni tozalash
            </button>
          )}
        </aside>

        <main className="lib-main">
          {filtered.length === 0 ? (
            <div className="lib-empty">
              <div className="lib-empty-icon">📭</div>
              <h3>Hech narsa topilmadi</h3>
              <p>Boshqa so'z yoki kategoriya bilan sinab ko'ring</p>
            </div>
          ) : (
            <div className="lib-grid">
              {filtered.map(doc => (
                <div key={doc.id} className="lib-card">
                  <div className="lib-card-cover">
                    <span className="lib-card-cover-icon">{TYPE_ICONS[doc.type] ?? "📁"}</span>
                  </div>
                  <div className="lib-card-body">
                    <h3 className="lib-card-title">{doc.title}</h3>
                    <button className="lib-dl-btn" onClick={() => handleDownload(doc)}>
                      {doc.file.split('.').pop().toLowerCase() === 'pdf' ? '👁️ Ko\'rish' : '⬇️ Yuklab olish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}