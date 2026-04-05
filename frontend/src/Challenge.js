import { useState } from "react";
import "./Challenge.css";
import {
  Ban, BookOpen, Brain, Globe, Headphones,
  MessageCircle, Dumbbell, Moon, Trophy,
  Flame, Star, ChevronRight, CheckCircle,
  Calendar, Users, Plus, X, TrendingUp
} from "lucide-react";

const CH_ICONS = {
  1: <Ban size={28} strokeWidth={1.5} />,
  2: <BookOpen size={28} strokeWidth={1.5} />,
  3: <Brain size={28} strokeWidth={1.5} />,
  4: <Globe size={28} strokeWidth={1.5} />,
  5: <Headphones size={28} strokeWidth={1.5} />,
  6: <MessageCircle size={28} strokeWidth={1.5} />,
  7: <Dumbbell size={28} strokeWidth={1.5} />,
  8: <Moon size={28} strokeWidth={1.5} />,
};

const DIFF = {
  "Oson":  { bg:"#e6f8f0", color:"#0d7a50", label:"EASY"   },
  "O'rta": { bg:"#fff5e6", color:"#b45309", label:"MEDIUM"  },
  "Qiyin": { bg:"#fee2e2", color:"#b91c1c", label:"HARD"    },
};

const TOP_USERS = [
  { name:"Aziz",    streak:17, avatar:"A", rank:1 },
  { name:"Malika",  streak:15, avatar:"M", rank:2 },
  { name:"Jamshid", streak:13, avatar:"J", rank:3 },
];

