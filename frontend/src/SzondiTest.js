import { useState } from "react";
import "./SzondiTest.css";

// 8 ta yuz tipi — har biri Sondi bo'yicha bir ehtiyojni ifodalaydi
const FACES = [
  { id: "h", label: "Yumshoq", emoji: "😊", color: "#fde68a", factor: "h",
    svg: (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="35" r="28" fill="#fde68a" stroke="#d97706" strokeWidth="2"/>
        <circle cx="32" cy="30" r="4" fill="#fff"/><circle cx="48" cy="30" r="4" fill="#fff"/>
        <circle cx="33" cy="31" r="2" fill="#555"/><circle cx="49" cy="31" r="2" fill="#555"/>
        <path d="M30 45 Q40 55 50 45" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M28 22 Q32 18 36 22" stroke="#d97706" strokeWidth="1.5" fill="none"/>
        <path d="M44 22 Q48 18 52 22" stroke="#d97706" strokeWidth="1.5" fill="none"/>
        <ellipse cx="40" cy="62" rx="20" ry="8" fill="#d97706" opacity="0.3"/>
      </svg>
    )},
  { id: "s", label: "Qattiq", emoji: "😤", color: "#fca5a5", factor: "s",
    svg: (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="35" r="28" fill="#fca5a5" stroke="#dc2626" strokeWidth="2"/>
        <circle cx="32" cy="30" r="4" fill="#fff"/><circle cx="48" cy="30" r="4" fill="#fff"/>
        <circle cx="33" cy="30" r="2" fill="#333"/><circle cx="49" cy="30" r="2" fill="#333"/>
        <path d="M30 46 Q40 42 50 46" stroke="#555" strokeWidth="2" fill="none"/>
        <path d="M27 24 L36 27" stroke="#dc2626" strokeWidth="2"/><path d="M53 24 L44 27" stroke="#dc2626" strokeWidth="2"/>
        <ellipse cx="40" cy="62" rx="20" ry="8" fill="#dc2626" opacity="0.2"/>
      </svg>
    )},
  { id: "e", label: "Hissiyotli", emoji: "😢", color: "#a5f3fc", factor: "e",
    svg: (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="35" r="28" fill="#a5f3fc" stroke="#0891b2" strokeWidth="2"/>
        <circle cx="32" cy="29" r="4" fill="#fff"/><circle cx="48" cy="29" r="4" fill="#fff"/>
        <circle cx="33" cy="30" r="2" fill="#444"/><circle cx="49" cy="30" r="2" fill="#444"/>
        <path d="M32 47 Q40 53 48 47" stroke="#555" strokeWidth="1.5" fill="none"/>
        <path d="M34 34 Q34 38 32 40" stroke="#0891b2" strokeWidth="1" fill="none"/>
        <path d="M46 34 Q46 38 48 40" stroke="#0891b2" strokeWidth="1" fill="none"/>
        <ellipse cx="40" cy="62" rx="20" ry="8" fill="#0891b2" opacity="0.2"/>
      </svg>
    )},
  { id: "hy", label: "Dramatik", emoji: "🎭", color: "#d8b4fe", factor: "hy",
    svg: (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="35" r="28" fill="#d8b4fe" stroke="#7c3aed" strokeWidth="2"/>
        <ellipse cx="32" cy="29" rx="5" ry="4" fill="#fff"/><ellipse cx="48" cy="29" rx="5" ry="4" fill="#fff"/>
        <circle cx="33" cy="30" r="2.5" fill="#333"/><circle cx="49" cy="30" r="2.5" fill="#333"/>
        <path d="M28 46 Q40 56 52 46" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M26 23 Q32 19 37 23" stroke="#7c3aed" strokeWidth="1.5" fill="none"/>
        <path d="M43 23 Q48 19 54 23" stroke="#7c3aed" strokeWidth="1.5" fill="none"/>
        <ellipse cx="40" cy="62" rx="20" ry="8" fill="#7c3aed" opacity="0.2"/>
      </svg>
    )},
  { id: "k", label: "Qat'iy", emoji: "😐", color: "#bbf7d0", factor: "k",
    svg: (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="35" r="28" fill="#bbf7d0" stroke="#15803d" strokeWidth="2"/>
        <rect x="28" y="26" width="8" height="7" rx="3" fill="#fff"/><rect x="44" y="26" width="8" height="7" rx="3" fill="#fff"/>
        <circle cx="32" cy="30" r="2" fill="#333"/><circle cx="48" cy="30" r="2" fill="#333"/>
        <line x1="30" y1="46" x2="50" y2="46" stroke="#555" strokeWidth="2"/>
        <path d="M29 22 L36 24" stroke="#15803d" strokeWidth="1.5"/><path d="M51 22 L44 24" stroke="#15803d" strokeWidth="1.5"/>
        <ellipse cx="40" cy="62" rx="20" ry="8" fill="#15803d" opacity="0.2"/>
      </svg>
    )},
  { id: "p", label: "Sezgir", emoji: "🧐", color: "#fed7aa", factor: "p",
    svg: (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="35" r="28" fill="#fed7aa" stroke="#ea580c" strokeWidth="2"/>
        <ellipse cx="32" cy="30" rx="5" ry="5" fill="#fff"/><ellipse cx="48" cy="30" rx="5" ry="5" fill="#fff"/>
        <circle cx="32" cy="30" r="3" fill="#555"/><circle cx="48" cy="30" r="3" fill="#555"/>
        <circle cx="31" cy="29" r="1" fill="#fff"/><circle cx="47" cy="29" r="1" fill="#fff"/>
        <path d="M32 47 Q40 44 48 47" stroke="#555" strokeWidth="1.5" fill="none"/>
        <ellipse cx="40" cy="62" rx="20" ry="8" fill="#ea580c" opacity="0.2"/>
      </svg>
    )},
  { id: "d", label: "Intiluvchi", emoji: "🤔", color: "#e0e7ff", factor: "d",
    svg: (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="35" r="28" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2"/>
        <circle cx="32" cy="30" r="4" fill="#fff"/><circle cx="48" cy="30" r="4" fill="#fff"/>
        <circle cx="34" cy="30" r="2" fill="#333"/><circle cx="50" cy="30" r="2" fill="#333"/>
        <path d="M32 46 Q37 50 45 47" stroke="#555" strokeWidth="2" fill="none"/>
        <path d="M35 22 Q40 17 45 22" stroke="#4f46e5" strokeWidth="1.5" fill="none"/>
        <ellipse cx="40" cy="62" rx="20" ry="8" fill="#4f46e5" opacity="0.2"/>
      </svg>
    )},
  { id: "m", label: "Bog'liq", emoji: "🤝", color: "#fce7f3", factor: "m",
    svg: (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="35" r="28" fill="#fce7f3" stroke="#db2777" strokeWidth="2"/>
        <circle cx="32" cy="30" r="4" fill="#fff"/><circle cx="48" cy="30" r="4" fill="#fff"/>
        <circle cx="32" cy="30" r="2" fill="#444"/><circle cx="48" cy="30" r="2" fill="#444"/>
        <path d="M29 46 Q40 55 51 46" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M28 22 Q32 20 36 23" stroke="#db2777" strokeWidth="1.5" fill="none"/>
        <path d="M44 23 Q48 20 52 22" stroke="#db2777" strokeWidth="1.5" fill="none"/>
        <ellipse cx="40" cy="62" rx="20" ry="8" fill="#db2777" opacity="0.2"/>
      </svg>
    )},
];

