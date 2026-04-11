import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";
import { useAuth } from "./AuthContext";

const API_BASE = "https://mindaura-backend-4.onrender.com";

const QUICK_QUESTIONS = [
  "Stress bilan qanday kurashish mumkin?",
  "Depressiya alomatlari nima?",
  "Uxlay olmayman, nima qilsam bo'ladi?",
  "Oilaviy muammolarni qanday hal qilaman?",
  "O'zimga ishonchim yo'q, yordam bering",
  "Tashvish va xavotirni kamaytirish yo'llari",
];

const WELCOME_MESSAGE = {
  role: "assistant",
  content: `Assalomu alaykum! 👋 Men **Umid** — MindAura platformasining AI psixolog yordamchisiman.\n\nSizga quyidagi sohalarda yordam bera olaman:\n• 🧠 Stress va tashvish bilan ishlash\n• 💙 Kayfiyat va depressiya\n• 👨‍👩‍👧 Oila va munosabatlar\n• 😴 Uyqu muammolari\n• 💪 O'z-o'zini rivojlantirish\n\nBugun qanday yordam kerak?`,
};

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .split("\n")
    .map((line, i) => `<span key="${i}">${line}</span>`)
    .join("<br/>");
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`chat-msg ${isUser ? "chat-msg-user" : "chat-msg-ai"}`}>
      {!isUser && <div className="chat-avatar">🧠</div>}
      <div className={`chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-ai"}`}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} />
        )}
        {msg.sources && msg.sources.length > 0 && (
          <div className="chat-sources">📚 {msg.sources.join(", ")}</div>
        )}
      </div>
      {isUser && <div className="chat-avatar chat-avatar-user">👤</div>}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg-ai">
      <div className="chat-avatar">🧠</div>
      <div className="chat-bubble chat-bubble-ai">
        <div className="chat-typing"><span /><span /><span /></div>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const authHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // ✅ Sessiyalarni DBdan yukla
  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/sessions`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.log("Sessiyalar yuklanmadi:", e);
    } finally {
      setSessionsLoading(false);
    }
  };

  // ✅ Sessiya xabarlarini yukla
  const loadSessionMessages = async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE}/ai/sessions/${sessionId}/messages`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const msgs = data.map(m => ({ role: m.role, content: m.content }));
        setActiveMessages([WELCOME_MESSAGE, ...msgs]);
      }
    } catch (e) {
      console.log("Xabarlar yuklanmadi:", e);
    }
  };

  const handleSelectSession = async (id) => {
    setActiveId(id);
    setSidebarOpen(false);
    setError("");
    await loadSessionMessages(id);
  };

  const handleNewSession = () => {
    setActiveId(null);
    setActiveMessages([WELCOME_MESSAGE]);
    setSidebarOpen(false);
    setError("");
  };

  // ✅ Sessiyani o'chirish
  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/ai/sessions/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setSessions(prev => prev.filter(s => s.id !== id));
      if (id === activeId) handleNewSession();
    } catch (e) {
      console.log("O'chirishda xato:", e);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, loading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 130) + "px";
    }
  }, [input]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setError("");

    const userMsg = { role: "user", content: msg };
    setActiveMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = activeMessages
      .filter(m => m !== WELCOME_MESSAGE)
      .slice(-14)
      .map(m => ({ role: m.role, content: m.content }));

    const endpoint = user ? `${API_BASE}/ai/chat` : `${API_BASE}/ai/chat/anonymous`;
    const headers = authHeaders();

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: msg, history, session_id: activeId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Server xatosi");
      }

      const data = await res.json();
      const aiMsg = { role: "assistant", content: data.reply, sources: data.sources || [] };
      setActiveMessages(prev => [...prev, aiMsg]);

      // ✅ Yangi sessiya yaratilgan bo'lsa — ro'yxatni yangilash
      if (data.session_id && data.session_id !== activeId) {
        setActiveId(data.session_id);
        await loadSessions();
      }
    } catch (e) {
      const fallback = {
        role: "assistant",
        content: "Uzr, hozir server bilan bog'lanishda muammo bor. Iltimos, keyinroq urinib ko'ring.",
        sources: [],
      };
      setActiveMessages(prev => [...prev, fallback]);
      setError(e.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });
  };

  return (
    <div className="chatbot-page">
      {/* ── Sidebar ── */}
      <div className={`chat-sessions ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="chat-sessions-header">
          <h3>Suhbatlar</h3>
          <button className="chat-new-btn" onClick={handleNewSession}>✏️ Yangi</button>
        </div>
        <div className="chat-sessions-list">
          {!user ? (
            <div className="chat-sessions-empty">
              <span>🔒</span>
              Tarixni saqlash uchun kiring
            </div>
          ) : sessionsLoading ? (
            <div className="chat-sessions-empty">Yuklanmoqda...</div>
          ) : sessions.length === 0 ? (
            <div className="chat-sessions-empty">
              <span>💬</span>
              Hali suhbat yo'q
            </div>
          ) : (
            sessions.map(s => (
              <div
                key={s.id}
                className={`chat-session-item ${s.id === activeId ? "active" : ""}`}
                onClick={() => handleSelectSession(s.id)}
              >
                <div className="chat-session-icon">💬</div>
                <div className="chat-session-info">
                  <div className="chat-session-title">{s.title}</div>
                  <div className="chat-session-meta">
                    {formatTime(s.created_at)} · {s.message_count} xabar
                  </div>
                </div>
                <button
                  className="chat-session-del"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                >✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="chatbot-main">
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar-wrap">
              <div className="chatbot-avatar">🧠</div>
              <div className="chatbot-online-dot" />
            </div>
            <div>
              <div className="chatbot-name">Umid — AI Psixolog</div>
              <div className="chatbot-status">
                <span className="chatbot-status-dot" />
                Onlayn · 24/7 tayyor
              </div>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button
              className="chatbot-action-btn"
              onClick={() => { setActiveMessages([WELCOME_MESSAGE]); setError(""); }}
            >🔄 Tozalash</button>
          </div>
        </div>

        <div className="chatbot-messages">
          <div className="chat-date-divider">Bugun</div>
          {activeMessages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          {error && <div className="chatbot-error">⚠️ {error}</div>}
          <div ref={bottomRef} />
        </div>

        {activeMessages.length <= 1 && (
          <div className="chatbot-quick">
            <div className="chatbot-quick-label">Tez savollar</div>
            <div className="chatbot-quick-list">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} className="chatbot-quick-btn" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}

        <div className="chatbot-input-wrap">
          {!user && (
            <div className="chatbot-guest-note">⚠️ Kirish qilib, suhbat tarixingizni saqlang</div>
          )}
          <div className="chatbot-input-row">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Savolingizni yozing... (Enter — yuborish, Shift+Enter — yangi qator)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={loading}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="chatbot-disclaimer">
            Umid AI psixolog ma'lumot beradi, tibbiy tashxis qo'ymaydi
          </div>
        </div>
      </div>

      <button className="chat-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>💬</button>
    </div>
  );
}