const ALL_CHALLENGES = [
  { id:1, title:"30 kunlik Shakarsiz",    desc:"30 kun shakar va shirinliklardan voz keching. Sog'lom tana, toza ong.",                    days:30, category:"Sog'lom hayot",        difficulty:"O'rta", participants:1243, completions:387,  badge:"Sugar Free Master", tasks:["Bugun shirinlik yemaslik","Shakarli ichimliklar o'rniga suv iching","Mahsulot tarkibidagi shakarni tekshiring","Meva bilan shirinlik ishtahasini bosing"], community:[{name:"Dilnoza",day:12,comment:"12 kun bo'ldi, yaxshi his qilyapman! 💪"},{name:"Sardor",day:30,comment:"Tugatdim! 4 kg yo'qotdim 🎉"},{name:"Malika",day:5,comment:"Qiyin lekin davom etaman 🔥"}] },
  { id:2, title:"30 kunlik O'qish",       desc:"Har kuni kamida 20 daqiqa kitob o'qing. Bilim — eng yaxshi investitsiya.",               days:30, category:"O'rganish",             difficulty:"Oson",  participants:2105, completions:891,  badge:"Reading Star",      tasks:["Bugun 20 daqiqa kitob o'qi","O'qiganingdan 3 ta fikr yoz","Kitobni do'stingga tavsiya qil","O'qish joyingni tartibga keltir"], community:[{name:"Aziza",day:18,comment:"18 kunda 2 ta kitob tugatdim!"},{name:"Jasur",day:30,comment:"Eng yaxshi odat shu bo'ldi 📖"}] },
  { id:3, title:"21 kunlik Meditatsiya",  desc:"Har kuni 10 daqiqa meditatsiya qiling. Xotirjamlik va diqqatni oshiring.",              days:21, category:"Ruhiy salomatlik",      difficulty:"Oson",  participants:987,  completions:412,  badge:"Zen Master",        tasks:["Ertalab 10 daqiqa meditatsiya","Nafas olish mashqi qil","Minnatdorchilik daftariga yoz","Telefonsiz 30 daqiqa o'tir"], community:[{name:"Feruza",day:21,comment:"Uxlash sifatim yaxshilandi 😴✨"},{name:"Bobur",day:10,comment:"Stressim kamaydi"}] },
  { id:4, title:"30 kunlik Til O'rganish",desc:"Har kuni 15 daqiqa yangi til o'rganing. Ingliz, Rus, Xitoy — siz tanlang!",             days:30, category:"O'rganish",             difficulty:"O'rta", participants:3210, completions:756,  badge:"Polyglot",          tasks:["Bugun 10 ta yangi so'z o'rgan","Duolingo yoki boshqa app ishlat","Bitta gap tuzib ko'r","Tilni amalda ishlatishga harakat qil"], community:[{name:"Umida",day:30,comment:"Inglizcha filmlarni ko'ra boshladim! 🎬"},{name:"Sherzod",day:15,comment:"Duolingo — odat bo'lib qoldi"}] },
  { id:5, title:"14 kunlik Podcast",      desc:"Har kuni foydali podcast tinglang. Yo'lda, oshxonada — istalgan joyda o'rganing.",      days:14, category:"O'rganish",             difficulty:"Oson",  participants:678,  completions:234,  badge:"Podcast Pro",       tasks:["Bugun 1 ta podcast epizod tinglang","Asosiy fikrlarni yozib ol","Do'stingga ulash","Yangi podcast kanal top"], community:[{name:"Kamola",day:14,comment:"Har kuni metroda tinglayapman 🚇"},{name:"Davron",day:6,comment:"Business podcastlar hayotimni o'zgartirdi"}] },
  { id:6, title:"21 kunlik Muloqot",      desc:"Har kuni yangi odam bilan suhbatlashing. Kommunikatsiya ko'nikmangizni oshiring.",       days:21, category:"Shaxsiy rivojlanish",  difficulty:"Qiyin", participants:445,  completions:123,  badge:"Social Star",       tasks:["Bugun yangi bir kishiga salom bering","5 daqiqa tanish bo'lmagan odam bilan gaplash","Kompliment bering birovga","Guruhda o'z fikrini bildiring"], community:[{name:"Iroda",day:21,comment:"Odamlar bilan gaplashishdan qo'rqmayman endi! 🌟"},{name:"Temur",day:9,comment:"Intervyuga tayyorlanish uchun zo'r"}] },
  { id:7, title:"30 kunlik Sport",        desc:"Har kuni 30 daqiqa jismoniy mashq qiling. Sog'lom tana — sog'lom fikr.",               days:30, category:"Sog'lom hayot",        difficulty:"O'rta", participants:4521, completions:1203, badge:"Iron Will",         tasks:["Bugun 30 daqiqa yuring yoki yuguring","10 ta push-up qiling","Cho'zilish mashqlarini bajaring","Suv iching — kuniga 2 litr"], community:[{name:"Sanjar",day:30,comment:"6 kg yo'qotdim! 🔥"},{name:"Barno",day:15,comment:"Har ertalab yugurish — kun yaxshi boshlanadi"}] },
  { id:8, title:"14 kunlik Sog'lom Uyqu", desc:"Har kuni soat 23:00 da uxlang, 07:00 da turing. Biologik soatingizni tartibga soling.", days:14, category:"Sog'lom hayot",        difficulty:"Qiyin", participants:892,  completions:267,  badge:"Sleep Champion",    tasks:["23:00 da telefonni qo'y, uxla","07:00 da tur","Uxlashdan 1 soat oldin ekran ko'rma","Uyqu vaqtini daftarga yoz"], community:[{name:"Gavhar",day:14,comment:"Energiya 2x 🌅"},{name:"Firdavs",day:7,comment:"Erta turish odat bo'lyapti"}] },
];

const CATS = ["Hammasi","Sog'lom hayot","O'rganish","Ruhiy salomatlik","Shaxsiy rivojlanish"];

