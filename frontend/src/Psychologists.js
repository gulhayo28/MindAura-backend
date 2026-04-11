import { useState } from "react";
import "./Psychologists.css";

// Rasmlarni src/images/ papkasiga qo'ying
import imgNargiza from "./images/nargiza.jpg";
import imgAmira from "./images/amira.jpg";
import imgLola from "./images/lola.jpg";
import imgRano from "./images/rano.jpg";
import imgSitora from "./images/sitora.jpg";
import imgDilrabo from "./images/dilrabo.jpg";

const PSYCHOLOGISTS = [
  {
    id: 1,
    name: "Shomuradova Nigora",
    img: imgnigora,
    title: "Psixolog | Munosabatlar mutaxassisi",
    exp: "10+ yil", rating: 4.9, reviews: 1240, subscribers: "338K",
    tags: ["Oila munosabatlari", "Stress", "O'z-o'zini rivojlantirish", "Ayollar psixologiyasi"],
    bio: "Shomuradova Nigora — O'zbekistonning eng taniqli psixologlaridan biri. Oilaviy munosabatlar, stress va o'z-o'zini rivojlantirish sohasida 10 yildan ortiq tajribaga ega. YouTube kanalida 338 ming obunachiga ega.",
    youtube: "https://youtube.com/@NargizSattarova",
    telegram: "https://t.me/nargiz_sattarova",
    videos: [
      { id: "2rURDOWjAC4", title: "O'zimdan ko'nglim to'lmaydi — meditatsiya" },
      { id: "dQw4w9WgXcQ", title: "Stress bilan qanday kurashish kerak?" },
      { id: "ScMzIvxBSi4", title: "O'z-o'zingizni qanday sevishni o'rganing" },
    ],
    price: "150 000 so'm", available: true,
  },
  {
    id: 2,
    name: "Amira Rashidova",
    img: imgAmira,
    title: "Psixolog-Motivator | Hayot murabbiyi",
    exp: "8+ yil", rating: 4.8, reviews: 980, subscribers: "2M",
    tags: ["Motivatsiya", "Ayollar kuchlanishi", "Oila", "Shaxsiy o'sish"],
    bio: "Amira Rashidova — 'Qizil Pomada' loyihasi asoschisi va taniqli psixolog-motivator. Ayollarning ichki kuchini ochishga, oilaviy baxtga erishishga yordam beradi. 2 million+ auditoriyaga ega.",
    youtube: "https://youtube.com/@qizilpomada",
    telegram: "https://t.me/qizilpomada",
    videos: [
      { id: "ScMzIvxBSi4", title: "Ayol kuchining siri" },
      { id: "2rURDOWjAC4", title: "O'zingizni qanday sevishni o'rganing" },
      { id: "dQw4w9WgXcQ", title: "Oilada baxt — bu tanlov" },
    ],
    price: "200 000 so'm", available: true,
  },
  {
    id: 3,
    name: "Lola Zunnunova",
    img: imgLola,
    title: "Psixolog | San'at va hayot terapevti",
    exp: "12+ yil", rating: 5.0, reviews: 756, subscribers: "450K",
    tags: ["San'at terapiyasi", "Tushkunlik", "Bolalar psixologiyasi", "Ijodiy o'sish"],
    bio: "Lola Zunnunova — san'at terapiyasi va psixologiyani birlashtirgan noyob mutaxassis. Ijodiy usullar orqali ruhiy muammolarni hal qilishga yordam beradi. Bolalar va o'smirlar bilan ishlashda katta tajribaga ega.",
    youtube: "https://youtube.com/@lolazunnunova",
    telegram: "https://t.me/lolazunnunova",
    videos: [
      { id: "dQw4w9WgXcQ", title: "San'at orqali o'zingizni toping" },
      { id: "ScMzIvxBSi4", title: "Bolalar ruhiyatini qanday tushunish kerak?" },
      { id: "2rURDOWjAC4", title: "Ijodiy terapiya — yangi hayot boshlanishi" },
    ],
    price: "180 000 so'm", available: false,
  },
  {
    id: 4,
    name: "Rano Muminova",
    img: imgRano,
    title: "Psixolog | Tushkunlik va stress mutaxassisi",
    exp: "9+ yil", rating: 4.9, reviews: 1100, subscribers: "255K",
    tags: ["Tushkunlik", "Stress", "O'z-o'zini rivojlantirish", "Motivatsiya"],
    bio: "Rano Muminova — tushkunlik va stress bilan kurashish sohasida taniqli psixolog. YouTube kanalida 255 ming obunachi bilan hayotiy masalalar haqida ochiq suhbatlar olib boradi. Amaliy va samarali yondashuvi bilan mashhur.",
    youtube: "https://youtube.com/@RanoMuminova",
    telegram: "https://t.me/rano_muminova",
    videos: [
      { id: "2rURDOWjAC4", title: "Tushkunlikdan qanday chiqish mumkin?" },
      { id: "ScMzIvxBSi4", title: "O'zingizni qanday motivatsiya qilasiz?" },
      { id: "dQw4w9WgXcQ", title: "Har kuni baxtli bo'lishning siri" },
    ],
    price: "160 000 so'm", available: true,
  },
  {
    id: 5,
    name: "Sitorabonu Abdurahmonova",
    img: imgSitora,
    title: "Psixolog | Oila va juftlik munosabatlari",
    exp: "7+ yil", rating: 4.8, reviews: 890, subscribers: "180K",
    tags: ["Oila", "Juftlik munosabatlari", "Ayollar psixologiyasi", "Shaxsiy o'sish"],
    bio: "Sitorabonu Abdurahmonova — oilaviy va juftlik munosabatlari sohasida mutaxassis psixolog. Nikoh va oila hayotidagi murakkab masalalarni hal qilishda amaliy yordam beradi. Empativ va samimiy yondashuvi bilan ishonch qozongan.",
    youtube: "https://youtube.com/@sitorabonu",
    telegram: "https://t.me/sitorabonu_psixolog",
    videos: [
      { id: "ScMzIvxBSi4", title: "Baxtiyor oilaning sirlari" },
      { id: "2rURDOWjAC4", title: "Juftingiz bilan muloqot qanday bo'lishi kerak?" },
      { id: "dQw4w9WgXcQ", title: "Sevgi va hurmat — oila poydevori" },
    ],
    price: "155 000 so'm", available: true,
  },
  {
    id: 6,
    name: "Dilrabo Isroilova",
    img: imgDilrabo,
    title: "Psixolog | Bolalar va o'smirlar mutaxassisi",
    exp: "11+ yil", rating: 4.9, reviews: 670, subscribers: "120K",
    tags: ["Bolalar psixologiyasi", "O'smirlar", "Oila", "Tarbiya"],
    bio: "Dilrabo Isroilova — bolalar va o'smirlar psixologiyasi sohasida 11 yillik tajribaga ega mutaxassis. Bolalar ruhiyatini tushunish, to'g'ri tarbiya usullari va o'smirlar bilan muloqot bo'yicha ota-onalarga yo'l-yo'riq beradi.",
    youtube: "https://youtube.com/@dilrabo_isroilova",
    telegram: "https://t.me/dilrabo_psixolog",
    videos: [
      { id: "dQw4w9WgXcQ", title: "Bolangiz bilan qanday gaplashish kerak?" },
      { id: "2rURDOWjAC4", title: "O'smirlar psixologiyasi — ota-onalar uchun" },
      { id: "ScMzIvxBSi4", title: "Bolani emotsional jihatdan rivojlantirish" },
    ],
    price: "170 000 so'm", available: false,
  },
];

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.floor(rating) ? "#f6ad55" : "#e2e8f0" }}>★</span>
      ))}
      <span className="rating-num">{rating}</span>
    </div>
  );
}

