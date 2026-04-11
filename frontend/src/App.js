import React, { useState } from "react";
import "./App.css";
import Chatbot from "./Chatbot";
import Psychologists from "./Psychologists";
import Challenge from "./Challenge";
import Login from "./Login";
import Tests from "./Tests";
import { useAuth } from "./AuthContext";
import logo from './logo1.webp';
import Exercises from "./Exercises";
import Trainings from "./Trainings";
import AdminApp from "./AdminApp";
import Library from "./Library";
import Profile from './Profile';
import PsychologistDashboard from './components/psychologist/PsychologistDashboard';
import { login } from './api';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Psixolog paneli */}
        <Route
          path="/psychologist"
          element={
            <ProtectedRoute role="psychologist">
              <PsychologistDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
function Navbar({ page, setPage, onLoginClick }) {
  const [open, setOpen] = useState(false);
  const { user, logoutUser } = useAuth();

  const links = [
    { label: "Bosh sahifa", key: "home" },
    { label: "AI Chatbot", key: "chatbot" },
    { label: "Challenge", key: "challenge" },
    { label: "Psixologlar", key: "psychologists" },
    { label: "Testlar", key: "tests" },
    { label: "Mashqlar", key: "exercises" },
    { label: "Treninglar", key: "trainings" },
    { label: "Kutubxona", key: "library" },
  ];

  const handleLogout = () => {
    logoutUser();
    setPage("home");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
        <img
          src={logo}
          alt="MindAura"
          style={{
            height: 42, width: 42,
            objectFit: "cover",
            borderRadius: "50%",
            marginRight: 8,
            verticalAlign: "middle"
          }}
        />
        <span style={{ verticalAlign: "middle" }}>MindAura</span>
      </div>
      <ul className={`nav-links ${open ? "open" : ""}`}>
        {links.map(l => (
          <li key={l.key}>
            <a href="/"
              onClick={e => { e.preventDefault(); setPage(l.key); setOpen(false); }}
              className={page === l.key ? "active-link" : ""}
            >{l.label}</a>
          </li>
        ))}
        <li>
          {user ? (
            <div className="nav-user">
              <button 
                className="nav-btn nav-btn-outline" 
                onClick={() => setPage("profile")}
              >
                👤 {user.username}
              </button>
              <button className="nav-btn nav-btn-outline" onClick={handleLogout}>Chiqish</button>
            </div>
          ) : (
            <button className="nav-btn" onClick={onLoginClick}>Kirish</button>
          )}
        </li>
        <li>
          <button className="nav-btn-admin"
            onClick={() => { window.location.hash = "admin"; window.location.reload(); }}
            title="Admin panel">⚙</button>
        </li>
      </ul>
      <div className="burger" onClick={() => setOpen(!open)}>☰</div>
    </nav>
  );
}


function Hero({ setPage, onLoginClick }) {
  const { user } = useAuth();
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-badge">24/7 Online Yordam</span>
        <h1>Yolg'izlikda<br /><span className="accent">yolg'iz emassan</span></h1>
        <p>O'zbekistondagi birinchi professional psixologik yordam platformasi. Mutaxassis psixologlar bilan istalgan vaqt bog'laning.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => setPage("psychologists")}>Psixolog toping →</button>
          <button className="btn-secondary" onClick={() => setPage("chatbot")}>AI bilan suhbat</button>
        </div>
        <div className="hero-stats">
          <div className="stat"><strong>500+</strong><span>Foydalanuvchi</span></div>
          <div className="stat"><strong>50+</strong><span>Psixolog</span></div>
          <div className="stat"><strong>24/7</strong><span>Xizmat</span></div>
        </div>
      </div>
      <div className="hero-img">
        <div className="hero-card">
          <div className="hcard-top">
            <div className="avatar">👩‍⚕️</div>
            <div>
              <p className="hcard-name">Dr. Malika Yusupova</p>
              <p className="hcard-role">Klinik psixolog</p>
            </div>
            <span className="online-dot" />
          </div>
          <p className="hcard-msg">"Siz bilan birga har qanday muammoni hal qila olamiz."</p>
          {user ? (
            <button className="btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={() => setPage("chatbot")}>
              Seans boshlash
            </button>
          ) : (
            <button className="btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={onLoginClick}>
              Boshlash uchun kiring
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Services({ setPage }) {
  const items = [
    { icon: "💬", title: "AI Chatbot", desc: "Sun'iy intellekt bilan darhol suhbat boshlang", page: "chatbot" },
    { icon: "🏆", title: "Challenge", desc: "Shaxsiy rivojlanish challengelarini bajaring", page: "challenge" },
    { icon: "👨‍👩‍👧", title: "Oila psixologiyasi", desc: "Oila muammolari uchun maxsus mutaxassislar", page: "psychologists" },
    { icon: "🔒", title: "Anonimlik", desc: "Maxfiyligingiz to'liq himoyalangan", page: null },
  ];
  return (
    <section className="services">
      <h2>Bizning xizmatlar</h2>
      <p className="section-sub">O'zbekiston mentalitetiga moslashtirilgan professional yordam</p>
      <div className="services-grid">
        {items.map(s => (
          <div className="service-card" key={s.title}
            onClick={() => s.page && setPage(s.page)}
            style={{ cursor: s.page ? "pointer" : "default" }}>
            <span className="service-icon">{s.icon}</span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { num: "52%",  label: "Aholining psixologik muammolarga duch kelishi" },
    { num: "65%",  label: "Ruhiy muammolar bilan bog'liq hollar" },
    { num: "24/7", label: "Uzluksiz yordam xizmati" },
    { num: "100%", label: "Maxfiylik kafolati" },
  ];
  return (
    <section className="stats-section">
      <h2>Nima uchun MindAura?</h2>
      <div className="stats-grid">
        {items.map(s => (
          <div className="stat-block" key={s.label}>
            <strong>{s.num}</strong>
            <p>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="nav-logo">🧠 MindAura</div>
          <p style={{ marginTop: 8, color: "#a0aec0", fontSize: 14 }}>Yolg'izlikda yolg'iz emassan.</p>
        </div>
        <p style={{ color: "#718096", fontSize: 13 }}>© 2025 MindAura. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
}

export default function AppWrapper() {
  const [page, setPage] = useState("home");
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // ── ADMIN PANEL ──
  if (window.location.hash === "#admin" || page === "admin") {
    return <AdminApp onExit={() => { window.location.hash = ""; setPage("home"); }} />;
  }
  // YANGI (to'g'ri):
  if (window.location.hash === "#psychologist" || page === "psychologist") {
    return (
      <PsychologistLogin 
        onSuccess={() => { 
          window.location.hash = ""; 
          setPage("psychologist-dashboard"); 
        }} 
        onExit={() => { 
          window.location.hash = ""; 
          setPage("home"); 
        }} 
      />
    );
  }

  if (page === "psychologist-dashboard") {
    return <PsychologistDashboard onExit={() => setPage("home")} />;
  }

    const handleLoginSuccess = () => {
      setShowLogin(false);
      setPage("home");
    };

  if (showLogin) {
    return <Login onSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} />;
  }

  return (
    <div className="app">
      <Navbar page={page} setPage={setPage} onLoginClick={() => setShowLogin(true)} />
      {page === "home" && <>
        <Hero setPage={setPage} onLoginClick={() => setShowLogin(true)} />
        <Services setPage={setPage} />
        <Psychologists />
        <Stats />
        <Footer />
      </>}
      {page === "chatbot"       && <Chatbot />}
      {page === "challenge"     && <Challenge />}
      {page === "tests"         && <Tests />}
      {page === "exercises"     && <Exercises />}
      {page === "psychologists" && <><Psychologists /><Footer /></>}
      {page === "trainings"     && <Trainings />}
      {page === "library"       && <Library />}
      {page === "profile" && <Profile user={user} />}
      {page === "psychologist" && <PsychologistDashboard />}
    </div>
  );
}


function PsychologistLogin({ onSuccess, onExit }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email va parolni kiriting!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await login({ email, password });
      const { access_token, role } = res.data;

      if (role !== "psychologist" && role !== "admin") {
        setError("Sizda psixolog huquqi yo'q!");
        return;
      }

      localStorage.setItem("access_token", access_token);
      onSuccess();
    } catch (err) {
      setError("Email yoki parol noto'g'ri!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F8F7FF"
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 40,
        boxShadow: "0 8px 32px rgba(124,58,237,.12)",
        width: 360, border: "1px solid #E5E7EB"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40 }}>🧠</div>
          <h2 style={{ fontWeight: 800, color: "#0D0A1E", marginTop: 8 }}>
            Psixolog Paneli
          </h2>
          <p style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
            Faqat psixologlar uchun
          </p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="psixolog@mindaura.uz"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: "1px solid #E5E7EB", fontSize: 13, outline: "none",
              fontFamily: "inherit", boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 5 }}>
            Parol
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="••••••••"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: "1px solid #E5E7EB", fontSize: 13, outline: "none",
              fontFamily: "inherit", boxSizing: "border-box"
            }}
          />
        </div>

        {error && (
          <div style={{
            background: "#FEE2E2", color: "#DC2626", padding: "8px 12px",
            borderRadius: 8, fontSize: 12, marginBottom: 14, textAlign: "center"
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "11px", borderRadius: 10,
            background: loading ? "#9CA3AF" : "linear-gradient(135deg, #7C3AED, #9333EA)",
            color: "#fff", border: "none", fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            marginBottom: 10
          }}
        >
          {loading ? "Kirilmoqda..." : "Kirish →"}
        </button>

        <button
          onClick={onExit}
          style={{
            width: "100%", padding: "10px", borderRadius: 10,
            background: "transparent", color: "#6B7280",
            border: "1px solid #E5E7EB", fontSize: 13,
            cursor: "pointer", fontFamily: "inherit"
          }}
        >
          ← Orqaga
        </button>
      </div>
    </div>
  );
}