// ── DETAIL ────────────────────────────────────────────
function ChallengeDetail({ ch, onBack, joined, onJoin, progress, onDay }) {
  const [tab, setTab] = useState("haqida");
  const [tasksDone, setTasksDone] = useState({});
  const isJoin = !!joined[ch.id];
  const cur    = progress[ch.id] || 1;
  const pct    = Math.round(((cur-1)/ch.days)*100);
  const d      = DIFF[ch.difficulty];

  return (
    <div className="ch-detail-page">
      <button className="ch-back-btn" onClick={onBack}>← Orqaga</button>
      <div className="ch-detail-hero">
        <div className="ch-dh-icon">{CH_ICONS[ch.id]}</div>
        <div className="ch-dh-info">
          <div className="ch-dh-tags">
            <span className="ch-cat-pill">{ch.category}</span>
            <span className="ch-diff-pill" style={{background:d.bg,color:d.color}}>{ch.difficulty}</span>
          </div>
          <h1>{ch.title}</h1>
          <p>{ch.desc}</p>
          <div className="ch-dh-meta">
            <span><Calendar size={13}/> {ch.days} kun</span>
            <span><Users size={13}/> {ch.participants.toLocaleString()}</span>
            <span><Trophy size={13}/> {ch.completions} tugatgan</span>
          </div>
        </div>
      </div>

      {isJoin && (
        <div className="ch-prog-card">
          <div className="ch-prog-top"><span>{cur-1}/{ch.days} kun</span><span>{pct}%</span></div>
          <div className="ch-prog-bar"><div style={{width:pct+"%"}}/></div>
          {pct===100 && <div className="ch-done-badge">🏆 Badge olindi: <strong>{ch.badge}</strong></div>}
        </div>
      )}

      <div className="ch-dtabs">
        {[["haqida","Haqida"],["vazifalar","Vazifalar"],["jadval","📅 Jadval"],["jamiyat","Jamiyat"]].map(([k,l])=>(
          <button key={k} className={`ch-dtab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==="haqida" && (
        <div className="ch-tab-body">
          <h3>Bu challenge nima beradi?</h3>
          {["Maqsadga erishish ko'nikmasi","Iroda va intizomni mustahkamlaydi","Yangi foydali odat shakllantiradi",`${ch.completions.toLocaleString()} kishi allaqachon tugatgan`].map((b,i)=>(
            <div key={i} className="ch-benefit-row"><CheckCircle size={16} color="#6C5CE7"/><span>{b}</span></div>
          ))}
          {!isJoin
            ? <button className="ch-join-btn" onClick={()=>onJoin(ch.id)}>🚀 Challengega qo'shilish</button>
            : <div className="ch-joined-ok">✅ Siz bu challengedasiz! {cur-1}/{ch.days} kun bajarildi</div>
          }
        </div>
      )}

      {tab==="vazifalar" && (
        <div className="ch-tab-body">
          <h3>Kunlik vazifalar</h3>
          {Array.from({length:Math.min(ch.days,7)},(_,i)=>i+1).map(day=>{
            const done = isJoin && cur>day;
            return (
              <div key={day} className={`ch-task-row ${done?"done":""}`}
                onClick={()=>isJoin&&onDay(ch.id,day)}>
                <div className={`ch-task-circle ${done?"done":""}`}>
                  {done?<CheckCircle size={15} color="#fff"/>:<span>{day}</span>}
                </div>
                <div>
                  <div className="ch-task-title">{day}-kun</div>
                  <div className="ch-task-sub">{ch.tasks[(day-1)%ch.tasks.length]}</div>
                </div>
              </div>
            );
          })}
          {ch.days>7 && <p className="ch-more">+ yana {ch.days-7} kun</p>}
          {!isJoin && <div className="ch-locked">🔒 Challengega qo'shiling</div>}
        </div>
      )}

      {tab==="jadval" && (
        <ScheduleTracker ch={ch} tasksDone={tasksDone} setTasksDone={setTasksDone} isJoin={isJoin} onJoin={onJoin}/>
      )}

      {tab==="jamiyat" && (
        <div className="ch-tab-body">
          <h3>Ishtirokchilar nima deyishyapti?</h3>
          {ch.community.map((c,i)=>(
            <div key={i} className="ch-comm-row">
              <div className="ch-comm-ava">{c.name[0]}</div>
              <div>
                <div className="ch-comm-name">{c.name} <span>{c.day}-kunda</span></div>
                <p>{c.comment}</p>
              </div>
            </div>
          ))}
          <div className="ch-comm-total"><Users size={13}/> {ch.participants.toLocaleString()} kishi hozir bajarayapti</div>
        </div>
      )}
    </div>
  );
}

// ── CREATE MODAL ──────────────────────────────────────
// ── SCHEDULE TRACKER ─────────────────────────────────
function ScheduleTracker({ ch, tasksDone, setTasksDone, isJoin, onJoin }) {
  //const today = new Date().getDate();
  const TOTAL  = ch.days;
  const doneDays = Object.keys(tasksDone).filter(k => tasksDone[k]?.length === ch.tasks.length).length;
  const pct    = Math.round((doneDays / TOTAL) * 100);
  const streak = Math.min(doneDays, 9);
  const todayTasks = ch.tasks.map((t, i) => ({
    id: i, name: t,
    done: !!(tasksDone["today"] && tasksDone["today"].includes(i))
  }));
  const allDone = todayTasks.every(t => t.done);
  const taskDetails = ["10 daqiqa","20 daqiqa","30 daqiqa","1 marta"];

  const toggleTask = (id) => {
    const cur = tasksDone["today"] || [];
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    setTasksDone(p => ({ ...p, today: next }));
  };
  const completeAll = () => setTasksDone(p => ({...p, today: ch.tasks.map((_,i)=>i)}));

  const circ = 2 * Math.PI * 42;
  const dashOffset = (circ - (pct / 100) * circ).toFixed(1);

  if (!isJoin) return (
    <div className="ch-tab-body">
      <div className="ch-locked">🔒 Jadvalni ko'rish uchun challengega qo'shiling</div>
      <button className="ch-join-btn" onClick={()=>onJoin(ch.id)}>🚀 Qo'shilish</button>
    </div>
  );

  return (
    <div className="sch-wrap">
      <h3 className="sch-title">{ch.days}-Day Challenge</h3>

      <div className="sch-main">
        {/* LEFT */}
        <div>
          {/* CALENDAR */}
          <div className="sch-card">
            <div className="sch-cal-head">
              {["D","S","C","P","S","J","S"].map((d,i)=>(
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="sch-cal-grid">
              {/* offset 4 bo'sh hujayra */}
              {Array.from({length:4},(_,i)=>(
                <div key={"e"+i} className="sch-day empty"/>
              ))}
              {Array.from({length:TOTAL},(_,i)=>{
                const day = i+1;
                const isDone = tasksDone[day] && tasksDone[day].length === ch.tasks.length;
                const isToday = day === Math.min(doneDays+1, TOTAL);
                const isFuture = day > doneDays+1;
                return (
                  <div key={day} className={`sch-day ${isDone?"done":""} ${isToday?"today":""} ${isFuture?"future":""}`}>
                    {isDone ? <span className="sch-check">✓</span> : <span>{day}</span>}
                  </div>
                );
              })}
            </div>
            {/* PROGRESS BAR */}
            <div className="sch-prog-row">
              <div>
                <span className="sch-prog-label"><strong>{doneDays}</strong> Kun bajarildi</span>
                <div className="sch-prog-track">
                  <div className="sch-prog-fill" style={{width: pct+"%"}}/>
                </div>
              </div>
              <span className="sch-prog-right"><strong>{TOTAL-doneDays}</strong> Kun qoldi</span>
            </div>
          </div>

          {/* TODAY TASKS */}
          <div className="sch-card" style={{marginTop:14}}>
            <div className="sch-tasks-head">
              <h4>Bugungi vazifalar</h4>
              <span className="sch-tasks-count">{todayTasks.filter(t=>t.done).length}/{ch.tasks.length}</span>
            </div>
            {todayTasks.map((t,i)=>(
              <div key={t.id} className={`sch-task-row ${t.done?"done":""}`} onClick={()=>toggleTask(t.id)}>
                <div className={`sch-cb ${t.done?"checked":""}`}>{t.done?"✓":""}</div>
                <span className={`sch-task-name ${t.done?"done":""}`}>{t.name}</span>
                <span className="sch-task-detail">{taskDetails[i % taskDetails.length]}</span>
              </div>
            ))}
            <button className="sch-complete-btn" onClick={completeAll} disabled={allDone}>
              {allDone ? "✅ Hammasi bajarildi!" : "Hammasini bajarish"}
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="sch-side">
          {/* STREAK */}
          <div className="sch-card sch-streak">
            <div className="sch-streak-label">🔥 Streak</div>
            <div className="sch-streak-num">{streak} <span>Kun</span></div>
          </div>

          {/* DONUT */}
          <div className="sch-card sch-donut-card">
            <h4 style={{textAlign:"center",marginBottom:14,fontSize:14,fontWeight:600,color:"#2d2060"}}>Progress</h4>
            <div className="sch-donut-wrap">
              <svg width="110" height="110" viewBox="0 0 110 110" style={{transform:"rotate(-90deg)"}}>
                <circle cx="55" cy="55" r="42" fill="none" stroke="#e8e4f8" strokeWidth="12"/>
                <circle cx="55" cy="55" r="42" fill="none"
                  stroke="url(#schGrad)" strokeWidth="12"
                  strokeDasharray={circ.toFixed(1)}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"/>
                <defs>
                  <linearGradient id="schGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6C5CE7"/>
                    <stop offset="50%" stopColor="#9B8FF5"/>
                    <stop offset="100%" stopColor="#ec4899"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="sch-donut-pct">{pct}%</div>
            </div>
            <div className="sch-side-stat">
              <div className="sch-side-icon">✓</div>
              <div><strong>{doneDays * ch.tasks.length}</strong><span> Vazifa</span></div>
            </div>
            <div className="sch-side-stat">
              <div className="sch-side-icon">%</div>
              <div><strong>{pct}%</strong><span> Bajarildi</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateModal({ onClose }) {
  const [form, setForm] = useState({title:"",desc:"",days:7,category:"Shaxsiy rivojlanish"});
  return (
    <div className="ch-overlay" onClick={onClose}>
      <div className="ch-modal" onClick={e=>e.stopPropagation()}>
        <div className="ch-modal-head">
          <h3>Yangi challenge yaratish</h3>
          <button className="ch-modal-x" onClick={onClose}><X size={16}/></button>
        </div>
        <input className="ch-min" placeholder="Challenge nomi" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <textarea className="ch-min ch-mta" placeholder="Tavsif" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
        <select className="ch-min" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
          <option>Sog'lom hayot</option><option>O'rganish</option>
          <option>Ruhiy salomatlik</option><option>Shaxsiy rivojlanish</option>
        </select>
        <label className="ch-mlabel">Kun soni: <strong>{form.days}</strong></label>
        <input type="range" min={3} max={60} value={form.days} onChange={e=>setForm({...form,days:+e.target.value})} className="ch-mrange"/>
        <button className="ch-msub" onClick={onClose}>✅ Yaratish</button>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────
export default function Challenge() {
  const [activeCat, setActiveCat]   = useState("Hammasi");
  const [selected, setSelected]     = useState(null);
  const [joined, setJoined]         = useState({});
  const [progress, setProgress]     = useState({});
  const [showCreate, setShowCreate] = useState(false);

  const handleJoin = (id) => { setJoined(p=>({...p,[id]:true})); setProgress(p=>({...p,[id]:1})); };
  const handleDay  = (cId,day) => setProgress(p=>({...p,[cId]:Math.max(p[cId]||1,day+1)}));

  if (selected) return (
    <ChallengeDetail ch={selected} onBack={()=>setSelected(null)}
      joined={joined} onJoin={handleJoin}
      progress={progress} onDay={handleDay}/>
  );

  const filtered  = activeCat==="Hammasi" ? ALL_CHALLENGES : ALL_CHALLENGES.filter(c=>c.category===activeCat);
  const totalDays = Object.values(progress).reduce((a,b)=>a+(b-1),0);
  const popular   = ALL_CHALLENGES.find(c=>c.id===3);

  return (
    <div className="ch-page">

      {/* HERO */}
      <div className="ch-hero">
        <div className="ch-hero-text">
          <h1>O'zingizni rivojlantiring —<br/>har kuni bir qadam</h1>
          <p>Challengelarni bajarib odatlaringizni yaxshilang va yangi maqsadlarga erishing</p>
          <button className="ch-hero-btn" onClick={()=>setShowCreate(true)}>
            <Plus size={15}/> Yangi challenge
          </button>
          <div className="ch-hero-stats-row">
            <div className="ch-hstat"><Flame size={14} color="#f59e0b"/><span>Faol challenge: <strong>{Object.keys(joined).length}</strong></span></div>
            <div className="ch-hstat"><Calendar size={14} color="#6C5CE7"/><span>Bugun bajarildi: <strong>{totalDays}</strong></span></div>
            <div className="ch-hstat"><Trophy size={14} color="#f59e0b"/><strong>{ALL_CHALLENGES.reduce((a,c)=>a+c.participants,0).toLocaleString()}</strong></div>
          </div>
        </div>
        <div className="ch-hero-visual">
          <div className="ch-vis-bg"/>
          <div className="ch-vis-trophy"><Trophy size={72} strokeWidth={1.2}/></div>
          <div className="ch-vis-float"><CheckCircle size={13} color="#0d7a50"/> Bugungi vazifa bajarildi!</div>
        </div>
      </div>

      {/* FEATURED + TOP */}
      <div className="ch-dual">
        <div className="ch-featured" onClick={()=>setSelected(popular)}>
          <div className="ch-featured-tag"><Trophy size={13}/> Eng mashhur challenge</div>
          <h2>{popular.title}</h2>
          <div className="ch-feat-bar"><div style={{width:"62%"}}/></div>
          <div className="ch-feat-meta">
            <span>{popular.participants.toLocaleString()} ishtirokchi</span>
            <span><Calendar size={11}/> 8/21 kun</span>
          </div>
          <div className="ch-feat-row">
            {["D","S","F","B"].map((a,i)=>(
              <div key={i} className="ch-mini-ava" style={{marginLeft:i?-6:0}}>{a}</div>
            ))}
            <span>Bugungi kun bajarildi</span>
            <ChevronRight size={13}/>
          </div>
          <div className="ch-feat-badge"><Star size={11} fill="#f59e0b" color="#f59e0b"/><span>Sugar Free Master</span></div>
          <button className="ch-feat-btn">Boshlash <ChevronRight size={13}/></button>
        </div>

        <div className="ch-top-users">
          <div className="ch-top-head"><Trophy size={13}/> Top foydalanuvchilar</div>
          {TOP_USERS.map((u,i)=>(
            <div key={i} className="ch-top-row">
              <div className={`ch-rank rank-${u.rank}`}>{u.rank}</div>
              <div className="ch-top-ava">{u.avatar}</div>
              <span className="ch-top-name">{u.name}</span>
              <span className="ch-top-streak"><Flame size={11} color="#f59e0b"/> Streak</span>
              <strong className="ch-top-days">{u.streak} kun</strong>
            </div>
          ))}
          <button className="ch-top-full">To'liq reyting <ChevronRight size={12}/></button>
        </div>
      </div>

      {/* CATS */}
      <div className="ch-cats">
        {CATS.map(c=>(
          <button key={c} className={`ch-cat ${activeCat===c?"active":""}`} onClick={()=>setActiveCat(c)}>{c}</button>
        ))}
        <button className="ch-cat-extra"><TrendingUp size={15}/></button>
      </div>

      {/* GRID */}
      <div className="ch-grid">
        {filtered.map(ch=>{
          const d    = DIFF[ch.difficulty];
          const isJ  = !!joined[ch.id];
          const cur  = progress[ch.id]||1;
          const pct  = Math.round(((cur-1)/ch.days)*100);
          return (
            <div key={ch.id} className="ch-card" onClick={()=>setSelected(ch)}>
              <div className="ch-card-top-row">
                <span className="ch-cdiff" style={{background:d.bg,color:d.color}}>{d.label}</span>
                <span className="ch-cdiff-r" style={{color:d.color}}>{ch.difficulty}</span>
              </div>
              <h3>{ch.title}</h3>
              {isJ && (
                <>
                  <div className="ch-card-bar-wrap">
                    <div className="ch-card-bar"><div style={{width:pct+"%"}}/></div>
                    <span>{cur-1} / {ch.days} kun</span>
                  </div>
                  <div className="ch-card-avas">
                    {ch.community.slice(0,3).map((c,i)=>(
                      <div key={i} className="ch-mini-ava sm" style={{marginLeft:i?-5:0}}>{c.name[0]}</div>
                    ))}
                  </div>
                </>
              )}
              <div className="ch-card-badge-row">
                <Trophy size={12} color="#f59e0b"/>
                <span>{ch.badge}</span>
                <ChevronRight size={12}/>
              </div>
              <div className="ch-card-people"><Users size={11}/> {ch.participants.toLocaleString()} kishi qatnashmoqda</div>
              <button className="ch-card-btn"
                onClick={e=>{e.stopPropagation(); isJ?setSelected(ch):handleJoin(ch.id);}}>
                {isJ?"Davom etish":"Boshlash"} <ChevronRight size={13}/>
              </button>
            </div>
          );
        })}
      </div>

      {showCreate && <CreateModal onClose={()=>setShowCreate(false)}/>}
    </div>
  );
}
