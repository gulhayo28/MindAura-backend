// src/Library.js

// src/Library.js
import { useState, useEffect, useCallback } from "react";
import "./Library.css";

const CDN = "https://PSCHOLOGY.b-cdn.net";
const BASE_URL = "http://127.0.0.1:8000";

function getToken() { return localStorage.getItem("access_token"); }

async function apiDownload(resource) {
  const token = getToken();
  if (!token) throw new Error("Yuklab olish uchun tizimga kiring");

  // file_path dan faqat fayl nomini olish (documents/ ni olib tashlash)
  const fileName = resource.file_path.replace("documents/", "");
  const fileUrl = `https://PSCHOLOGY.b-cdn.net/documents/${encodeURIComponent(fileName)}`;
  
  console.log("URL:", fileUrl); // tekshirish uchun
  
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = `${resource.title}.pdf`;
  a.target = "_blank";
  a.click();
}

async function apiFetch(params = {}) {
  const q = new URLSearchParams({
    page: params.page || 1,
    per_page: params.per_page || 12,
    sort_by: params.sort_by || "newest",
  });
  if (params.category)     q.append("category", params.category);
  if (params.content_type) q.append("content_type", params.content_type);
  if (params.search)       q.append("search", params.search);
  const res = await fetch(`${BASE_URL}/resources?${q}`);
  if (!res.ok) throw new Error("Ma'lumot yuklanmadi");
  return res.json();
}

const CATEGORIES = [
  { value: "",              label: "Barchasi" },
  { value: "anxiety",       label: "😰 Tashvish & Stress" },
  { value: "self_growth",   label: "🌱 Rivojlanish" },
  { value: "relationships", label: "💞 Munosabatlar" },
  { value: "therapy",       label: "🧘 Terapiya" },
  { value: "depression",    label: "🌧️ Depressiya" },
  { value: "mindfulness",   label: "🌸 Mindfulness" },
  { value: "other",         label: "📁 Boshqalar" },
];

const TYPES = [
  { value: "",        label: "Barchasi" },
  { value: "book",    label: "📚 Kitob" },
  { value: "guide",   label: "📋 Qo'llanma" },
  { value: "article", label: "📄 Maqola" },
];

const CAT_LABELS = {
  anxiety: "Tashvish", self_growth: "Rivojlanish",
  relationships: "Munosabatlar", therapy: "Terapiya",
  depression: "Depressiya", mindfulness: "Mindfulness", other: "Boshqa",
};

const TYPE_ICONS = { book: "📚", guide: "📋", article: "📄" };