// 6 seriya — har seriyada 8 ta yuz turli tartibda
const SERIES = [
  [0,1,2,3,4,5,6,7],
  [2,5,0,7,3,6,1,4],
  [4,7,1,6,0,3,5,2],
  [1,6,4,2,7,0,3,5],
  [3,0,6,5,2,7,4,1],
  [6,3,5,1,4,2,7,0],
];

// Natija profillari
const PROFILES = {
  h_s: { title: "Muhabbat va kuch", emoji: "❤️‍🔥", color: "#ef4444",
    desc: "Sizda kuchli sevgi va ehtirosga intilish bor. Munosabatlarda to'liq berilasiz.",
    traits: ["Ehtirosli va bag'rikeng", "Munosabatlarga chuqur beriladi", "Himoya qilish instinkti kuchli"],
    advice: ["His-tuyg'ularingizni muvozan qiling", "Yaqinlar bilan ochiq gaplashing", "O'z ehtiyojlaringizni bildirishdan qo'rqmang"] },
  e_hy: { title: "His-tuyg'u va ifoda", emoji: "🎭", color: "#7c3aed",
    desc: "Siz hissiyotga boy, o'z his-tuyg'ularini ifoda etishga moyil shaxssiz.",
    traits: ["Ijodiy va ekspressiv", "Empatiya kuchli", "San'at va estetikaga moyil"],
    advice: ["Ijodiy faoliyat bilan shug'ullaning", "His-tuyg'ularingizni ijobiy yo'naltiring", "San'at yoki musiqa orqali o'zingizni ifoda eting"] },
  k_p: { title: "Nazorat va idrok", emoji: "🧠", color: "#0891b2",
    desc: "Siz atrofni nazorat qilishga va chuqur his qilishga intilasiz.",
    traits: ["Analitik fikrlaydi", "Tafsilotlarga e'tibor beradi", "Mustaqil qaror qiladi"],
    advice: ["Perfeksionizmni kamaytiring", "Ba'zan nazoratni qo'yib yuboring", "O'zingizga ishoning"] },
  d_m: { title: "Intilish va bog'liqlik", emoji: "🌱", color: "#15803d",
    desc: "Siz yangi narsalarga intilasiz va yaqin munosabatlarga ehtiyoj his qilasiz.",
    traits: ["Ijtimoiy va muloqotsevar", "Yangiliklarga ochiq", "Sadoqatli va ishonchli"],
    advice: ["Yangi aloqalar o'rnating", "Maqsadlaringizni bosqichma-bosqich bajaring", "O'z ehtiyojlaringizni tan oling"] },
  default: { title: "Muvozanatli shaxs", emoji: "⚖️", color: "#553c9a",
    desc: "Sizda turli ehtiyojlar muvozanatli tarzda ifodalangan. Bu barqaror shaxsiyatning belgisi.",
    traits: ["Moslashuvchan", "Barqaror", "Ko'p tomonlama rivojlangan"],
    advice: ["Hozirgi muvozanatni saqlang", "Yangi imkoniyatlarga ochiq bo'ling", "O'z kuchlaringizdan foydalaning"] },
};

