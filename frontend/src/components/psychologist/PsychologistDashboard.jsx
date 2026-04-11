import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";


import { getClients } from '../../api'; // ← mavjud api.js dan






// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PALETTE = {
  violet: "#7C3AED",
  violetLight: "#A78BFA",
  violetUltra: "#EDE9FE",
  pink: "#EC4899",
  blue: "#3B82F6",
  teal: "#06B6D4",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  dark: "#0D0A1E",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F8F7FF",
};

const RISK_COLORS = {
  high: { bg: "#FEE2E2", text: "#DC2626", label: "🔴 Yuqori" },
  medium: { bg: "#FEF3C7", text: "#D97706", label: "🟡 O'rta" },
  low: { bg: "#D1FAE5", text: "#059669", label: "🟢 Past" },
};

const CLIENTS_DATA = [
  { id: 1, name: "Asilbek Toshmatov", age: 28, risk: "high", mood: 30, sessions: 14, initials: "AT", color: PALETTE.red, diagnos: "Depressiya, Tashvish", lastActive: "1 soat oldin", stress: 82, anxiety: 78, motivation: 35, social: 28, resilience: 22, phq9: 18, gad7: 15, pss: 31, notes: "Uxlash muammolari, ijtimoiy izolyatsiya kuchaymoqda. Oilaviy nizolar mavjud." },
  { id: 2, name: "Nilufar Xasanova", age: 23, risk: "medium", mood: 62, sessions: 8, initials: "NX", color: PALETTE.amber, diagnos: "Stress, O'z ishonch", lastActive: "3 soat oldin", stress: 58, anxiety: 52, motivation: 65, social: 58, resilience: 50, phq9: 11, gad7: 9, pss: 22, notes: "Ish bosimi sababli stress, motivatsiya oshmoqda." },
  { id: 3, name: "Javlon Mirzayev", age: 35, risk: "low", mood: 80, sessions: 22, initials: "JM", color: PALETTE.green, diagnos: "Moslashish buzilishi", lastActive: "Kecha", stress: 24, anxiety: 20, motivation: 82, social: 78, resilience: 85, phq9: 4, gad7: 3, pss: 10, notes: "Sezilarli yaxshilanish. Terapiya samarali ishlayapti." },
  { id: 4, name: "Zulfiya Rahimova", age: 31, risk: "high", mood: 22, sessions: 6, initials: "ZR", color: PALETTE.red, diagnos: "OKB, Panik atakalar", lastActive: "30 daqiqa oldin", stress: 88, anxiety: 85, motivation: 30, social: 25, resilience: 20, phq9: 20, gad7: 17, pss: 35, notes: "Panik atakalar soni ko'paydi. Psixiatr bilan maslahatlashish zarur." },
  { id: 5, name: "Bobur Qodirov", age: 19, risk: "high", mood: 18, sessions: 3, initials: "BQ", color: PALETTE.red, diagnos: "O'smirlik depressiyasi", lastActive: "2 soat oldin", stress: 80, anxiety: 75, motivation: 28, social: 20, resilience: 18, phq9: 22, gad7: 14, pss: 33, notes: "Oilaviy muammolar, ijtimoiy izolyatsiya. Krizis holati yaqin." },
  { id: 6, name: "Sarvinoz Abdullayeva", age: 27, risk: "low", mood: 76, sessions: 18, initials: "SA", color: PALETTE.green, diagnos: "Adaptatsiya muammosi", lastActive: "2 kun oldin", stress: 25, anxiety: 22, motivation: 80, social: 74, resilience: 82, phq9: 5, gad7: 4, pss: 11, notes: "Faoliyat normallashmoqda. Oyda bir kuzatuv yetarli." },
  { id: 7, name: "Firdavs Yusupov", age: 42, risk: "medium", mood: 55, sessions: 11, initials: "FY", color: PALETTE.amber, diagnos: "Burnout, Stress", lastActive: "Bugun", stress: 62, anxiety: 55, motivation: 58, social: 52, resilience: 48, phq9: 10, gad7: 8, pss: 21, notes: "Ish-hayot muvozanati yaxshilanmoqda. Sekin progres bor." },
  { id: 8, name: "Malika Ergasheva", age: 25, risk: "low", mood: 86, sessions: 30, initials: "ME", color: PALETTE.green, diagnos: "Fobiya (remissiya)", lastActive: "Bugun", stress: 20, anxiety: 18, motivation: 88, social: 82, resilience: 90, phq9: 3, gad7: 2, pss: 8, notes: "Barqaror holat. Davolash muvaffaqiyatli yakunlandi." },
];

const generateMoodHistory = (base) =>
  Array.from({ length: 14 }, (_, i) => ({
    day: `${i + 1}-kun`,
    mood: Math.max(10, Math.min(98, base + Math.sin(i * 0.8) * 18 + (Math.random() - 0.5) * 12)),
    stress: Math.max(10, Math.min(98, (100 - base) + Math.cos(i * 0.6) * 15 + (Math.random() - 0.5) * 10)),
  }));

