import { useState } from "react";
import "./Trainings.css";
import {
  Star, Clock, Users, Play, ChevronLeft,
  CheckCircle, Lock, Award, MessageCircle,
  Activity, Heart, Leaf, Baby, Brain, Sun, Video
} from "lucide-react";
//import VideoPreviewCard from "./components/VideoPreviewCard"; 

// ─── COFOUNDER ───────────────────────────────────────
import cofounderPhoto from "./images/cofounder.jpg";

// ─── VIDEOLAR (19 ta) ─────────────────────────────────
// Har bir video uchun: src/videos/trainingN.MP4 faylini qo'ying
// ─── BUNNY CDN BASE URL ───────────────────────────────
const CDN = "https://PSCHOLOGY.b-cdn.net";

// ─── ICON MAP ─────────────────────────────────────────
const CAT_ICONS = {
  stress:  <Activity size={36} strokeWidth={1.5} />,
  oila:    <Heart    size={36} strokeWidth={1.5} />,
  osish:   <Leaf     size={36} strokeWidth={1.5} />,
  bolalar: <Baby     size={36} strokeWidth={1.5} />,
  nlp:     <Brain    size={36} strokeWidth={1.5} />,
  soglik:  <Sun      size={36} strokeWidth={1.5} />,
  video:   <Video    size={36} strokeWidth={1.5} />,
};

