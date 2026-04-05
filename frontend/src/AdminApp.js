import { useState, useEffect, useCallback } from "react";
import "./Admin.css";

const API = "http://localhost:8000";

async function adminFetch(path, token, opts = {}) {
  try {
    const res = await fetch(API + path, {
      ...opts,
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", ...opts.headers }
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error("Admin API error:", e);
    return null;
  }
}


// ─── ADMIN CREDENTIALS ───────────────────────────────
const ADMIN_EMAIL    = "admin@umidnoma.uz";
const ADMIN_PASSWORD = "Admin2025!";

// ─── MOCK DATA ────────────────────────────────────────
const MOCK_USERS = [
  { id:1,  name:"Dilnoza T.",  email:"dilnoza@mail.uz",   status:"faol",      tests:7,  joined:"12 mart 2026", lastActive:"2 daq oldin" },
  { id:2,  name:"Sardor M.",   email:"sardor@gmail.com",  status:"faol",      tests:3,  joined:"10 mart 2026", lastActive:"15 daq oldin" },
  { id:3,  name:"Aziza R.",    email:"aziza@mail.ru",     status:"faol",      tests:12, joined:"8 mart 2026",  lastActive:"1 soat oldin" },
  { id:4,  name:"Bobur K.",    email:"bobur@gmail.com",   status:"bloklangan",tests:1,  joined:"5 mart 2026",  lastActive:"3 kun oldin" },
  { id:5,  name:"Malika B.",   email:"malika@mail.uz",    status:"faol",      tests:5,  joined:"3 mart 2026",  lastActive:"2 soat oldin" },
  { id:6,  name:"Jasur A.",    email:"jasur@yandex.ru",   status:"faol",      tests:9,  joined:"1 mart 2026",  lastActive:"Kecha" },
  { id:7,  name:"Feruza N.",   email:"feruza@gmail.com",  status:"faol",      tests:4,  joined:"28 fev 2026",  lastActive:"3 soat oldin" },
  { id:8,  name:"Otabek S.",   email:"otabek@mail.uz",    status:"bloklangan",tests:0,  joined:"25 fev 2026",  lastActive:"1 hafta oldin" },
];

const MOCK_PSYCHS = [
  { id:1, name:"Dr. Malika Yusupova", spec:"Klinik psixolog",  exp:"8 yil",  status:"tasdiqlangan", patients:42, rating:4.9 },
  { id:2, name:"Nodira Xasanova",     spec:"Oilaviy psixolog", exp:"5 yil",  status:"kutmoqda",     patients:0,  rating:0   },
  { id:3, name:"Jasur Karimov",       spec:"Bolalar psixologi",exp:"3 yil",  status:"kutmoqda",     patients:0,  rating:0   },
  { id:4, name:"Feruza Aliyeva",      spec:"Travma terapevti", exp:"6 yil",  status:"kutmoqda",     patients:0,  rating:0   },
  { id:5, name:"Sherzod Toshmatov",   spec:"Klinik psixolog",  exp:"10 yil", status:"tasdiqlangan", patients:38, rating:4.7 },
];

const MOCK_TESTS = [
  { id:1, name:"Temperament Testi",       taken:847, avgScore:72, popular:true  },
  { id:2, name:"Stess Testi (PSS-10)",    taken:672, avgScore:58, popular:true  },
  { id:3, name:"Big Five Shaxsiyat",      taken:534, avgScore:64, popular:false },
  { id:4, name:"Depressiya (PHQ-9)",      taken:407, avgScore:41, popular:false },
  { id:5, name:"Yolg'on Ko'rsatkichi",    taken:318, avgScore:55, popular:false },
  { id:6, name:"Muloqot Testi",           taken:289, avgScore:68, popular:false },
  { id:7, name:"Kettel 16PF",             taken:201, avgScore:61, popular:false },
  { id:8, name:"Bog'lanish Uslubi",       taken:187, avgScore:49, popular:false },
];

const MOCK_TRAININGS = [
  { id:1, title:"Stressni boshqarish",        cat:"Stress", students:1200, price:0,      status:"faol"  },
  { id:2, title:"Oilada baxtii hayot",         cat:"Oila",   students:900,  price:0,      status:"faol"  },
  { id:3, title:"21 kunlik Stress dasturi",    cat:"Stress", students:890,  price:150000, status:"faol"  },
  { id:4, title:"Munosabatlarda o'z-o'zini",  cat:"Oila",   students:540,  price:150000, status:"faol"  },
  { id:5, title:"Shaxsiy o'sish",             cat:"O'sish", students:720,  price:120000, status:"faol"  },
  { id:6, title:"Bolalar psixologiyasi",       cat:"Bolalar",students:340,  price:180000, status:"faol"  },
];

const MOCK_MESSAGES = [
  { id:1, from:"Dilnoza T.",    text:"Psixolog bilan bog'lana olmayman",        time:"5 daq oldin",  read:false, type:"muammo"  },
  { id:2, from:"Sardor M.",     text:"To'lov tizimi ishlamayapti",              time:"20 daq oldin", read:false, type:"texnik"  },
  { id:3, from:"Aziza R.",      text:"Test natijalarimni qaerdan ko'raman?",   time:"1 soat oldin", read:false, type:"savol"   },
  { id:4, from:"Jasur A.",      text:"Yangi kurs qachon chiqadi?",              time:"2 soat oldin", read:true,  type:"savol"   },
  { id:5, from:"Malika B.",     text:"Ajoyib platforma, rahmat!",               time:"Kecha",        read:true,  type:"fikr"    },
];

// ─── HELPERS ─────────────────────────────────────────
const AvaComp = ({ name, size=28, bg="#EEECfd", color="#4A3DB5" }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:bg, color, fontSize:size*0.4, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
    {name[0].toUpperCase()}
  </div>
);

const Badge = ({ text, type="default" }) => {
  const styles = {
    default:     { bg:"#EEECfd",  color:"#4A3DB5"  },
    success:     { bg:"#e6f8f0",  color:"#0d7a50"  },
    danger:      { bg:"#fee2e2",  color:"#b91c1c"  },
    warning:     { bg:"#fff5e6",  color:"#b45309"  },
    info:        { bg:"#e0f2fe",  color:"#0369a1"  },
  };
  const s = styles[type] || styles.default;
  return <span style={{ background:s.bg, color:s.color, borderRadius:999, fontSize:11, fontWeight:500, padding:"2px 9px" }}>{text}</span>;
};

// ─── DASHBOARD ───────────────────────────────────────
function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch("/admin/stats", token),
      adminFetch("/admin/activity?days=7", token),
    ]).then(([s, a]) => {
      if (s) setStats(s);
      if (a) setActivity(a);
      setLoading(false);
    });
  }, [token]);

  const metrics = stats ? [
    { val: stats.total_users.toLocaleString(),            label:"Jami foydalanuvchi", delta:`+${stats.new_users_this_week} bu hafta`, up:true,  color:"#6C5CE7" },
    { val: stats.total_challenges_taken.toLocaleString(), label:"Challengelar",        delta:"Jami",                                   up:true,  color:"#0d7a50" },
    { val: stats.total_days_completed.toLocaleString(),   label:"Bajarilgan kunlar",  delta:"Jami",                                   up:true,  color:"#b45309" },
    { val: stats.active_users.toLocaleString(),           label:"Faol foydalanuvchi", delta:`+${stats.new_users_this_month} bu oy`,   up:true,  color:"#0369a1" },
  ] : [
    { val:"...", label:"Jami foydalanuvchi", delta:"",    up:true,  color:"#6C5CE7" },
    { val:"...", label:"Challengelar",        delta:"",   up:true,  color:"#0d7a50" },
    { val:"...", label:"Bajarilgan kunlar",  delta:"",    up:true,  color:"#b45309" },
    { val:"...", label:"Faol foydalanuvchi", delta:"",    up:true,  color:"#0369a1" },
  ];

  return (
    <div>
      {/* Metrics */}
      <div className="adm-metrics">
        {metrics.map((m,i) => (
          <div key={i} className="adm-metric">
            <div className="adm-metric-val" style={{color:m.color}}>{m.val}</div>
            <div className="adm-metric-label">{m.label}</div>
            <div className="adm-metric-delta" style={{color: m.up?"#0d7a50":"#b91c1c"}}>
              {m.up?"↑":"↓"} {m.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="adm-row2">
        {/* Test statistics */}
        <div className="adm-card">
          <div className="adm-card-title">Eng ko'p o'tilgan testlar</div>
          {MOCK_TESTS.slice(0,5).map((t,i) => {
            const pct = Math.round((t.taken/847)*100);
            return (
              <div key={i} className="adm-bar-row">
                <span className="adm-bar-label">{t.name.slice(0,14)}</span>
                <div className="adm-bar-track">
                  <div className="adm-bar-fill" style={{width:pct+"%", opacity: 1-i*0.15}}/>
                </div>
                <span className="adm-bar-val">{t.taken}</span>
              </div>
            );
          })}
        </div>

        {/* Recent users */}
        <div className="adm-card">
          <div className="adm-card-title">Oxirgi foydalanuvchilar</div>
          {MOCK_USERS.slice(0,5).map((u,i) => (
            <div key={i} className="adm-user-row">
              <AvaComp name={u.name}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500}}>{u.name}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>{u.lastActive}</div>
              </div>
              <div style={{width:7,height:7,borderRadius:"50%",background: u.status==="faol"?"#22c55e":"#d1d5db"}}/>
            </div>
          ))}
        </div>
      </div>

      {/* Psixolog approvals */}
      <div className="adm-card" style={{marginTop:14}}>
        <div className="adm-card-title">
          Psixolog so'rovlari
          <Badge text={`${MOCK_PSYCHS.filter(p=>p.status==="kutmoqda").length} ta kutmoqda`} type="danger"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {MOCK_PSYCHS.filter(p=>p.status==="kutmoqda").map((p,i) => (
            <div key={i} className="adm-psych-pending">
              <AvaComp name={p.name} size={34}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>{p.spec}</div>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button className="adm-btn-sm adm-btn-ok">✓</button>
                <button className="adm-btn-sm adm-btn-no">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── USERS ───────────────────────────────────────────
function Users({ token }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("barchasi");
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filter !== "barchasi") params.append("status", filter);
    const data = await adminFetch(`/admin/users?${params}`, token);
    if (data) setUsers(data.map(u => ({
      ...u,
      status: u.is_active ? "faol" : "bloklangan",
      tests: u.challenges_count,
      joined: new Date(u.created_at).toLocaleDateString("uz-UZ"),
      lastActive: "—",
    })));
    setLoading(false);
  }, [search, filter, token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = users.filter(u => {
    const matchS = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchF = filter==="barchasi" || u.status===filter;
    return matchS && matchF;
  });

  const toggleBlock = async (id) => {
    await adminFetch(`/admin/users/${id}/block`, token, { method: "PATCH" });
    loadUsers();
  };

  return (
    <div>
      <div className="adm-toolbar">
        <div style={{display:"flex",gap:8}}>
          <input className="adm-input" placeholder="Qidirish..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className="adm-select" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="barchasi">Barchasi</option>
            <option value="faol">Faol</option>
            <option value="bloklangan">Bloklangan</option>
          </select>
        </div>
        <div style={{fontSize:13,color:"#9ca3af"}}>{filtered.length} ta foydalanuvchi</div>
      </div>
      <div className="adm-card" style={{padding:0,overflow:"hidden"}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Foydalanuvchi</th>
              <th>Holat</th>
              <th>Testlar</th>
              <th>Ro'yxatdan</th>
              <th>Oxirgi faollik</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <AvaComp name={u.name} size={30}/>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{u.name}</div>
                      <div style={{fontSize:11,color:"#9ca3af"}}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><Badge text={u.status==="faol"?"Faol":"Bloklangan"} type={u.status==="faol"?"success":"danger"}/></td>
                <td style={{fontSize:13,color:"#6b7280"}}>{u.tests} ta</td>
                <td style={{fontSize:12,color:"#9ca3af"}}>{u.joined}</td>
                <td style={{fontSize:12,color:"#9ca3af"}}>{u.lastActive}</td>
                <td>
                  <div style={{display:"flex",gap:5}}>
                    <button className="adm-btn-sm" style={{background:"#f5f4fc",color:"#6C5CE7"}}>Ko'rish</button>
                    <button className="adm-btn-sm" onClick={()=>toggleBlock(u.id)}
                      style={{background: u.status==="faol"?"#fee2e2":"#e6f8f0", color: u.status==="faol"?"#b91c1c":"#0d7a50"}}>
                      {u.status==="faol"?"Blok":"Ochish"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PSYCHOLOGISTS ───────────────────────────────────
function Psychologists() {
  const [psychs, setPsychs] = useState(MOCK_PSYCHS);

  const approve = (id) => setPsychs(prev => prev.map(p => p.id===id ? {...p, status:"tasdiqlangan"} : p));
  const reject  = (id) => setPsychs(prev => prev.filter(p => p.id!==id));

  const pending   = psychs.filter(p => p.status==="kutmoqda");
  const approved  = psychs.filter(p => p.status==="tasdiqlangan");

  return (
    <div>
      {pending.length > 0 && (
        <div className="adm-card" style={{marginBottom:14}}>
          <div className="adm-card-title">Tasdiqlash kutmoqda <Badge text={pending.length+" ta"} type="danger"/></div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {pending.map(p => (
              <div key={p.id} className="adm-psych-row">
                <AvaComp name={p.name} size={40}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500}}>{p.name}</div>
                  <div style={{fontSize:12,color:"#9ca3af"}}>{p.spec} · {p.exp} tajriba</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="adm-btn" style={{background:"#e6f8f0",color:"#0d7a50"}} onClick={()=>approve(p.id)}>✓ Tasdiqlash</button>
                  <button className="adm-btn" style={{background:"#fee2e2",color:"#b91c1c"}} onClick={()=>reject(p.id)}>✕ Rad etish</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-title">Tasdiqlangan psixologlar <Badge text={approved.length+" ta"} type="success"/></div>
        <table className="adm-table">
          <thead><tr><th>Psixolog</th><th>Mutaxassislik</th><th>Tajriba</th><th>Bemorlar</th><th>Reyting</th><th>Amallar</th></tr></thead>
          <tbody>
            {approved.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <AvaComp name={p.name} size={30}/>
                    <span style={{fontSize:13,fontWeight:500}}>{p.name}</span>
                  </div>
                </td>
                <td><Badge text={p.spec}/></td>
                <td style={{fontSize:13,color:"#6b7280"}}>{p.exp}</td>
                <td style={{fontSize:13,color:"#6b7280"}}>{p.patients} ta</td>
                <td style={{fontSize:13,color:"#f59e0b",fontWeight:500}}>★ {p.rating}</td>
                <td>
                  <div style={{display:"flex",gap:5}}>
                    <button className="adm-btn-sm" style={{background:"#f5f4fc",color:"#6C5CE7"}}>Tahrir</button>
                    <button className="adm-btn-sm" style={{background:"#fee2e2",color:"#b91c1c"}} onClick={()=>reject(p.id)}>O'chirish</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TESTS ───────────────────────────────────────────
function Tests() {
  return (
    <div>
      <div className="adm-metrics" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        <div className="adm-metric">
          <div className="adm-metric-val" style={{color:"#6C5CE7"}}>21</div>
          <div className="adm-metric-label">Jami testlar</div>
        </div>
        <div className="adm-metric">
          <div className="adm-metric-val">3,847</div>
          <div className="adm-metric-label">Jami o'tishlar</div>
        </div>
        <div className="adm-metric">
          <div className="adm-metric-val" style={{color:"#0d7a50"}}>61%</div>
          <div className="adm-metric-label">O'rtacha natija</div>
        </div>
      </div>
      <div className="adm-card">
        <div className="adm-card-title">Testlar statistikasi</div>
        <table className="adm-table">
          <thead><tr><th>Test nomi</th><th>O'tilgan</th><th>O'rtacha ball</th><th>Holat</th></tr></thead>
          <tbody>
            {MOCK_TESTS.map(t => {
              const pct = Math.round((t.taken/847)*100);
              return (
                <tr key={t.id}>
                  <td style={{fontSize:13,fontWeight:500}}>{t.name}</td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,height:4,background:"#f0eeff",borderRadius:999,overflow:"hidden",minWidth:80}}>
                        <div style={{width:pct+"%",height:"100%",background:"#6C5CE7",borderRadius:999}}/>
                      </div>
                      <span style={{fontSize:12,color:"#6b7280",minWidth:30}}>{t.taken}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{fontSize:13,fontWeight:500,color: t.avgScore>=60?"#0d7a50":t.avgScore>=40?"#b45309":"#b91c1c"}}>
                      {t.avgScore}%
                    </span>
                  </td>
                  <td>{t.popular ? <Badge text="Mashhur" type="info"/> : <Badge text="Oddiy"/>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TRAININGS ───────────────────────────────────────
function Trainings() {
  const [trainings, setTrainings] = useState(MOCK_TRAININGS);

  const toggle = (id) => setTrainings(prev => prev.map(t => t.id===id ? {...t, status: t.status==="faol"?"yashirin":"faol"} : t));

  return (
    <div>
      <div className="adm-toolbar">
        <div style={{fontSize:13,color:"#9ca3af"}}>{trainings.length} ta kurs</div>
        <button className="adm-btn-primary">+ Yangi kurs</button>
      </div>
      <div className="adm-card" style={{padding:0,overflow:"hidden"}}>
        <table className="adm-table">
          <thead><tr><th>Kurs nomi</th><th>Kategoriya</th><th>Talabalar</th><th>Narx</th><th>Holat</th><th>Amallar</th></tr></thead>
          <tbody>
            {trainings.map(t => (
              <tr key={t.id}>
                <td style={{fontSize:13,fontWeight:500}}>{t.title}</td>
                <td><Badge text={t.cat}/></td>
                <td style={{fontSize:13,color:"#6b7280"}}>{t.students.toLocaleString()}</td>
                <td style={{fontSize:13,fontWeight:500,color: t.price===0?"#0d7a50":"#6C5CE7"}}>
                  {t.price===0 ? "Bepul" : t.price.toLocaleString()+" so'm"}
                </td>
                <td><Badge text={t.status==="faol"?"Faol":"Yashirin"} type={t.status==="faol"?"success":"warning"}/></td>
                <td>
                  <div style={{display:"flex",gap:5}}>
                    <button className="adm-btn-sm" style={{background:"#f5f4fc",color:"#6C5CE7"}}>Tahrir</button>
                    <button className="adm-btn-sm" onClick={()=>toggle(t.id)}
                      style={{background: t.status==="faol"?"#fff5e6":"#e6f8f0", color: t.status==="faol"?"#b45309":"#0d7a50"}}>
                      {t.status==="faol"?"Yashir":"Ko'rsat"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MESSAGES ────────────────────────────────────────
function Messages() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selected, setSelected] = useState(null);
  const [reply, setReply]       = useState("");

  const markRead = (id) => setMessages(prev => prev.map(m => m.id===id ? {...m, read:true} : m));
  const typeColors = { muammo:"danger", texnik:"warning", savol:"info", fikr:"success" };

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:14,height:"calc(100vh - 160px)",minHeight:400}}>
      {/* List */}
      <div className="adm-card" style={{padding:0,overflow:"auto"}}>
        <div style={{padding:"12px 14px",borderBottom:"0.5px solid #e5e4f0",fontSize:13,fontWeight:500}}>
          Xabarlar <Badge text={messages.filter(m=>!m.read).length+" yangi"} type="danger"/>
        </div>
        {messages.map(m => (
          <div key={m.id}
            onClick={()=>{ setSelected(m); markRead(m.id); }}
            style={{padding:"11px 14px",borderBottom:"0.5px solid #f5f4fc",cursor:"pointer",
              background: selected?.id===m.id?"#f5f4fc":"transparent",
              borderLeft: !m.read?"3px solid #6C5CE7":"3px solid transparent"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:13,fontWeight:500}}>{m.from}</span>
              <span style={{fontSize:11,color:"#9ca3af"}}>{m.time}</span>
            </div>
            <div style={{fontSize:12,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.text}</div>
            <div style={{marginTop:5}}><Badge text={m.type} type={typeColors[m.type]}/></div>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div className="adm-card" style={{display:"flex",flexDirection:"column"}}>
        {selected ? (
          <>
            <div style={{padding:"0 0 12px",borderBottom:"0.5px solid #e5e4f0",marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:3}}>{selected.from}</div>
              <div style={{fontSize:12,color:"#9ca3af"}}>{selected.time}</div>
            </div>
            <div style={{background:"#f5f4fc",borderRadius:10,padding:14,fontSize:14,color:"#1a1a2e",lineHeight:1.6,flex:1,marginBottom:14}}>
              {selected.text}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input className="adm-input" style={{flex:1}} placeholder="Javob yozing..."
                value={reply} onChange={e=>setReply(e.target.value)}/>
              <button className="adm-btn-primary" onClick={()=>setReply("")}>Yuborish</button>
            </div>
          </>
        ) : (
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#9ca3af",flexDirection:"column",gap:8}}>
            <div style={{fontSize:32}}>💬</div>
            <div style={{fontSize:13}}>Xabar tanlang</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FINANCE ─────────────────────────────────────────
function Finance({ token }) {
  const months = ["Okt","Nov","Dek","Yan","Fev","Mart"];
  const data   = [1800000, 2100000, 2400000, 2900000, 3600000, 4200000];
  const maxVal = Math.max(...data);

  const payments = [
    { user:"Dilnoza T.", course:"Stressni boshqarish: 21 kun", amount:150000, date:"16 mart 2026", status:"to'langan" },
    { user:"Sardor M.",  course:"Bolalar psixologiyasi",        amount:180000, date:"15 mart 2026", status:"to'langan" },
    { user:"Aziza R.",   course:"Shaxsiy o'sish",              amount:120000, date:"14 mart 2026", status:"to'langan" },
    { user:"Jasur A.",   course:"Munosabatlarda o'z-o'zini",   amount:150000, date:"13 mart 2026", status:"qaytarilgan" },
  ];

  return (
    <div>
      <div className="adm-metrics">
        <div className="adm-metric"><div className="adm-metric-val" style={{color:"#0d7a50"}}>4.2M</div><div className="adm-metric-label">Bu oy (so'm)</div><div className="adm-metric-delta" style={{color:"#0d7a50"}}>↑ +18%</div></div>
        <div className="adm-metric"><div className="adm-metric-val">38</div><div className="adm-metric-label">Bu oy to'lovlar</div></div>
        <div className="adm-metric"><div className="adm-metric-val">110,526</div><div className="adm-metric-label">O'rtacha to'lov</div></div>
        <div className="adm-metric"><div className="adm-metric-val" style={{color:"#b91c1c"}}>2</div><div className="adm-metric-label">Qaytarishlar</div></div>
      </div>

      {/* Bar chart */}
      <div className="adm-card" style={{marginBottom:14}}>
        <div className="adm-card-title">Oylik daromad dinamikasi</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:12,height:120,padding:"8px 0"}}>
          {data.map((v,i) => (
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              <span style={{fontSize:10,color:"#9ca3af"}}>{(v/1000000).toFixed(1)}M</span>
              <div style={{width:"100%",background: i===data.length-1?"#6C5CE7":"#EEECfd",borderRadius:"4px 4px 0 0",height: Math.round((v/maxVal)*80)+"%",transition:"height .5s"}}/>
              <span style={{fontSize:11,color:"#9ca3af"}}>{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="adm-card" style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:"0.5px solid #e5e4f0",fontSize:13,fontWeight:500}}>So'nggi to'lovlar</div>
        <table className="adm-table">
          <thead><tr><th>Foydalanuvchi</th><th>Kurs</th><th>Summa</th><th>Sana</th><th>Holat</th></tr></thead>
          <tbody>
            {payments.map((p,i) => (
              <tr key={i}>
                <td style={{fontSize:13,fontWeight:500}}>{p.user}</td>
                <td style={{fontSize:12,color:"#6b7280"}}>{p.course}</td>
                <td style={{fontSize:13,fontWeight:500,color:"#6C5CE7"}}>{p.amount.toLocaleString()} so'm</td>
                <td style={{fontSize:12,color:"#9ca3af"}}>{p.date}</td>
                <td><Badge text={p.status} type={p.status==="to'langan"?"success":"danger"}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        try {
          const res = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
          if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem("adm_token", data.access_token);
          } else {
            sessionStorage.setItem("adm_token", "mock_token");
          }
        } catch(e) {
          sessionStorage.setItem("adm_token", "mock_token");
        }
        setLoading(false);
        onLogin();
      } else {
        setError("Email yoki parol noto'g'ri");
        setLoading(false);
      }
  };

  return (
    <div className="adm-login-page">
      <div className="adm-login-card">
        <div className="adm-login-logo">
          <div className="adm-login-icon">U</div>
          <div>
            <div style={{fontSize:17,fontWeight:600,color:"#1a1a2e"}}>Umidnoma</div>
            <div style={{fontSize:12,color:"#9ca3af"}}>Admin panel</div>
          </div>
        </div>
        <h2 style={{fontSize:20,fontWeight:600,color:"#1a1a2e",marginBottom:6}}>Kirish</h2>
        <p style={{fontSize:13,color:"#9ca3af",marginBottom:24}}>Admin hisobi bilan kiring</p>
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{display:"block",fontSize:12,fontWeight:500,color:"#374151",marginBottom:5}}>Email</label>
            <input className="adm-input" style={{width:"100%"}} type="email" placeholder="admin@umidnoma.uz"
              value={email} onChange={e=>setEmail(e.target.value)} required/>
          </div>
          <div>
            <label style={{display:"block",fontSize:12,fontWeight:500,color:"#374151",marginBottom:5}}>Parol</label>
            <input className="adm-input" style={{width:"100%"}} type="password" placeholder="••••••••"
              value={password} onChange={e=>setPassword(e.target.value)} required/>
          </div>
          {error && <div style={{background:"#fee2e2",color:"#b91c1c",borderRadius:8,padding:"9px 12px",fontSize:13}}>{error}</div>}
          <button type="submit" className="adm-btn-primary" style={{width:"100%",padding:"11px",fontSize:14}}
            disabled={loading}>{loading ? "Tekshirilmoqda..." : "Kirish →"}</button>
        </form>
      </div>
    </div>
  );
}

// ─── LAYOUT ──────────────────────────────────────────
const NAV_ITEMS = [
  { key:"dashboard",  label:"Dashboard",          badge:null },
  { key:"users",      label:"Foydalanuvchilar",    badge:"1,204" },
  { key:"psychs",     label:"Psixologlar",         badge:"3" },
  { key:"tests",      label:"Testlar & natijalar", badge:null },
  { key:"trainings",  label:"Treninglar",          badge:null },
  { key:"messages",   label:"Xabarlar",            badge:"5"  },
  { key:"finance",    label:"Moliya",              badge:null },
];

const ICONS = {
  dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  users:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  psychs:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  tests:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  trainings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  messages:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  finance:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

function AdminLayout({ onLogout, onExit }) {
  const [active, setActive] = useState("dashboard");

  const PAGES = { dashboard:<Dashboard token={sessionStorage.getItem("adm_token")}/>, users:<Users token={sessionStorage.getItem("adm_token")}/>, psychs:<Psychologists/>, tests:<Tests token={sessionStorage.getItem("adm_token")}/>, trainings:<Trainings/>, messages:<Messages/>, finance:<Finance token={sessionStorage.getItem("adm_token")}/> };
  const title = NAV_ITEMS.find(n=>n.key===active)?.label || "Dashboard";

  return (
    <div className="adm-layout">
      {/* SIDEBAR */}
      <div className="adm-sidebar">
        <div className="adm-sb-logo">
          <div className="adm-sb-icon">U</div>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:"#1a1a2e"}}>Umidnoma</div>
          </div>
          <span style={{marginLeft:"auto",background:"#fee2e2",color:"#b91c1c",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:999}}>Admin</span>
        </div>

        <nav className="adm-sb-nav">
          <div className="adm-sb-section">ASOSIY</div>
          {NAV_ITEMS.slice(0,3).map(item => (
            <button key={item.key} className={`adm-sb-item ${active===item.key?"active":""}`} onClick={()=>setActive(item.key)}>
              <span className="adm-sb-icon-wrap">{ICONS[item.key]}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span style={{marginLeft:"auto",background: item.key==="psychs"?"#fee2e2":"#EEECfd",color: item.key==="psychs"?"#b91c1c":"#4A3DB5",fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:999}}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="adm-sb-section">KONTENT</div>
          {NAV_ITEMS.slice(3,5).map(item => (
            <button key={item.key} className={`adm-sb-item ${active===item.key?"active":""}`} onClick={()=>setActive(item.key)}>
              <span className="adm-sb-icon-wrap">{ICONS[item.key]}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <div className="adm-sb-section">TIZIM</div>
          {NAV_ITEMS.slice(5).map(item => (
            <button key={item.key} className={`adm-sb-item ${active===item.key?"active":""}`} onClick={()=>setActive(item.key)}>
              <span className="adm-sb-icon-wrap">{ICONS[item.key]}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span style={{marginLeft:"auto",background:"#fee2e2",color:"#b91c1c",fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:999}}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="adm-sb-footer">
          <AvaComp name="Admin" size={30}/>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:500,color:"#1a1a2e"}}>Admin</div>
            <div style={{fontSize:10,color:"#9ca3af"}}>Super admin</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",color:"#9ca3af",fontSize:12,textAlign:"left"}}>Chiqish</button>
          {onExit && <button onClick={onExit} style={{background:"none",border:"none",cursor:"pointer",color:"#6C5CE7",fontSize:11,textAlign:"left"}}>← Saytga qaytish</button>}
        </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="adm-main">
        <div className="adm-topbar">
          <div style={{fontSize:15,fontWeight:600,color:"#1a1a2e"}}>{title}</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:12,color:"#9ca3af"}}>16 Mart 2026, Dushanba</div>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e"}}/>
            <span style={{fontSize:12,color:"#22c55e"}}>Tizim ishlayapti</span>
          </div>
        </div>
        <div className="adm-content">{PAGES[active]}</div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────
export default function AdminApp({ onExit }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem("adm_auth") === "1");

  const handleLogin  = () => { sessionStorage.setItem("adm_auth","1"); setIsLoggedIn(true);  };
  const handleLogout = () => { sessionStorage.removeItem("adm_auth"); setIsLoggedIn(false); if(onExit) onExit(); };

  if (!isLoggedIn) return <AdminLogin onLogin={handleLogin}/>;
  return <AdminLayout onLogout={handleLogout} onExit={onExit}/>;
}