function getResult(selections) {
  const counts = {};
  FACES.forEach(f => { counts[f.id] = 0; });
  selections.flat().forEach(id => { counts[id] = (counts[id] || 0) + 1; });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top2 = sorted.slice(0, 2).map(e => e[0]).sort().join("_");

  if (top2.includes("h") && top2.includes("s")) return { ...PROFILES.h_s, counts };
  if (top2.includes("e") && top2.includes("hy")) return { ...PROFILES.e_hy, counts };
  if (top2.includes("k") && top2.includes("p")) return { ...PROFILES.k_p, counts };
  if (top2.includes("d") && top2.includes("m")) return { ...PROFILES.d_m, counts };
  return { ...PROFILES.default, counts };
}

export default function SzondiTest({ onBack }) {
  const [series, setSeries] = useState(0);
  const [selected, setSelected] = useState([]);
  const [seriesSelections, setSeriesSelections] = useState([]);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("intro");

  const currentFaces = SERIES[series].map(i => FACES[i]);

  const handleSelect = (faceId) => {
    if (selected.includes(faceId)) {
      setSelected(selected.filter(id => id !== faceId));
    } else if (selected.length < 2) {
      setSelected([...selected, faceId]);
    }
  };

  const handleNext = () => {
    if (selected.length < 2) return;
    const newSS = [...seriesSelections, selected];
    if (series + 1 >= SERIES.length) {
      setResult(getResult(newSS));
      setStep("result");
    } else {
      setSeriesSelections(newSS);
      setSeries(s => s + 1);
      setSelected([]);
    }
  };

  const handleRetry = () => {
    setSeries(0); setSelected([]); setSeriesSelections([]); setResult(null); setStep("intro");
  };

  // INTRO
  if (step === "intro") return (
    <div className="szondi-intro">
      <div className="szondi-intro-icon">🎭</div>
      <h2>Sondi Testi</h2>
      <p>Leopold Sondi tomonidan yaratilgan klassik psixologik test. Siz 6 marta 8 ta yuzni ko'rasiz va har safar <strong>eng yoqimli</strong> 2 ta yuzni tanlaysiz.</p>
      <div className="szondi-rules">
        <div className="rule-item"><span>👁️</span><span>Har seriyada 8 ta yuz ko'rsatiladi</span></div>
        <div className="rule-item"><span>✌️</span><span>Har safar 2 ta yuzni tanlang</span></div>
        <div className="rule-item"><span>⚡</span><span>Birinchi taassurotga ishoning</span></div>
        <div className="rule-item"><span>🔄</span><span>Jami 6 seriya — taxminan 3 daqiqa</span></div>
      </div>
      <button className="szondi-start-btn" onClick={() => setStep("test")}>Boshlash →</button>
      <button className="szondi-back-btn" onClick={onBack}>← Testlar ro'yxatiga</button>
    </div>
  );

  // TEST
  if (step === "test") return (
    <div className="szondi-test">
      <div className="szondi-header">
        <div className="szondi-progress">
          {SERIES.map((_, i) => (
            <div key={i} className={`sp-dot ${i < series ? "done" : i === series ? "active" : ""}`} />
          ))}
        </div>
        <p className="szondi-series-label">{series + 1}-seriya / {SERIES.length}</p>
        <p className="szondi-instruction">
          Hozir <strong>eng yoqimli</strong> 2 ta yuzni tanlang
          {selected.length > 0 && <span className="sel-count"> ({selected.length}/2 tanlandi)</span>}
        </p>
      </div>

      <div className="szondi-faces">
        {currentFaces.map(face => (
          <div
            key={face.id}
            className={`szondi-face ${selected.includes(face.id) ? "selected" : ""} ${selected.length === 2 && !selected.includes(face.id) ? "dimmed" : ""}`}
            onClick={() => handleSelect(face.id)}
            style={{ "--face-color": face.color }}
          >
            <div className="face-svg">{face.svg}</div>
            {selected.includes(face.id) && <div className="face-check">✓</div>}
          </div>
        ))}
      </div>

      <button
        className="szondi-next-btn"
        disabled={selected.length < 2}
        onClick={handleNext}
      >
        {series + 1 === SERIES.length ? "Natijani ko'rish →" : "Keyingisi →"}
      </button>
    </div>
  );

  // RESULT
  if (step === "result" && result) {
    const faceLabels = { h: "Yumshoq", s: "Qattiq", e: "Hissiyotli", hy: "Dramatik", k: "Qat'iy", p: "Sezgir", d: "Intiluvchi", m: "Bog'liq" };
    const maxCount = Math.max(...Object.values(result.counts));

    return (
      <div className="szondi-result">
        <div className="result-emoji" style={{ fontSize: 64, textAlign: "center", marginBottom: 12 }}>{result.emoji}</div>
        <div className="result-level" style={{ background: result.color + "22", color: result.color, display: "inline-block", padding: "5px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          Sondi profili
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 10 }}>{result.title}</h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 20 }}>{result.desc}</p>

        {/* Tanlov grafigi */}
        <div className="szondi-chart">
          <h3>Tanlangan yuzlar tahlili</h3>
          <div className="chart-bars">
            {Object.entries(result.counts).map(([id, count]) => (
              <div key={id} className="chart-bar-item">
                <div className="chart-bar-label">{faceLabels[id]}</div>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{ width: `${(count / (maxCount || 1)) * 100}%`, background: FACES.find(f => f.id === id)?.color || "#ccc" }} />
                </div>
                <div className="chart-bar-val">{count}x</div>
              </div>
            ))}
          </div>
        </div>

        {/* Xususiyatlar */}
        <div className="result-advice">
          <h3>🔍 Shaxsiyat xususiyatlari</h3>
          {result.traits.map((t, i) => (
            <div key={i} className="advice-item">
              <span className="advice-num" style={{ background: result.color }}>✓</span>
              <span>{t}</span>
            </div>
          ))}
        </div>

        {/* Psixolog tavsiyasi */}
        <div className="psych-box" style={{ marginTop: 12 }}>
          <span style={{ fontSize: 28 }}>👨‍⚕️</span>
          <div>
            <strong style={{ fontSize: 14, fontWeight: 600, color: "#166534", display: "block", marginBottom: 4 }}>Psixolog izohi:</strong>
            <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, margin: 0 }}>
              Sondi testi ongsiz ehtiyojlarni aniqlashga yordam beradi. Bu natija sizning hozirgi ruhiy holatingizni aks ettiradi — bu o'zgarishi mumkin. Chuqurroq tahlil uchun mutaxassis bilan maslahatlashing.
            </p>
          </div>
        </div>

        {/* Tavsiyalar */}
        <div className="result-advice" style={{ marginTop: 12 }}>
          <h3>💡 Tavsiyalar</h3>
          {result.advice.map((a, i) => (
            <div key={i} className="advice-item">
              <span className="advice-num">{i + 1}</span>
              <span>{a}</span>
            </div>
          ))}
        </div>

        <button className="test-retry-btn" style={{ background: result.color, marginTop: 20 }} onClick={handleRetry}>🔄 Qayta o'tish</button>
        <button className="test-back-btn" style={{ marginTop: 10 }} onClick={onBack}>← Testlar ro'yxatiga</button>
      </div>
    );
  }

  return null;
}