// ─── 19 TA SHAXSIY TRENING VIDEOLARI ─────────────────
const PERSONAL_VIDEOS = [
  {
    id: "v1", catKey: "stress",
    title: "Stressni boshqarish",
    subtitle: "Shaxsiy trening #1",
    desc: "Bu yerga #1 trening haqida qisqacha tavsif yozing.",
    cat: "Stress", level: "Boshlovchilar",
    duration: "0:40", lessons: 1, students: 1200, rating: 4.8, reviews: 186,
    videoFile: `${CDN}/training1.MP4`,
    playlist: [{ id: 1, title: "Stressni boshqarish — Shaxsiy trening", dur: "42:18", free: true }],
  },
  {
    id: "v2", catKey: "oila",
    title: "Oilada baxtli hayot",
    subtitle: "Shaxsiy trening #2",
    desc: "Bu yerga #2 trening haqida qisqacha tavsif yozing.",
    cat: "Oila", level: "Boshlovchilar",
    duration: "0:46", lessons: 1, students: 900, rating: 4.7, reviews: 142,
    videoFile: `${CDN}/training2.MP4`,
    playlist: [{ id: 1, title: "Oilada baxtli hayot — Shaxsiy trening", dur: "38:45", free: true }],
  },
  {
    id: "v3", catKey: "osish",
    title: "Shaxsiy o'sish sirlari",
    subtitle: "Shaxsiy trening #3",
    desc: "Bajarayotgan ishingizdan qoniqmayotgan bo'lsangiz, ishni o'zgartirish kerak deb o'ylaysizmi?",
    cat: "Shaxsiy o'sish", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training3.MOV`,
    playlist: [{ id: 1, title: "Shaxsiy o'sish sirlari — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v4", catKey: "soglik",
    title: "Sog'lom turmush tarzi",
    subtitle: "Shaxsiy trening #4",
    desc: "Nima uchun o'zingizga qarab yurishingiz kerak?",
    cat: "Sog'liq", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training4.MOV`,
    playlist: [{ id: 1, title: "Sog'lom turmush tarzi — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v5", catKey: "stress",
    title: "Ichki tinchlikni topish",
    subtitle: "Shaxsiy trening #5",
    desc: "Ota-ona ajrimining bola psixologiyasiga tasiri.",
    cat: "Stress", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training5.MOV`,
    playlist: [{ id: 1, title: "Ichki tinchlikni topish — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v6", catKey: "oila",
    title: "Munosabatlarda uyg'unlik",
    subtitle: "Shaxsiy trening #6",
    desc: "Manupulatsiyali hikoyalar texnikasi",
    cat: "Oila", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training6.MOV`,
    playlist: [{ id: 1, title: "Munosabatlarda uyg'unlik — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v7", catKey: "bolalar",
    title: "Farzand tarbiyasi",
    subtitle: "Shaxsiy trening #7",
    desc: "Siz ham boshqalarni fikringizga ishontirishni xohlaysizmi?",
    cat: "Bolalar", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training7.MP4`,
    playlist: [{ id: 1, title: "Farzand tarbiyasi — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v8", catKey: "osish",
    title: "Motivatsiya va maqsad",
    subtitle: "Shaxsiy trening #8",
    desc: "Ranglar orqali o'zingizni anglash mashqi — Kayfiyat daraxti 🌳",
    cat: "Shaxsiy o'sish", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training8.MOV`,
    playlist: [{ id: 1, title: "Motivatsiya va maqsad — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v9", catKey: "soglik",
    title: "Ruhiy salomatlik asoslari",
    subtitle: "Shaxsiy trening #9",
    desc: "Nega atrofdagilar bizga bergan baho bizni boshqaradi?",
    cat: "Sog'liq", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training9.MP4`,
    playlist: [{ id: 1, title: "Ruhiy salomatlik asoslari — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v10", catKey: "stress",
    title: "Nafas texnikalari",
    subtitle: "Shaxsiy trening #10",
    desc: "oson ishlar miyani qiyin ishlarga qaraganda tezroq charchatishini bilarmidingiz?",
    cat: "Stress", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training10.MOV`,
    playlist: [{ id: 1, title: "Nafas texnikalari — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v11", catKey: "oila",
    title: "Er-xotin muloqoti",
    subtitle: "Shaxsiy trening #11",
    desc: "Odamni bilmoqchimisiz? So'zini emas, harakatini kuzating. 💭",
    cat: "Oila", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training11.mp4`,
    playlist: [{ id: 1, title: "Er-xotin muloqoti — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v12", catKey: "bolalar",
    title: "Bola va ota-ona bog'liqligi",
    subtitle: "Shaxsiy trening #12",
    desc: "Baxtimizni 50% genetika, 10% sharoitimiz bilan belgilanar ekan. Xo'sh qolgan % nima bilan belgilanadi?",
    cat: "Bolalar", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training12.mp4`,
    playlist: [{ id: 1, title: "Bola va ota-ona bog'liqligi — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v13", catKey: "osish",
    title: "O'z-o'ziga ishonch",
    subtitle: "Shaxsiy trening #13",
    desc: "Achinish nomli manipuliyatsiyadan himoyalaning.",
    cat: "Shaxsiy o'sish", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training13.MOV`,
    playlist: [{ id: 1, title: "O'z-o'ziga ishonch — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v14", catKey: "soglik",
    title: "Yaxshi uyqu va dam olish",
    subtitle: "Shaxsiy trening #14",
    desc: "Bu yerga #14 trening haqida qisqacha tavsif yozing.",
    cat: "Sog'liq", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training14.MOV`,
    playlist: [{ id: 1, title: "Yaxshi uyqu va dam olish — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v15", catKey: "stress",
    title: "Xavotirni yengish yo'llari",
    subtitle: "Shaxsiy trening #15",
    desc: "Stressdan qutilishning samarali usullari haqida nimalarni bilasiz?",
    cat: "Stress", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training15.MP4`,
    playlist: [{ id: 1, title: "Xavotirni yengish yo'llari — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v16", catKey: "oila",
    title: "Oilada mehr va hurmat",
    subtitle: "Shaxsiy trening #16",
    desc: "Ota-onalar farzandlariga rahmdil yoki qattiqko'llik orqali ta'sir o'tkazsa bolalar qanday ulg'ayishadi?",
    cat: "Oila", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training16.mp4`,
    playlist: [{ id: 1, title: "Oilada mehr va hurmat — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v17", catKey: "osish",
    title: "Shaxsiy o'sishda motivatsiya",
    subtitle: "Shaxsiy trening #17",
    desc: "Nima uchun biz xohlagan narsamizga erisholmaymiz?",
    cat: "Bolalar", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training17.MP4`,
    playlist: [{ id: 1, title: "Bolalarda his-tuyg'ularni boshqarish — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v18", catKey: "osish",
    title: "Emotsional yetuklik",
    subtitle: "Shaxsiy trening #18",
    desc: "Emotional yetuklik ayollar va erkaklarda bir xilmi?",
    cat: "Shaxsiy o'sish", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training18.MP4`,
    playlist: [{ id: 1, title: "Vaqtni boshqarish san'ati — Shaxsiy trening", dur: "00:00", free: true }],
  },
  {
    id: "v19", catKey: "bolalar",
    title: "Mindfulness va meditatsiya",
    subtitle: "Shaxsiy trening #19",
    desc: "7 yoshgacha bola o'z-o'ziga adekvat baho beraolmaydi.",
    cat: "Bolalar", level: "Boshlovchilar",
    duration: "0:00", lessons: 1, students: 0, rating: 5.0, reviews: 0,
    videoFile: `${CDN}/training19.MOV`,
    playlist: [{ id: 1, title: "Mindfulness va meditatsiya — Shaxsiy trening", dur: "00:00", free: true }],
  },
];
// Barcha video kurslar isFree:true va isPersonal:true
const PERSONAL_COURSES = PERSONAL_VIDEOS.map(v => ({
  ...v,
  price: 0,
  isFree: true,
  isPersonal: true,
  isNew: true,
}));

// ─── TO'LOVLI KURSLAR ─────────────────────────────────
const PAID_COURSES = [
  {
    id: 103, catKey: "stress",
    title: "Stressni boshqarish: 21 kunlik dastur",
    subtitle: null,
    desc: "Ish, oila va kundalik hayotdagi stressni ilmiy usullar bilan boshqarishni o'rganing.",
    cat: "Stress", level: "Boshlang'ich",
    price: 150000, isFree: false, isPersonal: false, isNew: false,
    duration: "4 soat 20 min", lessons: 12,
    students: 890, rating: 4.8, reviews: 124,
    videoFile: null,
    playlist: [
      { id: 1, title: "Stress nima va u qanday ishlaydi?",    dur: "18:24", free: true  },
      { id: 2, title: "Stressning tanaga ta'siri",            dur: "22:10", free: true  },
      { id: 3, title: "4-7-8 nafas texnikasi",                dur: "15:40", free: false },
      { id: 4, title: "Kognitiv qayta baholash",              dur: "28:15", free: false },
      { id: 5, title: "Ish joyida stressni kamaytirish",      dur: "20:30", free: false },
      { id: 6, title: "21 kunlik reja va xulosa",             dur: "16:30", free: false },
    ],
  },
  {
    id: 104, catKey: "oila",
    title: "Munosabatlarda o'z-o'zini tushunish",
    subtitle: null,
    desc: "Oilaviy va do'stlik munosabatlaridagi qiyinchiliklarni psixologik nuqtai nazardan ko'rib chiqing.",
    cat: "Oila", level: "O'rta",
    price: 150000, isFree: false, isPersonal: false, isNew: false,
    duration: "6 soat 15 min", lessons: 15,
    students: 540, rating: 4.8, reviews: 87,
    videoFile: null,
    playlist: [
      { id: 1, title: "Munosabat psixologiyasiga kirish", dur: "20:15", free: true  },
      { id: 2, title: "Bog'lanish uslublari",              dur: "25:30", free: false },
      { id: 3, title: "Konfliktni hal qilish",             dur: "30:00", free: false },
    ],
  },
  {
    id: 105, catKey: "osish",
    title: "Shaxsiy o'sish: Ichki kuchni topish",
    subtitle: null,
    desc: "O'z potentsialingizni ochadigan va hayotiy maqsadlaringizga erishishga yordam beradigan kurs.",
    cat: "Shaxsiy o'sish", level: "Boshlang'ich",
    price: 120000, isFree: false, isPersonal: false, isNew: true,
    duration: "5 soat 40 min", lessons: 14,
    students: 720, rating: 4.9, reviews: 98,
    videoFile: null,
    playlist: [
      { id: 1, title: "O'z-o'zingizni bilish",       dur: "22:00", free: true  },
      { id: 2, title: "SMART maqsad qo'yish",         dur: "18:45", free: false },
      { id: 3, title: "Motivatsiyani saqlash sirri",  dur: "24:15", free: false },
    ],
  },
  {
    id: 106, catKey: "bolalar",
    title: "Bolalar psixologiyasi: Ota-onalar uchun",
    subtitle: null,
    desc: "Farzandingizni tushunish va sog'lom muloqot o'rnatish bo'yicha amaliy ko'nikmalar.",
    cat: "Bolalar", level: "Barcha",
    price: 180000, isFree: false, isPersonal: false, isNew: false,
    duration: "7 soat 10 min", lessons: 18,
    students: 340, rating: 5.0, reviews: 52,
    videoFile: null,
    playlist: [
      { id: 1, title: "Bola psixologiyasiga kirish", dur: "19:30", free: true  },
      { id: 2, title: "Yoshga oid xususiyatlar",     dur: "28:15", free: false },
    ],
  },
];

// Barcha kurslar
const COURSES = [...PERSONAL_COURSES, ...PAID_COURSES];

const CATS = ["Hammasi", "Stress", "Oila", "Shaxsiy o'sish", "Bolalar", "Sog'liq"];

// ─── COURSE DETAIL ────────────────────────────────────
function CourseDetail({ course, onBack, enrolled, onEnroll, progress, onProgress }) {
  const [tab, setTab] = useState(course.isPersonal ? "video" : "playlist");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([
    { name: "Dilnoza T.", stars: 5, text: "Juda foydali! Hayotimga ta'sir qildi.", date: "2 kun oldin" },
    { name: "Sardor M.",  stars: 5, text: "Har bir dars amaliy va tushunarli.",    date: "1 hafta oldin" },
  ]);

  const done  = progress[course.id]?.length || 0;
  const pct   = Math.round((done / course.playlist.length) * 100);
  const isEnr = !!enrolled[course.id];

  const submitReview = () => {
    if (!comment.trim() || !rating) return;
    setReviews(r => [{ name: "Siz", stars: rating, text: comment, date: "Hozir" }, ...r]);
    setComment(""); setRating(0);
  };

  const TABS = course.isPersonal
    ? [{ k: "video", l: "▶ Video" }, { k: "trainer", l: "👤 Trener" }, { k: "reviews", l: "⭐ Sharhlar" }]
    : [{ k: "playlist", l: "📋 Darslar" }, { k: "trainer", l: "👤 Trener" }, { k: "reviews", l: "⭐ Sharhlar" }];

  return (
    <div className="td-page">
      <button className="td-back" onClick={onBack}><ChevronLeft size={15} /> Treninglar</button>

      {/* HERO */}
      <div className="td-hero">
        <div className="td-thumb">
          <div className="td-thumb-icon">{CAT_ICONS[course.catKey]}</div>
          {course.isPersonal && <span className="td-personal-tag">Shaxsiy trening</span>}
        </div>
        <div className="td-info">
          <div className="td-info-tags">
            <span className={`td-level ${course.level === "Boshlang'ich" || course.level === "Boshlovchilar" ? "easy" : course.level === "O'rta" ? "mid" : "all"}`}>
              {course.level}
            </span>
            {course.isFree && <span className="td-badge-free">Bepul</span>}
            {course.isNew  && <span className="td-badge-new">Yangi</span>}
          </div>
          <h1>{course.title}</h1>
          {course.subtitle && <p className="td-subtitle">{course.subtitle}</p>}
          <p>{course.desc}</p>
          <div className="td-meta-row">
            <span><Clock size={12} /> {course.duration}</span>
            <span><Video size={12} /> {course.lessons} dars</span>
            <span><Users size={12} /> {course.students.toLocaleString()}</span>
            <span><Star size={12} fill="#f59e0b" color="#f59e0b" /> {course.rating} ({course.reviews})</span>
          </div>
          {isEnr ? (
            <div className="td-progress-block">
              <div className="td-pr-row"><span>Jarayon</span><span>{pct}%</span></div>
              <div className="td-pr-track"><div style={{ width: pct + "%" }} className="td-pr-fill" /></div>
              {pct === 100 && (
                <div className="td-cert">
                  <Award size={15} /> Sertifikat tayyor!
                  <button className="td-cert-btn">Yuklab olish</button>
                </div>
              )}
            </div>
          ) : course.isFree ? (
            <button className="td-btn-enroll" onClick={() => onEnroll(course.id)}>Bepul boshlash →</button>
          ) : (
            <div className="td-enroll-paid">
              <span className="td-price">{course.price.toLocaleString()} so'm</span>
              <button className="td-btn-enroll" onClick={() => onEnroll(course.id)}>Sotib olish →</button>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="td-tabs">
        {TABS.map(t => (
          <button key={t.k} className={`td-tab ${tab === t.k ? "active" : ""}`} onClick={() => setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      {/* VIDEO */}
      {tab === "video" && course.videoFile && (
        <div className="td-video-wrap">
          <video
            className="td-video"
            src={course.videoFile}
            controls playsInline
            onError={e => {
              e.target.style.display = "none";
              document.getElementById(`td-vid-err-${course.id}`).style.display = "block";
            }}
          />
          <div id={`td-vid-err-${course.id}`} style={{ display: "none" }} className="td-vid-error">
            ⚠️ Video yuklanmadi. <br />
            <small>Faylni <code>src/videos/{course.id}.MP4</code> ga joylashtiring</small>
          </div>
          <div className="td-video-info">
            <h3>{course.playlist[0]?.title}</h3>
            <p>Nodirabegim bilan shaxsiy trening sessiyasi</p>
          </div>
        </div>
      )}

      {/* PLAYLIST */}
      {tab === "playlist" && (
        <div className="td-playlist">
          {course.playlist.map((item, i) => {
            const isDone  = progress[course.id]?.includes(item.id);
            const canOpen = item.free || isEnr;
            return (
              <div key={i} className={`td-pl-item ${isDone ? "pl-done" : ""} ${!canOpen ? "pl-locked" : ""}`}>
                <div className="td-pl-left">
                  {isDone
                    ? <CheckCircle size={19} color="#0d7a50" fill="#e6f8f0" />
                    : canOpen
                    ? <div className="td-pl-num">{i + 1}</div>
                    : <Lock size={15} color="#9ca3af" />}
                </div>
                <div className="td-pl-mid">
                  <span className="td-pl-title">{item.title}</span>
                  <span className="td-pl-dur"><Clock size={11} /> {item.dur}</span>
                </div>
                <div className="td-pl-right">
                  {item.free && !isEnr && <span className="td-pl-free">Bepul</span>}
                  {canOpen && isEnr && (
                    <button
                      className={`td-pl-btn ${isDone ? "done" : ""}`}
                      onClick={() => onProgress(course.id, item.id)}
                    >{isDone ? "↩" : "Bajarildim"}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TRAINER */}
      {tab === "trainer" && (
        <div className="td-trainer-card">
          <div className="td-trainer-ava-wrap">
            <img src={cofounderPhoto} alt="Nodirabegim" className="td-trainer-ava" />
          </div>
          <div className="td-trainer-info">
            <h2>Nodirabegim</h2>
            <p className="td-trainer-role">Psixolog | Hayot murabbiyi | Co-founder</p>
            <div className="td-trainer-stats">
              {[["2,400+", "Talaba"], ["19", "Trening"], ["4.9", "Reyting"]].map(([v, l], i) => (
                <div key={i} className="td-stat"><strong>{v}</strong><span>{l}</span></div>
              ))}
            </div>
            <p className="td-trainer-bio">10+ yillik tajribaga ega psixolog va hayot murabbiyi. Umidnoma platformasining asoschilaridan biri.</p>
            <div className="td-trainer-tags">
              {["Stress", "Oila", "Shaxsiy o'sish", "Motivatsiya", "Sog'liq", "Bolalar"].map((t, i) => (
                <span key={i} className="td-tag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS */}
      {tab === "reviews" && (
        <div className="td-reviews">
          <div className="td-reviews-top">
            <span className="td-rev-score">{course.rating}</span>
            <div>
              <div className="td-stars-row">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={15} fill={i < Math.round(course.rating) ? "#f59e0b" : "none"} color="#f59e0b" />
                ))}
              </div>
              <p>{course.reviews} ta sharh</p>
            </div>
          </div>
          {isEnr && (
            <div className="td-add-review">
              <h4><MessageCircle size={13} /> Sharh qoldiring</h4>
              <div className="td-star-sel">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} className="td-star-btn" onClick={() => setRating(s)}>
                    <Star size={22} fill={rating >= s ? "#f59e0b" : "none"} color="#f59e0b" />
                  </button>
                ))}
              </div>
              <textarea className="td-review-inp" rows={3} placeholder="Fikringizni yozing..."
                value={comment} onChange={e => setComment(e.target.value)} />
              <button className="td-review-sub" disabled={!comment.trim() || !rating} onClick={submitReview}>
                Yuborish →
              </button>
            </div>
          )}
          <div className="td-review-list">
            {reviews.map((r, i) => (
              <div key={i} className="td-review-item">
                <div className="td-rev-ava">{r.name[0]}</div>
                <div className="td-rev-body">
                  <div className="td-rev-head">
                    <strong>{r.name}</strong>
                    <span className="td-rev-stars">
                      {Array.from({ length: r.stars }, (_, i) => <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />)}
                    </span>
                    <span className="td-rev-date">{r.date}</span>
                  </div>
                  <p>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────
export default function Trainings() {
  const [activeCourse, setActiveCourse] = useState(null);
  const [cat, setCat]       = useState("Hammasi");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [enrolled, setEnrolled] = useState({});
  const [progress, setProgress] = useState({});

  const enroll     = (id) => setEnrolled(e => ({ ...e, [id]: true }));
  const doProgress = (cId, lId) =>
    setProgress(p => ({
      ...p,
      [cId]: (p[cId] || []).includes(lId)
        ? (p[cId] || []).filter(x => x !== lId)
        : [...(p[cId] || []), lId],
    }));

  if (activeCourse) return (
    <CourseDetail
      course={activeCourse} onBack={() => setActiveCourse(null)}
      enrolled={enrolled} onEnroll={enroll}
      progress={progress} onProgress={doProgress}
    />
  );

  const filtered = COURSES.filter(c => {
    const matchCat = cat === "Hammasi" || c.cat === cat;
    const matchF   = filter === "all" || (filter === "free" && c.isFree) || (filter === "paid" && !c.isFree);
    const matchS   = c.title.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchF && matchS;
  });

  const personal = filtered.filter(c => c.isPersonal);
  const others   = filtered.filter(c => !c.isPersonal);

  return (
    <div className="tr-page">

      {/* HERO BANNER */}
      <div className="tr-hero-banner">
        <div className="tr-hero-text">
          <h1>O'zingizni rivojlantiring va stresssiz hayot qurishni o'rganing</h1>
          <p>O'zbekistonning tajribali psixologlari bilan online treninglar</p>
          <div className="tr-hero-stats">
            <span>⭐ <strong>10,000+</strong> foydalanuvchi</span>
            <span>📹 <strong>19</strong> shaxsiy trening</span>
            <span>🌐 <strong>15</strong> mutaxassis</span>
          </div>
          <div className="tr-hero-btns">
            <button className="tr-btn-primary">Treninglarni boshlash →</button>
            <button className="tr-btn-outline">Bepul treninglarni ko'rish →</button>
          </div>
        </div>
        <div className="tr-hero-img">
          <img src={cofounderPhoto} alt="Nodirabegim" className="tr-hero-photo" />
        </div>
      </div>

      {/* INSTRUCTOR */}
      <div className="tr-instructor">
        <div className="tr-inst-ava-wrap">
          <img src={cofounderPhoto} alt="Nodirabegim" className="tr-inst-ava" />
          <span className="tr-inst-check">✓</span>
        </div>
        <div className="tr-inst-info">
          <div className="tr-inst-name">Nodirabegim <span className="tr-verified">✓</span></div>
          <div className="tr-inst-role">Psixolog | Hayot murabbiyi</div>
          <div className="tr-inst-stats">
            <span>⭐ 4.9</span>
            <span>👥 2400 talaba</span>
            <span>📹 19 shaxsiy trening</span>
            <span>🕐 10 yil tajriba</span>
          </div>
          <p className="tr-inst-quote">"Odamlarga stressni yengishga yordam beraman"</p>
        </div>
        <button className="tr-inst-btn" onClick={() => {}}>Profini ko'rish →</button>
      </div>

      {/* FILTER */}
      <div className="tr-filter-row">
        <div className="tr-search-wrap">
          <input className="tr-search" placeholder="Trening qidirish..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tr-pills">
          {[["all", "Hammasi"], ["free", "Bepul"], ["paid", "Pulli"]].map(([k, l]) => (
            <button key={k} className={`tr-pill ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="tr-cats">
        {CATS.map(c => (
          <button key={c} className={`tr-cat ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {/* SHAXSIY TRENINGLAR — 19 ta */}
      {personal.length > 0 && (
        <div className="tr-section">
          <div className="tr-section-head">
            <span className="tr-section-dot" />
            Shaxsiy treninglar — Nodirabegimdan ({personal.length} ta)
          </div>
          <div className="tr-personal-grid">
            {personal.map(c => (
              <div key={c.id} className="tr-pers-card" onClick={() => setActiveCourse(c)}>
                <div className="tr-pers-thumb">
                  <div className="tr-pers-overlay">
                    <div className="tr-play-btn"><Play size={20} fill="white" color="white" /></div>
                    <span className="tr-dur-badge"><Clock size={10} /> {c.duration}</span>
                  </div>
                  <div className="tr-pers-bg">{CAT_ICONS[c.catKey]}</div>
                </div>
                <div className="tr-pers-body">
                  <div className="tr-pers-tags">
                    <span className="tr-badge-free">Bepul</span>
                    <span className="tr-badge-new">Yangi</span>
                    <span className="tr-cat-tag">{c.cat}</span>
                  </div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <div className="tr-pers-meta">
                    <span><Star size={11} fill="#f59e0b" color="#f59e0b" /> {c.rating}</span>
                    <span><Users size={11} /> {c.students.toLocaleString()}</span>
                    <span>{c.level}</span>
                  </div>
                  <button className="tr-btn-watch" onClick={e => { e.stopPropagation(); setActiveCourse(c); }}>
                    <Play size={12} /> Ko'rishni boshlash →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TO'LOVLI KURSLAR */}
      {others.length > 0 && (
        <div className="tr-section">
          <div className="tr-section-head"><span className="tr-section-dot" />Barcha kurslar</div>
          <div className="tr-courses-grid">
            {others.map(c => {
              const isEnr = !!enrolled[c.id];
              const done  = progress[c.id]?.length || 0;
              const pct   = Math.round((done / c.playlist.length) * 100);
              return (
                <div key={c.id} className="tr-course-card" onClick={() => setActiveCourse(c)}>
                  <div className="tr-course-thumb">
                    <div className="tr-course-icon">{CAT_ICONS[c.catKey]}</div>
                    {c.isNew && <span className="tr-badge-new abs-tr">Yangi</span>}
                  </div>
                  <div className="tr-course-body">
                    <div className="tr-course-top">
                      <span className={`tr-level ${c.level === "Boshlang'ich" ? "easy" : c.level === "O'rta" ? "mid" : "all"}`}>{c.level}</span>
                      <span className="tr-course-cat">{c.cat}</span>
                    </div>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                    <div className="tr-course-meta">
                      <span><Clock size={11} /> {c.duration}</span>
                      <span><Video size={11} /> {c.lessons} dars</span>
                    </div>
                    <div className="tr-course-stats">
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      <span>{c.rating}</span>
                      <span className="tr-dot">·</span>
                      <span>{c.students.toLocaleString()} talaba</span>
                    </div>
                    {isEnr && (
                      <div className="tr-mini-prog">
                        <div className="tr-mini-track"><div className="tr-mini-fill" style={{ width: pct + "%" }} /></div>
                        <span>{pct}%</span>
                      </div>
                    )}
                    <div className="tr-course-footer">
                      <span className={c.isFree ? "tr-price-free" : "tr-price-paid"}>
                        {c.isFree ? "Bepul" : c.price.toLocaleString() + " so'm"}
                      </span>
                      <button className="tr-btn-view">{isEnr ? "Davom" : "Ko'rish"} →</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 && <div className="tr-empty">Hech narsa topilmadi</div>}
    </div>
  );
}
