import { useState } from "react";
import SzondiTest from "./SzondiTest";
import "./Tests.css";
import { RorschachTest, Big5Test, EnneagramTest, EmpathyTest, NarcissismTest, DarkTriadTest, AttachmentTest, ChildhoodTraumaTest } from "./ExtraTests";
import {
  Palette, Dna, CloudRain, Thermometer, Heart,
  Drama, Waves, Users, Circle, SmilePlus,
  Eye, Moon, Link2, Baby, MessageSquare, TrendingUp, Grid, FlaskConical, SearchCheck,
} from "lucide-react";
import { 
  ParentTeenTest, MuloqotTest, OzOziniTest, 
  RavenTest, KettelTest, YolgonTest 
} from "./ExtraTests";


const TEST_ICONS = {
  luscher: <Palette size={19} strokeWidth={1.5} />,
  temperament: <Dna size={19} strokeWidth={1.5} />,
  depression: <CloudRain size={19} strokeWidth={1.5} />,
  stress: <Thermometer size={19} strokeWidth={1.5} />,
  nikoh: <Heart size={19} strokeWidth={1.5} />,
  szondi: <Drama size={19} strokeWidth={1.5} />,
  rorschach: <Waves size={19} strokeWidth={1.5} />,
  big5: <Users size={19} strokeWidth={1.5} />,
  enneagram: <Circle size={19} strokeWidth={1.5} />,
  empathy: <SmilePlus size={19} strokeWidth={1.5} />,
  narcissism: <Eye size={19} strokeWidth={1.5} />,
  darktriad: <Moon size={19} strokeWidth={1.5} />,
  attachment: <Link2 size={19} strokeWidth={1.5} />,
  trauma: <Baby size={19} strokeWidth={1.5} />,
  parent_teen: <Users       size={19} strokeWidth={1.5} />,
  muloqot:     <MessageSquare size={19} strokeWidth={1.5} />,
  ozozini:     <TrendingUp  size={19} strokeWidth={1.5} />,
  raven:       <Grid        size={19} strokeWidth={1.5} />,
  kettel: <FlaskConical size={19} strokeWidth={1.5} />,
  yolgon: <SearchCheck  size={19} strokeWidth={1.5} />,
};


// ═══════════════════════════════════════════════
// 1. LYUSHER RANG TESTI
// ═══════════════════════════════════════════════
const LUSCHER_COLORS = [
  { id: 1, color: "#4169E1" }, { id: 2, color: "#22c55e" },
  { id: 3, color: "#ef4444" }, { id: 4, color: "#f59e0b" },
  { id: 5, color: "#7c3aed" }, { id: 6, color: "#92400e" },
  { id: 7, color: "#111827" }, { id: 8, color: "#d1d5db" },
];
const LUSCHER_RESULTS = {
  1: { state: "Xotirjam va barqaror", emoji: "😌", level: "Yaxshi", color: "#4169E1",
    desc: "Siz hozir ichki tinchlikka ehtiyoj his qilyapsiz. Munosabatlar va ishonch sizga muhim.",
    advice: ["Yaqinlaringiz bilan vaqt o'tkazing", "Meditatsiya yoki nafas olish mashqlarini bajaring", "Tabiatda sayr qiling", "Sevimli kitobingizni o'qing"] },
  2: { state: "Muvozanatli va o'ziga ishonchli", emoji: "💪", level: "Ajoyib", color: "#22c55e",
    desc: "Siz o'zingizni himoya qila olasiz va muammolarni hal qilishda qat'iysiz.",
    advice: ["Yangi ko'nikmalar o'rganing", "Sport bilan shug'ullaning", "Maqsadlaringizni yozing", "Jamoaviy faoliyatlarda qatnashing"] },
  3: { state: "Faol va g'ayratli", emoji: "🔥", level: "Energik", color: "#ef4444",
    desc: "Siz hozir katta energiyaga egasiz. Harakat va natijaga intilish sizga xos.",
    advice: ["Bu energiyani ijodiy ishlarga yo'naltiring", "Jismoniy mashqlar qiling", "Yangi loyiha boshlang", "Raqobatli o'yinlar o'ynang"] },
  4: { state: "Optimistik va ochiq", emoji: "☀️", level: "Ijobiy", color: "#f59e0b",
    desc: "Siz hayotga ijobiy qarayapsiz va yangi imkoniyatlarni ko'ra olasiz.",
    advice: ["Ijodiy hobbiylar bilan shug'ullaning", "Yangi odamlar bilan tanishing", "Musiqa tinglang", "Sayohat rejalashtiring"] },
  5: { state: "Sezgir va intuitiv", emoji: "🌙", level: "O'rta", color: "#7c3aed",
    desc: "Siz chuqur his-tuyg'ularga egasiz. Ba'zan real hayotdan uzoqlashish xavfi bor.",
    advice: ["Kundalik daftar yozing", "San'at yoki musiqa bilan shug'ullaning", "Psixolog bilan suhbatlashing", "Tabiatga chiqing"] },
  6: { state: "Charchagan va taranglashgan", emoji: "😔", level: "Diqqat", color: "#92400e",
    desc: "Siz uzoq vaqt stress ostida bo'lgansiz. Dam olish vaqti keldi.",
    advice: ["Yetarlicha uxlang", "Ijtimoiy majburiyatlarni kamaytiring", "Professionalga murojaat qiling", "O'zingizga mehribon bo'ling"] },
  7: { state: "Qiyin davrni boshdan kechiryapsiz", emoji: "🌧️", level: "Yordam kerak", color: "#374151",
    desc: "Siz ichki ziddiyat his qilyapsiz. Muloqot va yordamga ehtiyoj bor.",
    advice: ["Ishonchli do'stingiz bilan gaplashing", "Psixolog bilan konsultatsiya oling", "O'z his-tuyg'ularingizni yozing", "Kichik maqsadlar qo'ying"] },
  8: { state: "Neytral va kuzatuvchi", emoji: "🔍", level: "Barqaror", color: "#6b7280",
    desc: "Siz hozir kuzatish va baholash holatindasiz.",
    advice: ["O'z qiziqishlaringizni kuzating", "Yangi narsalarni sinab ko'ring", "Maqsadlaringizni qayta ko'rib chiqing", "Ijodiy mashg'ulotlar bilan shug'ullaning"] },
};

