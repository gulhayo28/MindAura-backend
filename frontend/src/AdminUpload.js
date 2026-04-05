// src/AdminUpload.js
import { useState, useRef, useEffect } from "react";
import "./AdminUpload.css";

const BASE_URL = "http://127.0.0.1:8000";
function getToken() { return localStorage.getItem("access_token"); }
function authHeaders() { return { Authorization: `Bearer ${getToken()}` }; }

async function apiUpload(formData) {
  const res = await fetch(`${BASE_URL}/resources/`, {
    method: "POST", headers: authHeaders(), body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Yuklashda xatolik");
  }
  return res.json();
}

async function apiDelete(id) {
  const res = await fetch(`${BASE_URL}/resources/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!res.ok) throw new Error("O'chirishda xatolik");
}

async function apiFetchAll() {
  const res = await fetch(`${BASE_URL}/resources?per_page=50`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Yuklanmadi");
  return res.json();
}

const CATEGORIES = [
  { value: "anxiety",       label: "Tashvish & Stress" },
  { value: "self_growth",   label: "O'zini rivojlantirish" },
  { value: "relationships", label: "Munosabatlar" },
  { value: "therapy",       label: "Terapiya" },
  { value: "depression",    label: "Depressiya" },
  { value: "mindfulness",   label: "Mindfulness" },
  { value: "other",         label: "Boshqalar" },
];

const TYPES = [
  { value: "book",    label: "📚 Kitob" },
  { value: "guide",   label: "📋 Qo'llanma" },
  { value: "article", label: "📄 Maqola" },
];

export default function AdminUpload() {
  const [tab, setTab]           = useState("upload");
  const [resources, setResources] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (tab === "list") loadList();
  }, [tab]);

  async function loadList() {
    setLoadingList(true);
    try {
      const data = await apiFetchAll();
      setResources(data.items || []);
    } catch { /* silent */ }
    finally { setLoadingList(false); }
  }

  return (
    <div className="au-root">
      {/* Tablar */}
      <div className="au-tabs">
        {[
          { key: "upload", label: "➕ Yangi yuklash" },
          { key: "list",   label: "📋 Barcha fayllar" },
        ].map(t => (
          <button
            key={t.key}
            className={`au-tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {tab === "upload" && (
        <UploadForm onSuccess={() => { setTab("list"); loadList(); }} />
      )}
      {tab === "list" && (
        <ResourceList
          resources={resources}
          loading={loadingList}
          onDelete={async (id) => {
            if (!window.confirm("O'chirilsinmi?")) return;
            try { await apiDelete(id); loadList(); }
            catch (err) { alert(err.message); }
          }}
        />
      )}
    </div>
  );
}

// ─── Upload Form ──────────────────────────────────────────────────────────────

function UploadForm({ onSuccess }) {
  const [form, setForm] = useState({
    title: "", description: "", author: "",
    content_type: "book", category: "anxiety",
    language: "uz", is_published: true, is_featured: false,
  });
  const [file, setFile]               = useState(null);
  const [cover, setCover]             = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState("");
  const [error, setError]             = useState("");
  const fileRef  = useRef();
  const coverRef = useRef();

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleCover(e) {
    const f = e.target.files[0];
    if (!f) return;
    setCover(f);
    setCoverPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Sarlavha kiritilishi shart"); return; }
    if (!file) { setError("PDF fayl tanlanishi shart"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append("file", file);
      if (cover) fd.append("cover", cover);
      await apiUpload(fd);
      setSuccess("✅ Muvaffaqiyatli yuklandi!");
      setForm({ title: "", description: "", author: "", content_type: "book", category: "anxiety", language: "uz", is_published: true, is_featured: false });
      setFile(null); setCover(null); setCoverPreview(null);
      if (fileRef.current)  fileRef.current.value  = "";
      if (coverRef.current) coverRef.current.value = "";
      setTimeout(onSuccess, 1200);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <form className="au-form" onSubmit={handleSubmit}>
      {success && <div className="au-alert success">{success}</div>}
      {error   && <div className="au-alert error">{error}</div>}

      {/* Sarlavha */}
      <div className="au-form-row">
        <label className="au-label">Sarlavha *</label>
        <input className="au-input" value={form.title}
          onChange={e => set("title", e.target.value)}
          placeholder="Kitob / qo'llanma nomi" />
      </div>

      {/* Muallif + Til */}
      <div className="au-form-grid">
        <div>
          <label className="au-label">Muallif</label>
          <input className="au-input" value={form.author}
            onChange={e => set("author", e.target.value)} placeholder="Dr. ..." />
        </div>
        <div>
          <label className="au-label">Til</label>
          <select className="au-select" value={form.language}
            onChange={e => set("language", e.target.value)}>
            <option value="uz">O'zbek</option>
            <option value="ru">Rus</option>
            <option value="en">Ingliz</option>
          </select>
        </div>
      </div>

      {/* Tur + Kategoriya */}
      <div className="au-form-grid">
        <div>
          <label className="au-label">Tur *</label>
          <select className="au-select" value={form.content_type}
            onChange={e => set("content_type", e.target.value)}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="au-label">Kategoriya *</label>
          <select className="au-select" value={form.category}
            onChange={e => set("category", e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tavsif */}
      <div className="au-form-row">
        <label className="au-label">Tavsif</label>
        <textarea className="au-textarea" value={form.description}
          onChange={e => set("description", e.target.value)}
          placeholder="Qisqacha tavsif..." />
      </div>

      {/* PDF */}
      <div className="au-form-row">
        <label className="au-label">PDF fayl *</label>
        <div
          className={`au-dropzone ${file ? "has-file" : ""}`}
          onClick={() => fileRef.current?.click()}
        >
          <div className="au-dropzone-icon">{file ? "✅" : "📄"}</div>
          {file ? (
            <>
              <p className="au-dropzone-title success">{file.name}</p>
              <p className="au-dropzone-sub">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </>
          ) : (
            <>
              <p className="au-dropzone-title">PDF faylni tanlash uchun bosing</p>
              <p className="au-dropzone-sub">Maksimal: 50 MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.epub"
          onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
      </div>

      {/* Muqova */}
      <div className="au-form-row">
        <label className="au-label">
          Muqova rasmi <span className="optional">(ixtiyoriy)</span>
        </label>
        <div className="au-cover-wrap">
          <div className="au-cover-zone" onClick={() => coverRef.current?.click()}>
            {coverPreview
              ? <img src={coverPreview} alt="cover" />
              : <>
                  <span className="au-cover-icon">🖼️</span>
                  <span className="au-cover-hint">JPEG / PNG</span>
                </>
            }
          </div>
          {coverPreview && (
            <button type="button" className="au-cover-remove"
              onClick={() => { setCover(null); setCoverPreview(null); }}>
              O'chirish
            </button>
          )}
        </div>
        <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp"
          onChange={handleCover} style={{ display: "none" }} />
      </div>

      {/* Togglelar */}
      <div className="au-toggles">
        <label className="au-toggle-label">
          <input type="checkbox" checked={form.is_published}
            onChange={e => set("is_published", e.target.checked)} />
          Chop etish
        </label>
        <label className="au-toggle-label">
          <input type="checkbox" checked={form.is_featured}
            onChange={e => set("is_featured", e.target.checked)} />
          ⭐ Featured
        </label>
      </div>

      <button type="submit" className="au-submit-btn" disabled={loading}>
        {loading ? "Yuklanmoqda..." : "⬆️ Yuklash"}
      </button>
    </form>
  );
}

// ─── Resource List ────────────────────────────────────────────────────────────

function ResourceList({ resources, loading, onDelete }) {
  if (loading) {
    return (
      <div className="au-list">
        {[1, 2, 3].map(i => (
          <div key={i} className="au-skeleton-item">
            <div className="au-skel-box" style={{ width: 36, height: 36 }} />
            <div style={{ flex: 1 }}>
              <div className="au-skel-box" style={{ height: 14, width: "40%", marginBottom: 8 }} />
              <div className="au-skel-box" style={{ height: 11, width: "25%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!resources.length) {
    return (
      <div className="au-empty">
        <p>📭</p>
        <p>Hali hech qanday resurs yo'q</p>
      </div>
    );
  }

  return (
    <div className="au-list">
      {resources.map(r => (
        <div key={r.id} className="au-list-item">
          <span className="au-list-icon">
            {{ book: "📚", guide: "📋", article: "📄" }[r.content_type] ?? "📁"}
          </span>
          <div className="au-list-info">
            <p className="au-list-title">{r.title}</p>
            <div className="au-list-meta">
              {r.author && <span className="au-list-author">✍️ {r.author}</span>}
              <span className="au-list-downloads">⬇️ {r.download_count}</span>
              <span className={`au-status-badge ${r.is_published ? "published" : "draft"}`}>
                {r.is_published ? "Chop etilgan" : "Qoralama"}
              </span>
            </div>
          </div>
          <button className="au-delete-btn" onClick={() => onDelete(r.id)}>
            O'chirish
          </button>
        </div>
      ))}
    </div>
  );
}
