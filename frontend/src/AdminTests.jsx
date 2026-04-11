// src/components/Admin/AdminTests.jsx

import { useState, useEffect } from "react";

const BACKEND = "https://mindaura-backend-4.onrender.com";

// Testlar uchun "mashhur" belgisi (Tests.js dagi TESTS_LIST ga mos)
const POPULAR_IDS = ["temperament", "stress", "big5"];

export default function AdminTests() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BACKEND}/admin/test-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Serverdan xato keldi");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{ color: "#9ca3af", marginTop: 12 }}>Yuklanmoqda...</p>
    </div>
  );

  if (error) return (
    <div style={styles.center}>
      <p style={{ color: "#ef4444" }}>❌ {error}</p>
      <button style={styles.retryBtn} onClick={fetchStats}>Qayta urinish</button>
    </div>
  );

  const maxCount = stats.tests.length > 0
    ? Math.max(...stats.tests.map(t => t.count))
    : 1;

  return (
    <div style={styles.page}>

      {/* ── YUQORIdagi 3 ta stat kartochka ── */}
      <div style={styles.topCards}>
        <StatCard
          value={stats.unique_tests}
          label="Jami testlar"
          color="#553c9a"
        />
        <StatCard
          value={stats.total_completions.toLocaleString()}
          label="Jami o'tishlar"
          color="#553c9a"
        />
        <StatCard
          value={`${stats.avg_score}%`}
          label="O'rtacha natija"
          color="#553c9a"
        />
      </div>

      {/* ── JADVAL ── */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Testlar statistikasi</h2>
          <button style={styles.refreshBtn} onClick={fetchStats}>
            🔄 Yangilash
          </button>
        </div>

        {stats.tests.length === 0 ? (
          <div style={styles.empty}>
            Hali hech kim test yechmagan
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Test nomi", "O'tilgan", "O'rtacha ball", "Holat"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.tests.map((t, i) => {
                const pct = maxCount > 0 ? Math.round((t.count / maxCount) * 100) : 0;
                const isPopular = POPULAR_IDS.includes(t.test_id) || t.count >= 100;

                return (
                  <tr key={t.test_id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>

                    {/* Test nomi */}
                    <td style={styles.td}>{t.test_name}</td>

                    {/* Progress bar + son */}
                    <td style={styles.td}>
                      <div style={styles.barWrap}>
                        <div style={styles.barTrack}>
                          <div style={{
                            ...styles.barFill,
                            width: `${pct}%`,
                          }} />
                        </div>
                        <span style={styles.barNum}>{t.count}</span>
                      </div>
                    </td>

                    {/* O'rtacha ball */}
                    <td style={styles.td}>
                      <span style={{
                        color: t.avg_score >= 70 ? "#22c55e"
                             : t.avg_score >= 40 ? "#f59e0b"
                             : "#ef4444",
                        fontWeight: 600,
                      }}>
                        {t.avg_score > 0 ? `${t.avg_score}%` : "—"}
                      </span>
                    </td>

                    {/* Holat badge */}
                    <td style={styles.td}>
                      <span style={isPopular ? styles.badgePopular : styles.badgeOddiy}>
                        {isPopular ? "Mashhur" : "Oddiy"}
                      </span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Kichik komponentlar ──────────────────────────────

function StatCard({ value, label, color }) {
  return (
    <div style={styles.statCard}>
      <span style={{ fontSize: 28, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{label}</span>
    </div>
  );
}

// ── Inline stillar ───────────────────────────────────

const styles = {
  page: {
    padding: "24px",
    maxWidth: 960,
    margin: "0 auto",
    fontFamily: "inherit",
  },
  topCards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  },
  tableCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "24px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1a1a2e",
    margin: 0,
  },
  refreshBtn: {
    background: "none",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: 13,
    color: "#6b7280",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: 500,
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "13px 14px",
    fontSize: 14,
    color: "#374151",
    verticalAlign: "middle",
  },
  trEven: { background: "#fff" },
  trOdd:  { background: "#fafafa" },
  barWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  barTrack: {
    flex: 1,
    height: 6,
    background: "#f3f4f6",
    borderRadius: 99,
    overflow: "hidden",
    maxWidth: 220,
  },
  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #553c9a, #7c3aed)",
    borderRadius: 99,
    transition: "width 0.6s ease",
  },
  barNum: {
    fontSize: 13,
    color: "#6b7280",
    minWidth: 28,
  },
  badgePopular: {
    background: "#ede9fe",
    color: "#7c3aed",
    borderRadius: 6,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 500,
  },
  badgeOddiy: {
    background: "#f3f4f6",
    color: "#6b7280",
    borderRadius: 6,
    padding: "3px 10px",
    fontSize: 12,
  },
  empty: {
    textAlign: "center",
    padding: 40,
    color: "#9ca3af",
    fontSize: 14,
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #f3f4f6",
    borderTop: "3px solid #553c9a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  retryBtn: {
    marginTop: 12,
    padding: "8px 20px",
    background: "#553c9a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};