function LuscherTest({ onBack }) {
  const [round, setRound] = useState(1);
  const [selections, setSelections] = useState([]);
  const [available, setAvailable] = useState([...LUSCHER_COLORS]);
  const [result, setResult] = useState(null);

  const handleSelect = (color) => {
    const newSel = [...selections, color.id];
    const newAvail = available.filter(c => c.id !== color.id);
    if (newAvail.length === 0) {
      if (round === 1) {
        setSelections([]); setAvailable([...LUSCHER_COLORS]); setRound(2);
      } else {
        setResult(LUSCHER_RESULTS[newSel[0]] || LUSCHER_RESULTS[8]);
      }
    } else { setSelections(newSel); setAvailable(newAvail); }
  };

  if (result) return <Result result={result} onRetry={() => { setRound(1); setSelections([]); setAvailable([...LUSCHER_COLORS]); setResult(null); }} onBack={onBack} />;

  return (
    <div className="luscher-test">
      <div className="test-instruction">
        <h3>{round === 1 ? "1-bosqich" : "2-bosqich"}: Ranglarni yoqimlilik tartibida tanlang</h3>
        <p>Hozir eng yoqimli ko'ringan rangni tanlang. Uzoq o'ylamang — birinchi his-tuyg'uingizga ishoning.</p>
        <div className="test-progress-dots">
          {LUSCHER_COLORS.map((_, i) => <div key={i} className={`dot ${i < selections.length ? "filled" : ""}`} />)}
        </div>
      </div>
      <div className="color-grid">
        {available.map(c => <div key={c.id} className="color-block" style={{ background: c.color }} onClick={() => handleSelect(c)} />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 2. TEMPERAMENT TESTI (docx dan)
// ═══════════════════════════════════════════════
const TEMP_QUESTIONS = [
  { A: "Faol", B: "Xushchaqchaq", V: "Og'ir, vazmin", G: "Uyatchang" },
  { A: "O'zini tuta olmaydigan", B: "Energiyali va ishbilarmon", V: "Ishini o'z vaqtida bajaradigan", G: "Yangi sharoitda o'zini yo'qotmaydigan" },
  { A: "Sabrsiz", B: "Boshlagan ishini oxiriga yetkaza olmaydi", V: "Ehtiyotkor va fikrlovchi", G: "Yangi odamlar bilan muomala qilishda qiynaladi" },
  { A: "Betgachopar", B: "O'ziga ortiqcha baho berish", V: "Kuta bilish", G: "O'ziga ishonmaslik" },
  { A: "Qo'rqmaslik va tashabbuskorlik", B: "Yangilikni tez qabul qiladi", V: "Indamas, ko'p gapirishni yoqtirmaydi", G: "Yolg'izlikni osongina o'tkaza oladi" },
  { A: "Qaysarlik", B: "O'zini aytganini qila olmaslik", V: "O'zini tutgan holda suhbatlashish", G: "Tanholikni yoqtirish" },
  { A: "Muzokaralarda o'z fikrini o'tkaza olish", B: "Qiyinchilik va omadsizlikka e'tibor bermaslik", V: "Chidamlilik va o'zini ushlay olish", G: "O'zi bilan o'zi ovora bo'lib qolish" },
  { A: "Tavakkalchilik bor", B: "Har xil sharoitlarga osonlik bilan moslasha olish", V: "Boshlagan ishni oxirigacha olib borish", G: "Tavakkalchilikning yo'qligi" },
  { A: "Yugurib-yugurib ishlaydi", B: "Yangilikka qiziqish bilan kirishadi", V: "O'z kuchini bekorga sarflamaydi", G: "Past ovoz bilan gapiradi" },
  { A: "Gina saqlaydi", B: "Biron narsaga qiziqish tez so'nadi", V: "Kunlik ish tartibiga qat'iy rioya qiladi", G: "Suhbatdoshning xarakteriga moslasha oladi" },
  { A: "Gapirganida intonatsiya bilan gapiradi", B: "Bir ishdan ikkinchi ishga tez o'tadi", V: "Qiyinchilikni osonlik bilan o'tkazadi", G: "Og'ir vaziyatlarda yig'lab yuboradi" },
  { A: "O'zini tuta olmaslik", B: "Bir xil sharoitga moslashish", V: "Masalalar hal bo'layotganda e'tiborsizlik", G: "O'ziga va boshqalarga yuqori darajada talabchanlik" },
  { A: "Agressiv (jahldor) bo'lish", B: "O'zini yo'qotmaslik va boshqalarni eshita olish", V: "Birovdan hafa bo'lmaslik", G: "Birovlardan xafsirash" },
  { A: "Kamchilikka chiday olmaslik", B: "Chidamlilik va ishlash qobiliyatining ustunligi", V: "Doimiy qiziquvchanlikning o'zgarmasligi", G: "Hamma narsani o'ziga olib tez hafa bo'lish" },
  { A: "Aniq xatti-harakatlarga ega", B: "Xatti-harakat bilan tez va qattiq gapirish", V: "Shoshilmasdan ishga kirishish", G: "Hamma narsaga hafa bo'lish" },
  { A: "Ishni tez hal qiladi", B: "Qiyin sharoitlarda o'zini tuta oladi", V: "Hammaga teng qaraydi", G: "Boshqalar bilan ham suhbat qilishni yoqtiradi" },
  { A: "Yangilikka doim intilib boradi", B: "Har doim kayfiyat ko'tarinki", V: "Hamma ishni sifatli qiladi", G: "Kam harakatlik, uyatchanlik xos" },
  { A: "Tez va qo'rs xatti-harakatga ega", B: "Tez uxlab, tez uyg'onadi", V: "Qiyinchilik bilan yangi sharoitga moslashadi", G: "Bo'ysunuvchanlik va tortinuvchanlik mavjud" },
  { A: "Ishni shoshma-shosharlik bilan hal qiladi", B: "Maqsadga erishishda qat'an harakat qiladi", V: "Kam harakatchanlik", G: "Hamdardlikni xohlaydi" },
  { A: "Tezda xarakteri o'zgarib turadi", B: "Bir ishdan ikkinchi ishga o'tish oson", V: "Jahl chiqqanda o'zini tuta biladi", G: "Tez ta'sirchanlik" },
];

const TEMP_RESULTS = {
  A: { type: "Xolerik", emoji: "🔥", color: "#ef4444",
    desc: "Asab tizimidagi qo'zg'alish va tormozlanish jarayonlar kuchli. Yangiliklarga ehtirosi baland, g'ayratli va o'ta harakatchan. Bir maromdagi ishlarni yoqtirmaydi, doimo yangilikka intiluvchan.",
    strong: ["Tashabbuskor va g'ayratli", "Yangi muhitga tez moslashadi", "Kuchli rahbarlik qobiliyati", "Yuqori energiya va ishchanlik"],
    weak: ["Sabrsiz va betgachopar bo'lishi mumkin", "Tez achchiqlanadi", "Ishni oxirigacha yetkaza olmasligi"],
    advice: ["Sabr-toqat mashqlarini bajaring", "Katta ishlarni kichik qismlarga bo'ling", "His-tuyg'ularingizni nazorat qilishga o'rganing", "Meditatsiya va nafas olish mashqlari qiling"] },
  B: { type: "Sangvinik", emoji: "😊", color: "#22c55e",
    desc: "Qo'zg'alish va tormozlanish jarayonlari kuchli, lekin muvozanatli. O'zini qo'lda ushlay oladi, intizomli. Nizoli vaziyatda kelishuvga bora oladi, kelajakka ishonch bilan qaraydi.",
    strong: ["Muloqotga ochiq va do'stona", "Tez moslashadi", "Optimistik va ko'tarinki kayfiyatli", "Tashabbuskor"],
    weak: ["Ba'zan shoshma-shosharlik qiladi", "Ishlarni chuqur o'rganmasligi", "Osonlik bilan boshqa ishga o'tib ketishi"],
    advice: ["Boshlaganingizni oxirigacha yetkizing", "Diqqatni bir joyga to'plash mashqlarini bajaring", "Muhim ishlarni yozib boring", "Chuqur o'rganish ko'nikmalarini rivojlantiring"] },
  V: { type: "Flegmatik", emoji: "🧊", color: "#3b82f6",
    desc: "Harakatlari sekin, shoshilmas va sabr-toqatli. Tanholikni yaxshi ko'radi. O'rganib qolgan sharoitida yaxshi faoliyat yuritadi. Saramjon, tartibli, boshlagan ishini oxiriga yetkazadi.",
    strong: ["Juda sabr-toqatli", "Ishonchli va tartibli", "Boshlagan ishini tugatadi", "Chuqur o'ylaydi"],
    weak: ["Yangi sharoitga moslashish qiyin", "Sekin qaror qabul qiladi", "Ba'zan passiv ko'rinadi"],
    advice: ["Yangi narsalarni sinab ko'rishga harakat qiling", "Ijtimoiy faollikni oshiring", "Yangi odamlar bilan muloqot qiling", "Vaqt boshqarish ko'nikmalarini rivojlantiring"] },
  G: { type: "Melanxolik", emoji: "🌙", color: "#7c3aed",
    desc: "Nozik didli, hissiyotga berilgan, o'z ichki dunyosiga e'tiborli. San'atga qobiliyatlilar ko'p. Murakkab vaziyatlarda tezkor harakat qilishda qiynaladii. Juda sezuvchan.",
    strong: ["Nozik his-tuyg'uga ega", "Ijodiy va san'atga moyil", "Chuqur va diqqatli", "Sadoqatli do'st"],
    weak: ["O'z kuchiga ishonmasligi", "Tez toliqadi", "Yolg'izlikka moyil"],
    advice: ["O'z-o'zingizga ishonchni oshiring", "Kichik muvaffaqiyatlaringizni nishonlang", "Psixolog bilan suhbatlashing", "Ijodiy hobbiylar bilan shug'ullaning"] },
};

function TemperamentTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [counts, setCounts] = useState({ A: 0, B: 0, V: 0, G: 0 });
  const [result, setResult] = useState(null);

  const handleAnswer = (key) => {
    const newCounts = { ...counts, [key]: counts[key] + 1 };
    if (current + 1 >= TEMP_QUESTIONS.length) {
      const total = TEMP_QUESTIONS.length;
      const percents = {};
      Object.keys(newCounts).forEach(k => { percents[k] = Math.round((newCounts[k] / total) * 100); });
      const main = Object.keys(percents).reduce((a, b) => percents[a] > percents[b] ? a : b);
      setResult({ ...TEMP_RESULTS[main], percents, main });
    } else { setCounts(newCounts); setCurrent(c => c + 1); }
  };

  if (result) {
    const labels = { A: "Xolerik 🔥", B: "Sangvinik 😊", V: "Flegmatik 🧊", G: "Melanxolik 🌙" };
    return (
      <div className="test-result">
        <div className="result-emoji">{result.emoji}</div>
        <div className="result-level" style={{ background: result.color + "22", color: result.color }}>{result.type}</div>
        <h2>Siz — {result.type}!</h2>
        <p className="result-desc">{result.desc}</p>
        <div className="temp-bars">
          {Object.keys(result.percents).map(k => (
            <div key={k} className="temp-bar-item">
              <span>{labels[k]}</span>
              <div className="temp-bar-track"><div className="temp-bar-fill" style={{ width: result.percents[k] + "%", background: TEMP_RESULTS[k].color }} /></div>
              <span className="temp-pct">{result.percents[k]}%</span>
            </div>
          ))}
        </div>
        <div className="result-advice">
          <h3>💪 Kuchli tomonlar</h3>
          {result.strong.map((s, i) => <div key={i} className="advice-item"><span className="advice-num" style={{ background: result.color }}>✓</span><span>{s}</span></div>)}
        </div>
        <div className="result-advice" style={{ marginTop: 12 }}>
          <h3>💡 Rivojlantirish tavsiyalari</h3>
          {result.advice.map((a, i) => <div key={i} className="advice-item"><span className="advice-num">{i + 1}</span><span>{a}</span></div>)}
        </div>
        <button className="test-retry-btn" onClick={() => { setCurrent(0); setCounts({ A: 0, B: 0, V: 0, G: 0 }); setResult(null); }}>🔄 Qayta o'tish</button>
        <button className="test-back-btn" onClick={onBack}>← Testlar ro'yxatiga</button>
      </div>
    );
  }

  const pct = Math.round((current / TEMP_QUESTIONS.length) * 100);
  const q = TEMP_QUESTIONS[current];
  return (
    <div className="question-test">
      <div className="q-progress">
        <div className="q-progress-bar"><div style={{ width: pct + "%", background: "#ef4444" }} /></div>
        <span>{current + 1}/{TEMP_QUESTIONS.length}</span>
      </div>
      <div className="q-card">
        <p className="q-text">{current + 1}-savol: O'zingizga mos keladigan xususiyatni tanlang</p>
        <div className="q-options">
          {Object.entries(q).map(([key, val]) => (
            <button key={key} className="q-option temp-option" onClick={() => handleAnswer(key)}>
              <span className="temp-key" style={{ background: { A: "#ef4444", B: "#22c55e", V: "#3b82f6", G: "#7c3aed" }[key] }}>{key}</span>
              {val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 3. DEPRESSIYA TESTI (PHQ-9)
// ═══════════════════════════════════════════════
const DEPRESSION_Q = [
  "Ish qilishdan, dam olishdan ham kamroq zavq olyapsizmi?",
  "Kayfiyatingiz tushkun, umidsiz his qilyapsizmi?",
  "Uxlashda qiynalayapsizmi yoki juda ko'p uxlayapsizmi?",
  "Charchagan, kuchsiz his qilyapsizmi?",
  "Ishtahangiz past yoki juda yuqori?",
  "O'zingizni yomon his qilyapsiz, muvaffaqiyatsizman deb?",
  "Diqqatni bir joyga to'plab qiynalayapsizmi?",
  "Harakatlaringiz sekinlashgan yoki aksincha juda tez?",
  "O'zingizga zarar yetkazish haqida o'ylar kelib qolayaptimi?",
];

function DepressionTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const newAns = [...answers, val];
    if (current + 1 >= DEPRESSION_Q.length) {
      const score = newAns.reduce((a, b) => a + b, 0);
      let res;
      if (score <= 4) res = { state: "Minimal depressiya belgilari", emoji: "😊", level: "Yaxshi", color: "#22c55e", desc: "Depressiya belgilari minimal darajada. Siz ruhiy jihatdan yaxshi holatdasiz.", advice: ["Sog'lom hayot tarzini davom ettiring", "Do'stlar bilan muloqotni kuchaytiring", "Faol hayot tarzi qiling"] };
      else if (score <= 9) res = { state: "Engil depressiya belgilari", emoji: "🙂", level: "Kuzatish kerak", color: "#f59e0b", desc: "Ba'zi depressiya belgilari kuzatilmoqda. Bu holat rivojlanmasligi uchun choralar ko'rish kerak.", advice: ["Kuniga 30 daqiqa jismoniy mashq qiling", "Ijtimoiy aloqalarni kuchaytiring", "Psixolog bilan konsultatsiya foydali bo'ladi", "Uyqu rejimiga e'tibor bering"] };
      else if (score <= 14) res = { state: "O'rtacha depressiya", emoji: "😟", level: "Diqqat", color: "#f97316", desc: "O'rtacha darajada depressiya belgilari bor. Mutaxassis yordami zarur.", advice: ["Psixolog yoki psixiatr bilan albatta murojaat qiling", "Yaqinlaringizga holatingiz haqida ayting", "Kundalik harakatlar va tartibni saqlang", "Yolg'iz qolmang"] };
      else if (score <= 19) res = { state: "Kuchli depressiya", emoji: "😰", level: "Yordam kerak", color: "#ef4444", desc: "Depressiya belgilari kuchli darajada. Zudlik bilan mutaxassis ko'magiga muhtojsiz.", advice: ["Psixiatr bilan zudlik bilan bog'laning", "Oila yoki do'stlaringizga ayting", "Yolg'iz hal qilishga urinmang", "Umidnoma platformasidagi psixologlar bilan bog'laning"] };
      else res = { state: "Juda og'ir depressiya", emoji: "🆘", level: "Zudlik bilan yordam", color: "#dc2626", desc: "Juda og'ir depressiya belgilari. Darhol mutaxassisga murojaat qiling.", advice: ["HOZIROQ psixiatr yoki shifoxonaga murojaat qiling", "Yolg'iz qolmang — yaqinlaringizni chaqiring", "Umidnoma psixologlari bilan bog'laning", "Ishonch telefoni: 1800"] };
      setResult({ ...res, score });
    } else { setAnswers(newAns); setCurrent(c => c + 1); }
  };

  if (result) return (
    <div className="test-result">
      <div className="result-emoji">{result.emoji}</div>
      <div className="result-score-circle" style={{ borderColor: result.color, color: result.color }}>{result.score}<span>/27</span></div>
      <div className="result-level" style={{ background: result.color + "22", color: result.color }}>{result.level}</div>
      <h2>{result.state}</h2>
      <p className="result-desc">{result.desc}</p>
      <div className="result-advice"><h3>💡 Tavsiyalar</h3>
        {result.advice.map((a, i) => <div key={i} className="advice-item"><span className="advice-num">{i + 1}</span><span>{a}</span></div>)}
      </div>
      <button className="test-retry-btn" onClick={() => { setCurrent(0); setAnswers([]); setResult(null); }}>🔄 Qayta o'tish</button>
      <button className="test-back-btn" onClick={onBack}>← Testlar ro'yxatiga</button>
    </div>
  );

  const pct = Math.round((current / DEPRESSION_Q.length) * 100);
  return (
    <div className="question-test">
      <div className="q-progress"><div className="q-progress-bar"><div style={{ width: pct + "%", background: "#7c3aed" }} /></div><span>{current + 1}/{DEPRESSION_Q.length}</span></div>
      <p className="q-subtitle">So'nggi 2 hafta ichida qanchalik tez-tez his qildingiz?</p>
      <div className="q-card">
        <p className="q-text">{DEPRESSION_Q[current]}</p>
        <div className="q-options">
          {["Umuman yo'q (0)", "Bir necha kun (1)", "Kunlarning yarmidan ko'pi (2)", "Deyarli har kuni (3)"].map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 4. STRESS TESTI (PSS-10)
// ═══════════════════════════════════════════════
const STRESS_Q = [
  "So'nggi oyda kutilmagan hodisalar tufayli xafa bo'ldingizmi?",
  "Hayotingizning muhim narsalarini nazorat qila olmasligingizni his qildingizmi?",
  "Asabiylashgan va stressga uchragan his qildingizmi?",
  "Muammolarni muvaffaqiyatli hal qila olganingizni his qildingizmi?",
  "Ishlar o'z yo'lida ketayotganini his qildingizmi?",
  "Yuzaga kelgan muammolar bilan kurasha olmasligingizni his qildingizmi?",
  "Hayotingizni o'zingiz boshqara olganingizni his qildingizmi?",
  "Qo'lingizdan kelgan narsalarga erishish uchun imkoniyatlaringiz borligini his qildingizmi?",
  "Hayotingizning muhim narsalarini nazorat qila olmasligingizdan g'azablandingizmi?",
  "Qiyinchiliklar shunchalik ko'p to'planib qoldiki, ularni yengib o'ta olmasligingizni his qildingizmi?",
];

function StressTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const newAns = [...answers, val];
    if (current + 1 >= STRESS_Q.length) {
      const score = newAns.reduce((a, b) => a + b, 0);
      let res;
      if (score <= 13) res = { state: "Stress darajasi past", emoji: "😊", level: "Yaxshi", color: "#22c55e", desc: "Siz stressni yaxshi boshqaryapsiz.", advice: ["Sog'lom odatlaringizni saqlang", "Do'stlar bilan muloqotni davom ettiring", "Sport va faol hayot tarzini qo'llab-quvvatlang"] };
      else if (score <= 26) res = { state: "O'rtacha stress darajasi", emoji: "😐", level: "O'rta", color: "#f59e0b", desc: "Hayotingizda ma'lum stresslar bor, lekin ular boshqariladigan darajada.", advice: ["Kuniga 10 daqiqa meditatsiya qiling", "Uyqu rejimingizni tartibga soling", "Kofein iste'molini kamaytiring", "Dam olish pauzalarini kiriting"] };
      else res = { state: "Yuqori stress darajasi", emoji: "😰", level: "Diqqat", color: "#ef4444", desc: "Siz sezilarli stress ostindasiz. Bu sog'liqqa ta'sir qilishi mumkin.", advice: ["Psixolog bilan konsultatsiya oling", "Jismoniy mashqlarni kundalik odatga aylantiring", "Ijtimoiy majburiyatlaringizni kamaytiring", "Uyqu va ovqatlanishga diqqat bering"] };
      setResult({ ...res, score });
    } else { setAnswers(newAns); setCurrent(c => c + 1); }
  };

  if (result) return (
    <div className="test-result">
      <div className="result-emoji">{result.emoji}</div>
      <div className="result-score-circle" style={{ borderColor: result.color, color: result.color }}>{result.score}<span>/40</span></div>
      <div className="result-level" style={{ background: result.color + "22", color: result.color }}>{result.level}</div>
      <h2>{result.state}</h2><p className="result-desc">{result.desc}</p>
      <div className="result-advice"><h3>💡 Tavsiyalar</h3>
        {result.advice.map((a, i) => <div key={i} className="advice-item"><span className="advice-num">{i + 1}</span><span>{a}</span></div>)}
      </div>
      <button className="test-retry-btn" onClick={() => { setCurrent(0); setAnswers([]); setResult(null); }}>🔄 Qayta o'tish</button>
      <button className="test-back-btn" onClick={onBack}>← Testlar ro'yxatiga</button>
    </div>
  );

  const pct = Math.round((current / STRESS_Q.length) * 100);
  return (
    <div className="question-test">
      <div className="q-progress"><div className="q-progress-bar"><div style={{ width: pct + "%", background: "#f59e0b" }} /></div><span>{current + 1}/{STRESS_Q.length}</span></div>
      <div className="q-card">
        <p className="q-text">{STRESS_Q[current]}</p>
        <div className="q-options">
          {["Hech qachon", "Deyarli yo'q", "Ba'zan", "Tez-tez", "Juda tez-tez"].map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 5. NIKOHGA TAYYORLIK TESTI
// ═══════════════════════════════════════════════
const NIKOH_Q = [
  "O'zingizni moliyaviy mustaqil deb hisoblaysizmi?",
  "Hamkoringiz bilan ochiq muloqol qila olasizmi?",
  "Konflikt yuzaga kelganda tinch hal qila olasizmi?",
  "Oilaviy majburiyatlarni bo'lishishga tayyormisiz?",
  "Hamkoringizning kamchiklarini qabul qila olasizmi?",
  "Oilaviy byudjetni rejalashtirishga tayyormisiz?",
  "Hamkoringizning oilasi bilan munosabat o'rnatishga tayyormisiz?",
  "Farzand tarbiyasi haqida hamkoringiz bilan gaplashdingizmi?",
  "Hayotiy maqsadlaringiz hamkoringiznikiga mos keladi deb o'ylaysizmi?",
  "Nikoh bu mas'uliyat deb tushunasizmi?",
];

function NikohTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const newAns = [...answers, val];
    if (current + 1 >= NIKOH_Q.length) {
      const score = newAns.reduce((a, b) => a + b, 0);
      let res;
      if (score <= 15) res = { state: "Nikohga tayyorlik past", emoji: "⚠️", level: "Tayyorgarlik kerak", color: "#ef4444", desc: "Hozir nikohga to'liq tayyor emassiz. Ko'proq tayyorgarlik va o'z-o'zini rivojlantirish zarur.", advice: ["Moliyaviy mustaqillikni oshiring", "Muloqot ko'nikmalarini rivojlantiring", "Psixolog bilan maslahatlashing", "Hamkoringiz bilan ochiq suhbatlar qiling"] };
      else if (score <= 30) res = { state: "O'rtacha tayyorlik darajasi", emoji: "🙂", level: "O'rta", color: "#f59e0b", desc: "Nikohga ma'lum darajada tayyorsiz, lekin ayrim sohalarni mustahkamlash kerak.", advice: ["Hamkoringiz bilan muhim mavzularni muhokama qiling", "Oilaviy mas'uliyatlar haqida kelishing", "Moliyaviy rejalashtirish ko'nikmalarini oshiring", "Oila psixologi bilan suhbatlashing"] };
      else res = { state: "Nikohga yaxshi tayyorsiz", emoji: "💍", level: "Tayyor", color: "#22c55e", desc: "Siz nikohga yaxshi tayyorsiz! Mas'uliyatni tushunsangiz, muloqol ko'nikmalaringiz yaxshi.", advice: ["Hamkoringiz bilan kelishuvlarni yozma ravishda ham mustahkamlang", "Oilaviy qoidalarni birgalikda belgilang", "Har ikki tomon oilasini hurmat qiling", "Nikohdan keyin ham o'z rivojlanishingizni davom ettiring"] };
      setResult({ ...res, score });
    } else { setAnswers(newAns); setCurrent(c => c + 1); }
  };

  if (result) return (
    <div className="test-result">
      <div className="result-emoji">{result.emoji}</div>
      <div className="result-score-circle" style={{ borderColor: result.color, color: result.color }}>{result.score}<span>/40</span></div>
      <div className="result-level" style={{ background: result.color + "22", color: result.color }}>{result.level}</div>
      <h2>{result.state}</h2><p className="result-desc">{result.desc}</p>
      <div className="result-advice"><h3>💡 Tavsiyalar</h3>
        {result.advice.map((a, i) => <div key={i} className="advice-item"><span className="advice-num">{i + 1}</span><span>{a}</span></div>)}
      </div>
      <button className="test-retry-btn" onClick={() => { setCurrent(0); setAnswers([]); setResult(null); }}>🔄 Qayta o'tish</button>
      <button className="test-back-btn" onClick={onBack}>← Testlar ro'yxatiga</button>
    </div>
  );

  const pct = Math.round((current / NIKOH_Q.length) * 100);
  return (
    <div className="question-test">
      <div className="q-progress"><div className="q-progress-bar"><div style={{ width: pct + "%", background: "#ec4899" }} /></div><span>{current + 1}/{NIKOH_Q.length}</span></div>
      <div className="q-card">
        <p className="q-text">{NIKOH_Q[current]}</p>
        <div className="q-options">
          {["Umuman yo'q (0)", "Ozgina (1)", "O'rtacha (2)", "Ko'p (3)", "Mutlaqo ha (4)"].map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 6. OILAVIY MOSLIK TESTI
// ═══════════════════════════════════════════════
const OILA_Q = [
  "Hamkoringiz bilan asosiy hayotiy qadriyatlaringiz mos keladimi?",
  "Bir-biringizni tinglashga tayyormisiz?",
  "Moliyaviy masalalar bo'yicha fikrlaringiz mos keladimi?",
  "Dam olish va hobby borasida umumiy qiziqishlaringiz bormi?",
  "Farzand tarbiyasi bo'yicha bir xil fikrda ekansizmi?",
  "Bir-biringiz oilasini hurmat qilasizmi?",
  "Uzoq muddatli maqsadlaringiz bir xilmi?",
  "Konflikt chog'ida bir-biringizni tushunasizmi?",
  "Din yoki madaniyat bo'yicha muammolar yo'qmi?",
  "Bir-biringiz bilan vaqt o'tkazishdan rohatlanasizmi?",
];

function OilaTest({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const newAns = [...answers, val];
    if (current + 1 >= OILA_Q.length) {
      const score = newAns.reduce((a, b) => a + b, 0);
      let res;
      if (score <= 15) res = { state: "Moslik past darajada", emoji: "⚠️", level: "Muammolar bor", color: "#ef4444", desc: "Hamkoringiz bilan muhim sohalarda farqlar ko'p. Jiddiy suhbatlar zarur.", advice: ["Oila psixologi bilan birgalikda murojaat qiling", "Muhim farqlar haqida ochiq gaplashing", "Bir-biringizni tushunishga harakat qiling", "Qaror qabul qilishda shoshilmang"] };
      else if (score <= 30) res = { state: "O'rtacha moslik", emoji: "🤝", level: "O'rta", color: "#f59e0b", desc: "Ba'zi sohalarda mos kelasiz, lekin muhim farqlar ham bor. Muloqot zarur.", advice: ["Farqli sohalarda kelishuvga harakat qiling", "Har ikkalangiz uchun muhim narsalarni muhokama qiling", "Oilaviy maslahatchi bilan murojaat qiling", "Sabr va tushunish bilan munosabat qiling"] };
      else res = { state: "Yuqori moslik", emoji: "💑", level: "Mos kelasiz", color: "#22c55e", desc: "Siz va hamkoringiz ko'p jihatlarda mos kelasiz. Bu mustahkam oila uchun yaxshi asos.", advice: ["Munosabatlarni doimiy parvarishlang", "Kichik farqlarni hurmatlang", "Birgalikda reja tuzing", "Bir-biringizga minnatdorlik bildiring"] };
      setResult({ ...res, score });
    } else { setAnswers(newAns); setCurrent(c => c + 1); }
  };

  if (result) return (
    <div className="test-result">
      <div className="result-emoji">{result.emoji}</div>
      <div className="result-score-circle" style={{ borderColor: result.color, color: result.color }}>{result.score}<span>/40</span></div>
      <div className="result-level" style={{ background: result.color + "22", color: result.color }}>{result.level}</div>
      <h2>{result.state}</h2><p className="result-desc">{result.desc}</p>
      <div className="result-advice"><h3>💡 Tavsiyalar</h3>
        {result.advice.map((a, i) => <div key={i} className="advice-item"><span className="advice-num">{i + 1}</span><span>{a}</span></div>)}
      </div>
      <button className="test-retry-btn" onClick={() => { setCurrent(0); setAnswers([]); setResult(null); }}>🔄 Qayta o'tish</button>
      <button className="test-back-btn" onClick={onBack}>← Testlar ro'yxatiga</button>
    </div>
  );

  const pct = Math.round((current / OILA_Q.length) * 100);
  return (
    <div className="question-test">
      <div className="q-progress"><div className="q-progress-bar"><div style={{ width: pct + "%", background: "#ec4899" }} /></div><span>{current + 1}/{OILA_Q.length}</span></div>
      <div className="q-card">
        <p className="q-text">{OILA_Q[current]}</p>
        <div className="q-options">
          {["Umuman yo'q (0)", "Ozgina (1)", "O'rtacha (2)", "Ko'p (3)", "Mutlaqo ha (4)"].map((opt, i) => (
            <button key={i} className="q-option" onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// UMUMIY RESULT KOMPONENTI
// ═══════════════════════════════════════════════
function Result({ result, onRetry, onBack }) {
  return (
    <div className="test-result">
      <div className="result-emoji">{result.emoji}</div>
      <div className="result-level" style={{ background: result.color + "22", color: result.color }}>{result.level}</div>
      <h2>{result.state}</h2>
      <p className="result-desc">{result.desc}</p>
      <div className="result-advice"><h3>💡 Tavsiyalar</h3>
        {result.advice.map((a, i) => <div key={i} className="advice-item"><span className="advice-num">{i + 1}</span><span>{a}</span></div>)}
      </div>
      <button className="test-retry-btn" onClick={onRetry}>🔄 Qayta o'tish</button>
      <button className="test-back-btn" onClick={onBack}>← Testlar ro'yxatiga</button>
    </div>
  );
}

// ═══════════════════════════════════════════════
// ASOSIY SAHIFA
// ═══════════════════════════════════════════════
const TESTS_LIST = [
  { id: "luscher", emoji: "🎨", title: "Lyusher Rang Testi", desc: "Ranglarni tanlash orqali hozirgi ruhiy holatingizni aniqlang", duration: "3-5 daqiqa", questions: "8 rang × 2", color: "#7c3aed", tag: "Klassik" },
  { id: "temperament", emoji: "🧬", title: "Temperament Testi", desc: "Xolerik, Sangvinik, Flegmatik yoki Melanxolik — qaysi tipsiz?", duration: "5-7 daqiqa", questions: "20 savol", color: "#ef4444", tag: "Shaxsiyat" },
  { id: "depression", emoji: "🌧️", title: "Depressiya Testi (PHQ-9)", desc: "Depressiya belgilarini aniqlash uchun klinik standart test", duration: "2-3 daqiqa", questions: "9 savol", color: "#6366f1", tag: "Klinik standart" },
  { id: "stress", emoji: "🌡️", title: "Stress Darajasi Testi", desc: "So'nggi oy ichida stress darajangizni o'lchang (PSS-10)", duration: "2-3 daqiqa", questions: "10 savol", color: "#f59e0b", tag: "Keng qo'llaniladigan" },
  { id: "nikoh", emoji: "💍", title: "Nikohga Tayyorlik Testi", desc: "Nikoh uchun emotsional va amaliy tayyorligingizni aniqlang", duration: "3-4 daqiqa", questions: "10 savol", color: "#ec4899", tag: "Oilaviy" },
  { id: "oila", emoji: "💑", title: "Oilaviy Moslik Testi", desc: "Hamkoringiz bilan qanchalik mos kelishingizni tekshiring", duration: "3-4 daqiqa", questions: "10 savol", color: "#e11d48", tag: "Munosabatlar" },
  { id: "szondi", emoji: "🎭", title: "Sondi Testi", desc: "6 seriya yuzlardan 2 tasini tanlash orqali ongsiz ehtiyojlarni aniqlang", duration: "3-5 daqiqa", questions: "6 seriya × 2 tanlov", color: "#7c3aed", tag: "Klassik" },
  { id:"rorschach", emoji:"🌊", title:"Rorschach Dog' Testi", desc:"10 ta siyoh dog'ida nimani ko'rishingiz shaxsiyatingizni aks ettiradi", duration:"3-4 daqiqa", questions:"10 savol", color:"#1d4ed8", tag:"Proektiv" },
  { id:"big5", emoji:"🧬", title:"Big Five Shaxsiyat", desc:"Dunyoning eng ishonchli 5 omilli shaxsiyat modeli", duration:"3-4 daqiqa", questions:"15 savol", color:"#553c9a", tag:"Ilmiy" },
  { id:"enneagram", emoji:"⭕", title:"Enneagram (9 tip)", desc:"9 ta shaxsiyat tipidan qaysisingiz? Chuqur o'z-o'zini tushunish", duration:"3-5 daqiqa", questions:"5 savol", color:"#7c3aed", tag:"Chuqur tahlil" },
  { id:"empathy", emoji:"💜", title:"Empatiya Testi", desc:"Boshqalarning his-tuyg'ularini his qilish qobiliyatingizni o'lchang", duration:"2-3 daqiqa", questions:"8 savol", color:"#db2777", tag:"Ijtimoiy" },
  { id:"narcissism", emoji:"🪞", title:"Narsisizm Testi (NPI)", desc:"Sog'lom o'z-o'ziga hurmat va narsisizm chegarasini aniqlang", duration:"2-3 daqiqa", questions:"8 savol", color:"#f59e0b", tag:"Shaxsiyat" },
  { id:"darktriad", emoji:"🌑", title:"Dark Triad Testi", desc:"Makkyavelizm, Psixopatiya va Narsisizm darajasini aniqlang", duration:"2-3 daqiqa", questions:"9 savol", color:"#374151", tag:"Ilmiy" },
  { id:"attachment", emoji:"🔗", title:"Bog'lanish Uslubi Testi", desc:"Munosabatlarda xavfsiz, xavotirli yoki qochuvchi tip?", duration:"2-3 daqiqa", questions:"5 savol", color:"#ec4899", tag:"Munosabatlar" },
  { id:"trauma", emoji:"💙", title:"Bolaliк Travmasi Testi", desc:"Bolaliкdagi tajribalar va ularning ta'sirini tushunish", duration:"3-4 daqiqa", questions:"10 savol", color:"#7c3aed", tag:"Travma" },
];




// Tests.js faylingizning oxiridagi export default Tests() funksiyasini
// quyidagi kod bilan to'liq almashtiring:

export default function Tests() {
  const [activeTest, setActiveTest] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Test o'tish routerlari
  if (activeTest === "luscher")     return <LuscherTest     onBack={() => setActiveTest(null)} />;
  if (activeTest === "temperament") return <TemperamentTest onBack={() => setActiveTest(null)} />;
  if (activeTest === "depression")  return <DepressionTest  onBack={() => setActiveTest(null)} />;
  if (activeTest === "stress")      return <StressTest      onBack={() => setActiveTest(null)} />;
  if (activeTest === "nikoh")       return <NikohTest       onBack={() => setActiveTest(null)} />;
  if (activeTest === "szondi")      return <SzondiTest      onBack={() => setActiveTest(null)} />;
  if (activeTest === "rorschach")   return <RorschachTest   onBack={() => setActiveTest(null)} />;
  if (activeTest === "big5")        return <Big5Test        onBack={() => setActiveTest(null)} />;
  if (activeTest === "enneagram")   return <EnneagramTest   onBack={() => setActiveTest(null)} />;
  if (activeTest === "empathy")     return <EmpathyTest     onBack={() => setActiveTest(null)} />;
  if (activeTest === "narcissism")  return <NarcissismTest  onBack={() => setActiveTest(null)} />;
  if (activeTest === "darktriad")   return <DarkTriadTest   onBack={() => setActiveTest(null)} />;
  if (activeTest === "attachment")  return <AttachmentTest  onBack={() => setActiveTest(null)} />;
  if (activeTest === "trauma")      return <ChildhoodTraumaTest onBack={() => setActiveTest(null)} />;
  if (activeTest === "parent_teen") return <ParentTeenTest  onBack={() => setActiveTest(null)} />;
  if (activeTest === "muloqot")     return <MuloqotTest         onBack={() => setActiveTest(null)} />;
  if (activeTest === "raven")       return <RavenTest    onBack={() => setActiveTest(null)} />;
  if (activeTest === "ozozini")     return <OzOziniTest  onBack={() => setActiveTest(null)} />;
  if (activeTest === "kettel")      return <KettelTest   onBack={() => setActiveTest(null)} />;
  if (activeTest === "yolgon")      return <YolgonTest   onBack={() => setActiveTest(null)} />;

  const TESTS_LIST = [
    { id:"luscher",     emoji:"🎨", title:"Lyusher Rang Testi",      desc:"Ranglarni tanlash orqali hozirgi ruhiy holatingizni aniqlang",              duration:"3–5 daqiqa", questions:"8 rang × 2",  tag:"Klassik",    cat:"shaxsiyat", featured:false, popular:false },
    { id:"temperament", emoji:"🧬", title:"Temperament Testi",        desc:"Xolerik, Sangvinik, Flegmatik yoki Melanxolik — qaysi tipsiz?",             duration:"5–7 daqiqa", questions:"8 savol",     tag:"Shaxsiyat",  cat:"shaxsiyat", featured:true,  popular:true  },
    { id:"depression",  emoji:"🌧️", title:"Depressiya Testi (PHQ-9)", desc:"4 o'lcham + radar grafik bilan klinik standart baholash",                  duration:"2–3 daqiqa", questions:"9 savol",     tag:"Klinik",     cat:"klinik",    featured:false, popular:false },
    { id:"stress",      emoji:"🌡️", title:"Stress Testi (PSS-10)",    desc:"3 o'lcham: reaktivlik, nazorat, bardosh + batafsil tavsif",                duration:"2–3 daqiqa", questions:"10 savol",    tag:"Klinik",     cat:"klinik",    featured:false, popular:true  },
    { id:"nikoh",       emoji:"💍", title:"Nikohga Tayyorlik Testi",  desc:"4 o'lcham: amaliy, muloqot, emotsional, ijtimoiy tayyorlik",               duration:"3–4 daqiqa", questions:"10 savol",    tag:"Munosabat",  cat:"munosabat", featured:false, popular:false },
    { id:"szondi",      emoji:"🎭", title:"Sondi Testi",              desc:"6 seriya yuzlardan 2 tasini tanlash orqali ongsiz ehtiyojlarni aniqlang",   duration:"3–5 daqiqa", questions:"6 × 2",       tag:"Proektiv",   cat:"shaxsiyat", featured:false, popular:false },
    { id:"rorschach",   emoji:"🌊", title:"Rorschach Dog' Testi",     desc:"10 ta siyoh dog'ida nimani ko'rishingiz shaxsiyatingizni aks ettiradi",     duration:"3–4 daqiqa", questions:"10 savol",    tag:"Proektiv",   cat:"shaxsiyat", featured:false, popular:false },
    { id:"big5",        emoji:"⭐", title:"Big Five Shaxsiyat",       desc:"Dunyoning eng ishonchli 5 omilli shaxsiyat modeli (OCEAN)",                 duration:"3–4 daqiqa", questions:"15 savol",    tag:"Ilmiy",      cat:"shaxsiyat", featured:true,  popular:true  },
    { id:"enneagram",   emoji:"⭕", title:"Enneagram (9 tip)",        desc:"9 ta shaxsiyat tipidan qaysisingiz? O'z-o'zini chuqur tushunish",           duration:"3–5 daqiqa", questions:"5 savol",     tag:"Chuqur",     cat:"shaxsiyat", featured:false, popular:false },
    { id:"empathy",     emoji:"💜", title:"Empatiya Testi",           desc:"Boshqalarning his-tuyg'ularini his qilish qobiliyatingizni o'lchang",       duration:"2–3 daqiqa", questions:"8 savol",     tag:"Ijtimoiy",   cat:"munosabat", featured:false, popular:false },
    { id:"narcissism",  emoji:"🪞", title:"Narsisizm Testi (NPI)",    desc:"Sog'lom o'z-o'ziga hurmat va narsisizm chegarasini aniqlang",              duration:"2–3 daqiqa", questions:"8 savol",     tag:"Shaxsiyat",  cat:"shaxsiyat", featured:false, popular:false },
    { id:"darktriad",   emoji:"🌑", title:"Dark Triad Testi",         desc:"Makkyavelizm, psixopatiya va narsisizm darajasini aniqlang",               duration:"2–3 daqiqa", questions:"9 savol",     tag:"Ilmiy",      cat:"shaxsiyat", featured:false, popular:false },
    { id:"attachment",  emoji:"🔗", title:"Bog'lanish Uslubi Testi",  desc:"Munosabatlarda xavfsiz, xavotirli yoki qochuvchi tip?",                   duration:"2–3 daqiqa", questions:"5 savol",     tag:"Munosabat",  cat:"munosabat", featured:false, popular:false },
    { id:"trauma",      emoji:"💙", title:"Bolaliк Travmasi Testi",   desc:"Bolaliкdagi tajribalar va ularning hozirgi hayotga ta'sirini tushunish",   duration:"3–4 daqiqa", questions:"10 savol",    tag:"Travma",     cat:"klinik",    featured:false, popular:false },
    { id:"muloqot",     emoji:"💬", title:"Muloqot Testi",              desc:"Kommunikabellik darajangizni aniqlang — muloqotga intiluvchanlıgingiz",     duration:"3–4 daqiqa", questions:"16 savol",    tag:"Ijtimoiy",   cat:"munosabat", featured:false, popular:false },
    { id:"ozozini",     emoji:"🌱", title:"O'z-o'zini Rivojlantirish",  desc:"O'zingizni bilish istagi va o'zgartira olish qobiliyatingizni aniqlang",    duration:"3–4 daqiqa", questions:"14 savol",    tag:"Shaxsiyat",  cat:"shaxsiyat", featured:false, popular:false },
    { id:"raven",       emoji:"🧩", title:"Raven Intellekt Testi",      desc:"Mantiqiy fikrlash va naqshlarni aniqlash qobiliyatingizni o'lchang",        duration:"5–7 daqiqa", questions:"5 savol",     tag:"Intellekt",  cat:"shaxsiyat", featured:false, popular:false },
    { id:"kettel",      emoji:"🧬", title:"Kettel 16PF Testi",           desc:"16 omilli shaxsiyat profili — Kettel metodikasi asosida",                    dur:"8–10 min", q:"32 savol",    tag:"Ilmiy",     cat:"shaxsiyat", popular:false },
    { id:"yolgon",      emoji:"🔍", title:"Yolg'on Ko'rsatkichi",         desc:"Ijtimoiy maqbullik tendentsiyangizni aniqlang — Eysenck metodikasi",         dur:"3–4 min", q:"20 savol",    tag:"Klassik",   cat:"shaxsiyat", popular:false },
    { id:"parent_teen", emoji:"👨‍👩‍👧", title:"Ota-onalar Testi",           desc:"O'smir farzandingizni qanchalik tushunasiz? J.Piaje metodikasi",          duration:"5–7 daqiqa", questions:"24 savol",    tag:"Oila",       cat:"munosabat", featured:false, popular:false },
  ];

  const filtered = TESTS_LIST.filter(t => {
    const matchCat = activeFilter === "all" || t.cat === activeFilter;
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const FILTERS = [
    { key: "all",       label: "Barchasi" },
    { key: "shaxsiyat", label: "Shaxsiyat" },
    { key: "munosabat", label: "Munosabat" },
    { key: "klinik",    label: "Klinik"  },
  ];

  return (
    <div className="tests-page">

      {/* HERO */}
      <div className="tests-hero">
        <div className="tests-hero-badge">✦ {TESTS_LIST.length} ta test mavjud</div>
        <h1>O'zingizni <span>chuqurroq</span> tushunib oling</h1>
        <p>Ilmiy asoslangan psixologik testlar orqali shaxsiyatingizni, his-tuyg'ularingizni va munosabatlaringizni tahlil qiling</p>
      </div>

      {/* STATS */}
      <div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:28,flexWrap:"wrap"}}>
        {[
          [TESTS_LIST.length,"Testlar"],
          ["2.4K+","Foydalanuvchi"],
          ["96%","Foydali"],
          ["3 min","O'rtacha vaqt"],
        ].map(([n,l])=>(
          <div key={l} style={{textAlign:"center"}}>
            <span style={{display:"block",fontSize:22,fontWeight:500,color:"#1a1a2e"}}>{n}</span>
            <span style={{fontSize:12,color:"#9ca3af"}}>{l}</span>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER */}
      <div className="tests-controls">
        <div className="tests-search-wrap">
          <span className="tests-search-icon">🔍</span>
          <input
            className="tests-search"
            placeholder="Test qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tests-filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`tests-ftab ${activeFilter === f.key ? "active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="tests-grid">
        {filtered.map(t => (
          <div
            key={t.id}
            className="test-card"
            onClick={() => setActiveTest(t.id)}
          >
            <div className="test-card-bar" />
            <div className="test-card-inner">
              <div className="test-card-head">
                <div className="test-card-icon">{TEST_ICONS[t.id]}</div>
                <div className="test-card-badges">
                  <span className="test-tag">{t.tag}</span>
                  {t.popular && <span className="test-tag-new">🔥 Mashhur</span>}
                </div>
              </div>
              <div className="test-card-body">
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <div className="test-card-divider" />
                <div className="test-card-meta">
                  <span>⏱ {t.duration}</span>
                  <span className="test-card-meta-dot" />
                  <span>{t.questions}</span>
                </div>
                <button className="test-card-btn">
                  Boshlash →
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#94A3B8" }}>
            🔍 "{searchQuery}" bo'yicha test topilmadi
          </div>
        )}
      </div>

      <div className="tests-note">
        ⚠️ Bu testlar ma'lumot berish uchun mo'ljallangan va tibbiy tashxis o'rnini bosmaydi. Jiddiy muammolar uchun mutaxassisga murojaat qiling.
      </div>

      {/* BOTTOM BANNER */}
      <div className="tests-banner">
        <div>
          <h3>Natijalarni psixolog bilan muhokama qiling 💬</h3>
          <p>Test natijalaringiz asosida professional psixolog bilan maslahat oling. 24/7 onlayn yordam mavjud.</p>
        </div>
        <button className="tests-banner-btn">Psixolog toping →</button>
      </div>

    </div>
  );
}

