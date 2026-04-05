import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";
import { useAuth } from "./AuthContext";

const API_BASE = "http://localhost:8000";

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
  content: `Assalomu alaykum! 👋 Men **Umid** — MindAura platformasining AI psixolog yordamchisiman.

Sizga quyidagi sohalarda yordam bera olaman:
• 🧠 Stress va tashvish bilan ishlash
• 💙 Kayfiyat va depressiya
• 👨‍👩‍👧 Oila va munosabatlar
• 😴 Uyqu muammolari
• 💪 O'z-o'zini rivojlantirish

Bugun qanday yordam kerak?`,
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
      {!isUser && (
        <div className="chat-avatar">🧠</div>
      )}
      <div className={`chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-ai"}`}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} />
        )}
        {msg.sources && msg.sources.length > 0 && (
          <div className="chat-sources">
            📚 {msg.sources.join(", ")}
          </div>
        )}
      </div>
      {isUser && (
        <div className="chat-avatar chat-avatar-user">👤</div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg-ai">
      <div className="chat-avatar">🧠</div>
      <div className="chat-bubble chat-bubble-ai">
        <div className="chat-typing">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

let sessionCounter = 1;

function createNewSession() {
  return {
    id: Date.now(),
    title: `Suhbat ${sessionCounter++}`,
    messages: [WELCOME_MESSAGE],
    createdAt: new Date(),
  };
}

export default function Chatbot() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(() => [createNewSession()]);
  const [activeId, setActiveId] = useState(() => sessions[0]?.id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const activeSession = sessions.find(s => s.id === activeId);
  const messages = activeSession?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Textarea auto-resize
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 130) + "px";
    }
  }, [input]);

  function updateSession(id, updater) {
    setSessions(prev => prev.map(s => s.id === id ? updater(s) : s));
  }

  function handleNewSession() {
    const s = createNewSession();
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
    setSidebarOpen(false);
    setError("");
  }

  function handleDeleteSession(id, e) {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const s = createNewSession();
        setActiveId(s.id);
        return [s];
      }
      if (id === activeId) setActiveId(filtered[0].id);
      return filtered;
    });
  }

  function handleSelectSession(id) {
    setActiveId(id);
    setSidebarOpen(false);
    setError("");
  }

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setError("");

    const userMsg = { role: "user", content: msg };

    // Auto-title session from first user message
    updateSession(activeId, s => {
      const isFirst = s.messages.filter(m => m.role === "user").length === 0;
      return {
        ...s,
        title: isFirst ? msg.slice(0, 36) + (msg.length > 36 ? "…" : "") : s.title,
        messages: [...s.messages, userMsg],
      };
    });

    setLoading(true);

    const currentMessages = [...messages, userMsg];
    const history = currentMessages
      .filter(m => m !== WELCOME_MESSAGE)
      .slice(-14)
      .map(m => ({ role: m.role, content: m.content }));

    const endpoint = user
      ? `${API_BASE}/ai/chat`
      : `${API_BASE}/ai/chat/anonymous`;

    const token = localStorage.getItem("access_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: msg, history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Server xatosi");
      }

      const data = await res.json();
      const aiMsg = {
        role: "assistant",
        content: data.reply,
        sources: data.sources || [],
      };

      updateSession(activeId, s => ({
        ...s,
        messages: [...s.messages, aiMsg],
      }));
    } catch (e) {
      if (e.message.includes("fetch") || e.message.includes("Failed")) {
        const fallback = {
          role: "assistant",
          content: "Uzr, hozir server bilan bog'lanishda muammo bor. Iltimos, keyinroq urinib ko'ring yoki bevosita psixolog bilan bog'laning.",
          sources: [],
        };
        updateSession(activeId, s => ({
          ...s,
          messages: [...s.messages, fallback],
        }));
      } else {
        setError(e.message);
      }
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

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });
  };

  return (
    <div className="chatbot-page">
      {/* ── Sidebar ── */}
      <div className={`chat-sessions ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="chat-sessions-header">
          <h3>Suhbatlar</h3>
          <button className="chat-new-btn" onClick={handleNewSession}>
            ✏️ Yangi
          </button>
        </div>

        <div className="chat-sessions-list">
          {sessions.length === 0 ? (
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
                  <div className="chat-session-meta">{formatTime(s.createdAt)}</div>
                </div>
                <button
                  className="chat-session-del"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  title="O'chirish"
                >✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="chatbot-main">
        {/* Header */}
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
              onClick={() => {
                updateSession(activeId, s => ({ ...s, messages: [WELCOME_MESSAGE] }));
                setError("");
              }}
              title="Suhbatni tozalash"
            >
              🔄 Tozalash
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          <div className="chat-date-divider">Bugun</div>

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && <TypingIndicator />}

          {error && (
            <div className="chatbot-error">
              ⚠️ {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && (
          <div className="chatbot-quick">
            <div className="chatbot-quick-label">Tez savollar</div>
            <div className="chatbot-quick-list">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} className="chatbot-quick-btn" onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-wrap">
          {!user && (
            <div className="chatbot-guest-note">
              ⚠️ Kirish qilib, suhbat tarixingizni saqlang
            </div>
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

      {/* Mobile sidebar toggle */}
      <button
        className="chat-sidebar-toggle"
        onClick={() => setSidebarOpen(o => !o)}
      >
        💬
      </button>
    </div>
  );
}
