import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import "./Profile.css";

const BACKEND = "https://mindaura-backend-4.onrender.com";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path) {
  try {
    const res = await fetch(`${BACKEND}${path}`, { headers: authHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── LEVEL PROGRESS ────────────────────────────────────
const LEVEL_THRESHOLDS = [0, 100, 300, 700, 1500, 3000, 6000, 10000];
function getLevelProgress(points, level) {
  const cur = LEVEL_THRESHOLDS[level - 1] || 0;
  const next = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const pct = Math.min(100, Math.round(((points - cur) / (next - cur)) * 100));
  return { pct, next, cur };
}

// ── EDIT MODAL ────────────────────────────────────────
function EditModal({ field, value, onClose, onSave }) {
  const [val, setVal] = useState(value || "");
  const labels = { full_name: "To'liq ism", username: "Username", password: "Yangi parol" };
  return (
    <div className="pr-overlay" onClick={onClose}>
      <div className="pr-modal" onClick={e => e.stopPropagation()}>
        <div className="pr-modal-head">
          <span>{labels[field] || field} ni tahrirlash</span>
          <button onClick={onClose}>✕</button>
        </div>
        <input
          className="pr-modal-input"
          type={field === "password" ? "password" : "text"}
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder={labels[field]}
          autoFocus
        />
        <div className="pr-modal-btns">
          <button className="pr-modal-cancel" onClick={onClose}>Bekor</button>
          <button className="pr-modal-save" onClick={() => onSave(field, val)}>Saqlash</button>
        </div>
      </div>
    </div>
  );
}

// ── WEEKLY CHART ──────────────────────────────────────
function WeeklyChart({ data }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.completed), 1);
  return (
    <div className="pr-chart">
      {data.map((d, i) => (
        <div key={i} className="pr-chart-col">
          <div className="pr-chart-bar-wrap">
            <div
              className="pr-chart-bar"
              style={{ height: `${Math.round((d.completed / max) * 100)}%` }}
            />
          </div>
          <div className="pr-chart-label">{d.day}</div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN PROFILE ──────────────────────────────────────
export default function Profile() {
  const { user, loginUser } = useAuth();
  const [analytics, setAnalytics]   = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [tests, setTests]           = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [editField, setEditField]   = useState(null);
  const [saveMsg, setSaveMsg]       = useState("");
  const [activeTab, setActiveTab]   = useState("challenges");

  // ✅ Barcha ma'lumotlarni DB dan yuklaymiz
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      apiFetch("/progress/analytics"),
      apiFetch("/challenge-progress/my"),
      apiFetch("/test-results/"),
      apiFetch("/achievements/my"),
      apiFetch("/progress/streak"),
    ]).then(([ana, ch, ts, ach, str]) => {
      setAnalytics(ana);
      setChallenges(ch || []);
      setTests(ts || []);
      setAchievements(ach || []);
      setStreak(str);
      setLoading(false);
    });
  }, [user]);

  // ✅ Profil ma'lumotlarini tahrirlash
  const handleSave = async (field, value) => {
    if (!value.trim()) return;
    try {
      const body = { [field]: value };
      const res = await fetch(`${BACKEND}/auth/update`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        loginUser(
          { access_token: localStorage.getItem("access_token"), refresh_token: localStorage.getItem("refresh_token") },
          updated
        );
        setSaveMsg("Saqlandi ✓");
        setTimeout(() => setSaveMsg(""), 2000);
      }
    } catch {}
    setEditField(null);
  };

  if (!user) return (
    <div className="pr-empty">
      <div className="pr-empty-icon">👤</div>
      <p>Profilni ko'rish uchun tizimga kiring</p>
    </div>
  );

  if (loading) return (
    <div className="pr-loading">
      <div className="pr-spinner" />
      <p>Ma'lumotlar yuklanmoqda...</p>
    </div>
  );

  const levelInfo   = getLevelProgress(user.total_points || 0, user.level || 1);
  const initials    = (user.full_name || user.username || "?").slice(0, 2).toUpperCase();
  const totalDays   = analytics?.total_days_completed || 0;
  const curStreak   = streak?.current_streak || analytics?.current_streak || 0;
  const totalTests  = tests.length;
  const activeCh    = challenges.filter(c => c.status !== "completed").length;

  // Challenge progress dan unique challengelar
  const uniqueChallenges = [];
  const seen = new Set();
  challenges.forEach(c => {
    if (!seen.has(c.challenge_id)) {
      seen.add(c.challenge_id);
      uniqueChallenges.push(c);
    }
  });

  return (
    <div className="pr-page">

      {/* ── HERO CARD ── */}
      <div className="pr-hero">
        <div className="pr-avatar-wrap">
          <div className="pr-avatar">{initials}</div>
          <div className="pr-avatar-dot" />
        </div>
        <div className="pr-hero-info">
          <div className="pr-hero-name">{user.full_name || user.username}</div>
          <div className="pr-hero-sub">@{user.username} · {user.email}</div>
          <div className="pr-level-row">
            <span className="pr-level-pill">
              ⭐ {user.level || 1}-daraja
            </span>
            <span className="pr-points">{user.total_points || 0} ball</span>
          </div>
          <div className="pr-level-bar-wrap">
            <div className="pr-level-bar">
              <div className="pr-level-fill" style={{ width: `${levelInfo.pct}%` }} />
            </div>
            <span className="pr-level-next">{levelInfo.pct}% → {user.level + 1 || 2}-daraja</span>
          </div>
        </div>
        {saveMsg && <div className="pr-save-msg">{saveMsg}</div>}
      </div>

      {/* ── STATS ── */}
      <div className="pr-stats">
        <div className="pr-stat">
          <div className="pr-stat-icon" style={{ background: "#ede9fe" }}>🔥</div>
          <div className="pr-stat-val">{curStreak}</div>
          <div className="pr-stat-label">Streak</div>
        </div>
        <div className="pr-stat">
          <div className="pr-stat-icon" style={{ background: "#e6f8f0" }}>📅</div>
          <div className="pr-stat-val">{totalDays}</div>
          <div className="pr-stat-label">Jami kun</div>
        </div>
        <div className="pr-stat">
          <div className="pr-stat-icon" style={{ background: "#fff5e6" }}>🏆</div>
          <div className="pr-stat-val">{activeCh}</div>
          <div className="pr-stat-label">Faol challenge</div>
        </div>
        <div className="pr-stat">
          <div className="pr-stat-icon" style={{ background: "#fdf2f8" }}>📝</div>
          <div className="pr-stat-val">{totalTests}</div>
          <div className="pr-stat-label">Test</div>
        </div>
      </div>

      {/* ── HAFTALIK FAOLLIK ── */}
      {analytics?.weekly_data && (
        <div className="pr-section">
          <div className="pr-section-head">
            <span className="pr-section-title">Haftalik faollik</span>
            <span className="pr-section-sub">{analytics.completion_rate || 0}% bajarildi</span>
          </div>
          <WeeklyChart data={analytics.weekly_data} />
          <div className="pr-analytics-row">
            <div className="pr-ana-item">
              <span className="pr-ana-val">{analytics.total_challenges || 0}</span>
              <span className="pr-ana-label">Jami challenge</span>
            </div>
            <div className="pr-ana-item">
              <span className="pr-ana-val">{analytics.completed_challenges || 0}</span>
              <span className="pr-ana-label">Tugatilgan</span>
            </div>
            <div className="pr-ana-item">
              <span className="pr-ana-val">{analytics.completion_rate || 0}%</span>
              <span className="pr-ana-label">Natija</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SHAXSIY MA'LUMOTLAR ── */}
      <div className="pr-section">
        <div className="pr-section-head">
          <span className="pr-section-title">Shaxsiy ma'lumotlar</span>
        </div>
        {[
          { key: "full_name",  label: "To'liq ism",  val: user.full_name || "—" },
          { key: "username",   label: "Username",     val: user.username },
          { key: "email",      label: "Email",        val: user.email,  noEdit: true },
          { key: "password",   label: "Parol",        val: "••••••••" },
        ].map(f => (
          <div key={f.key} className="pr-field-row">
            <div>
              <div className="pr-field-label">{f.label}</div>
              <div className="pr-field-val">{f.val}</div>
            </div>
            {!f.noEdit && (
              <button className="pr-edit-btn" onClick={() => setEditField(f.key)}>
                Tahrirlash
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── TABS: CHALLENGE / TEST / YUTUQ ── */}
      <div className="pr-section">
        <div className="pr-tabs">
          {[["challenges","Challengelar"],["tests","Testlar"],["badges","Yutuqlar"]].map(([k,l]) => (
            <button
              key={k}
              className={`pr-tab ${activeTab === k ? "active" : ""}`}
              onClick={() => setActiveTab(k)}
            >{l}</button>
          ))}
        </div>

        {/* CHALLENGELAR */}
        {activeTab === "challenges" && (
          <div className="pr-tab-body">
            {uniqueChallenges.length === 0 ? (
              <div className="pr-empty-tab">Hali challenge bajarilmagan</div>
            ) : uniqueChallenges.slice(0, 8).map((c, i) => {
              const maxDay = challenges
                .filter(x => x.challenge_id === c.challenge_id)
                .reduce((a, b) => Math.max(a, b.day_number || 0), 0);
              const pct = Math.min(100, Math.round((maxDay / 30) * 100));
              return (
                <div key={i} className="pr-ch-row">
                  <div className="pr-ch-icon">🏃</div>
                  <div className="pr-ch-info">
                    <div className="pr-ch-name">{c.challenge_title}</div>
                    <div className="pr-ch-bar-wrap">
                      <div className="pr-ch-bar">
                        <div className="pr-ch-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="pr-ch-pct">{pct}%</span>
                    </div>
                  </div>
                  <div className="pr-ch-day">{maxDay}-kun</div>
                </div>
              );
            })}
          </div>
        )}

        {/* TESTLAR */}
        {activeTab === "tests" && (
          <div className="pr-tab-body">
            {tests.length === 0 ? (
              <div className="pr-empty-tab">Hali test o'tilmagan</div>
            ) : tests.slice(0, 10).map((t, i) => {
              const colors = {
                good:   { bg: "#e6f8f0", color: "#0d7a50" },
                medium: { bg: "#fff5e6", color: "#b45309" },
                high:   { bg: "#fee2e2", color: "#b91c1c" },
                default:{ bg: "#ede9fe", color: "#6C5CE7" },
              };
              const label = t.result_label?.toLowerCase() || "";
              const c = label.includes("past") || label.includes("yaxshi") || label.includes("past")
                ? colors.good
                : label.includes("o'rta") || label.includes("orta")
                ? colors.medium
                : label.includes("yuqori") || label.includes("baland")
                ? colors.high
                : colors.default;
              const date = t.created_at
                ? new Date(t.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" })
                : "";
              return (
                <div key={i} className="pr-test-row">
                  <div className="pr-test-info">
                    <div className="pr-test-name">{t.test_name}</div>
                    <div className="pr-test-date">{date}</div>
                  </div>
                  <span className="pr-test-badge" style={{ background: c.bg, color: c.color }}>
                    {t.result_label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* YUTUQLAR */}
        {activeTab === "badges" && (
          <div className="pr-tab-body">
            {achievements.length === 0 ? (
              <div className="pr-empty-tab">Hali yutuq qo'lga kiritilmagan</div>
            ) : (
              <div className="pr-badge-grid">
                {achievements.map((a, i) => (
                  <div key={i} className="pr-badge-item">
                    <div className="pr-badge-circle earned">
                      {a.achievement?.badge_icon || "🏅"}
                    </div>
                    <div className="pr-badge-name">{a.achievement?.name}</div>
                    <div className="pr-badge-pts">+{a.achievement?.points} ball</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editField && (
        <EditModal
          field={editField}
          value={editField === "password" ? "" : user[editField] || ""}
          onClose={() => setEditField(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