export default function Library() {
  const [resources, setResources]     = useState([]);
  const [total, setTotal]             = useState(0);
  const [pages, setPages]             = useState(1);
  const [loading, setLoading]         = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [error, setError]             = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    page: 1, per_page: 12, category: "",
    content_type: "", search: "", sort_by: "newest",
  });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiFetch(filters);
      setResources(data.items); setTotal(data.total); setPages(data.pages);
    } catch { setError("Ma'lumotlarni yuklashda xatolik."); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() =>
      setFilters(f => ({ ...f, search: searchInput, page: 1 })), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  function setFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  }

  async function handleDownload(resource) {
    setDownloading(resource.id);
    try { await apiDownload(resource); }  // resource ni to'liq beramiz
    catch (err) { alert(err.message); }
    finally { setDownloading(null); }
  }

  const hasFilter = filters.category || filters.content_type || filters.search;

  return (
    <div className="library-root">
      {/* ── Header ── */}
      <div className="lib-header">
        <h2 className="lib-header-title">
          📚 Kutubxona
          {total > 0 && <span className="lib-count">{total} ta material</span>}
        </h2>
        <div className="lib-search-wrap">
          <span className="lib-search-icon">🔍</span>
          <input
            className="lib-search-input"
            type="text"
            placeholder="Kitob, muallif qidiring..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button className="lib-search-clear" onClick={() => setSearchInput("")}>✕</button>
          )}
        </div>
      </div>

      {/* Mobil kategoriya chips */}
      <div className="lib-mobile-cats">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`lib-chip ${filters.category === cat.value ? "active" : ""}`}
            onClick={() => setFilter("category", cat.value)}
          >{cat.label}</button>
        ))}
      </div>

      <div className="lib-layout">
        {/* ── Sidebar ── */}
        <aside className="lib-sidebar">
          <p className="lib-filter-label">Kategoriya</p>
          <div className="lib-filter-group">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`lib-filter-btn ${filters.category === cat.value ? "active" : ""}`}
                onClick={() => setFilter("category", cat.value)}
              >{cat.label}</button>
            ))}
          </div>

          <p className="lib-filter-label">Tur</p>
          <div className="lib-filter-group">
            {TYPES.map(t => (
              <button
                key={t.value}
                className={`lib-filter-btn ${filters.content_type === t.value ? "active" : ""}`}
                onClick={() => setFilter("content_type", t.value)}
              >{t.label}</button>
            ))}
          </div>

          <p className="lib-filter-label">Saralash</p>
          <select
            className="lib-sort-select"
            value={filters.sort_by}
            onChange={e => setFilter("sort_by", e.target.value)}
          >
            <option value="newest">Eng yangi</option>
            <option value="popular">Eng ommabop</option>
            <option value="title">Nom bo'yicha</option>
          </select>

          {hasFilter && (
            <button
              className="lib-filter-reset"
              onClick={() => {
                setFilters(f => ({ ...f, category: "", content_type: "", search: "", page: 1 }));
                setSearchInput("");
              }}
            >✕ Filterni tozalash</button>
          )}
        </aside>

        {/* ── Asosiy kontent ── */}
        <main className="lib-main">
          {error && <div className="lib-error">{error}</div>}

          {/* Skeleton */}
          {loading && (
            <div className="lib-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="lib-skeleton">
                  <div className="lib-skel-img" />
                  <div className="lib-skel-line" style={{ height: 14, width: "70%" }} />
                  <div className="lib-skel-line" style={{ height: 12, width: "90%" }} />
                  <div className="lib-skel-line" style={{ height: 12, width: "55%" }} />
                  <div className="lib-skel-line" style={{ height: 36, width: "100%", marginTop: 8, borderRadius: 9 }} />
                </div>
              ))}
            </div>
          )}

          {/* Bo'sh */}
          {!loading && resources.length === 0 && (
            <div className="lib-empty">
              <div className="lib-empty-icon">📭</div>
              <h3>Hech narsa topilmadi</h3>
              <p>Boshqa so'z yoki kategoriya bilan sinab ko'ring</p>
            </div>
          )}

          {/* Kartalar */}
          {!loading && resources.length > 0 && (
            <div className="lib-grid">
              {resources.map(r => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onDownload={handleDownload}
                  isDownloading={downloading === r.id}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div className="lib-pagination">
              <button
                className="lib-page-btn"
                disabled={filters.page === 1}
                onClick={() => setFilter("page", filters.page - 1)}
              >← Oldingi</button>

              {[...Array(pages)].map((_, i) => i + 1)
                .filter(p => Math.abs(p - filters.page) <= 2)
                .map(p => (
                  <button
                    key={p}
                    className={`lib-page-btn ${p === filters.page ? "active" : ""}`}
                    onClick={() => setFilter("page", p)}
                  >{p}</button>
                ))}

              <button
                className="lib-page-btn"
                disabled={filters.page === pages}
                onClick={() => setFilter("page", filters.page + 1)}
              >Keyingi →</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── ResourceCard ─────────────────────────────────────────────────────────────

function ResourceCard({ resource, onDownload, isDownloading }) {
  const typeIcon = TYPE_ICONS[resource.content_type] ?? "📁";
  const catLabel = CAT_LABELS[resource.category] ?? resource.category;
  const catClass = `lib-badge-cat lib-cat-${resource.category || "other"}`;

  return (
    <div className="lib-card">
      {/* Muqova */}
      <div className="lib-card-cover">
        {resource.cover_image
          ? <img src={`${CDN}/covers/${resource.cover_image}`} alt={resource.title} />
          : <span className="lib-card-cover-icon">{typeIcon}</span>
        }
        {resource.is_featured && (
          <span className="lib-card-featured">⭐ Featured</span>
        )}
      </div>

      {/* Kontent */}
      <div className="lib-card-body">
        <div className="lib-card-badges">
          <span className={catClass}>{catLabel}</span>
          <span className="lib-badge-type">{typeIcon}</span>
        </div>

        <h3 className="lib-card-title">{resource.title}</h3>

        {resource.author && (
          <p className="lib-card-author">✍️ {resource.author}</p>
        )}

        {resource.description && (
          <p className="lib-card-desc">{resource.description}</p>
        )}

        <div className="lib-card-meta">
          {resource.page_count && <span>📖 {resource.page_count} bet</span>}
          {resource.file_size_kb && (
            <span>💾 {(resource.file_size_kb / 1024).toFixed(1)} MB</span>
          )}
          <span>⬇️ {resource.download_count}</span>
        </div>

        {resource.file_path !== undefined ? (
          <button
            className={`lib-dl-btn ${isDownloading ? "loading" : ""}`}
            onClick={() => onDownload(resource)}
            disabled={isDownloading}
          >
            {isDownloading
              ? <><span className="lib-spin">⏳</span> Yuklanmoqda...</>
              : "⬇️ Yuklab olish"
            }
          </button>
        ) : (
          <div className="lib-no-file">Fayl mavjud emas</div>
        )}
      </div>
    </div>
  );
}