const generateTrendData = () =>
  ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((d) => ({
    day: d,
    stress: 45 + Math.random() * 30,
    anxiety: 40 + Math.random() * 28,
    mood: 50 + Math.random() * 25,
  }));

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, change, changeType, accent }) => (
  <div style={{
    background: "#fff", borderRadius: 20, padding: "20px 22px",
    boxShadow: "0 4px 24px rgba(124,58,237,.07)", border: `1px solid ${PALETTE.border}`,
    position: "relative", overflow: "hidden", transition: "transform .2s, box-shadow .2s",
    cursor: "default",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(124,58,237,.13)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(124,58,237,.07)"; }}
  >
    <div style={{ position: "absolute", top: -18, right: -18, width: 80, height: 80, borderRadius: "50%", background: accent, opacity: .1 }} />
    <div style={{ fontSize: 12, color: PALETTE.muted, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      <span style={{ fontSize: 15 }}>{icon}</span>{label}
    </div>
    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, color: PALETTE.dark, lineHeight: 1 }}>{value}</div>
    <div style={{ marginTop: 8, fontSize: 12, fontWeight: 500, color: changeType === "up" ? PALETTE.green : changeType === "down" ? PALETTE.red : PALETTE.amber, display: "flex", alignItems: "center", gap: 4 }}>
      {changeType === "up" ? "↑" : changeType === "down" ? "↓" : "⚠"} {change}
    </div>
  </div>
);

const RiskBadge = ({ level }) => (
  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: RISK_COLORS[level].bg, color: RISK_COLORS[level].text, display: "inline-block", whiteSpace: "nowrap" }}>
    {RISK_COLORS[level].label}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 20, padding: 22, boxShadow: "0 4px 24px rgba(124,58,237,.07)", border: `1px solid ${PALETTE.border}`, ...style }}>
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, action }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
    <div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: PALETTE.dark }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: PALETTE.muted, marginTop: 3 }}>{subtitle}</div>}
    </div>
    {action}
  </div>
);

const ActionBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${PALETTE.violetLight}`, background: PALETTE.violetUltra, color: PALETTE.violet, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: ".2s" }}
    onMouseEnter={e => { e.currentTarget.style.background = PALETTE.violet; e.currentTarget.style.color = "#fff"; }}
    onMouseLeave={e => { e.currentTarget.style.background = PALETTE.violetUltra; e.currentTarget.style.color = PALETTE.violet; }}
  >{children}</button>
);

const ProgressBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 13 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}%</span>
    </div>
    <div style={{ height: 7, background: PALETTE.bg, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 4, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: PALETTE.muted, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
    {children}
    <div style={{ flex: 1, height: 1, background: PALETTE.border }} />
  </div>
);

// ─── AI SUMMARY COMPONENT ─────────────────────────────────────────────────────
const AISummary = ({ prompt, deps = [] }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    if (!prompt) return;
    setLoading(true); setText("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const d = await res.json();
      setText(d.content?.[0]?.text || "Tahlil yuklanmadi.");
    } catch {
      setText("Offline rejim: " + (prompt.includes("risk") ? "Yuqori risk mijozlar tezkor diqqat talab qiladi. Krizis protokolini faollashtiring." : "Mijoz holatini baholash uchun qo'shimcha ma'lumot kerak."));
    } finally { setLoading(false); }
  }, [prompt]);

  useEffect(() => { run(); }, deps);

  return (
    <div style={{ background: `linear-gradient(135deg, ${PALETTE.violetUltra}, rgba(236,72,153,.04))`, border: `1px solid rgba(124,58,237,.15)`, borderRadius: 14, padding: 16, marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: PALETTE.violet, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: PALETTE.violet, animation: "pulse 1.5s infinite" }} />
        AI Tahlil
        {loading && <span style={{ marginLeft: "auto", fontSize: 11, fontStyle: "italic", fontWeight: 400 }}>Yuklanmoqda...</span>}
        {!loading && <button onClick={run} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0 }} title="Yangilash">🔄</button>}
      </div>
      <p style={{ fontSize: 12.5, color: PALETTE.muted, lineHeight: 1.7, margin: 0 }}>
        {loading ? "..." : text || "..."}
      </p>
    </div>
  );
};

// ─── VIEWS ────────────────────────────────────────────────────────────────────
const DashboardView = ({ clients, onSelectClient }) => {
  const [trendData, setTrendData] = useState(generateTrendData);
  const highRisk = clients.filter(c => c.risk === "high").length;
  const avgMood = Math.round(clients.reduce((s, c) => s + c.mood, 0) / clients.length);
  const avgStress = Math.round(clients.reduce((s, c) => s + c.stress, 0) / clients.length);

  const pieData = [
    { name: "Barqaror", value: clients.filter(c => c.risk === "low").length, color: PALETTE.green },
    { name: "O'rta", value: clients.filter(c => c.risk === "medium").length, color: PALETTE.amber },
    { name: "Yuqori Risk", value: highRisk, color: PALETTE.red },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <KpiCard icon="📅" label="Bugungi Sessiyalar" value="12" change="3 ta ko'p" changeType="up" accent={PALETTE.violet} />
        <KpiCard icon="🚨" label="Yuqori Risk" value={highRisk} change="Tezkor e'tibor" changeType="warn" accent={PALETTE.red} />
        <KpiCard icon="👥" label="Faol Mijozlar" value={clients.length} change="2 yangi bu oy" changeType="up" accent={PALETTE.blue} />
        <KpiCard icon="📊" label="O'rtacha Stress" value={`${avgStress}%`} change="4% yaxshilandi" changeType="down" accent={PALETTE.teal} />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader title="Stress & Kayfiyat Dinamikasi" subtitle="So'nggi 7 kun – barcha mijozlar o'rtachasi"
            action={<ActionBtn onClick={() => setTrendData(generateTrendData())}>🔄 Yangilash</ActionBtn>} />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.violet} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={PALETTE.violet} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAnx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.pink} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={PALETTE.pink} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.green} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={PALETTE.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="stress" name="Stress" stroke={PALETTE.violet} fill="url(#gStress)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="anxiety" name="Tashvish" stroke={PALETTE.pink} fill="url(#gAnx)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="mood" name="Kayfiyat" stroke={PALETTE.green} fill="url(#gMood)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Psixologik Holat Taqsimoti" subtitle="Barcha faol mijozlar" />
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, flex: 1 }}>{e.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Client table + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader title="Faol Mijozlar" action={<ActionBtn onClick={() => {}}>Barchasi →</ActionBtn>} />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Mijoz", "Risk", "Kayfiyat", "Sessiya", "Faollik"].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 600, color: PALETTE.muted, textTransform: "uppercase", letterSpacing: ".7px", padding: "6px 10px", textAlign: "left", borderBottom: `1px solid ${PALETTE.border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {clients.slice(0, 6).map(c => (
                <tr key={c.id} onClick={() => onSelectClient(c)} style={{ cursor: "pointer", transition: ".15s" }}
                  onMouseEnter={e => e.currentTarget.querySelectorAll("td").forEach(td => td.style.background = PALETTE.bg)}
                  onMouseLeave={e => e.currentTarget.querySelectorAll("td").forEach(td => td.style.background = "")}>
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: c.color + "22", color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.initials}</div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 10.5, color: PALETTE.muted }}>{c.age} yosh</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "9px 10px" }}><RiskBadge level={c.risk} /></td>
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 50, height: 5, background: PALETTE.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${c.mood}%`, height: "100%", background: `linear-gradient(90deg, ${PALETTE.violet}, ${PALETTE.pink})`, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10.5, color: PALETTE.muted }}>{c.mood}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "9px 10px", fontSize: 12.5, fontWeight: 600, color: PALETTE.violet }}>{c.sessions}</td>
                  <td style={{ padding: "9px 10px", fontSize: 11, color: PALETTE.muted }}>{c.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Bugungi Faoliyat" />
          {[
            { icon: "📋", bg: PALETTE.violetUltra, text: "Asilbek Toshmatov – sessiya yakunlandi", time: "09:30" },
            { icon: "⚠️", bg: "#FEE2E2", text: "Zulfiya Rahimova – yuqori risk aniqlandi", time: "10:15" },
            { icon: "✅", bg: "#D1FAE5", text: "Malika Ergasheva – PHQ-9 test: 3/27", time: "11:00" },
            { icon: "💬", bg: "#DBEAFE", text: "Bobur Qodirov – xabar yubordi", time: "11:45" },
            { icon: "🏆", bg: "#FEF3C7", text: "Sarvinoz – breathing challenge yakunladi", time: "12:30" },
            { icon: "📊", bg: PALETTE.violetUltra, text: "Haftalik stress tahlili yangilandi", time: "13:00" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 5 ? `1px solid rgba(229,231,235,.5)` : "none" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: 12, flex: 1 }}>{f.text}</span>
              <span style={{ fontSize: 10.5, color: PALETTE.muted, flexShrink: 0 }}>{f.time}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ─── CLIENTS VIEW ─────────────────────────────────────────────────────────────
const ClientsView = ({ clients, onSelectClient, selectedClient }) => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? clients : clients.filter(c => c.risk === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {[["all", "Barchasi"], ["high", "Yuqori Risk"], ["medium", "O'rta"], ["low", "Past Risk"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding: "7px 18px", borderRadius: 24, border: `1px solid ${filter === k ? PALETTE.violet : PALETTE.border}`, background: filter === k ? PALETTE.violet : "#fff", color: filter === k ? "#fff" : PALETTE.muted, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: ".2s" }}>{l}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: PALETTE.muted, alignSelf: "center" }}>{filtered.length} ta mijoz</span>
      </div>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["#", "Mijoz", "Yosh", "Risk", "Kayfiyat", "Stress", "Sessiya", "Faollik", ""].map(h => (
              <th key={h} style={{ fontSize: 10, fontWeight: 600, color: PALETTE.muted, textTransform: "uppercase", letterSpacing: ".7px", padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${PALETTE.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} onClick={() => onSelectClient(c)}
                style={{ cursor: "pointer", transition: ".15s", background: selectedClient?.id === c.id ? PALETTE.violetUltra : "" }}
                onMouseEnter={e => { if (selectedClient?.id !== c.id) e.currentTarget.querySelectorAll("td").forEach(td => td.style.background = PALETTE.bg); }}
                onMouseLeave={e => { if (selectedClient?.id !== c.id) e.currentTarget.querySelectorAll("td").forEach(td => td.style.background = ""); }}>
                <td style={{ padding: "10px 12px", fontSize: 11, color: PALETTE.muted }}>{String(i + 1).padStart(2, "0")}</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: c.color + "22", color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.initials}</div>
                    <div><div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 11, color: PALETTE.muted }}>{c.diagnos}</div></div>
                  </div>
                </td>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{c.age}</td>
                <td style={{ padding: "10px 12px" }}><RiskBadge level={c.risk} /></td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 55, height: 5, background: PALETTE.border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${c.mood}%`, height: "100%", background: c.mood > 60 ? PALETTE.green : c.mood > 40 ? PALETTE.amber : PALETTE.red, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: PALETTE.muted }}>{c.mood}%</span>
                  </div>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 55, height: 5, background: PALETTE.border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${c.stress}%`, height: "100%", background: c.stress > 70 ? PALETTE.red : c.stress > 50 ? PALETTE.amber : PALETTE.green, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: PALETTE.muted }}>{c.stress}%</span>
                  </div>
                </td>
                <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: PALETTE.violet }}>{c.sessions}</td>
                <td style={{ padding: "10px 12px", fontSize: 11, color: PALETTE.muted }}>{c.lastActive}</td>
                <td style={{ padding: "10px 12px" }}>
                  <button onClick={e => { e.stopPropagation(); onSelectClient(c); }} style={{ padding: "4px 12px", background: PALETTE.violetUltra, color: PALETTE.violet, border: `1px solid ${PALETTE.violetLight}`, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Ko'rish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Client Detail */}
      {selectedClient && <ClientDetail client={selectedClient} />}
    </div>
  );
};

// ─── CLIENT DETAIL ────────────────────────────────────────────────────────────
const ClientDetail = ({ client: c }) => {
  const moodHistory = generateMoodHistory(c.mood);
  const timeline = [
    { dot: c.color, event: "Sessiya o'tkazildi – 50 daqiqa", time: "Bugun, 10:00", tag: "📋 Sessiya" },
    { dot: PALETTE.green, event: `PHQ-9 test topshirildi – ball: ${c.phq9}/27`, time: "Kecha, 19:30", tag: "📊 Test" },
    { dot: PALETTE.blue, event: "Breathing exercise bajarildi", time: "2 kun oldin", tag: "🧘 Trening" },
    { dot: PALETTE.amber, event: "Stress darajasi o'lchandi", time: "3 kun oldin", tag: "📈 Monitoring" },
    { dot: c.risk === "high" ? PALETTE.red : PALETTE.green, event: `Risk bahosi yangilandi: ${c.risk === "high" ? "Yuqori" : c.risk === "medium" ? "O'rta" : "Past"}`, time: "4 kun oldin", tag: "⚠️ Risk" },
  ];
  const recs = c.risk === "high"
    ? [{ i: "🧘", n: "Nafas mashqlari", d: "4-7-8 texnikasi – hoziroq" }, { i: "💊", n: "Psixiatr konsultatsiya", d: "Tezkor yonaltirish kerak" }, { i: "📞", n: "Krizis sessiya", d: "Bugun bog'lanish zarur" }]
    : [{ i: "📓", n: "Kundalik yuritish", d: "Har kuni 5 daqiqa" }, { i: "🏃", n: "Jismoniy faollik", d: "30 daqiqa yurish" }, { i: "🎯", n: "Maqsad belgilash", d: "Haftalik mini-maqsadlar" }];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <Card>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid ${PALETTE.border}` }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: c.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: c.color }}>{c.initials}</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: PALETTE.muted, marginTop: 3 }}>{c.age} yosh · {c.diagnos} · <RiskBadge level={c.risk} /></div>
            <div style={{ fontSize: 11, color: PALETTE.muted, marginTop: 2 }}>{c.notes}</div>
          </div>
          <div style={{ display: "flex", gap: 20, marginLeft: "auto" }}>
            {[["Sessiyalar", c.sessions, PALETTE.violet], ["Kayfiyat", c.mood + "%", c.mood > 60 ? PALETTE.green : c.mood > 40 ? PALETTE.amber : PALETTE.red], ["Stress", c.stress + "%", c.stress > 70 ? PALETTE.red : PALETTE.amber]].map(([l, v, col]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: col }}>{v}</div>
                <div style={{ fontSize: 10, color: PALETTE.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 20 }}>
          {/* Mood chart */}
          <div>
            <SectionTitle>Kayfiyat Tarixi (14 kun)</SectionTitle>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={moodHistory}>
                <defs>
                  <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={c.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                <Area type="monotone" dataKey="mood" name="Kayfiyat" stroke={c.color} fill="url(#gm)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="stress" name="Stress" stroke={PALETTE.violet} fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Timeline */}
          <div>
            <SectionTitle>Voqealar Tarixchasi</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {timeline.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.dot, flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{t.event}</div>
                    <div style={{ fontSize: 10.5, color: PALETTE.muted }}>{t.time}</div>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: t.dot + "22", color: t.dot, display: "inline-block", marginTop: 3 }}>{t.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <SectionTitle>Tavsiyalar</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recs.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: PALETTE.bg, borderRadius: 10, border: `1px solid ${PALETTE.border}`, cursor: "pointer", transition: ".2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = PALETTE.violetLight; e.currentTarget.style.background = PALETTE.violetUltra; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = PALETTE.border; e.currentTarget.style.background = PALETTE.bg; }}>
                  <span style={{ fontSize: 18 }}>{r.i}</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.n}</div>
                    <div style={{ fontSize: 10.5, color: PALETTE.muted }}>{r.d}</div>
                  </div>
                  <span style={{ marginLeft: "auto", color: PALETTE.muted }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat + AI */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
          <div>
            <SectionTitle>Suhbat Ko'rinishi</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 160, overflowY: "auto" }}>
              {[
                { from: "client", text: "Kecha uxlay olmadim, ko'p o'ylayapman..." },
                { from: "psych", text: "Tushunaman. Nafas mashqini sinab ko'rdingizmi?" },
                { from: "client", text: "Ha, biroz yordam berdi. Lekin ertasi kuni yana xuddi shunday..." },
                { from: "psych", text: "Yaxshi boshladingiz. Ertaga batafsil gaplashamiz, hozircha shu mashqni davom eting." },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.from === "psych" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: m.from === "client" ? "4px 12px 12px 12px" : "12px 4px 12px 12px", background: m.from === "psych" ? `linear-gradient(135deg, ${PALETTE.violet}, #9333EA)` : PALETTE.bg, color: m.from === "psych" ? "#fff" : PALETTE.dark, fontSize: 12.5, lineHeight: 1.5, border: m.from === "client" ? `1px solid ${PALETTE.border}` : "none" }}>
                    {m.text}
                    <div style={{ fontSize: 10, opacity: .6, marginTop: 3 }}>{m.from === "client" ? "Mijoz" : "Dr. Karimova"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle>AI Psixologik Tahlil</SectionTitle>
            <AISummary
              prompt={`Siz klinikalik psixolog asistenisiz. ${c.name} (${c.age} yosh) haqida qisqa (3-4 jumla) psixologik tahlil yozing. O'zbek tilida. Tashxis: ${c.diagnos}. Risk: ${c.risk}. Kayfiyat: ${c.mood}%. Stress: ${c.stress}%. PHQ-9: ${c.phq9}/27. GAD-7: ${c.gad7}/21. Eslatma: ${c.notes}. Faqat tahlil matni, boshqa hech narsa yozmang.`}
              deps={[c.id]}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── ANALYTICS VIEW ───────────────────────────────────────────────────────────
const AnalyticsView = ({ clients }) => {
  const [data30, setData30] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      day: `${i + 1}`,
      stress: 35 + Math.random() * 40,
      anxiety: 30 + Math.random() * 38,
      mood: 42 + Math.random() * 35,
    }))
  );

  const segData = [
    { age: "18-25", count: clients.filter(c => c.age < 26).length },
    { age: "26-35", count: clients.filter(c => c.age >= 26 && c.age < 36).length },
    { age: "36-45", count: clients.filter(c => c.age >= 36 && c.age < 46).length },
    { age: "46+", count: clients.filter(c => c.age >= 46).length },
  ];

  const stats = [
    ["Sessiya samaradorligi", "87%", PALETTE.green],
    ["O'rtacha sessiya", "52 daqiqa", PALETTE.violet],
    ["Risk kamayish", "23%", PALETTE.teal],
    ["Mijoz qoniqishi", "4.7 / 5", PALETTE.amber],
    ["Qaytib kelish %", "91%", PALETTE.violet],
    ["O'rtacha PHQ-9", Math.round(clients.reduce((s, c) => s + c.phq9, 0) / clients.length) + "/27", PALETTE.pink],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader title="Stress Dinamikasi – 30 kun" subtitle="Barcha faol mijozlar o'rtachasi"
            action={<ActionBtn onClick={() => setData30(Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}`, stress: 35 + Math.random() * 40, anxiety: 30 + Math.random() * 38, mood: 42 + Math.random() * 35 })))}>🔄</ActionBtn>} />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data30}>
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={4} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="stress" name="Stress" stroke={PALETTE.violet} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="anxiety" name="Tashvish" stroke={PALETTE.pink} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mood" name="Kayfiyat" stroke={PALETTE.green} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader title="Yosh Segmentatsiyasi" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segData}>
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" name="Mijozlar" radius={[8, 8, 0, 0]}>
                {segData.map((_, i) => <Cell key={i} fill={[PALETTE.violet, PALETTE.pink, PALETTE.blue, PALETTE.teal][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader title="Asosiy Ko'rsatkichlar" />
          {stats.map(([l, v, col]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${PALETTE.border}` }}>
              <span style={{ fontSize: 13, color: PALETTE.muted }}>{l}</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: col }}>{v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <CardHeader title="Oy bo'yicha Stress Taqsimoti" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[
                { name: "Past (0-30%)", value: clients.filter(c => c.stress < 30).length },
                { name: "O'rta (30-60%)", value: clients.filter(c => c.stress >= 30 && c.stress < 60).length },
                { name: "Yuqori (60%+)", value: clients.filter(c => c.stress >= 60).length },
              ]} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={4}>
                {[PALETTE.green, PALETTE.amber, PALETTE.red].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ─── PSYCHOPROFILE VIEW ───────────────────────────────────────────────────────
const PsychoprofileView = ({ clients }) => {
  const [selId, setSelId] = useState(clients[0]?.id);
  const c = clients.find(x => x.id === selId) || clients[0];
  const radarData = [
    { trait: "Tashvish", value: c.anxiety },
    { trait: "Stress", value: c.stress },
    { trait: "Motivatsiya", value: c.motivation },
    { trait: "Ijtimoiylik", value: c.social },
    { trait: "Bardoshlilik", value: c.resilience },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Client selector */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {clients.map(cl => (
          <button key={cl.id} onClick={() => setSelId(cl.id)} style={{ padding: "7px 16px", borderRadius: 24, border: `1px solid ${selId === cl.id ? PALETTE.violet : PALETTE.border}`, background: selId === cl.id ? PALETTE.violet : "#fff", color: selId === cl.id ? "#fff" : PALETTE.muted, fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: ".2s" }}>
            {cl.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Radar */}
        <Card>
          <CardHeader title="Shaxsiyat Radari" subtitle={c.name} />
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={PALETTE.border} />
              <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11 }} />
              <Radar name={c.name} dataKey="value" stroke={PALETTE.violet} fill={PALETTE.violet} fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Progress bars */}
        <Card>
          <CardHeader title="Psixologik Ko'rsatkichlar" />
          <ProgressBar label="Tashvish darajasi" value={c.anxiety} color={c.anxiety > 70 ? PALETTE.red : PALETTE.amber} />
          <ProgressBar label="Stress indeksi" value={c.stress} color={c.stress > 70 ? PALETTE.red : PALETTE.amber} />
          <ProgressBar label="Motivatsiya" value={c.motivation} color={PALETTE.green} />
          <ProgressBar label="Ijtimoiy faollik" value={c.social} color={PALETTE.blue} />
          <ProgressBar label="Bardoshlilik" value={c.resilience} color={PALETTE.violet} />
        </Card>

        {/* Test results */}
        <Card>
          <CardHeader title="Test Natijalari" />
          {[
            { name: "PHQ-9 (Depressiya)", score: c.phq9, max: 27, color: c.phq9 > 14 ? PALETTE.red : c.phq9 > 9 ? PALETTE.amber : PALETTE.green },
            { name: "GAD-7 (Tashvish)", score: c.gad7, max: 21, color: c.gad7 > 14 ? PALETTE.red : c.gad7 > 9 ? PALETTE.amber : PALETTE.green },
            { name: "PSS (Stress)", score: c.pss, max: 40, color: c.pss > 26 ? PALETTE.red : c.pss > 13 ? PALETTE.amber : PALETTE.green },
          ].map((t, i) => (
            <div key={i} style={{ marginBottom: 14, background: PALETTE.bg, borderRadius: 12, padding: "10px 14px", border: `1px solid ${PALETTE.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>{t.name}</span>
                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: t.color }}>{t.score}<span style={{ fontSize: 10, fontWeight: 400 }}>/{t.max}</span></span>
              </div>
              <div style={{ height: 6, background: PALETTE.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${Math.round(t.score / t.max * 100)}%`, height: "100%", background: t.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* AI full profile */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader title="AI Psixologik Xulosa" action={<span style={{ fontSize: 11, color: PALETTE.muted }}>Jonli yangilanadi</span>} />
          <AISummary
            prompt={`Siz tajribali klinikalik psixologsiz. ${c.name} (${c.age} yosh) uchun to'liq psixologik profil tahlilini O'zbek tilida yozing (5-6 jumla). Tashxis: ${c.diagnos}. Risk: ${c.risk}. Tashvish: ${c.anxiety}%, Stress: ${c.stress}%, Motivatsiya: ${c.motivation}%, Ijtimoiylik: ${c.social}%, Bardoshlilik: ${c.resilience}%. PHQ-9: ${c.phq9}/27, GAD-7: ${c.gad7}/21, PSS: ${c.pss}/40. ${c.notes}. Terapevtik yondashuv va ustuvorliklarni ham belgilang. Faqat tahlil matni yozing.`}
            deps={[c.id]}
          />
        </Card>
        <Card>
          <CardHeader title="Kayfiyat Grafigi – 14 kun" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={generateMoodHistory(c.mood)}>
              <defs>
                <linearGradient id="gProf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.violet} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={PALETTE.violet} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
              <Area type="monotone" dataKey="mood" name="Kayfiyat" stroke={PALETTE.violet} fill="url(#gProf)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ─── RISK VIEW ────────────────────────────────────────────────────────────────
const RiskView = ({ clients, onSelectClient }) => {
  const high = clients.filter(c => c.risk === "high");
  const med = clients.filter(c => c.risk === "medium");
  const low = clients.filter(c => c.risk === "low");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <KpiCard icon="🔴" label="Yuqori Risk" value={high.length} change="Tezkor e'tibor" changeType="warn" accent={PALETTE.red} />
        <KpiCard icon="🟡" label="O'rta Risk" value={med.length} change="Kuzatuv tavsiya" changeType="warn" accent={PALETTE.amber} />
        <KpiCard icon="🟢" label="Past Risk" value={low.length} change="Barqaror holat" changeType="up" accent={PALETTE.green} />
        <KpiCard icon="📋" label="Jami Tekshirildi" value={clients.length} change="Bugun yangilandi" changeType="up" accent={PALETTE.blue} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHeader title="🚨 Yuqori Risk Mijozlar" subtitle="Tezkor psixologik yordam talab etadilar" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {high.map(c => (
              <div key={c.id} onClick={() => onSelectClient(c)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFF5F5", borderRadius: 12, border: `1px solid #FEE2E2`, cursor: "pointer", transition: ".2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = PALETTE.red}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#FEE2E2"}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "#FEE2E2", color: PALETTE.red, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{c.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: PALETTE.muted }}>{c.diagnos} · {c.lastActive}</div>
                  <div style={{ fontSize: 11, color: PALETTE.red, marginTop: 2 }}>PHQ-9: {c.phq9}/27 · Stress: {c.stress}%</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: PALETTE.red }}>{c.mood}%</div>
                  <div style={{ fontSize: 10, color: PALETTE.muted }}>Kayfiyat</div>
                </div>
                <span style={{ color: PALETTE.red, fontSize: 16 }}>→</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Risk Tahlili – AI" action={<ActionBtn onClick={() => {}}>🤖 Yangilash</ActionBtn>} />
          <AISummary
            prompt={`Siz psixiatriya mutaxassisisiz. Quyidagi yuqori risk mijozlarni tahlil qiling va O'zbek tilida (4-5 jumla) tezkor tavsiyalar bering: ${high.map(c => `${c.name}: ${c.diagnos}, kayfiyat ${c.mood}%, stress ${c.stress}%, PHQ-9: ${c.phq9}/27. ${c.notes}`).join(". ")}. Psixolog uchun aniq amaliy harakatlar tavsiya eting.`}
            deps={[high.map(c => c.id).join(",")]}
          />
          <div style={{ marginTop: 16 }}>
            <SectionTitle>O'rta Risk Kuzatuvi</SectionTitle>
            {med.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${PALETTE.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#FEF3C7", color: PALETTE.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{c.initials}</div>
                <span style={{ fontSize: 13, flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: PALETTE.muted }}>{c.diagnos}</span>
                <RiskBadge level="medium" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PsychologistDashboard() {
  const [view, setView] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState(CLIENTS_DATA);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true); 

  // Live update every 45s
  useEffect(() => {
    getClients()
      .then(res => {
        const mapped = res.data.map(c => ({
          id: c.id,
          name: c.full_name || "Noma'lum",
          age: c.age || 0,
          risk: c.risk_level || "low",
          mood: c.mood_score || 70,
          stress: c.stress_score || 40,
          anxiety: c.anxiety_score || 35,
          motivation: c.motivation_score || 65,
          social: c.social_score || 60,
          resilience: c.resilience_score || 70,
          sessions: c.sessions_count || 0,
          diagnos: c.diagnosis || "—",
          notes: c.notes || "",
          lastActive: c.created_at || "—",
          phq9: c.phq9 || 0,
          gad7: c.gad7 || 0,
          pss: c.pss || 0,
          initials: (c.full_name || "??").split(" ").map(n => n[0]).join("").slice(0, 2),
          color: c.risk_level === "high" ? "#EF4444" : c.risk_level === "medium" ? "#F59E0B" : "#10B981",
        }));
        setClients(mapped);
      })
      .catch(() => setClients(CLIENTS_DATA)) // ← xato bo'lsa fake data
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ fontSize: 18, color: "#7C3AED" }}>⏳ Yuklanmoqda...</div>
    </div>
  );

  const filteredClients = search
    ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.diagnos.toLowerCase().includes(search.toLowerCase()))
    : clients;

  const handleSelectClient = (c) => {
    setSelectedClient(c);
    setView("clients");
  };

  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "clients", icon: "👥", label: "Mijozlar", badge: clients.filter(c => c.risk === "high").length },
    { id: "analytics", icon: "📈", label: "Tahlil" },
    { id: "psychoprofile", icon: "🔮", label: "Psixoprofil" },
    { id: "risk", icon: "⚠️", label: "Risk Monitor", badge: clients.filter(c => c.risk === "high").length },
    { id: "settings", icon: "⚙️", label: "Sozlamalar" },
  ];

  const pageTitles = { dashboard: "Dashboard", clients: "Mijozlar", analytics: "Tahlil", psychoprofile: "Psixoprofil", risk: "Risk Monitor", settings: "Sozlamalar" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.3); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
      `}</style>
      <div style={{ display: "flex", height: "100vh", background: PALETTE.bg, fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>

        {/* SIDEBAR */}
        <aside style={{ width: 240, flexShrink: 0, background: PALETTE.dark, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,.4) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ padding: "26px 22px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${PALETTE.violet}, ${PALETTE.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-.5px" }}>MindAura</span>
          </div>
          <div style={{ padding: "6px 14px 4px", fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 6 }}>Asosiy</div>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setView(n.id)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 18px", margin: "2px 8px", borderRadius: 12, cursor: "pointer", transition: ".2s", color: view === n.id ? "#fff" : "rgba(255,255,255,.5)", fontWeight: 500, fontSize: 13.5, background: view === n.id ? "linear-gradient(135deg,rgba(124,58,237,.7),rgba(236,72,153,.3))" : "transparent", boxShadow: view === n.id ? "0 4px 16px rgba(124,58,237,.3)" : "none" }}
              onMouseEnter={e => { if (view !== n.id) e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { if (view !== n.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; } }}>
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{n.icon}</span>
              {n.label}
              {n.badge > 0 && <span style={{ marginLeft: "auto", background: PALETTE.pink, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>{n.badge}</span>}
            </div>
          ))}
          <div style={{ marginTop: "auto", padding: 14 }}>
            <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${PALETTE.violetLight}, ${PALETTE.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👩‍⚕️</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>Dr. Aziza Karimova</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Klinikalik psixolog</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* TOPBAR */}
          <div style={{ height: 62, background: "#fff", borderBottom: `1px solid ${PALETTE.border}`, display: "flex", alignItems: "center", padding: "0 26px", gap: 14, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: PALETTE.dark }}>{pageTitles[view]}</span>
            <div style={{ flex: 1, maxWidth: 340, marginLeft: 20, position: "relative" }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: PALETTE.muted }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mijoz yoki tashxis qidirish..." style={{ width: "100%", padding: "8px 14px 8px 34px", border: `1px solid ${PALETTE.border}`, borderRadius: 24, fontSize: 12.5, background: PALETTE.bg, outline: "none", fontFamily: "inherit", color: PALETTE.dark }} onFocus={e => e.target.style.borderColor = PALETTE.violetLight} onBlur={e => e.target.style.borderColor = PALETTE.border} />
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#D1FAE5", color: "#059669", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: ".8px" }}>
                <div style={{ width: 5, height: 5, background: "#059669", borderRadius: "50%", animation: "pulse 1s infinite" }} />JONLI
              </div>
              {[["🔔", () => {}], ["⚙️", () => setView("settings")]].map(([icon, fn], i) => (
                <div key={i} onClick={fn} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${PALETTE.border}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, transition: ".2s", position: "relative" }}
                  onMouseEnter={e => e.currentTarget.style.background = PALETTE.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  {icon}
                  {icon === "🔔" && <div style={{ position: "absolute", top: 7, right: 7, width: 6, height: 6, background: PALETTE.pink, borderRadius: "50%", border: "2px solid #fff" }} />}
                </div>
              ))}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${PALETTE.violet}, ${PALETTE.pink})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15 }}>👩‍⚕️</div>
            </div>
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }} key={view}>
            {view === "dashboard" && <DashboardView clients={filteredClients} onSelectClient={handleSelectClient} />}
            {view === "clients" && <ClientsView clients={filteredClients} onSelectClient={setSelectedClient} selectedClient={selectedClient} />}
            {view === "analytics" && <AnalyticsView clients={clients} />}
            {view === "psychoprofile" && <PsychoprofileView clients={clients} />}
            {view === "risk" && <RiskView clients={filteredClients} onSelectClient={handleSelectClient} />}
            {view === "settings" && (
              <Card style={{ maxWidth: 600 }}>
                <CardHeader title="⚙️ Profil Sozlamalari" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[["Ism Familiya", "Dr. Aziza Karimova", "text"], ["Mutaxassislik", "Klinikalik Psixolog", "text"], ["Email", "aziza@mindaura.uz", "email"], ["Sessiya davomiyligi (daqiqa)", "50", "number"]].map(([l, v, t]) => (
                    <div key={l}>
                      <label style={{ fontSize: 12, color: PALETTE.muted, display: "block", marginBottom: 4 }}>{l}</label>
                      <input type={t} defaultValue={v} style={{ width: "100%", padding: "9px 12px", border: `1px solid ${PALETTE.border}`, borderRadius: 10, fontFamily: "inherit", fontSize: 13, outline: "none" }} onFocus={e => e.target.style.borderColor = PALETTE.violetLight} onBlur={e => e.target.style.borderColor = PALETTE.border} />
                    </div>
                  ))}
                </div>
                <button style={{ marginTop: 18, padding: "10px 24px", background: `linear-gradient(135deg, ${PALETTE.violet}, #9333EA)`, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Saqlash</button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
