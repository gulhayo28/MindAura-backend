import { useState, useEffect } from "react";
import "./ExtraTests.css";

// ═══════════════════════════════════════════════
// YORDAMCHI KOMPONENTLAR
// ═══════════════════════════════════════════════
function QProgress({ current, total, color }) {
  return (
    <div className="q-progress">
      <div className="q-progress-bar">
        <div style={{ width: Math.round((current / total) * 100) + "%", background: color }} />
      </div>
      <span>{current + 1}/{total}</span>
    </div>
  );
}

function RetryBack({ onRetry, onBack }) {
  return (
    <div style={{ marginTop: 20 }}>
      <button className="test-retry-btn" onClick={onRetry}>🔄 Qayta o'tish</button>
      <button className="test-back-btn" onClick={onBack}>← Testlar ro'yxatiga</button>
    </div>
  );
}

function ResultCard({ result, onRetry, onBack, score, maxScore }) {
  return (
    <div className="test-result">
      <div className="result-emoji">{result.emoji}</div>
      {score !== undefined && (
        <div className="result-score-circle" style={{ borderColor: result.color, color: result.color }}>
          {score}<span>/{maxScore}</span>
        </div>
      )}
      <div className="result-level" style={{ background: result.color + "22", color: result.color }}>{result.level}</div>
      <h2>{result.state}</h2>
      <p className="result-desc">{result.desc}</p>
      {result.psych && (
        <div className="psych-box">
          <span className="psych-icon">👨‍⚕️</span>
          <div><strong>Psixolog izohi:</strong><p>{result.psych}</p></div>
        </div>
      )}
      {result.traits && (
        <div className="result-advice">
          <h3>🔍 Xususiyatlar</h3>
          {result.traits.map((t, i) => (
            <div key={i} className="advice-item">
              <span className="advice-num" style={{ background: result.color }}>✓</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}
      <div className="result-advice" style={{ marginTop: 12 }}>
        <h3>💡 Tavsiyalar</h3>
        {result.advice.map((a, i) => (
          <div key={i} className="advice-item">
            <span className="advice-num">{i + 1}</span>
            <span>{a}</span>
          </div>
        ))}
      </div>
      <RetryBack onRetry={onRetry} onBack={onBack} />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 1. RORSCHACH INKBLOT TESTI
// ═══════════════════════════════════════════════
const INKBLOTS = [
  { id: 1, emoji: "🦇", label: "1-rasm", opts: [
    { text: "Kapalak yoki qushlar", dim: "ijodiy" },
    { text: "Yuzma-yuz turgan ikki odam", dim: "ijtimoiy" },
    { text: "Qorong'u figura, xavfli narsa", dim: "xavotir" },
    { text: "Simmetrik bezak naqsh", dim: "analitik" },
  ]},
  { id: 2, emoji: "🩸", label: "2-rasm", opts: [
    { text: "O'ynayotgan ikkita odam", dim: "ijtimoiy" },
    { text: "Yonayotgan olov yoki qon", dim: "intensiv" },
    { text: "Ajoyib kapalak", dim: "ijodiy" },
    { text: "Simmetrik anatomik shakl", dim: "analitik" },
  ]},
  { id: 3, emoji: "🎭", label: "3-rasm", opts: [
    { text: "Ikkita odam biror narsa qilyapti", dim: "ijtimoiy" },
    { text: "Qushlar yoki hayvonlar", dim: "ijodiy" },
    { text: "Anatomik organ", dim: "analitik" },
    { text: "Kulgili figurelar", dim: "ijodiy" },
  ]},
  { id: 4, emoji: "🦍", label: "4-rasm", opts: [
    { text: "Katta, kuchli figura (ota, avtoritet)", dim: "kuch" },
    { text: "Yotgan hayvon", dim: "ijodiy" },
    { text: "Qo'rqinchli monster", dim: "xavotir" },
    { text: "Daraxt yoki o'simlik", dim: "tabiiy" },
  ]},
  { id: 5, emoji: "🦋", label: "5-rasm", opts: [
    { text: "Kapalak yoki ko'rshapalak", dim: "ijodiy" },
    { text: "Uchayotgan qush", dim: "ijodiy" },
    { text: "Yuz yoki niqob", dim: "ijtimoiy" },
    { text: "Anatomik tuzilish", dim: "analitik" },
  ]},
  { id: 6, emoji: "🐾", label: "6-rasm", opts: [
    { text: "Hayvon terisi yoki xalı", dim: "hissiy" },
    { text: "Raket yoki raketa", dim: "kuch" },
    { text: "Daryo va vodiy", dim: "tabiiy" },
    { text: "Seksual ramz", dim: "intensiv" },
  ]},
  { id: 7, emoji: "👧", label: "7-rasm", opts: [
    { text: "Ikkita ayol yoki qiz", dim: "ijtimoiy" },
    { text: "Bulutlar va osmon", dim: "tabiiy" },
    { text: "Hayvon boshi", dim: "ijodiy" },
    { text: "O'pishayotgan figuralar", dim: "hissiy" },
  ]},
  { id: 8, emoji: "🐻", label: "8-rasm", opts: [
    { text: "Ayiqlar yoki tulkilar", dim: "ijodiy" },
    { text: "Rang-barang gul", dim: "tabiiy" },
    { text: "Anatomik kesmalar", dim: "analitik" },
    { text: "Bayroq yoki nishon", dim: "kuch" },
  ]},
  { id: 9, emoji: "🌋", label: "9-rasm", opts: [
    { text: "Portlash yoki olov", dim: "intensiv" },
    { text: "Ikkita kishi gap qurishyapti", dim: "ijtimoiy" },
    { text: "Gul va bog'", dim: "tabiiy" },
    { text: "Fantastik mavjudot", dim: "ijodiy" },
  ]},
  { id: 10, emoji: "🦞", label: "10-rasm", opts: [
    { text: "Krabs, qisqichbaqa", dim: "ijodiy" },
    { text: "Ko'p rangli naqsh", dim: "analitik" },
    { text: "Hayot daraxti", dim: "tabiiy" },
    { text: "Ildiz va shoxlar", dim: "hissiy" },
  ]},
];

const INKBLOT_RESULTS = {
  ijodiy: { state: "Ijodiy va tasavvurli", emoji: "🎨", level: "Ijodkor", color: "#7c3aed",
    desc: "Siz kuchli tasavvurga egasiz. Dunyoni boshqacha ko'rasiz va ijodiy yechimlar topasiz.",
    traits: ["Kuchli tasavvur", "Noodatiy fikrlash", "Badiiy sezgirlik", "Moslashuvchanlik"],
    psych: "Ijodiy idrok kuchli — bu ijodiy kasblar va muammolarni noodatiy hal qilishda katta ustunlik.",
    advice: ["Ijodiy hobbiylarni rivojlantiring", "San'at, musiqa yoki yozuvni sinab ko'ring", "Ijodiy muhitda ishlashga intiling"] },
  ijtimoiy: { state: "Ijtimoiy va muloqotsevar", emoji: "🤝", level: "Ijtimoiy", color: "#22c55e",
    desc: "Odamlar bilan munosabatlar sizga muhim. Ijtimoiy vaziyatlarda o'zingizni yaxshi his qilasiz.",
    traits: ["Muloqotga ochiq", "Empatiya kuchli", "Hamkorlikka moyil", "Boshqalarni tushunadi"],
    psych: "Ijtimoiy yo'nalish kuchli — bu rahbarlik va jamoa ishida katta ustunlik.",
    advice: ["Ijtimoiy tarmoqlaringizni kengaytiring", "Jamoaviy loyihalarda qatnashing", "Muloqot ko'nikmalarini yanada oshiring"] },
  analitik: { state: "Analitik va mantiqiy", emoji: "🧠", level: "Analitik", color: "#0891b2",
    desc: "Siz tafsilotlarga e'tibor berasiz va mantiqiy fikrlaysiz. Tizimli yondashish sizga xos.",
    traits: ["Tizimli fikrlash", "Tafsilotlarga e'tibor", "Ob'ektiv baholash", "Puxta tahlil"],
    psych: "Analitik idrok kuchli — fan, texnologiya va tahlil talab qiladigan sohalarda muvaffaqiyat yuqori.",
    advice: ["Mantiqiy masalalarni yechishni davom eting", "Yangi texnik ko'nikmalar o'rganing", "Kreativlikni ham rivojlantiring"] },
  xavotir: { state: "Sezgir va ehtiyotkor", emoji: "🌙", level: "Sezgir", color: "#f59e0b",
    desc: "Siz nozik his-tuyg'ularga egasiz. Ba'zan xavotir va ehtiyotkorlik ustunlik qiladi.",
    traits: ["Nozik his-tuyg'u", "Ehtiyotkorlik", "Chuqur tahlil", "Xavf-xatarni sezish"],
    psych: "Sezgirlik kuchli — bu himoya mexanizmi bo'lishi mumkin. Psixolog bilan ishlash foydali.",
    advice: ["Relaksatsiya texnikalarini o'rganing", "Xavotirni boshqarishni mashq qiling", "Psixolog bilan suhbatlashing"] },
  intensiv: { state: "Intensiv va kuchli his-tuyg'uli", emoji: "🔥", level: "Intensiv", color: "#ef4444",
    desc: "Siz kuchli his-tuyg'ularga egasiz. Hayotni to'liq his qilasiz va keskin reaksiyalar berasiz.",
    traits: ["Kuchli his-tuyg'u", "Ehtiroslilik", "Tez reaktsiya", "Chuqur boshdan kechirish"],
    psych: "His-tuyg'ular intensiv — ularni to'g'ri kanalga yo'naltirish muhim.",
    advice: ["His-tuyg'ularni boshqarishni o'rganing", "Sport va jismoniy faollik yordamida energiyani chiqaring", "Meditatsiya qiling"] },
  tabiiy: { state: "Xotirjam va muvozanatli", emoji: "🌿", level: "Muvozanatli", color: "#15803d",
    desc: "Siz tabiat bilan uyg'unlikda, xotirjam va barqaror holatidasiz.",
    traits: ["Ichki tinchlik", "Tabiat bilan uyg'unlik", "Muvozanat", "Sabr-toqat"],
    psych: "Muvozanatli idrok — bu ruhiy salomatlikning yaxshi ko'rsatkichi.",
    advice: ["Tabiatda vaqt o'tkazishni davom eting", "Meditatsiya va mindfulness amaliyotlari", "Tinch muhitni saqlang"] },
  hissiy: { state: "Hissiyotga boy va empatik", emoji: "💜", level: "Empatik", color: "#db2777",
    desc: "Siz boshqalarning his-tuyg'ularini teran his qilasiz. Empatiya va sezgirlik sizning kuchingiz.",
    traits: ["Kuchli empatiya", "Hissiy ziyraklik", "Mehribon", "Boshqalarni tushunadi"],
    psych: "Empatiya kuchli — bu psixolog, o'qituvchi yoki shifokor kabi kasblar uchun katta ustunlik.",
    advice: ["O'z his-tuyg'ularingizga ham e'tibor bering", "Hissiy chegaralar o'rnatishni o'rganing", "Yordamchi kasblarni ko'rib chiqing"] },
  kuch: { state: "Kuchga intiluvchi va ambitsiyali", emoji: "💪", level: "Ambitsiyali", color: "#dc2626",
    desc: "Siz kuch, muvaffaqiyat va tan olinishga intilasiz. Raqobatchilik sizga xos.",
    traits: ["Maqsadga intilish", "Raqobatchilik", "Rahbarlik", "Qat'iyat"],
    psych: "Kuchga intilish — bu motivatsiyaning kuchli manbai. Uni konstruktiv yo'naltirish muhim.",
    advice: ["Maqsadlaringizni aniq belgilang", "Rahbarlik ko'nikmalarini rivojlantiring", "Boshqalar bilan hamkorlikni o'rganing"] },
};

export function RorschachTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [dimScores, setDimScores] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (dim) => {
    const newScores = { ...dimScores, [dim]: (dimScores[dim] || 0) + 1 };
    if (current + 1 >= INKBLOTS.length) {
      const top = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0][0];
      setResult(INKBLOT_RESULTS[top] || INKBLOT_RESULTS.ijodiy);
    } else { setDimScores(newScores); setCurrent(c => c + 1); }
  };

  if (result) return <ResultCard result={result} onRetry={() => { setCurrent(0); setDimScores({}); setResult(null); }} onBack={onBack} />;

  const blot = INKBLOTS[current];
  return (
    <div className="question-test">
      <QProgress current={current} total={INKBLOTS.length} color="#7c3aed" />
      <p className="q-subtitle">Bu rasmda nimani ko'ryapsiz? Birinchi kelgan fikrni tanlang</p>
      <div className="q-card">
        <div className="inkblot-display">
          <span className="inkblot-emoji">{blot.emoji}</span>
          <div className="inkblot-shape" />
        </div>
        <p className="q-text" style={{ fontSize: 15 }}>{blot.label}: Bu shaklda nimani ko'ryapsiz?</p>
        <div className="q-options">
          {blot.opts.map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(opt.dim)}>{opt.text}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 2. BIG 5 PERSONALITY TEST
// ═══════════════════════════════════════════════
const BIG5_Q = [
  { q: "Yangi g'oyalar va tajribalar sizni qiziqtiradimi?", dim: "O" },
  { q: "Odatda tartibli va rejalashtirib ishlaysizmi?", dim: "C" },
  { q: "Odamlar bilan vaqt o'tkazish sizga energiya beradimi?", dim: "E" },
  { q: "Boshqalarga yordam berishdan xursand bo'lasizmi?", dim: "A" },
  { q: "Ba'zan tashvish va stress his qilasizmi?", dim: "N" },
  { q: "Ijodiy va badiiy narsalarga qiziqasizmi?", dim: "O" },
  { q: "Vazifalarni o'z vaqtida bajarasizmi?", dim: "C" },
  { q: "Guruhda faol va gapirishni yoqtirasizmi?", dim: "E" },
  { q: "Boshqalarning his-tuyg'ulariga e'tibor berasizmi?", dim: "A" },
  { q: "Kayfiyatingiz tez o'zgarib turadimi?", dim: "N" },
  { q: "Falsafiy va chuqur mavzularni yoqtirasizmi?", dim: "O" },
  { q: "Puxta rejalashtirmasdan ishlash qiyin bo'ladimi?", dim: "C" },
  { q: "Tanish bo'lmagan odamlar bilan tez til topasizmi?", dim: "E" },
  { q: "Nizoli vaziyatlarda osonlik bilan kechirasizmi?", dim: "A" },
  { q: "Ba'zan o'zingizni etarli emas deb his qilasizmi?", dim: "N" },
];

const BIG5_DIMS = {
  O: { name: "Ochiqlik", emoji: "🎨", color: "#7c3aed", high: "Ijodiy, qiziquvchan, yangiliklarga ochiq", low: "Amaliy, an'anaviy, barqaror" },
  C: { name: "Vijdonlilik", emoji: "📋", color: "#0891b2", high: "Tartibli, mas'uliyatli, puxta", low: "Erkin, spontan, moslashuvchan" },
  E: { name: "Ekstraversiya", emoji: "🌟", color: "#f59e0b", high: "Muloqotsevar, faol, optimistik", low: "Introver, mustaqil, fikrlovchi" },
  A: { name: "Yoqimlilik", emoji: "💚", color: "#22c55e", high: "Hamkorchi, empatik, ishonchli", low: "Mustaqil, raqobatchi, tanqidchi" },
  N: { name: "Nevrotizm", emoji: "🌊", color: "#ef4444", high: "Sezgir, emotsional, ehtiyotkor", low: "Barqaror, xotirjam, chidamli" },
};

export function Big5Test({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ O: 0, C: 0, E: 0, A: 0, N: 0 });
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const dim = BIG5_Q[current].dim;
    const newScores = { ...scores, [dim]: scores[dim] + val };
    if (current + 1 >= BIG5_Q.length) {
      setResult(newScores);
    } else { setScores(newScores); setCurrent(c => c + 1); }
  };

  if (result) {
    const maxPerDim = 3 * 3; // 3 savol × max 4 ball
    return (
      <div className="test-result">
        <div className="result-emoji">🧬</div>
        <div className="result-level" style={{ background: "#553c9a22", color: "#553c9a" }}>Big 5 Profil</div>
        <h2>Sizning shaxsiyat profiling</h2>
        <p className="result-desc">Big Five — dunyodagi eng ishonchli shaxsiyat modeli. Quyida 5 ta asosiy o'lcham bo'yicha bahoingiz:</p>
        <div className="big5-chart">
          {Object.entries(result).map(([key, val]) => {
            const pct = Math.round((val / maxPerDim) * 100);
            const dim = BIG5_DIMS[key];
            return (
              <div key={key} className="big5-item">
                <div className="big5-label">
                  <span>{dim.emoji} {dim.name}</span>
                  <span className="big5-pct" style={{ color: dim.color }}>{pct}%</span>
                </div>
                <div className="big5-bar-track">
                  <div className="big5-bar-fill" style={{ width: pct + "%", background: dim.color }} />
                </div>
                <p className="big5-desc">{pct >= 50 ? dim.high : dim.low}</p>
              </div>
            );
          })}
        </div>
        <div className="psych-box">
          <span className="psych-icon">👨‍⚕️</span>
          <div><strong>Psixolog izohi:</strong>
            <p>Big Five modeli shaxsiyatning 5 asosiy o'lchamini o'lchaydi. Bu natijalar sizning ish uslubi, munosabatlar va hayot yondashuvingiz haqida muhim ma'lumot beradi.</p>
          </div>
        </div>
        <div className="result-advice">
          <h3>💡 Tavsiyalar</h3>
          {["Kuchli tomonlaringizdan foydalaning", "Zaif tomonlarni rivojlantiring", "Shaxsiyatingizni qabul qiling — har bir tip qimmatli", "Psixolog bilan chuqur tahlil qiling"].map((a, i) => (
            <div key={i} className="advice-item"><span className="advice-num">{i + 1}</span><span>{a}</span></div>
          ))}
        </div>
        <RetryBack onRetry={() => { setCurrent(0); setScores({ O: 0, C: 0, E: 0, A: 0, N: 0 }); setResult(null); }} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="question-test">
      <QProgress current={current} total={BIG5_Q.length} color="#553c9a" />
      <div className="q-card">
        <p className="q-text">{BIG5_Q[current].q}</p>
        <div className="q-options">
          {["Umuman yo'q", "Kamdan-kam", "Ba'zan", "Ko'pincha", "Har doim"].map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 3. ENNEAGRAM (9 tip)
// ═══════════════════════════════════════════════
const ENNEA_Q = [
  { q: "Asosiy motivatsiyangiz nima?", opts: [
    { t: "To'g'ri bo'lish, yaxshilik qilish", tip: 1 },
    { t: "Sevilib, kerak bo'lib qolish", tip: 2 },
    { t: "Muvaffaqiyatga erishish, tan olinish", tip: 3 },
    { t: "O'z o'ziga xosligini saqlab qolish", tip: 4 },
    { t: "Bilim va tushunishga erishish", tip: 5 },
    { t: "Xavfsizlik va qo'llab-quvvatlash", tip: 6 },
    { t: "Baxtli bo'lish, yangi tajribalar", tip: 7 },
    { t: "Kuchli va mustaqil bo'lish", tip: 8 },
    { t: "Tinchlik va uyg'unlik", tip: 9 },
  ]},
  { q: "Stress holatida odatda nima qilasiz?", opts: [
    { t: "Qoidalarga rioya qilishga harakat qilaman", tip: 1 },
    { t: "Boshqalarga ko'proq yordam beraman", tip: 2 },
    { t: "Ko'proq ishlayman, natija chiqarishga uraman", tip: 3 },
    { t: "Ichimga o'tib, his-tuyg'ularimni kuchaytirib his qilaman", tip: 4 },
    { t: "Yolg'izlikka chekinaman va o'ylayman", tip: 5 },
    { t: "Boshqalardan tasdiqlash izlayman", tip: 6 },
    { t: "E'tiborni boshqa narsalarga o'tkazaman", tip: 7 },
    { t: "Nazoratni qo'lda ushlab qolaman", tip: 8 },
    { t: "Muammoni chetlab o'tishga harakat qilaman", tip: 9 },
  ]},
  { q: "Siz o'zingizni qanday inson deb bilasiz?", opts: [
    { t: "Prinsipial va intizomli", tip: 1 },
    { t: "Mehribon va bag'rikeng", tip: 2 },
    { t: "Muvaffaqiyatga erishuvchi", tip: 3 },
    { t: "O'ziga xos va chuqur his-tuyg'uli", tip: 4 },
    { t: "Bilimdon va kuzatuvchi", tip: 5 },
    { t: "Sadoqatli va ehtiyotkor", tip: 6 },
    { t: "Quvnoq va sarguzashtsevar", tip: 7 },
    { t: "Kuchli va himoyachi", tip: 8 },
    { t: "Osoyishta va moslashuvchan", tip: 9 },
  ]},
  { q: "Munosabatlarda siz odatda...", opts: [
    { t: "Standartlar va kutilmalarga e'tibor beraman", tip: 1 },
    { t: "Boshqalar ehtiyojini o'zimnikidan oldin qo'yaman", tip: 2 },
    { t: "Muvaffaqiyatli ko'rinishga harakat qilaman", tip: 3 },
    { t: "Chuqur va hissiy aloqa izlayman", tip: 4 },
    { t: "Shaxsiy makonga ehtiyoj sezaman", tip: 5 },
    { t: "Ishonchli va bardoshli bo'lishga harakat qilaman", tip: 6 },
    { t: "Zavqli va ilhomlantiruvchi bo'lishga uraman", tip: 7 },
    { t: "To'g'ridan-to'g'ri va aniq bo'laman", tip: 8 },
    { t: "Hammaga moslashishga harakat qilaman", tip: 9 },
  ]},
  { q: "Sizga eng qiyin narsa nima?", opts: [
    { t: "Xatoga yo'l qo'yish", tip: 1 },
    { t: "Kerak bo'lmaslik", tip: 2 },
    { t: "Muvaffaqiyatsizlik", tip: 3 },
    { t: "Oddiy va o'xshash bo'lish", tip: 4 },
    { t: "Boshqalarga bog'liq bo'lish", tip: 5 },
    { t: "Ishonchsizlik va xavotir", tip: 6 },
    { t: "Zerikarlilik va cheklovlar", tip: 7 },
    { t: "Zaiflik ko'rsatish", tip: 8 },
    { t: "Nizolar va kelishmovchiliklar", tip: 9 },
  ]},
];

const ENNEA_TYPES = {
  1: { name: "Islohotchi", emoji: "⚖️", color: "#0891b2", desc: "Siz prinsipial, tartibli va yaxshilikka intiluvchi shaxssiz. Standartlar sizga muhim.", psych: "1-tip kuchli vijdon va mukammallikka intilish bilan tavsiflanadi.", traits: ["Prinsipial va halol", "Intizomli", "Tafsilotlarga e'tibor beradi"], advice: ["O'zingizga nisbatan mehribon bo'ling", "Mukammallikdan voz keching — yetarlicha yaxshi bo'lish kifoya", "Relaksatsiya va o'yin-kulgi uchun vaqt ajrating"] },
  2: { name: "Yordamchi", emoji: "💝", color: "#ec4899", desc: "Siz mehribon, bag'rikeng va boshqalarga yordam berishni yaxshi ko'rasiz.", psych: "2-tip boshqalar ehtiyojini o'z ehtiyojidan ustun qo'yadi.", traits: ["Mehribon va empatik", "Bag'rikeng", "Munosabatlar uchun ochiq"], advice: ["O'z ehtiyojlaringizni ham bildirishga ruxsat bering", "\"Yo'q\" deyishni o'rganing", "O'zingizga ham g'amxo'rlik qiling"] },
  3: { name: "Muvaffaqiyatli", emoji: "🏆", color: "#f59e0b", desc: "Siz ambitsiyali, maqsadga intiluvchi va muvaffaqiyatga chanqoq shaxssiz.", psych: "3-tip muvaffaqiyat va tan olinishga kuchli intiladi.", traits: ["Maqsadga yo'nalgan", "Samarali", "Tashabbuskor"], advice: ["Muvaffaqiyatdan tashqarida ham o'zingizni qimmatli his qiling", "Dam olishga ruxsat bering", "Chuqur munosabatlar o'rnating"] },
  4: { name: "Individual", emoji: "🎭", color: "#7c3aed", desc: "Siz o'ziga xos, ijodiy va chuqur his-tuyg'uli shaxssiz.", psych: "4-tip o'z o'ziga xosligini saqlab qolishga va chuqur his-tuyg'ularga intiladi.", traits: ["O'ziga xos", "Ijodiy", "Chuqur his-tuyg'u"], advice: ["Hozirgi daqiqada yashashga harakat qiling", "Ijodiy ifodani rivojlantiring", "Boshqalar bilan aloqani kuchaytiring"] },
  5: { name: "Tergovchi", emoji: "🔭", color: "#1d4ed8", desc: "Siz kuzatuvchi, bilimdon va mustaqil shaxssiz. Bilim sizning kuchingiz.", psych: "5-tip bilim orqali xavfsizlik izlaydi.", traits: ["Analitik", "Kuzatuvchi", "Mustaqil"], advice: ["Boshqalar bilan ko'proq ulashing", "His-tuyg'ularingizni ifoda eting", "Amaliy tajribaga ham e'tibor bering"] },
  6: { name: "Sadoqatli", emoji: "🛡️", color: "#059669", desc: "Siz sadoqatli, ishonchli va xavfsizlikni qadrlaysiz.", psych: "6-tip xavfsizlik va ishonchli munosabatlarga intiladi.", traits: ["Sadoqatli", "Ishonchli", "Ehtiyotkor"], advice: ["O'z qarorlarga ishoning", "Xavotirni boshqarishni o'rganing", "O'z instinktlaringizga ishoning"] },
  7: { name: "Sarguzashtchi", emoji: "🌈", color: "#dc2626", desc: "Siz quvnoq, sarguzashtsevar va hayotsevar shaxssiz.", psych: "7-tip yangi tajribalar va quvonchga intiladi.", traits: ["Quvnoq", "Sarguzashtsevar", "Ijodiy"], advice: ["Bir ishda chuqurroq qaling", "Qiyin his-tuyg'ulardan qochmang", "Hozirgi daqiqani his qiling"] },
  8: { name: "Muzokarakor", emoji: "💪", color: "#ef4444", desc: "Siz kuchli, to'g'riso'z va himoyachi shaxssiz.", psych: "8-tip kuch va nazorat orqali o'zini himoya qiladi.", traits: ["Kuchli", "To'g'riso'z", "Himoyachi"], advice: ["Zaiflikni qabul qilish — kuchsizlik emas", "Boshqalarni ham nazorat qilmasdan qabul qiling", "Yumshoqlikni rivojlantiring"] },
  9: { name: "Tinchlovchi", emoji: "☮️", color: "#15803d", desc: "Siz osoyishta, moslashuvchan va uyg'unlikni sevuvchi shaxssiz.", psych: "9-tip tinchlik va uyg'unlikni saqlab qolishga intiladi.", traits: ["Osoyishta", "Moslashuvchan", "Empatik"], advice: ["O'z ehtiyojlaringizni bildirishga o'rganing", "Nizo vaqtida ham o'z fikringizni ayting", "O'z maqsadlaringizni aniqlang"] },
};

export function EnneagramTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [tipScores, setTipScores] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (tip) => {
    const newScores = { ...tipScores, [tip]: (tipScores[tip] || 0) + 1 };
    if (current + 1 >= ENNEA_Q.length) {
      const top = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0]?.[0] || "9";
      setResult(ENNEA_TYPES[parseInt(top)]);
    } else { setTipScores(newScores); setCurrent(c => c + 1); }
  };

  if (result) return <ResultCard result={result} onRetry={() => { setCurrent(0); setTipScores({}); setResult(null); }} onBack={onBack} />;

  return (
    <div className="question-test">
      <QProgress current={current} total={ENNEA_Q.length} color="#7c3aed" />
      <div className="q-card">
        <p className="q-text">{ENNEA_Q[current].q}</p>
        <div className="q-options">
          {ENNEA_Q[current].opts.map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(opt.tip)}>{opt.t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 4. EMPATHY TEST
// ═══════════════════════════════════════════════
const EMPATHY_Q = [
  "Boshqalar xafa bo'lsa, siz ham xafa bo'lasizmi?",
  "Odamlarning yuz ifodasidan his-tuyg'ularini bila olasizmi?",
  "Filmda qayg'uli sahna bo'lsa, ko'zingiz yoshlanib ketadimi?",
  "Boshqa odam qiynalsa, unga yordam berish istaği kuchlimi?",
  "Notanish odamning dardini eshitib, u bilan birga his qila olasizmi?",
  "Guruhda kim noqulay ekanini tezda sezasizmi?",
  "Boshqa odam nima his qilayotganini tez anglay olasizmi?",
  "Yaqiningizning muammosi sizni ham bezovta qiladimi?",
];

export function EmpathyTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const newTotal = total + val;
    if (current + 1 >= EMPATHY_Q.length) {
      let res;
      if (newTotal <= 12) res = { state: "Past empatiya", emoji: "😐", level: "Past", color: "#6b7280", desc: "Boshqalarning his-tuyg'ularini his qilish sizga qiyin. Bu muloqotda muammolarga olib kelishi mumkin.", psych: "Empatiyani rivojlantirish mumkin — bu tug'ma xususiyat emas.", traits: ["Mustaqil fikrlash", "Ob'ektiv baholash"], advice: ["Boshqalarni tinglashga ko'proq vaqt ajrating", "\"Ular o'rnida bo'lsam?\" deb o'ylang", "Empatiya mashqlarini bajaring"] };
      else if (newTotal <= 24) res = { state: "O'rtacha empatiya", emoji: "🙂", level: "O'rta", color: "#f59e0b", desc: "Siz boshqalarni ma'lum darajada his qila olasiz. Bu ko'nikmani yanada oshirish mumkin.", psych: "O'rtacha empatiya — ko'pchilik uchun normal holat.", traits: ["Tanlama empatiya", "Yaqinlarga kuchli his-tuyg'u"], advice: ["Faol tinglab o'rganing", "His-tuyg'ularingizni ochiqroq ifoda eting", "Boshqalar bilan ko'proq ulashing"] };
      else res = { state: "Yuqori empatiya", emoji: "💜", level: "Yuqori", color: "#7c3aed", desc: "Siz boshqalarning his-tuyg'ularini juda teran his qilasiz. Bu kuchli, lekin charchash xavfi ham bor.", psych: "Yuqori empatiya — psixolog, shifokor va o'qituvchilar uchun katta ustunlik. Ammo 'empathy burnout'dan ehtiyot bo'ling.", traits: ["Chuqur his-tuyg'u", "Boshqalarni tushunish", "Empatik muloqot"], advice: ["O'z his-tuyg'ularingiz uchun vaqt ajrating", "Hissiy chegaralar o'rnating", "O'zingizga g'amxo'rlik qiling"] };
      setResult({ ...res, score: newTotal });
    } else { setTotal(newTotal); setCurrent(c => c + 1); }
  };

  if (result) return <ResultCard result={result} score={result.score} maxScore={32} onRetry={() => { setCurrent(0); setTotal(0); setResult(null); }} onBack={onBack} />;

  return (
    <div className="question-test">
      <QProgress current={current} total={EMPATHY_Q.length} color="#7c3aed" />
      <div className="q-card">
        <p className="q-text">{EMPATHY_Q[current]}</p>
        <div className="q-options">
          {["Umuman yo'q (0)", "Kamdan-kam (1)", "Ba'zan (2)", "Ko'pincha (3)", "Har doim (4)"].map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 5. NARCISSISM TEST (NPI-16)
// ═══════════════════════════════════════════════
const NARC_Q = [
  { a: "Men o'z fikrimni boshqalarga o'tkaza olaman", b: "Men odamlarni o'z fikrimga ko'ndirish uchun harakat qilmayman", dim: 1 },
  { a: "Men odatda o'z yo'limni tutaman", b: "Men odatda boshqalar nima desa, shuni qilaman", dim: 1 },
  { a: "Men alohida odam ekanman", b: "Men ko'pchilikdan farq qilmayman", dim: 1 },
  { a: "Men diqqat markazida bo'lishni yaxshi ko'raman", b: "Diqqat markazida bo'lish menga noqulay", dim: 1 },
  { a: "Men faqat o'zimning muammolarim bilan shug'ullanaman", b: "Mening muammolarim va boshqalarning muammolari bir xil muhim", dim: -1 },
  { a: "Men muvaffaqiyatimni boshqalar bilan ulashgim keladi", b: "Men o'z muvaffaqiyatimni o'zim bilaman — bu kifoya", dim: 1 },
  { a: "Men hamma narsani boshqarishni yaxshi ko'raman", b: "Men mas'uliyatni boshqalar bilan ulashishni yaxshi ko'raman", dim: 1 },
  { a: "Bir kun bo'lsa ham mashhur bo'lishni istardim", b: "Mashhurlik men uchun muhim emas", dim: 1 },
];

export function NarcissismTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);

  const handleAnswer = (choice) => {
    const q = NARC_Q[current];
    const add = choice === "a" ? (q.dim > 0 ? 1 : 0) : (q.dim < 0 ? 1 : 0);
    const newScore = score + add;
    if (current + 1 >= NARC_Q.length) {
      let res;
      if (newScore <= 2) res = { state: "Past narsisizm darajasi", emoji: "🌿", level: "Past", color: "#22c55e", desc: "Siz kamtarin va boshqalarga yo'nalgan shaxssiz. O'z ehtiyojlaringizni e'tiborsiz qoldirmasligingizni kuzating.", psych: "Past narsisizm ba'zan past o'z-o'ziga ishonch bilan bog'liq bo'lishi mumkin.", traits: ["Kamtarin", "Boshqalarga e'tiborli", "Hamkorlikka moyil"], advice: ["O'z qadriyatlaringizni bildirishdan qo'rqmang", "O'z muvaffaqiyatlaringizni nishonlang", "O'z ehtiyojlaringizga e'tibor bering"] };
      else if (newScore <= 5) res = { state: "O'rtacha narsisizm", emoji: "⚖️", level: "O'rta", color: "#f59e0b", desc: "Sog'lom o'z-o'ziga hurmat va boshqalarga nisbatan muvozanatli munosabatda ekansiz.", psych: "O'rtacha narsisizm sog'lom ego va o'z-o'ziga hurmatning belgisi.", traits: ["Sog'lom o'z-o'ziga ishonch", "Muvozanatli munosabat", "Maqsadga yo'nalgan"], advice: ["Muvozanatni saqlang", "Boshqalar fikriga ham quloq soling", "Hamkorlik ko'nikmalarini rivojlantiring"] };
      else res = { state: "Yuqori narsisizm belgilari", emoji: "🪞", level: "Yuqori", color: "#ef4444", desc: "Narsisizm belgilari kuchli ko'rinmoqda. Bu munosabatlarda qiyinchilik yaratishi mumkin.", psych: "Yuqori narsisizm belgilari mavjud. Bu narsissistik shaxsiyat buzilishi emas, lekin mutaxassis bilan gaplashish foydali.", traits: ["Yuqori o'z-o'ziga ishonch", "Liderlik intilishi", "Mustaqillik"], advice: ["Boshqalar his-tuyg'ulariga ko'proq e'tibor bering", "Psixolog bilan murojaat qiling", "Empatiyani rivojlantiring"] };
      setResult({ ...res, score: newScore });
    } else { setScore(newScore); setCurrent(c => c + 1); }
  };

  if (result) return <ResultCard result={result} score={result.score} maxScore={8} onRetry={() => { setCurrent(0); setScore(0); setResult(null); }} onBack={onBack} />;

  const q = NARC_Q[current];
  return (
    <div className="question-test">
      <QProgress current={current} total={NARC_Q.length} color="#f59e0b" />
      <p className="q-subtitle">Sizga ko'proq mos keladigan jumlani tanlang</p>
      <div className="q-card">
        <p className="q-text">{current + 1}-savol: Qaysi biri sizga ko'proq mos?</p>
        <div className="q-options">
          <button className="q-option narc-option" onClick={() => handleAnswer("a")}><span className="narc-tag">A</span>{q.a}</button>
          <button className="q-option narc-option" onClick={() => handleAnswer("b")}><span className="narc-tag">B</span>{q.b}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 6. DARK TRIAD TEST
// ═══════════════════════════════════════════════
const DARK_Q = [
  { q: "Maqsadimga erishish uchun boshqalarni ishlatishdan tortinmayman", dim: "mach" },
  { q: "Boshqalar meni kuzatmasligini bilsam, qoidalarni buza olaman", dim: "psych" },
  { q: "O'zimni boshqalardan ustun deb his qilaman", dim: "narc" },
  { q: "Odamlarni o'z manfaatim uchun boshqara olaman", dim: "mach" },
  { q: "O'zgalar azobiga befarq qolishim mumkin", dim: "psych" },
  { q: "Men alohida va maxsus insondekman", dim: "narc" },
  { q: "Natijaga erishish uchun har qanday usulni qo'llashim mumkin", dim: "mach" },
  { q: "Odamlarning his-tuyg'ulari mening qarorlarimga ta'sir qilmaydi", dim: "psych" },
  { q: "Boshqalar mening fikrimga qo'shilishi kerak", dim: "narc" },
];

export function DarkTriadTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ mach: 0, psych: 0, narc: 0 });
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const dim = DARK_Q[current].dim;
    const newScores = { ...scores, [dim]: scores[dim] + val };
    if (current + 1 >= DARK_Q.length) setResult(newScores);
    else { setScores(newScores); setCurrent(c => c + 1); }
  };

  if (result) {
    const maxDim = 12;
    const dims = [
      { key: "mach", label: "Makkyavelizm", color: "#f59e0b", desc: "Boshqalarni o'z maqsadi uchun ishlatish" },
      { key: "psych", label: "Psixopatiya", color: "#ef4444", desc: "Empatiya va vijdonsizlik belgilari" },
      { key: "narc", label: "Narsisizm", color: "#7c3aed", desc: "O'z-o'zini ulug'lash va diqqat markazida bo'lish" },
    ];
    const total = Object.values(result).reduce((a, b) => a + b, 0);
    const isHigh = total > 18;
    return (
      <div className="test-result">
        <div className="result-emoji">{isHigh ? "⚠️" : "✅"}</div>
        <div className="result-level" style={{ background: (isHigh ? "#ef4444" : "#22c55e") + "22", color: isHigh ? "#ef4444" : "#22c55e" }}>
          {isHigh ? "Yuqori belgilar" : "Normal daraja"}
        </div>
        <h2>Dark Triad tahlili</h2>
        <p className="result-desc">Qorong'u uchlik — Makkyavelizm, Psixopatiya va Narsisizm. Har bir insonda bu xususiyatlar ma'lum darajada mavjud.</p>
        <div className="big5-chart">
          {dims.map(d => {
            const pct = Math.round((result[d.key] / maxDim) * 100);
            return (
              <div key={d.key} className="big5-item">
                <div className="big5-label"><span>{d.label}</span><span className="big5-pct" style={{ color: d.color }}>{pct}%</span></div>
                <div className="big5-bar-track"><div className="big5-bar-fill" style={{ width: pct + "%", background: d.color }} /></div>
                <p className="big5-desc">{d.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="psych-box">
          <span className="psych-icon">👨‍⚕️</span>
          <div><strong>Muhim eslatma:</strong>
            <p>Dark Triad xususiyatlari hammada bor. Yuqori ball — klinik tashxis emas. Lekin yuqori natijalarda psixolog bilan murojaat qilish tavsiya etiladi.</p>
          </div>
        </div>
        <div className="result-advice">
          <h3>💡 Tavsiyalar</h3>
          {["Empatiya va muloqot ko'nikmalarini rivojlantiring", "Boshqalar bilan sog'lom munosabatlar o'rnating", "O'z motivatsiyalaringizni tanib oling", "Kerak bo'lsa psixolog bilan ishlang"].map((a, i) => (
            <div key={i} className="advice-item"><span className="advice-num">{i + 1}</span><span>{a}</span></div>
          ))}
        </div>
        <RetryBack onRetry={() => { setCurrent(0); setScores({ mach: 0, psych: 0, narc: 0 }); setResult(null); }} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="question-test">
      <QProgress current={current} total={DARK_Q.length} color="#374151" />
      <p className="q-subtitle">Qanchalik mos kelishini baholang</p>
      <div className="q-card">
        <p className="q-text">{DARK_Q[current].q}</p>
        <div className="q-options">
          {["Umuman yo'q (0)", "Ozgina (1)", "Ba'zan (2)", "Ko'pincha (3)", "To'liq ha (4)"].map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 7. ATTACHMENT STYLE TEST
// ═══════════════════════════════════════════════
const ATTACH_Q = [
  { q: "Munosabatlarda o'zingizni qanday his qilasiz?", opts: [
    { t: "Xavotir qilmayman, yaqinlashishga tayyor", dim: "secure" },
    { t: "Hamkor meni tashlab ketishidan qo'rqaman", dim: "anxious" },
    { t: "Juda yaqin bo'lish noqulay", dim: "avoidant" },
    { t: "Ham yaqinlashgim keladi, ham qo'rqaman", dim: "disorganized" },
  ]},
  { q: "Hamkoringiz e'tibor bermasa...", opts: [
    { t: "Uning sababi bor deb o'ylayman", dim: "secure" },
    { t: "Meni sevsholmayapti deb o'ylayman", dim: "anxious" },
    { t: "Menga yaxshi — men ham erkinman", dim: "avoidant" },
    { t: "Tashlab ketadi deb qo'rqaman va g'azablanaman", dim: "disorganized" },
  ]},
  { q: "Munosabatdagi nizolarda...", opts: [
    { t: "Tinch gaplashib hal qilaman", dim: "secure" },
    { t: "Tashlab ketishdan qo'rqib, ko'p kechirim so'rayman", dim: "anxious" },
    { t: "Uzoqlashib, vaqt o'tishini kutaman", dim: "avoidant" },
    { t: "Tezda g'azablanib, keyin yolvoraman", dim: "disorganized" },
  ]},
  { q: "Yangi munosabatda...", opts: [
    { t: "Ochiq va ishonchli bo'laman", dim: "secure" },
    { t: "Tasdiqlash va e'tibor izlayman", dim: "anxious" },
    { t: "Sekin-asta va ehtiyotkorlik bilan yaqinlashaman", dim: "avoidant" },
    { t: "Tez yaqinlashib, keyin chekinaman", dim: "disorganized" },
  ]},
  { q: "Yolg'iz qolganda...", opts: [
    { t: "O'z vaqtimdan maza qilaman", dim: "secure" },
    { t: "Yolg'izlikdan aziyat chekaman", dim: "anxious" },
    { t: "Yolg'izlikni yoqtiraman", dim: "avoidant" },
    { t: "Ba'zan yaxshi, ba'zan juda og'ir", dim: "disorganized" },
  ]},
];

const ATTACH_TYPES = {
  secure: { state: "Xavfsiz bog'lanish uslubi", emoji: "🔒", level: "Sog'lom", color: "#22c55e", desc: "Siz munosabatlarda xavfsiz va barqaror his qilasiz. Yaqinlashishdan qo'rqmaysiz.", psych: "Xavfsiz bog'lanish — sog'lom munosabatlar uchun eng yaxshi asos. Bu ko'pincha bolaliqdagi sog'lom ota-ona munosabatidan kelib chiqadi.", traits: ["Ishonchli munosabatlar", "Mustaqillik bilan uyg'unlik", "Ochiq muloqot"], advice: ["Hozirgi sog'lom uslubni saqlang", "Hamkoringizga ham sog'lom muhit yarating", "Munosabatlarni doimiy parvarishlang"] },
  anxious: { state: "Xavotirli bog'lanish uslubi", emoji: "😰", level: "Xavotirli", color: "#f59e0b", desc: "Siz tashlab ketilishdan qo'rqasiz va ko'p tasdiqlashga ehtiyoj his qilasiz.", psych: "Xavotirli bog'lanish ko'pincha bolaliqdagi izchilsiz g'amxo'rlikdan kelib chiqadi. Psixoterapiya juda foydali.", traits: ["Kuchli aloqaga intilish", "Tasdiqlashga ehtiyoj", "Chuqur his-tuyg'u"], advice: ["O'z-o'zingizga ishonchni oshiring", "Psixolog bilan murojaat qiling", "Mustaqil faoliyatlarni kuchaytiring"] },
  avoidant: { state: "Qochuvchi bog'lanish uslubi", emoji: "🚪", level: "Qochuvchi", color: "#0891b2", desc: "Siz yaqinlashishdan qochasiz va mustaqillikni afzal ko'rasiz.", psych: "Qochuvchi bog'lanish ko'pincha bolaliqdagi emotsional uzoqlikdan kelib chiqadi. Psixoterapiya his-tuyg'ularni ochishda yordam beradi.", traits: ["Mustaqillik", "O'z-o'ziga tayanish", "Shaxsiy chegara"], advice: ["Zaiflikni ko'rsatishga ruxsat bering", "Psixolog bilan ishlang", "Sekin-asta ishonchni rivojlantiring"] },
  disorganized: { state: "Tartibsiz bog'lanish uslubi", emoji: "🌀", level: "Murakkab", color: "#7c3aed", desc: "Siz ham yaqin bo'lishni xohlaysiz, ham qo'rqasiz. Bu ziddiyatli his-tuyg'ularga olib keladi.", psych: "Tartibsiz bog'lanish ko'pincha travma bilan bog'liq. Psixoterapiya — ayniqsa travma yo'nalishli — juda foydali.", traits: ["Chuqur his-tuyg'u", "Himoya mexanizmlari", "O'zgaruvchan munosabat"], advice: ["Psixolog bilan albatta murojaat qiling", "Travma bilan ishlashni ko'rib chiqing", "O'zingizga sabr va mehribon bo'ling"] },
};

export function AttachmentTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ secure: 0, anxious: 0, avoidant: 0, disorganized: 0 });
  const [result, setResult] = useState(null);

  const handleAnswer = (dim) => {
    const newScores = { ...scores, [dim]: scores[dim] + 1 };
    if (current + 1 >= ATTACH_Q.length) {
      const top = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0][0];
      setResult(ATTACH_TYPES[top]);
    } else { setScores(newScores); setCurrent(c => c + 1); }
  };

  if (result) return <ResultCard result={result} onRetry={() => { setCurrent(0); setScores({ secure: 0, anxious: 0, avoidant: 0, disorganized: 0 }); setResult(null); }} onBack={onBack} />;

  return (
    <div className="question-test">
      <QProgress current={current} total={ATTACH_Q.length} color="#ec4899" />
      <div className="q-card">
        <p className="q-text">{ATTACH_Q[current].q}</p>
        <div className="q-options">
          {ATTACH_Q[current].opts.map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(opt.dim)}>{opt.t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 8. CHILDHOOD TRAUMA TEST (CTQ)
// ═══════════════════════════════════════════════
const TRAUMA_Q = [
  { q: "Bolaliğimda oilamda ko'p janjal bo'lardi", dim: "emotional" },
  { q: "Bolaliğimda kimdir meni kamsitishi yoki xo'rlashi bo'lgan", dim: "emotional" },
  { q: "Bolaliğimda yetarli e'tibor va sevgi olmadim", dim: "neglect" },
  { q: "Bolaliğimda jismoniy jazo bo'lgan", dim: "physical" },
  { q: "Bolaliğimda o'zimni xavfsiz his qilmasdim", dim: "emotional" },
  { q: "Bolaliğimda yetarli ovqat, kiyim va boshpana bo'lmagan", dim: "neglect" },
  { q: "Bolaliğimda kimdir meni jismoniy hurt qilgan", dim: "physical" },
  { q: "Bolaliğimda kimdir mening chegaralarimni buzgan", dim: "sexual" },
  { q: "Bolaliğimda o'zimni tushunilmagan his qilardim", dim: "neglect" },
  { q: "Bolaliğimda ota-onam mening his-tuyg'ularimni qabul qilishmasdi", dim: "emotional" },
];

export function ChildhoodTraumaTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ emotional: 0, physical: 0, neglect: 0, sexual: 0 });
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const dim = TRAUMA_Q[current].dim;
    const newScores = { ...scores, [dim]: scores[dim] + val };
    if (current + 1 >= TRAUMA_Q.length) setResult(newScores);
    else { setScores(newScores); setCurrent(c => c + 1); }
  };

  if (result) {
    const total = Object.values(result).reduce((a, b) => a + b, 0);
    const isHigh = total > 20;
    const dims = [
      { key: "emotional", label: "Emotsional", color: "#7c3aed" },
      { key: "physical", label: "Jismoniy", color: "#ef4444" },
      { key: "neglect", label: "E'tiborsizlik", color: "#f59e0b" },
      { key: "sexual", label: "Jinsiy", color: "#ec4899" },
    ];
    return (
      <div className="test-result">
        <div className="result-emoji">{isHigh ? "💙" : "🌱"}</div>
        <div className="result-level" style={{ background: (isHigh ? "#7c3aed" : "#22c55e") + "22", color: isHigh ? "#7c3aed" : "#22c55e" }}>
          {isHigh ? "Travma belgilari bor" : "Minimal travma"}
        </div>
        <h2>Bolaliк travmasi tahlili</h2>
        <p className="result-desc">{isHigh ? "Bolaliğingizda travmatik tajribalar bo'lgan. Bu hozirgi hayotingizga ta'sir qilishi mumkin. Siz yolg'iz emassiz." : "Minimal travma belgilari kuzatilmoqda. Bu yaxshi sign."}</p>
        <div className="big5-chart">
          {dims.map(d => {
            const pct = Math.round((result[d.key] / 8) * 100);
            return (
              <div key={d.key} className="big5-item">
                <div className="big5-label"><span>{d.label}</span><span className="big5-pct" style={{ color: d.color }}>{pct}%</span></div>
                <div className="big5-bar-track"><div className="big5-bar-fill" style={{ width: pct + "%", background: d.color }} /></div>
              </div>
            );
          })}
        </div>
        <div className="psych-box">
          <span className="psych-icon">💙</span>
          <div><strong>Muhim xabar:</strong>
            <p>Bolaliк travmasi — siz qilgan narsa emas. Bu sizning aybing emas. Travma bilan ishlash mumkin va hayot yaxshilanishi mumkin. Siz yordam olishga loyiqsiz.</p>
          </div>
        </div>
        <div className="result-advice">
          <h3>💡 Tavsiyalar</h3>
          {(isHigh
            ? ["Psixolog yoki psixoterapevt bilan murojaat qiling", "Travma-yo'naltirilgan terapiyani ko'rib chiqing (EMDR, CBT)", "O'zingizga g'amxo'rlik qiling — siz buni haqsiz", "Ishonchli odamlar bilan o'rashing"]
            : ["O'zingizni yaxshi his qilishni davom eting", "Ruhiy salomatlikni kuzatib boring", "Psixologik resurslarni o'rganing"]
          ).map((a, i) => <div key={i} className="advice-item"><span className="advice-num">{i + 1}</span><span>{a}</span></div>)}
        </div>
        <RetryBack onRetry={() => { setCurrent(0); setScores({ emotional: 0, physical: 0, neglect: 0, sexual: 0 }); setResult(null); }} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="question-test">
      <QProgress current={current} total={TRAUMA_Q.length} color="#7c3aed" />
      <p className="q-subtitle">Bolaliğingizni eslab, qanchalik mos kelishini baholang</p>
      <div className="q-card">
        <p className="q-text">{TRAUMA_Q[current].q}</p>
        <div className="q-options">
          {["Hech qachon (0)", "Kamdan-kam (1)", "Ba'zan (2)", "Ko'pincha (3)", "Har doim (4)"].map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OTA-ONALAR TESTI — Ўсмир фарзандини тушуниш
// J.Piaje va I.S.Kon metodikasi (24 savol)
// ═══════════════════════════════════════════════════════

const PARENT_Q = [
  "Yuzakilik — o'smirlarga xos sifatdir.",
  "Kattalar o'smirlarga nisbatan ko'p narsalarni mavhumlashtiradi.",
  "O'smirlar ko'proq hozirgi bor narsalar haqida o'ylasa, kattalar kelajak va istiqbol rejalarini birinchi o'ringa qo'yadilar.",
  "O'smirlik davriga fikrlarning qat'iyligi xosdir.",
  "Kattalar o'smirlarga nisbatan insoniy xulq-atvor haqidagi umumiy qoidalar va tamoyillarni izlashga moyil.",
  "O'smirlar o'z bilim darajasi hamda aqliy imkoniyatlarini oshirib baholashga moyildir.",
  "Ta'lim jarayonida o'smirlarga nisbatan bolalarga ko'proq individual yondashuv zarur.",
  "His-tuyg'ularga beriluvchanlık va emotsional taranglik — o'smirlik davriga xos.",
  "Yumorni his qilish o'smirlik davridan ko'ra ko'proq bolalikda paydo bo'lib, namoyon bo'ladi.",
  "Bolalarga nisbatan, bolalikda mavhum narsalar haqidagi suhbatlar ko'proq bo'ladi.",
  "Kattalar orasida o'smirlarga nisbatan melanxoliklar ko'proq uchraydi.",
  "Badiiy asarlarda o'smirlarni ko'proq qahramonlarning aniq xatti-harakatlari va jarayonlar qiziqtiradi.",
  "Bolalarga o'smirlarga nisbatan o'zlarini ko'rsatish, boshqalardan farqli bo'lish xosdir.",
  "'Yolg'izlik hissi' — o'smirlik davriga xos his-tuyg'u.",
  "Vaqt o'tishini his etish aniqligi yosh oshgan sari pasayib boradi.",
  "Tashqi qiyofa va jismoniy rivojlanish bolalarga nisbatan o'smirlarni ko'proq o'ylantiradi.",
  "O'smirning aqliy salohiyati past bo'lsa, o'zidan noroziligi ham ortiq bo'ladi.",
  "Irodaviy sifatlarning yetarli rivojlanmaganligi o'smirning o'ziga bahosini belgilovchi xususiyatdir.",
  "O'smirlar pedagoglarning insoniyligini (samimiylik, tushunish) kasbiy mahoratidan yuqori qo'yadilar.",
  "O'smirlar jamoaga nisbatan yuqori talablar qo'yishga moyil.",
  "O'smirlar o'z o'qituvchilari bilan o'rnatgan yaxshi munosabatlarini pedagoglarning o'zlariga yuqori darajada qadrlaydigan.",
  "O'smirlarda o'zaro munosabatlar bilan bog'liq qiyinchiliklar bola va kattalardan ko'proq namoyon bo'ladi.",
  "O'smirlar badiiy adabiyotdan ko'ra musiqaga ko'proq qiziqadi.",
  "U yoki bu normalar asosida hayotni tashkillashga intilish o'smirlarga nisbatan kattalar uchun xosdir.",
];

const PARENT_KEY = ["+","+","-","+","-","+","-","+","-","-","-","-","-","+","-","+","-","+","+","+","-","+","-","-"];

const PARENT_SCALE = [
  [0,4,  14, "Juda past"],  [5,8,  17, "Past"],
  [9,12, 30, "O'rtadan past"], [13,15, 43, "O'rta pastroq"],
  [16,17, 50, "O'rta"], [18,19, 57, "O'rta yuqoriroq"],
  [20,21, 63, "Yuqori"], [22,23, 73, "Juda yuqori"], [24,24, 83, "A'lo"],
];

export function ParentTeenTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleAnswer = (ans) => {
    const newAns = [...answers, ans];
    if (current + 1 < PARENT_Q.length) {
      setAnswers(newAns);
      setCurrent(c => c + 1);
    } else {
      let score = 0;
      newAns.forEach((a, i) => { if (a === PARENT_KEY[i]) score++; });
      const row = PARENT_SCALE.find(r => score >= r[0] && score <= r[1]);
      const tScore = row ? row[2] : 50;
      const level  = row ? row[3] : "O'rta";
      setResult({ score, tScore, level });
    }
  };

  if (result) {
    const isHigh = result.tScore >= 60;
    const isMid  = result.tScore >= 40 && result.tScore < 60;
    const levelColor = isHigh ? "#0d7a50" : isMid ? "#6C5CE7" : "#b45309";
    return (
      <div className="test-result">
        <span className="result-emoji">{isHigh ? "🌟" : isMid ? "📚" : "📖"}</span>
        <div className="result-level" style={{ background: levelColor + "20", color: levelColor }}>
          {result.level}
        </div>
        <h2>O'smir farzandingizni {isHigh ? "yaxshi" : isMid ? "o'rtacha" : "kam"} tushunasiz</h2>
        <p className="result-desc">
          {isHigh
            ? "Siz o'smirlik psixologiyasini yaxshi bilasiz. Bu sizga farzandingiz bilan yaxshi munosabat o'rnatishga yordam beradi."
            : isMid
            ? "Siz o'smirlik psixologiyasini o'rtacha darajada bilasiz. Ko'rgan-kechirganlarni borича baholashga odatlangansiz."
            : "O'smirlik psixologiyasini chuqurroq o'rganish tavsiya etiladi. Ba'zan noto'g'ri tushunchalar bo'lishi mumkin."
          }
        </p>
        <div className="big5-chart">
          <div className="big5-item">
            <div className="big5-label"><span>To'g'ri javoblar</span><span className="big5-pct" style={{color:levelColor}}>{result.score}/24</span></div>
            <div className="big5-bar-track"><div className="big5-bar-fill" style={{width: Math.round(result.score/24*100)+"%", background: levelColor}}/></div>
          </div>
          <div className="big5-item">
            <div className="big5-label"><span>Standart ball</span><span className="big5-pct" style={{color:levelColor}}>{result.tScore}</span></div>
            <div className="big5-bar-track"><div className="big5-bar-fill" style={{width: result.tScore+"%", background: levelColor}}/></div>
          </div>
        </div>
        <div className="psych-box">
          <span className="psych-icon">💡</span>
          <div>
            <strong>Psixolog maslahati</strong>
            <p>{isHigh
              ? "Farzandingiz bilan ochiq suhbatlashishni davom eting. Ularga bo'lgan ishonchingiz ulug' kuch."
              : isMid
              ? "O'smirlik psixologiyasi bo'yicha kitoblar o'qish va mutaxassislar bilan maslahat qilish tavsiya etiladi."
              : "Farzandingizni tushunish uchun psixolog yordamini olishni ko'rib chiqing."
            }</p>
          </div>
        </div>
        <RetryBack onRetry={()=>{setCurrent(0);setAnswers([]);setResult(null);}} onBack={onBack}/>
      </div>
    );
  }

  return (
    <div className="question-test">
      <QProgress current={current} total={PARENT_Q.length} color="#6C5CE7"/>
      <p className="q-subtitle">Har bir fikrga munosabatingizni bildiring</p>
      <div className="q-card">
        <p className="q-text">{current+1}. {PARENT_Q[current]}</p>
        <div className="q-options">
          <button className="q-option" onClick={()=>handleAnswer("+")}>✅ Qo'shilaman</button>
          <button className="q-option" onClick={()=>handleAnswer("?")}>🤔 Aniq emas</button>
          <button className="q-option" onClick={()=>handleAnswer("-")}>❌ Qo'shilmayman</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MULOQOT TESTI — Kommunikabellik darajasini aniqlash
// 16 savol | Ha=2, Bilmadim=1, Yo'q=0
// ═══════════════════════════════════════════════════════

const MULOQOT_Q = [
  "Mas'ul ish topshirilganda hayajonlanasizmi?",
  "Ahvolingiz yomon bo'lguncha ham shifokor chaqirmaysizmi?",
  "Kutilmagan holda ma'ruza qilasiz desa, norozilik bildirasizmi?",
  "Begona kishiga kechinmalaringizni so'zlaysizmi?",
  "Begona odam sizdan yo'lni yoki vaqtni so'rasa, g'ashingiz keladimi?",
  "Har xil avlod o'rtasida hayot masalasida kelishmovchilik bo'ladi deb o'ylaysizmi?",
  "Bir necha oy ilgari tanishingizga bergan pulingizni so'rashga hijolat qilasizmi?",
  "Kafeda sifatsiz taom keltirishsa, indamay qo'yaverasizmi?",
  "Avtobusda bir necha soat begona yo'lovchi bilan ketsangiz, gapni birinchi bo'lib boshlaysizmi?",
  "Navbatda turish maqsadingizga erishish uchun zaruriyat bo'lsa ham, uzundan uzoq navbat kutishdan voz kechasizmi?",
  "Do'stlaringiz o'rtasida bo'ladigan mojoroni hal qilishdan o'zingizni olib qochasizmi?",
  "Biror adabiyot yoki san'at haqida gap ketsa, o'z fikringizni himoya qilasizmi?",
  "Sizga yaxshi ma'lum bo'lgan masala bo'yicha noto'g'ri fikr eshitsangiz, jim tura olasizmi?",
  "Sizdan ish yoki o'qish yuzasidan yordam so'ralsa, norozi bo'lasizmi?",
  "O'z fikringizni og'zaki bayon etishga imkoniyat bo'lsa ham, yozma ravishda bayon etishni afzal ko'rasizmi?",
  "Siz bilan tanish bo'lmagan odamlar bilan muloqot qilishni yoqtirasizmi?",
];

const MULOQOT_LEVELS = [
  { min:0,  max:9,  emoji:"💬", label:"Yuqori kommunikabellik",  color:"#0d7a50",
    desc:"Siz ochiq, muloqotga intiluvchi insonsiz. Yangi tanishliklar va guruh ishlarida o'zingizni erkin his qilasiz. Odamlar bilan tez til topasiz." },
  { min:10, max:18, label:"O'rtacha kommunikabellik", emoji:"🤝", color:"#6C5CE7",
    desc:"Atrofdagilar bilan osoyishta muloqotda bo'lasiz, notanish sharoitda o'zingizga ishonasiz. Tortishuvlarda qatnashishni yoqtirmaysiz." },
  { min:19, max:24, label:"Past kommunikabellik",    emoji:"🧘", color:"#b45309",
    desc:"Indamas, kamgapsiз, yolg'izlikni yoqtirasiz. Yangi muloqotlar sizni muvozanatdan chiqaradi. Asta-sekin odamlar bilan ko'proq muloqot qilishga harakat qiling." },
  { min:25, max:32, label:"Juda past kommunikabellik",emoji:"🔇", color:"#b91c1c",
    desc:"Muloqotga ehtiyoj sezmasligingiz muammo tug'dirishi mumkin. Yaqinlaringiz siz bilan muomala qilishda qiynalishi mumkin. Odamlar bilan ko'proq muloqotda bo'lishga intiling." },
];

export function MuloqotTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const newScore = score + val;
    if (current + 1 < MULOQOT_Q.length) {
      setScore(newScore);
      setCurrent(c => c + 1);
    } else {
      const lv = MULOQOT_LEVELS.find(l => newScore >= l.min && newScore <= l.max)
              || MULOQOT_LEVELS[0];
      setResult({ score: newScore, level: lv });
    }
  };

  if (result) {
    const lv = result.level;
    const pct = Math.round((result.score / 32) * 100);
    return (
      <div className="test-result">
        <span className="result-emoji">{lv.emoji}</span>
        <div className="result-level" style={{ background: lv.color + "18", color: lv.color }}>
          {lv.label}
        </div>
        <div className="result-score-circle" style={{ borderColor: lv.color, color: lv.color }}>
          {result.score}<span>/32</span>
        </div>
        <h2>{lv.label}</h2>
        <p className="result-desc">{lv.desc}</p>

        <div className="big5-chart">
          <div className="big5-item">
            <div className="big5-label">
              <span>Kommunikabellik darajasi</span>
              <span className="big5-pct" style={{ color: lv.color }}>{pct}%</span>
            </div>
            <div className="big5-bar-track">
              <div className="big5-bar-fill" style={{ width: pct + "%", background: lv.color }} />
            </div>
          </div>
        </div>

        <div className="psych-box">
          <span className="psych-icon">💡</span>
          <div>
            <strong>Psixolog maslahati</strong>
            <p>{result.score >= 19
              ? "Muloqot ko'nikmalarini rivojlantirish uchun har kuni 1 yangi odam bilan suhbatlashishga harakat qiling. Guruh mashg'ulotlari yoki klublarga qo'shilish yordam beradi."
              : result.score >= 10
              ? "Muloqot qobiliyatingiz yaxshi. Uni yanada rivojlantirish uchun yangi ijtimoiy guruhlarda qatnashing."
              : "Zo'r kommunikativ qobiliyatingiz bor! Buni ijobiy yo'nalishda ishlating — jamoada rahbarlik qilishga harakat qiling."
            }</p>
          </div>
        </div>

        <div className="result-advice">
          <h3>💡 Tavsiyalar</h3>
          {(result.score >= 19
            ? ["Har kuni kamida 1 yangi odam bilan gaplashing","Jamoat joylarida faolroq bo'ling","Suhbat qilish ko'nikmalarini mashq qiling","Psixolog bilan konsultatsiya oling"]
            : result.score >= 10
            ? ["Yangi ijtimoiy guruhlarga qo'shiling","Deb klub yoki seminarlarida qatnashing","O'z fikringizni bayon etishga qo'rqmang"]
            : ["Muloqot ko'nikmalaringizdan foydalaning","Atrofingizdagilarga yordam bering","Rahbarlik rollarini qabul qiling"]
          ).map((a, i) => (
            <div key={i} className="advice-item">
              <span className="advice-num">{i + 1}</span>
              <span>{a}</span>
            </div>
          ))}
        </div>

        <RetryBack
          onRetry={() => { setCurrent(0); setScore(0); setResult(null); }}
          onBack={onBack}
        />
      </div>
    );
  }

  return (
    <div className="question-test">
      <QProgress current={current} total={MULOQOT_Q.length} color="#6C5CE7" />
      <p className="q-subtitle">Har bir savolga halol javob bering</p>
      <div className="q-card">
        <p className="q-text">{MULOQOT_Q[current]}</p>
        <div className="q-options">
          <button className="q-option" onClick={() => handleAnswer(2)}>✅ Ha — 2 ball</button>
          <button className="q-option" onClick={() => handleAnswer(1)}>🤔 Bilmadim — 1 ball</button>
          <button className="q-option" onClick={() => handleAnswer(0)}>❌ Yo'q — 0 ball</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TEMPERAMENT TESTI (To'liq variant — 20 savol)
// A=Xolerik B=Sangvinik V=Flegmatik G=Melanxolik
// ═══════════════════════════════════════════════════════

const TEMP_Q = [
  { q:"Quyidagilardan qaysi biri sizga xos?",        opts:["Faol","Xushchaqchaq","Og'ir, vazmin","Uyatchang"] },
  { q:"Yangi sharoitda o'zingizni qanday tutasiz?",  opts:["O'zini tuta olmaydi","Energiyali va ishbilarmon","Ishini o'z vaqtida bajaradigan","O'zini yo'qotmaydiganlar"] },
  { q:"Sabr-toqat borasida qanaysiz?",               opts:["Sabrsiz","Boshlagan ishini oxiriga yetkaza olmaydi","Ehtiyotkor va fikrlovchi","Yangi odamlar bilan qiynaladiganlar"] },
  { q:"O'zingizni qanday baholaysiz?",               opts:["Betgachopar","O'ziga ortiqcha baho berish","Kuta bilish","O'ziga ishonmaslik"] },
  { q:"Qo'rquv va tashabbuskorlik haqida?",          opts:["Qo'rqmaslik va tashabbuskorlik","Yangilikni tez qabul qiladigan","Indamas, ko'p gapirishni yoqtirmaslik","Yolg'izlikni oson o'tkazishlik"] },
  { q:"Suhbat va muloqotda qanaysiz?",               opts:["Qaysarlik","O'zini aytganini qila olmaslik","O'zini tutgan holda suhbatlashish","Tanholikni yoqtirish"] },
  { q:"Muzokaralarda qanday bo'lasiz?",              opts:["Muzokaralarda o'z fikrini o'tkaza olish","Qiyinchilik va omadsizlikka e'tibor bermaslik","Chidamlilik va o'zini ushlay olish","O'zi bilan o'zi ovora bo'lib qolish"] },
  { q:"Tavakkalchilik borasida qanaysiz?",           opts:["Tavakkalchilik bor","Har xil sharoitlarga osonlik bilan moslashish","Boshlagan ishni oxirigacha olib borish","Tavakkalchilikning yo'qligi"] },
  { q:"Ish uslubingiz qanday?",                      opts:["Yugurib-yugurib ishlaydi","Yangilikka qiziqish bilan kirishadi","O'z kuchini bekorga sarflamaydi","Past ovoz bilan gapiradi"] },
  { q:"Qiziqishlaringiz haqida?",                    opts:["Gina saqlaydi","Qiziqish tez so'nadi","Kunlik ish tartibiga qat'iy rioya qiladi","Suhbatdoshning xarakteriga moslashadi"] },
  { q:"Gapirish uslubingiz?",                        opts:["Intonatsiya bilan gapiradi","Bir ishdan ikkinchisiga o'tish oson","Qiyinchilikni osonlik bilan o'tkazadi","Og'ir vaziyatlarda yig'lab yuboradi"] },
  { q:"Nazorat va talabchanlik?",                    opts:["O'zini tuta olmaslik","Bir xil sharoitga moslashish","Masalalar hal bo'layotganda e'tiborsizlik","O'ziga va boshqalarga yuqori talabchanlik"] },
  { q:"Muomala va munosabat?",                       opts:["Agressiv (jahldor) holat","O'zini yo'qotmaslik va to'g'ri muomala","Birovdan hafa bo'lmaslik","Birovlardan xafsirash"] },
  { q:"Kamchiliklarga munosabat?",                   opts:["Kamchilikka chiday olmaslik","Chidamlilik va ishlash qobiliyati","Doimiy qiziquvchanligi o'zgarmasligi","Hamma narsani o'ziga olib tez hafa bo'lish"] },
  { q:"Xatti-harakatlaringiz?",                      opts:["Aniq xatti-harakatlarga egalik","Tez va qattiq gapirish","Shoshilmasdan ishga kirishuvchanlik","Hamma narsaga hafa bo'lishlik"] },
  { q:"Hal qilish tezligi?",                         opts:["Ishni tez hal qiladi","Qiyin sharoitlarda o'zini tutadi","Hammaga teng qaradi","Boshqalar bilan suhbatni yoqtiradi"] },
  { q:"Yangiliklarга munosabat?",                    opts:["Yangilikka doim intiladi","Har doim kayfiyat ko'tarinki","Hamma ishni sifatli qiladi","Kam harakat, uyatchanlik"] },
  { q:"Harakat va uyqu?",                            opts:["Tez va qo'rs xatti-harakat","Tez uxlab, tez uyg'onadi","Qiyinchilik bilan yangi sharoitga moslashadi","Bo'ysunuvchanlik va tortinuvchanlik"] },
  { q:"Maqsadga erishish?",                          opts:["Ishni shoshma-shosharlik bilan hal qilish","Maqsadga erishishda qat'an harakat","Kam harakatchanlik","Hamdardlikni xohlaydi"] },
  { q:"O'zgaruvchanlik?",                            opts:["Tezda xarakter o'zgarib turadi","Bir ishdan ikkinchisiga o'tish oson","Jahl chiqqanda o'zini tuta bilish","Tez ta'sirchanlik"] },
];

const TEMP_INFO = {
  A: { name:"Xolerik", emoji:"🔥", color:"#e53e3e",
       desc:"Faol, tashabbuskor, tez va kuchli his-tuyg'ular. Rahbarlikka moyil. Sabrsizlik zaif tomoni.",
       strong:["Tashabbuskorlik","Maqsadga intilish","Rahbarlik qobiliyati","Qo'rqmaslik"],
       weak:["Sabrsizlik","Tez jahllanish","O'zini tutolmaslik","Qaysarlik"] },
  B: { name:"Sangvinik", emoji:"😊", color:"#0891b2",
       desc:"Ijtimoiy, moslashuvchan, xushchaqchaq. Yangi odamlar bilan tez til topadi.",
       strong:["Muloqotga ochiqlik","Moslashuvchanlik","Optimizm","Ijodkorlik"],
       weak:["Ishni oxiriga yetkaza olmaslik","Qiziqish tez so'nishi","Tartibsizlik"] },
  V: { name:"Flegmatik", emoji:"🧊", color:"#0d7a50",
       desc:"Vazmin, ishonchli, chidamli. Boshlagan ishni albatta tugatadi.",
       strong:["Chidamlilik","Ishonchlilik","Tartiblilik","Chuqur fikrlash"],
       weak:["Yangiliklarga sekin moslashish","Indamaslik","Inertlik"] },
  G: { name:"Melanxolik", emoji:"🌙", color:"#7c3aed",
       desc:"Sezgir, chuqur his qiladigan, empातiyali. Sifatli ish qiladi.",
       strong:["Sezgirlik","Empatiya","Sifatga e'tibor","Sadoqat"],
       weak:["Tez ta'sirchanlik","O'ziga ishonmaslik","Uyatchanlik","Yolg'izlikka moyillik"] },
};

export function TemperamentFullTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ A:0, B:0, V:0, G:0 });
  const [result, setResult] = useState(null);

  const handleAnswer = (idx) => {
    const key = ["A","B","V","G"][idx];
    const newScores = { ...scores, [key]: scores[key] + 1 };
    if (current + 1 < TEMP_Q.length) {
      setScores(newScores);
      setCurrent(c => c + 1);
    } else {
      const total = TEMP_Q.length;
      const pcts = {};
      Object.keys(newScores).forEach(k => pcts[k] = Math.round((newScores[k] / total) * 100));
      const dominant = Object.keys(pcts).reduce((a,b) => pcts[a] > pcts[b] ? a : b);
      setResult({ scores: newScores, pcts, dominant });
    }
  };

  if (result) {
    const dom = TEMP_INFO[result.dominant];
    return (
      <div className="test-result">
        <span className="result-emoji">{dom.emoji}</span>
        <div className="result-level" style={{ background: dom.color+"20", color: dom.color }}>
          {dom.name}
        </div>
        <h2>Siz — {dom.name}!</h2>
        <p className="result-desc">{dom.desc}</p>

        <div className="big5-chart">
          {Object.entries(result.pcts).map(([k, pct]) => (
            <div key={k} className="big5-item">
              <div className="big5-label">
                <span>{TEMP_INFO[k].emoji} {TEMP_INFO[k].name}</span>
                <span className="big5-pct" style={{ color: TEMP_INFO[k].color }}>{pct}%</span>
              </div>
              <div className="big5-bar-track">
                <div className="big5-bar-fill" style={{ width: pct+"%", background: TEMP_INFO[k].color }}/>
              </div>
            </div>
          ))}
        </div>

        <div className="result-advice">
          <h3>💪 Kuchli tomonlar</h3>
          {dom.strong.map((s,i) => (
            <div key={i} className="advice-item">
              <span className="advice-num">✓</span><span>{s}</span>
            </div>
          ))}
        </div>

        <div className="result-advice">
          <h3>⚠️ Rivojlantirish kerak</h3>
          {dom.weak.map((w,i) => (
            <div key={i} className="advice-item">
              <span className="advice-num">{i+1}</span><span>{w}</span>
            </div>
          ))}
        </div>

        <div className="psych-box">
          <span className="psych-icon">💡</span>
          <div>
            <strong>Eslab qoling</strong>
            <p>Hech bir temperament yaxshi yoki yomon emas — har birining o'z kuchlari va zaif tomonlari bor. Temperament o'zgarmaydi, lekin uni bilish orqali boshqarish mumkin.</p>
          </div>
        </div>

        <RetryBack onRetry={()=>{ setCurrent(0); setScores({A:0,B:0,V:0,G:0}); setResult(null); }} onBack={onBack}/>
      </div>
    );
  }

  return (
    <div className="question-test">
      <QProgress current={current} total={TEMP_Q.length} color="#6C5CE7"/>
      <p className="q-subtitle">O'zingizga to'g'ri keladigan javobni tanlang</p>
      <div className="q-card">
        <p className="q-text">{TEMP_Q[current].q}</p>
        <div className="q-options">
          {TEMP_Q[current].opts.map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// O'Z-O'ZINI RIVOJLANTIRISH TESTI — 14 savol
// 2 o'lcham: GBI (bilish istagi) va VTO (rivojlanish)
// ═══════════════════════════════════════════════════════

const OZOZIM_Q = [
  { q:"Menda o'z haqimda bilim olish istagi tug'uldi", gbi:true  },
  { q:"Fikrimcha menda o'zimni o'zgartishga hech qanday zarurat yo'q", gbi:false },
  { q:"Men o'z kuchimga ishonaman", vto:true  },
  { q:"Men barcha o'ylagan istaklarimni amalga oshirishimga ishonaman", vto:true  },
  { q:"Men o'zimdagi ijobiy va salbiy xislatlarni bilishga hohishim yo'q", gbi:false },
  { q:"Men o'z rejalarimni amalga oshirishimda ko'proq o'zimga emas, balki omadga ishonaman", vto:false },
  { q:"Men samarali va yaxshi ishlashni xohlayman", vto:true  },
  { q:"Kerakli vaqtda men o'zimni majburlab o'zgartira olaman", vto:true  },
  { q:"Mening omadsizligim bu ko'proq ishni bajara olmasligimga bog'liq", vto:false },
  { q:"Meni boshqalarning men haqimdagi fikrlari, imkoniyatlarim va fazilatlari qiziqtiradi", gbi:true  },
  { q:"Men istaklarimni mustaqil amalga oshirishga qiynalaman", vto:false },
  { q:"Har qanday ishda omadsizlik va xatodan qo'rqaman", vto:false },
  { q:"Mening qobiliyatim va bilimim mening kasbim talablariga mos tushadi", gbi:true  },
  { q:"Vaziyat mendan kuchliroq — hatto men nimanidir qilishni juda ham xohlayotgan bo'lsam ham", vto:false },
];

const OZOZIM_KEY = {
  1:"+", 2:"-", 3:"+", 4:"+", 5:"-", 6:"-", 7:"+",
  8:"+", 9:"-", 10:"+", 11:"-", 12:"-", 13:"+", 14:"-"
};

// GBI savollar: 1,2,5,7,10,13 (bilish istagi)
const GBI_IDX = [0, 1, 4, 6, 9, 12];
// VTO savollar: 3,4,6,8,9,11,12,14 (rivojlantirish tayyor)
const VTO_IDX = [2, 3, 5, 7, 8, 10, 11, 13];

const OZOZIM_QUADS = {
  A: { name:"O'zimni takomillashtira olaman, lekin bilishni istamayman", emoji:"⚡", color:"#0891b2",
       desc:"O'zingizni rivojlantirish qobiliyatingiz bor, lekin o'zingizni bilish istagingiz kam. O'z haqingizda ko'proq o'ylashni boshlang." },
  B: { name:"O'zimni bilishni istayman va o'zgara olaman", emoji:"🌟", color:"#0d7a50",
       desc:"Ajoyib holat! Siz ham o'zingizni bilishga intiласиз, ham rivojlana olasiz. Bu muvaffaqiyat yo'lidagi eng yaxshi holat." },
  V: { name:"O'zimni bilishni istayman, lekin o'zgarmayман", emoji:"📚", color:"#b45309",
       desc:"Bilish istagingiz bor, lekin o'zgarish qiyin. O'zingizni rivojlantirish uchun kichik qadamlardan boshlang." },
  G: { name:"O'zimni bilishni istaman, lekin o'zimni o'zgartira olmayman", emoji:"🌱", color:"#7c3aed",
       desc:"Hozircha o'z-o'zini rivojlantirish qiyin tuyulmoqda. Psixolog yordami foydali bo'lishi mumkin." },
};

export function OzOzimTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleAnswer = (ans) => {
    const newAns = [...answers, ans];
    if (current + 1 < OZOZIM_Q.length) {
      setAnswers(newAns);
      setCurrent(c => c + 1);
    } else {
      // Hisoblash
      let gbi = 0, vto = 0;
      newAns.forEach((a, i) => {
        const correct = OZOZIM_KEY[i + 1];
        if (a === correct) {
          if (GBI_IDX.includes(i)) gbi++;
          if (VTO_IDX.includes(i)) vto++;
        }
      });
      const gbiHigh = gbi >= 4; // GBI max 6
      const vtoHigh = vto >= 4; // VTO max 8
      let quad;
      if (!gbiHigh && vtoHigh)  quad = "A";
      else if (gbiHigh && vtoHigh)  quad = "B";
      else if (gbiHigh && !vtoHigh) quad = "V";
      else quad = "G";
      setResult({ gbi, vto, quad, gbiPct: Math.round(gbi/6*100), vtoPct: Math.round(vto/8*100) });
    }
  };

  if (result) {
    const q = OZOZIM_QUADS[result.quad];
    return (
      <div className="test-result">
        <span className="result-emoji">{q.emoji}</span>
        <div className="result-level" style={{ background: q.color+"20", color: q.color }}>
          {q.name}
        </div>
        <h2>O'z-o'zini rivojlantirish tahlili</h2>
        <p className="result-desc">{q.desc}</p>

        <div className="big5-chart">
          <div className="big5-item">
            <div className="big5-label">
              <span>Bilish istagi (GBI)</span>
              <span className="big5-pct" style={{ color:"#6C5CE7" }}>{result.gbiPct}%</span>
            </div>
            <div className="big5-bar-track">
              <div className="big5-bar-fill" style={{ width:result.gbiPct+"%", background:"#6C5CE7" }}/>
            </div>
            <p className="big5-desc">{result.gbi}/6 ball</p>
          </div>
          <div className="big5-item">
            <div className="big5-label">
              <span>Rivojlantirish tayyor (VTO)</span>
              <span className="big5-pct" style={{ color:"#0891b2" }}>{result.vtoPct}%</span>
            </div>
            <div className="big5-bar-track">
              <div className="big5-bar-fill" style={{ width:result.vtoPct+"%", background:"#0891b2" }}/>
            </div>
            <p className="big5-desc">{result.vto}/8 ball</p>
          </div>
        </div>

        <div className="psych-box">
          <span className="psych-icon">💡</span>
          <div>
            <strong>Eslab qoling</strong>
            <p>"Inson o'z qobiliyatlarini faqatgina qo'llash orqali bilishi mumkin" — suzishni o'rganish uchun suvga tushish kerak. Doimo harakat qiling!</p>
          </div>
        </div>

        <div className="result-advice">
          <h3>💡 Tavsiyalar</h3>
          {(result.quad === "B"
            ? ["O'z kuchingizdan to'liq foydalaning","Atrofingizdagilarga yordam bering","Yangi maqsadlar qo'ying"]
            : result.quad === "A"
            ? ["O'z haqingizda ko'proq o'ylang","Kundalik yozing","Psixologik testlar o'ting"]
            : result.quad === "V"
            ? ["Kichik qadamlardan boshlang","Har kuni 1 yangi narsa qiling","O'zingizga ishoning"]
            : ["Psixolog bilan maslahat oling","O'zingizga mehribon bo'ling","Atrofingizdagi yaxshi odamlardan yordam so'rang"]
          ).map((a,i) => (
            <div key={i} className="advice-item">
              <span className="advice-num">{i+1}</span><span>{a}</span>
            </div>
          ))}
        </div>

        <RetryBack onRetry={()=>{ setCurrent(0); setAnswers([]); setResult(null); }} onBack={onBack}/>
      </div>
    );
  }

  return (
    <div className="question-test">
      <QProgress current={current} total={OZOZIM_Q.length} color="#6C5CE7"/>
      <p className="q-subtitle">Har bir fikrga + (to'g'ri) yoki - (noto'g'ri) deb javob bering</p>
      <div className="q-card">
        <p className="q-text">{current+1}. {OZOZIM_Q[current].q}</p>
        <div className="q-options">
          <button className="q-option" onClick={() => handleAnswer("+")}>✅ Ha, to'g'ri (+)</button>
          <button className="q-option" onClick={() => handleAnswer("-")}>❌ Yo'q, noto'g'ri (-)</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// O'Z-O'ZINI RIVOJLANTIRISH TESTI — 14 savol
// 2 o'lcham: bilish istagi + o'zgartira olish
// 4 kvadrant natija: A, B, V, G
// ═══════════════════════════════════════════════════════

const OZOZINI_Q = [
  { id:1,  text:"Menda o'z haqimda bilim olish istagi tug'uldi.",               key:"+" },
  { id:2,  text:"Menimcha, menda o'zimni o'zgartirishga hech qanday zarurat yo'q.", key:"-" },
  { id:3,  text:"Men o'z kuchimga ishonaman.",                                   key:"+" },
  { id:4,  text:"Men barcha o'ylagan istaklarimni amalga oshirishimga ishonaman.", key:"+" },
  { id:5,  text:"Men o'zimdagi ijobiy va salbiy xislatlarni bilishga xohishim yo'q.", key:"-" },
  { id:6,  text:"Men o'z rejalarimi amalga oshirishda ko'proq o'zimga emas, omadga ishonaman.", key:"-" },
  { id:7,  text:"Men samarali va yaxshi ishlashni xohlayman.",                   key:"+" },
  { id:8,  text:"Kerakli vaqtda men o'zimni majburlab o'zgartira olaman.",       key:"+" },
  { id:9,  text:"Mening omadsizligim bu ko'proq ishni bajara olmasligimga bog'liq.", key:"+" },
  { id:10, text:"Boshqalarning men haqimdagi fikrlari, imkoniyatlarim va fazilatlari meni qiziqtiradi.", key:"+" },
  { id:11, text:"Men istaklarimni mustaqil amalga oshirishga qiynalaman.",       key:"-" },
  { id:12, text:"Har qanday ishda omadsizlik va xatodan qo'rqaman.",             key:"+" },
  { id:13, text:"Mening qobiliyatim va bilimim mening kasbim talablariga mos tushadi.", key:"-" },
  { id:14, text:"Vaziyat mendan kuchli, hatto men nimadir qilishni juda xohlayotgan bo'lsam ham.", key:"-" },
];

// Savol 1,2,5,7,10,13 → "bilish istagi" (GBI)
// Savol 3,4,6,8,11,12,14 → "o'zgartira olish" (VTO)
const GBI_IDS  = [1,2,5,7,10,13];
const VTO_IDS  = [3,4,6,8,11,12,14];

export function OzOziniTest({ onBack }) {
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState({});
  const [result, setResult]     = useState(null);

  const handleAnswer = (ans) => {
    const q    = OZOZINI_Q[current];
    const match = ans === q.key ? 1 : 0;
    const newAnswers = { ...answers, [q.id]: { ans, match } };

    if (current + 1 < OZOZINI_Q.length) {
      setAnswers(newAnswers);
      setCurrent(c => c + 1);
    } else {
      // Hisoblash
      let gbi = 0, vto = 0;
      Object.entries(newAnswers).forEach(([id, val]) => {
        if (GBI_IDS.includes(+id))  gbi += val.match;
        if (VTO_IDS.includes(+id))  vto += val.match;
      });
      const quadrant = gbi >= 4 && vto >= 4 ? "B"
                     : gbi >= 4 && vto <  4 ? "G"
                     : gbi <  4 && vto >= 4 ? "A"
                     :                        "V";
      setResult({ gbi, vto, quadrant, answers: newAnswers });
    }
  };

  if (result) {
    const QUAD = {
      B: { emoji:"🌟", color:"#0d7a50", bg:"#e6f8f0",
           title:"O'zini bilishni istayman va o'zgara olaman",
           desc:"Siz eng qulay holatdasiz! O'zingizni bilishga istagingiz bor va uni amalga oshira olasiz. Bu shaxsiy o'sish uchun ideal holat. Davom eting!" },
      G: { emoji:"🔍", color:"#6C5CE7", bg:"#EEECfd",
           title:"O'zini bilishni istayman, lekin o'zgartira olmayman",
           desc:"O'zingiz haqida ko'proq bilishni xohlaysiz, lekin o'zingizni takomillashtirish ko'nikmalarini hali yaxshi egallamadingiz. Insonlar o'z qobiliyatlarini faqat qo'llash orqali biladi — harakat qilishni boshlang." },
      A: { emoji:"💪", color:"#b45309", bg:"#fff5e6",
           title:"O'zgara olaman, lekin bilishni istagan emasman",
           desc:"O'zingizni rivojlantirishga qobiliyatingiz bor, lekin o'zingizni anglash istagi kamligi to'sqinlik qiladi. O'z faoliyatingizda individual uslubingizni topish orqali professionalizmga erishishingiz mumkin." },
      V: { emoji:"🌱", color:"#b91c1c", bg:"#fee2e2",
           title:"O'zini bilishni istayman va o'zgarishga tayyorman emas",
           desc:"Hozirgi holatingizda ham bilish istagi, ham o'zgartirish qobiliyati rivojlanish kerak. O'zingizni diqqat bilan kuzating va ishonchli odamlardan fikr so'rang. Bu bosqich — o'sishning boshlanishi." },
    };
    const q = QUAD[result.quadrant];
    const gbiPct = Math.round((result.gbi / GBI_IDS.length)  * 100);
    const vtoPct = Math.round((result.vto / VTO_IDS.length)  * 100);

    return (
      <div className="test-result">
        <span className="result-emoji">{q.emoji}</span>
        <div className="result-level" style={{ background: q.bg, color: q.color }}>
          Kvadrant {result.quadrant}
        </div>
        <h2>{q.title}</h2>
        <p className="result-desc">{q.desc}</p>

        {/* Kvadrant vizual */}
        <div className="ozoz-quad-grid">
          {["B","G","A","V"].map(k => (
            <div key={k} className={`ozoz-quad ${result.quadrant===k?"active":""}`}>
              <span>{k}</span>
              <small>{k==="B"?"Bilaman+O'zgara":""}
                     {k==="G"?"Bilaman+Qiyna":""}
                     {k==="A"?"O'zgara+Bilmas":""}
                     {k==="V"?"Bilmas+Qiyna":""}</small>
            </div>
          ))}
        </div>

        <div className="big5-chart" style={{marginTop:14}}>
          <div className="big5-item">
            <div className="big5-label">
              <span>O'zini bilish istagi</span>
              <span className="big5-pct">{result.gbi}/{GBI_IDS.length}</span>
            </div>
            <div className="big5-bar-track">
              <div className="big5-bar-fill" style={{width:gbiPct+"%", background:"#6C5CE7"}}/>
            </div>
            <p className="big5-desc">{gbiPct>=57?"Yuqori":"Past"}</p>
          </div>
          <div className="big5-item">
            <div className="big5-label">
              <span>O'zgartira olish qobiliyati</span>
              <span className="big5-pct">{result.vto}/{VTO_IDS.length}</span>
            </div>
            <div className="big5-bar-track">
              <div className="big5-bar-fill" style={{width:vtoPct+"%", background:"#0d7a50"}}/>
            </div>
            <p className="big5-desc">{vtoPct>=57?"Yuqori":"Past"}</p>
          </div>
        </div>

        <div className="psych-box">
          <span className="psych-icon">💡</span>
          <div>
            <strong>Tavsiya</strong>
            <p>Bir muncha vaqtdan so'ng testni qayta o'ting va natijalarni solishtiring. Har kuni o'zingiz haqida 1 ta yangi narsa kashf eting.</p>
          </div>
        </div>

        <RetryBack
          onRetry={() => { setCurrent(0); setAnswers({}); setResult(null); }}
          onBack={onBack}
        />
      </div>
    );
  }

  const q = OZOZINI_Q[current];
  return (
    <div className="question-test">
      <QProgress current={current} total={OZOZINI_Q.length} color="#6C5CE7"/>
      <p className="q-subtitle">O'zingizga mos keluvchi javobni tanlang</p>
      <div className="q-card">
        <p className="q-text">{q.text}</p>
        <div className="q-options">
          <button className="q-option" onClick={() => handleAnswer("+")}>✅ Ha, men bilan mos</button>
          <button className="q-option" onClick={() => handleAnswer("?")}>🤔 Aniq emas</button>
          <button className="q-option" onClick={() => handleAnswer("-")}>❌ Yo'q, mos emas</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// RAVEN TESTI — Mantiqiy fikrlash (soddalashtirilgan)
// 20 savol, matritsa topshiriqlari SVG bilan
// ═══════════════════════════════════════════════════════

// SVG matritsa topshiriqlari
const RAVEN_Q = [
  {
    id:1, series:"A",
    desc:"3×3 katakda pattern — pastki o'ng burchakdagi element qaysi?",
    svg: `<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="50" height="50" fill="#e5e4f0" stroke="#6C5CE7" strokeWidth="1.5"/>
      <circle cx="35" cy="35" r="15" fill="#6C5CE7" opacity="0.3"/>
      <rect x="70" y="10" width="50" height="50" fill="#e5e4f0" stroke="#6C5CE7" strokeWidth="1.5"/>
      <circle cx="95" cy="35" r="15" fill="#6C5CE7" opacity="0.6"/>
      <rect x="130" y="10" width="50" height="50" fill="#e5e4f0" stroke="#6C5CE7" strokeWidth="1.5"/>
      <circle cx="155" cy="35" r="15" fill="#6C5CE7" opacity="0.9"/>
      <rect x="10" y="70" width="50" height="50" fill="#e5e4f0" stroke="#6C5CE7" strokeWidth="1.5"/>
      <rect x="25" y="85" width="20" height="20" fill="#6C5CE7" opacity="0.3"/>
      <rect x="70" y="70" width="50" height="50" fill="#e5e4f0" stroke="#6C5CE7" strokeWidth="1.5"/>
      <rect x="85" y="85" width="20" height="20" fill="#6C5CE7" opacity="0.6"/>
      <rect x="130" y="70" width="50" height="50" fill="#e5e4f0" stroke="#6C5CE7" strokeWidth="1.5"/>
      <rect x="145" y="85" width="20" height="20" fill="#6C5CE7" opacity="0.9"/>
      <rect x="10" y="130" width="50" height="50" fill="#e5e4f0" stroke="#6C5CE7" strokeWidth="1.5"/>
      <polygon points="35,145 20,170 50,170" fill="#6C5CE7" opacity="0.3"/>
      <rect x="70" y="130" width="50" height="50" fill="#e5e4f0" stroke="#6C5CE7" strokeWidth="1.5"/>
      <polygon points="95,145 80,170 110,170" fill="#6C5CE7" opacity="0.6"/>
      <rect x="130" y="130" width="50" height="50" fill="#ddd" stroke="#999" strokeWidth="1.5" strokeDasharray="4"/>
      <text x="155" y="162" textAnchor="middle" fontSize="22" fill="#999">?</text>
    </svg>`,
    options: ["Uchburchak (to'q)", "Doira (to'q)", "Kvadrat (to'q)", "Uchburchak (o'rta)", "Doira (och)", "Kvadrat (och)"],
    answer: 0,
  },
  {
    id:2, series:"A",
    desc:"Qator bo'yicha shakllar qanday o'zgarmoqda?",
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="50" height="50" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <line x1="20" y1="35" x2="50" y2="35" stroke="#6C5CE7" strokeWidth="2"/>
      <rect x="70" y="10" width="50" height="50" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <line x1="80" y1="25" x2="110" y2="25" stroke="#6C5CE7" strokeWidth="2"/>
      <line x1="80" y1="45" x2="110" y2="45" stroke="#6C5CE7" strokeWidth="2"/>
      <rect x="130" y="10" width="50" height="50" fill="#ddd" stroke="#999" strokeWidth="1.5" strokeDasharray="4"/>
      <text x="155" y="42" textAnchor="middle" fontSize="22" fill="#999">?</text>
      <rect x="10" y="70" width="50" height="40" fill="white"/>
      <rect x="10" y="70" width="45" height="35" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5" rx="3"/>
      <text x="32" y="91" textAnchor="middle" fontSize="11" fill="#6C5CE7">1 chiziq</text>
      <rect x="65" y="70" width="45" height="35" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5" rx="3"/>
      <text x="87" y="91" textAnchor="middle" fontSize="11" fill="#6C5CE7">2 chiziq</text>
      <rect x="120" y="70" width="45" height="35" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5" rx="3"/>
      <text x="142" y="91" textAnchor="middle" fontSize="11" fill="#6C5CE7">3 chiziq</text>
    </svg>`,
    options: ["1 ta chiziq", "2 ta chiziq", "3 ta chiziq", "4 ta chiziq", "Chiziqsiz", "Diagonal"],
    answer: 2,
  },
  {
    id:3, series:"B",
    desc:"Simmetriya qoidasiga ko'ra, ? o'rniga nima keladi?",
    svg: `<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="50" height="50" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <circle cx="25" cy="25" r="8" fill="#6C5CE7"/>
      <rect x="70" y="10" width="50" height="50" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <circle cx="85" cy="45" r="8" fill="#6C5CE7"/>
      <rect x="130" y="10" width="50" height="50" fill="#ddd" stroke="#999" strokeWidth="1.5" strokeDasharray="4"/>
      <text x="155" y="42" textAnchor="middle" fontSize="22" fill="#999">?</text>
      <g transform="translate(0,70)">
        <rect x="10" y="0" width="35" height="35" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1" rx="3"/>
        <circle cx="22" cy="12" r="5" fill="#6C5CE7"/>
        <rect x="55" y="0" width="35" height="35" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1" rx="3"/>
        <circle cx="77" cy="25" r="5" fill="#6C5CE7"/>
        <rect x="100" y="0" width="35" height="35" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1" rx="3"/>
        <circle cx="112" cy="12" r="5" fill="#6C5CE7"/>
        <rect x="145" y="0" width="35" height="35" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1" rx="3"/>
        <circle cx="167" cy="25" r="5" fill="#6C5CE7"/>
      </g>
    </svg>`,
    options: ["Yuqori-chap", "Yuqori-o'ng", "Past-chap", "Past-o'ng", "Markazda", "Yo'q"],
    answer: 1,
  },
  {
    id:4, series:"C",
    desc:"Shakllar progressiv ravishda o'zgaradi. ? nima?",
    svg: `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="5"  y="10" width="40" height="60" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <circle cx="25" cy="40" r="8" fill="#6C5CE7"/>
      <rect x="55" y="10" width="40" height="60" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <circle cx="75" cy="40" r="8" fill="#6C5CE7"/>
      <circle cx="75" cy="20" r="6" fill="#6C5CE7" opacity="0.5"/>
      <rect x="105" y="10" width="40" height="60" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <circle cx="125" cy="40" r="8" fill="#6C5CE7"/>
      <circle cx="125" cy="20" r="6" fill="#6C5CE7" opacity="0.5"/>
      <circle cx="125" cy="60" r="6" fill="#6C5CE7" opacity="0.5"/>
      <rect x="155" y="10" width="40" height="60" fill="#ddd" stroke="#999" strokeWidth="1.5" strokeDasharray="4"/>
      <text x="175" y="47" textAnchor="middle" fontSize="22" fill="#999">?</text>
      <g transform="translate(200,0)">
        <rect x="5"  y="15" width="30" height="50" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1" rx="2"/>
        <circle cx="20" cy="40" r="5" fill="#6C5CE7"/>
        <circle cx="20" cy="25" r="4" fill="#6C5CE7" opacity="0.5"/>
        <circle cx="20" cy="55" r="4" fill="#6C5CE7" opacity="0.5"/>
        <circle cx="8"  cy="40" r="4" fill="#6C5CE7" opacity="0.5"/>
      </g>
    </svg>`,
    options: ["1 doira", "2 doira", "3 doira", "4 doira (har tomonga)", "5 doira", "6 doira"],
    answer: 3,
  },
  {
    id:5, series:"D",
    desc:"Shakllar qanday joylashuvda davom etadi?",
    svg: `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="5"  y="10" width="50" height="60" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <rect x="15" y="20" width="10" height="10" fill="#6C5CE7"/>
      <rect x="60" y="10" width="50" height="60" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <rect x="80" y="20" width="10" height="10" fill="#6C5CE7"/>
      <rect x="115" y="10" width="50" height="60" fill="#f0eeff" stroke="#6C5CE7" strokeWidth="1.5"/>
      <rect x="145" y="20" width="10" height="10" fill="#6C5CE7"/>
      <rect x="170" y="10" width="50" height="60" fill="#ddd" stroke="#999" strokeWidth="1.5" strokeDasharray="4"/>
      <text x="195" y="47" textAnchor="middle" fontSize="22" fill="#999">?</text>
    </svg>`,
    options: ["Yuqori-chap", "Yuqori-markazda", "Yuqori-o'ng", "Pastda", "Markazda", "Chapda"],
    answer: 2,
  },
];

export function RavenTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect]   = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult]     = useState(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60);

  useEffect(() => {
    if (result) return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); finishTest(correct); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [result]);

  const finishTest = (score) => {
    const pct   = Math.round((score / RAVEN_Q.length) * 100);
    const level = pct >= 80 ? { label:"Yuqori intellekt", emoji:"🧠", color:"#0d7a50" }
                : pct >= 60 ? { label:"O'rtadan yuqori",  emoji:"⭐", color:"#6C5CE7"  }
                : pct >= 40 ? { label:"O'rta intellekt",  emoji:"📊", color:"#b45309"  }
                :             { label:"Rivojlantirish kerak", emoji:"🌱", color:"#b91c1c" };
    setResult({ score, pct, level });
  };

  const handleSelect = (idx) => { if (!confirmed) setSelected(idx); };
  const handleConfirm = () => {
    if (selected === null) return;
    const isCorrect = selected === RAVEN_Q[current].answer;
    const newCorrect = isCorrect ? correct + 1 : correct;
    setConfirmed(true);
    setTimeout(() => {
      if (current + 1 < RAVEN_Q.length) {
        setCorrect(newCorrect);
        setCurrent(c => c + 1);
        setSelected(null);
        setConfirmed(false);
      } else {
        finishTest(newCorrect);
      }
    }, 800);
  };

  if (result) {
    const lv = result.level;
    return (
      <div className="test-result">
        <span className="result-emoji">{lv.emoji}</span>
        <div className="result-level" style={{ background: lv.color + "20", color: lv.color }}>{lv.label}</div>
        <div className="result-score-circle" style={{ borderColor: lv.color, color: lv.color }}>
          {result.score}<span>/{RAVEN_Q.length}</span>
        </div>
        <h2>{lv.label}</h2>
        <p className="result-desc">
          To'g'ri javoblar: {result.score}/{RAVEN_Q.length} ({result.pct}%). Raven testi mantiqiy fikrlash, naqshlarni aniqlash va muammolarni hal qilish qobiliyatini o'lchaydi.
        </p>
        <div className="big5-chart">
          <div className="big5-item">
            <div className="big5-label"><span>Natija</span><span className="big5-pct" style={{color:lv.color}}>{result.pct}%</span></div>
            <div className="big5-bar-track"><div className="big5-bar-fill" style={{width:result.pct+"%", background:lv.color}}/></div>
          </div>
        </div>
        <div className="psych-box">
          <span className="psych-icon">💡</span>
          <div>
            <strong>Eslatma</strong>
            <p>Bu soddalashtirilgan variant (5 savol). To'liq Raven testi 60 ta matritsa va 20 daqiqadan iborat. Natijani professional psixolog bilan muhokama qiling.</p>
          </div>
        </div>
        <RetryBack onRetry={() => { setCurrent(0); setCorrect(0); setSelected(null); setConfirmed(false); setResult(null); setTimeLeft(20*60); }} onBack={onBack}/>
      </div>
    );
  }

  const q = RAVEN_Q[current];
  const mins = Math.floor(timeLeft/60);
  const secs = timeLeft % 60;

  return (
    <div className="question-test">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:12,color:"#6b7280"}}>Seriya {q.series} — {current+1}/{RAVEN_Q.length}</span>
        <span style={{fontSize:13,fontWeight:600,color: timeLeft<120?"#b91c1c":"#6C5CE7",background:"#f0eeff",padding:"3px 10px",borderRadius:999}}>
          ⏱ {mins}:{secs.toString().padStart(2,"0")}
        </span>
      </div>
      <div className="q-progress-bar" style={{marginBottom:16}}>
        <div style={{width:Math.round((current/RAVEN_Q.length)*100)+"%",height:"100%",background:"#6C5CE7",borderRadius:999}}/>
      </div>
      <p style={{fontSize:13,color:"#6b7280",textAlign:"center",marginBottom:12}}>{q.desc}</p>
      <div style={{background:"#f8f8fc",border:"1px solid #e5e4f0",borderRadius:12,padding:12,marginBottom:14,overflow:"auto"}}
        dangerouslySetInnerHTML={{__html:q.svg}}/>
      <p style={{fontSize:12,color:"#9ca3af",marginBottom:8,textAlign:"center"}}>Javobni tanlang:</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {q.options.map((opt,i)=>(
          <button key={i}
            style={{padding:"9px 12px",border:`1.5px solid ${selected===i?(confirmed?(i===q.answer?"#0d7a50":"#b91c1c"):"#6C5CE7"):"#e5e4f0"}`,borderRadius:8,background:selected===i?(confirmed?(i===q.answer?"#e6f8f0":"#fee2e2"):"#EEECfd"):"#fff",fontSize:13,cursor:"pointer",fontFamily:"Inter,sans-serif",color:selected===i?"#1a1a2e":"#6b7280",transition:"all .15s",textAlign:"left"}}
            onClick={()=>handleSelect(i)}>
            <span style={{fontWeight:600,color:"#6C5CE7",marginRight:6}}>{i+1}.</span>{opt}
          </button>
        ))}
      </div>
      <button
        onClick={handleConfirm}
        disabled={selected===null}
        style={{width:"100%",padding:"11px",background:selected===null?"#d1d5db":"#6C5CE7",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:selected===null?"not-allowed":"pointer",marginTop:12,fontFamily:"Inter,sans-serif",transition:"background .15s"}}>
        Javobni tasdiqlash →
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// KETTEL SHAXSIYAT TESTI (16PF — qisqartirilgan)
// 16 omil, 105 savol → biz 32 ta savol (asosiy 8 omil)
// ═══════════════════════════════════════════════════════

const KETTEL_Q = [
  // A omil — muloqotga ochiqlik
  {id:1,  factor:"A", text:"Yangi odamlar bilan tez til topaman.",            options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:2,  factor:"A", text:"Odamlar bilan bo'lishdan zavqlanaman.",           options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // B omil — aqliy qobiliyat
  {id:3,  factor:"B", text:"Yangi muammolarni tez yechaman.",                 options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:4,  factor:"B", text:"Murakkab topshiriqlar meni qiziqtiradi.",         options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // C omil — hissiy barqarorlik
  {id:5,  factor:"C", text:"Qiyin vaziyatlarda o'zimni ushlab turaman.",      options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:6,  factor:"C", text:"Muammolar meni uzoq vaqt bezovta qilmaydi.",     options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // E omil — dominantlik
  {id:7,  factor:"E", text:"Guruhda o'z fikrimni ochiq aytaman.",             options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:8,  factor:"E", text:"Boshqalarga ta'sir o'tkaza olaman.",              options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // F omil — hayajonlilik
  {id:9,  factor:"F", text:"Ko'pincha kayfiyatim yaxshi va xushchaqchaqman.", options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:10, factor:"F", text:"Hazil-mutoyibani yaxshi ko'raman.",               options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // G omil — mas'uliyatlilik
  {id:11, factor:"G", text:"Har doim o'z zimmamdagi ishni bajaraman.",        options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:12, factor:"G", text:"Qoidalarga rioya qilish menga muhim.",            options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // H omil — ijtimoiy jasurlik
  {id:13, factor:"H", text:"Notanish odamlar bilan muloqotda qo'rqmayman.",  options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:14, factor:"H", text:"Jamoat oldida chiqish qilishdan qo'rqmayman.",   options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // I omil — sezuvchanlik
  {id:15, factor:"I", text:"Boshqalarning his-tuyg'ularini tez sezaman.",    options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:16, factor:"I", text:"Go'zallik va san'at meni hayajonga soladi.",      options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // L omil — shubhalanish
  {id:17, factor:"L", text:"Odamlar ko'pincha yashirin maqsad ko'zlaydi.",   options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:18, factor:"L", text:"Boshqalarning niyatidan shubhalangan vaqtlarim bo'ladi.", options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // M omil — abstrakt fikrlash
  {id:19, factor:"M", text:"Ko'pincha o'z xayollarimga cho'mib qolaman.",    options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:20, factor:"M", text:"Kelajakni ko'p o'ylayman.",                      options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // N omil — diplomatik
  {id:21, factor:"N", text:"Odamlarni yaxshi tushunaman.",                   options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:22, factor:"N", text:"So'zlarni ehtiyotkorlik bilan tanlayman.",       options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // O omil — tashvish
  {id:23, factor:"O", text:"Ko'pincha o'zim haqimda ko'p tashvishlanaman.", options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:24, factor:"O", text:"Kelajak meni ko'pincha xavotirga soladi.",       options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // Q1 omil — yangiliklarga ochiqlik
  {id:25, factor:"Q1", text:"Yangi g'oyalar va o'zgarishlarni yoqtiraman.",  options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:26, factor:"Q1", text:"An'anaviy usullardan ko'ra yangilarini sinab ko'raman.", options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // Q2 omil — mustaqillik
  {id:27, factor:"Q2", text:"Ko'pincha mustaqil qaror qabul qilaman.",       options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:28, factor:"Q2", text:"Yolg'iz ishlashni guruhdan ko'ra afzal ko'raman.", options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // Q3 omil — o'zini nazorat qilish
  {id:29, factor:"Q3", text:"Ishlarimni oldindan rejalashtirib qo'yaman.",   options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  {id:30, factor:"Q3", text:"O'zimni tartibli deb hisoblayman.",             options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
  // Q4 omil — stress darajasi
  {id:31, factor:"Q4", text:"Ko'pincha bo'shashgan va tinch his qilaman.",   options:["Ha","Ba'zan","Yo'q"], scores:[0,1,2]},
  {id:32, factor:"Q4", text:"Muhim ishdan oldin kam uxlayman.",              options:["Ha","Ba'zan","Yo'q"], scores:[2,1,0]},
];

const KETTEL_FACTORS = {
  A:  { name:"Muloqotga ochiqlik",     low:"Yopiq, yolg'izlikni yoqtiradi",    high:"Ochiq, muloqotsevar"        },
  B:  { name:"Aqliy qobiliyat",        low:"Konkret fikrlaydi",                high:"Abstrakt, tez o'rganadi"     },
  C:  { name:"Hissiy barqarorlik",     low:"Hissiy, bexavor",                  high:"Barqaror, tetik"             },
  E:  { name:"Dominantlik",            low:"Bo'ysunuvchan, yumshoq",           high:"Mustaqil, qat'iy"            },
  F:  { name:"Hayajonlilik",           low:"Jiddiy, ehtiyotkor",               high:"Xushchaqchaq, faol"          },
  G:  { name:"Mas'uliyatlilik",        low:"Erkin, qoidalarsiz",               high:"Mas'uliyatli, tartibli"      },
  H:  { name:"Ijtimoiy jasurlik",      low:"Uyatchan, tortinchoq",             high:"Jasur, faol"                 },
  I:  { name:"Sezuvchanlik",           low:"Amaliy, mustaqil",                 high:"Sezgir, empatik"             },
  L:  { name:"Shubhalanish",           low:"Ishonuvchan, ochiq",               high:"Shubhali, ehtiyotkor"        },
  M:  { name:"Xayolparast",            low:"Amaliy, realist",                  high:"Ijodiy, xayolparast"         },
  N:  { name:"Diplomatik",             low:"Sodda, to'g'riso'z",               high:"Diplomatik, zukko"           },
  O:  { name:"Tashvish",               low:"O'ziga ishonadi",                  high:"Ko'p tashvishlanadi"         },
  Q1: { name:"Yangiliklarga ochiqlik", low:"An'anaviy, konservativ",           high:"Yangiliklarga ochiq"         },
  Q2: { name:"Mustaqillik",            low:"Guruhga bog'liq",                  high:"Mustaqil, o'z fikrida"       },
  Q3: { name:"O'zini nazorat qilish",  low:"Beparvo, tartibsiz",              high:"Nazoratli, maqsadli"         },
  Q4: { name:"Stress darajasi",        low:"Tinch, bo'shashgan",               high:"Taranglik, stressli"         },
};

export function KettelTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [scores, setScores]   = useState({});
  const [result, setResult]   = useState(null);

  const handleAnswer = (score) => {
    const q = KETTEL_Q[current];
    const newScores = { ...scores, [q.factor]: (scores[q.factor] || 0) + score };
    if (current + 1 < KETTEL_Q.length) {
      setScores(newScores);
      setCurrent(c => c + 1);
    } else {
      setResult(newScores);
    }
  };

  if (result) {
    const factors = Object.entries(KETTEL_FACTORS).map(([key, info]) => {
      const raw = result[key] || 0;
      const pct = Math.round((raw / 4) * 100);
      return { key, ...info, raw, pct };
    });

    return (
      <div className="test-result">
        <span className="result-emoji">🧬</span>
        <div className="result-level">Kettel 16PF Profil</div>
        <h2>Shaxsiyat profili</h2>
        <p className="result-desc">Kettel metodikasi 16 ta shaxsiyat omilini o'lchaydi. Har bir omil past yoki yuqori bo'lishi mumkin — ikkalasi ham normal.</p>
        <div className="big5-chart">
          {factors.map(f => (
            <div key={f.key} className="big5-item">
              <div className="big5-label">
                <span>{f.key}. {f.name}</span>
                <span className="big5-pct" style={{color: f.pct >= 60 ? "#6C5CE7" : "#b45309"}}>
                  {f.pct >= 60 ? "↑ " : "↓ "}{f.pct}%
                </span>
              </div>
              <div className="big5-bar-track">
                <div className="big5-bar-fill"
                  style={{width: f.pct + "%", background: f.pct >= 60 ? "#6C5CE7" : "#f59e0b"}}/>
              </div>
              <p className="big5-desc">{f.pct >= 50 ? f.high : f.low}</p>
            </div>
          ))}
        </div>
        <div className="psych-box">
          <span className="psych-icon">💡</span>
          <div>
            <strong>Eslatma</strong>
            <p>Bu qisqartirilgan variant. To'liq Kettel 16PF testi 105 savoldan iborat. Natijalarni professional psixolog bilan muhokama qiling.</p>
          </div>
        </div>
        <RetryBack onRetry={() => { setCurrent(0); setScores({}); setResult(null); }} onBack={onBack}/>
      </div>
    );
  }

  const q = KETTEL_Q[current];
  return (
    <div className="question-test">
      <QProgress current={current} total={KETTEL_Q.length} color="#6C5CE7"/>
      <p className="q-subtitle">O'zingizga mos javobni tanlang</p>
      <div className="q-card">
        <p className="q-text">{q.text}</p>
        <div className="q-options">
          {q.options.map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(q.scores[i])}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// YOLG'ON ANIQLASH TESTI (Lie Detector / Eysenck lie scale)
// 20 savol — yolg'on ko'rsatkichini o'lchaydi
// ═══════════════════════════════════════════════════════

const YOLGON_Q = [
  "Har doim hamma odamlarga yaxshi munosabatda bo'laman.",
  "Hech qachon o'zimni yomon his qilmaganman.",
  "Hech qachon birovga yomon narsa demaganman.",
  "Har doim barcha qoidalarga rioya qilaman.",
  "Hech qachon kechikmaganman.",
  "Hech qachon birovning narsasini ruxsatsiz olmagan bo'lardim.",
  "Har doim o'z so'zimda turaman.",
  "Hech qachon boshqalar haqida yomon o'ylamaganman.",
  "Har doim hamma odamlarga to'g'risini aytaman.",
  "Hech qachon birovga hasad qilmaganman.",
  "Har doim ishimni o'z vaqtida bajaraman.",
  "Hech qachon birovga yolg'on gapirib bermaganman.",
  "Har doim barcha kelishuvlarga amal qilaman.",
  "Hech qachon birovga zarar yetkazmaganman.",
  "Har doim o'z xatoımni tan olaman.",
  "Hech qachon kimgadir g'azablanmaganman.",
  "Har doim barchaga teng munosabatda bo'laman.",
  "Hech qachon birovga nohaq munosabatda bo'lmaganman.",
  "Har doim o'zimni mukammal tutaman.",
  "Hech qachon birovga jalb qiluvchi yolg'on gapirib bermaganman.",
];

export function YolgonTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [yesCount, setYesCount] = useState(0);
  const [result, setResult]     = useState(null);

  const handleAnswer = (isYes) => {
    const newYes = isYes ? yesCount + 1 : yesCount;
    if (current + 1 < YOLGON_Q.length) {
      setYesCount(newYes);
      setCurrent(c => c + 1);
    } else {
      const pct = Math.round((newYes / YOLGON_Q.length) * 100);
      const level =
        pct >= 80 ? { label:"Juda yuqori ijtimoiy maqbullik", emoji:"⚠️", color:"#b91c1c",
          desc:"Javoblaringiz juda 'mukammal' ko'rinadi. Bu natijalar ishonchlilik darajasi pastligini ko'rsatishi mumkin. Ba'zi testlarda bu holat natijalarni shubhali qiladi." }
        : pct >= 60 ? { label:"Yuqori ijtimoiy maqbullik",    emoji:"🔶", color:"#b45309",
          desc:"Ijtimoiy maqbul javob berish tendentsiyasi kuzatilmoqda. O'zingiz haqingizda idealroq tasvir yaratishga moyilsiz." }
        : pct >= 40 ? { label:"O'rtacha",                     emoji:"✅", color:"#6C5CE7",
          desc:"Normal natija. Javoblaringiz ishonchli va haqiqatga yaqin ko'rinadi." }
        :             { label:"Past ijtimoiy maqbullik",       emoji:"🌿", color:"#0d7a50",
          desc:"Ochiq va samimiy javob berganingiz ko'rinayapti. Bu psixologik testlarda natijalar ishonchli ekanligini ko'rsatadi." };
      setResult({ yesCount: newYes, pct, level });
    }
  };

  if (result) {
    const lv = result.level;
    return (
      <div className="test-result">
        <span className="result-emoji">{lv.emoji}</span>
        <div className="result-level" style={{background: lv.color+"18", color: lv.color}}>
          {lv.label}
        </div>
        <div className="result-score-circle" style={{borderColor: lv.color, color: lv.color}}>
          {result.yesCount}<span>/{YOLGON_Q.length}</span>
        </div>
        <h2>{lv.label}</h2>
        <p className="result-desc">{lv.desc}</p>
        <div className="big5-chart">
          <div className="big5-item">
            <div className="big5-label">
              <span>Ijtimoiy maqbullik ko'rsatkichi</span>
              <span className="big5-pct" style={{color: lv.color}}>{result.pct}%</span>
            </div>
            <div className="big5-bar-track">
              <div className="big5-bar-fill" style={{width: result.pct+"%", background: lv.color}}/>
            </div>
          </div>
        </div>
        <div className="psych-box">
          <span className="psych-icon">ℹ️</span>
          <div>
            <strong>Bu test nima o'lchaydi?</strong>
            <p>Bu test "yolg'on ko'rsatkichi" emas — balki ijtimoiy maqbullik tendentsiyasini o'lchaydi. Ya'ni, siz o'zingizni boshqalarga qanday ko'rsatmoqchi ekanligingizni aniqlaydi. Eysenck shaxsiyat so'rovnomasining bir qismi.</p>
          </div>
        </div>
        <RetryBack
          onRetry={() => { setCurrent(0); setYesCount(0); setResult(null); }}
          onBack={onBack}
        />
      </div>
    );
  }

  return (
    <div className="question-test">
      <QProgress current={current} total={YOLGON_Q.length} color="#6C5CE7"/>
      <p className="q-subtitle">Har bir gapga "Ha" yoki "Yo'q" deb javob bering</p>
      <div className="q-card">
        <p className="q-text">{YOLGON_Q[current]}</p>
        <div className="q-options">
          <button className="q-option" onClick={() => handleAnswer(true)}>✅ Ha, bu men haqimda</button>
          <button className="q-option" onClick={() => handleAnswer(false)}>❌ Yo'q, bu men haqimda emas</button>
        </div>
      </div>
    </div>
  );
}