function PsychDetail({ p, onBack }) {
  const [activeVideo, setActiveVideo] = useState(p.videos[0]);
  return (
    <div className="psych-detail">
      <button className="back-btn" onClick={onBack}>← Orqaga</button>
      <div className="detail-hero">
        <img src={p.img} alt={p.name} className="detail-avatar-img" />
        <div className="detail-info">
          <h2>{p.name}</h2>
          <p className="detail-title">{p.title}</p>
          <StarRating rating={p.rating} />
          <p className="detail-reviews">{p.reviews.toLocaleString()} ta sharh · {p.subscribers} obunachi</p>
          <div className="detail-tags">
            {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
      </div>

      <div className="detail-bio">
        <h3>Psixolog haqida</h3>
        <p>{p.bio}</p>
      </div>

      <div className="detail-videos">
        <h3>Videolar</h3>
        <div className="video-main">
          <iframe
            key={activeVideo.id}
            src={`https://www.youtube.com/embed/${activeVideo.id}`}
            title={activeVideo.title}
            frameBorder="0"
            allowFullScreen
            className="video-frame"
          />
          <p className="video-title">{activeVideo.title}</p>
        </div>
        <div className="video-list">
          {p.videos.map(v => (
            <div key={v.id} className={`video-thumb ${activeVideo.id === v.id ? "active" : ""}`} onClick={() => setActiveVideo(v)}>
              <div className="vthumb-img">
                <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={v.title} />
                <div className="play-icon">▶</div>
              </div>
              <p>{v.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-contact">
        <h3>Bog'lanish</h3>
        <div className="contact-price">
          <span>Konsultatsiya narxi:</span>
          <strong>{p.price}</strong>
        </div>
        <div className="contact-btns">
          <a href={p.telegram} target="_blank" rel="noreferrer" className="btn-telegram">✈ Telegram kanal</a>
          <a href={p.youtube} target="_blank" rel="noreferrer" className="btn-youtube">▶ YouTube</a>
          <button className={`btn-consult ${!p.available ? "disabled" : ""}`} disabled={!p.available}>
            {p.available ? "📅 Konsultatsiya olish" : "❌ Hozir band"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Psychologists() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("Barchasi");
  const filters = ["Barchasi", "Oila", "Stress", "Motivatsiya", "Bolalar"];

  if (selected) return <PsychDetail p={selected} onBack={() => setSelected(null)} />;

  const filtered = PSYCHOLOGISTS.filter(p =>
    filter === "Barchasi" || p.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="psychologists-page">
      <div className="psych-hero">
        <h2>Mutaxassis <span>psixologlar</span></h2>
        <p>O'zbekistonning eng taniqli va tajribali psixologlari bilan bog'laning</p>
      </div>
      <div className="filter-row">
        {filters.map(f => (
          <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="psych-grid">
        {filtered.map(p => (
          <div className="psych-card" key={p.id} onClick={() => setSelected(p)}>
            <div className="card-top">
              <img src={p.img} alt={p.name} className="psych-card-img" />
              <div className={`avail-badge ${p.available ? "avail" : "busy"}`}>
                {p.available ? "● Bo'sh" : "● Band"}
              </div>
            </div>
            <h3>{p.name}</h3>
            <p className="card-title">{p.title}</p>
            <StarRating rating={p.rating} />
            <div className="card-stats">
              <span>⏱ {p.exp}</span>
              <span>👥 {p.subscribers}</span>
              <span>💬 {p.reviews}+</span>
            </div>
            <div className="card-tags">
              {p.tags.slice(0,2).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div className="card-price">{p.price} / seans</div>
            <button className="btn-view">Profilni ko'rish →</button>
          </div>
        ))}
      </div>
    </div>
  );
}