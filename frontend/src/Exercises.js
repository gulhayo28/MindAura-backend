import { useState, useEffect, useRef, useCallback } from "react";
import "./Exercises.css";

const BACKEND = "https://mindaura-backend-4.onrender.com";

async function saveExerciseResult(exerciseId, exerciseName, score, resultLabel) {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  const doSave = async (t) => {
    return await fetch(`${BACKEND}/test-results/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${t}`
      },
      body: JSON.stringify({
        test_id: exerciseId,
        test_name: exerciseName,
        score: score,
        result_label: resultLabel,
        result_desc: "",
      })
    });
  };

  try {
    let res = await doSave(token);
    if (res.status === 401) {
      const refresh_token = localStorage.getItem("refresh_token");
      if (!refresh_token) return;
      const refreshRes = await fetch(`${BACKEND}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("access_token", data.access_token);
        await doSave(data.access_token);
      }
    }
  } catch (e) {
    console.log("Saqlashda xato:", e);
  }
}

// ═══════════════════════════════════════
// YORDAMCHI KOMPONENTLAR
// ═══════════════════════════════════════

function StepDots({ total, current }) {
  return (
    <div className="step-dots">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`step-dot ${i === current ? "active" : i < current ? "done" : ""}`} />
      ))}
    </div>
  );
}

function ResultCard({ score, maxScore, level, onRetry, onBack, correctItems, missedItems, message }) {
  const pct = Math.round((score / maxScore) * 100);
  const [barW, setBarW] = useState(0);
  useEffect(() => { setTimeout(() => setBarW(pct), 200); }, [pct]);

  const lvlStyle = level === "alo"
    ? { bg: "#DCFCE7", color: "#16A34A", label: "🏆 A'lo" }
    : level === "yaxshi"
    ? { bg: "#DBEAFE", color: "#2563EB", label: "👍 Yaxshi" }
    : { bg: "#FEF3C7", color: "#D97706", label: "📈 Rivojlantirish kerak" };

  return (
    <div className="result-wrap">
      <div className="result-score-card">
        <div className="result-big-score">{score}</div>
        <div className="result-score-sub">{message || `/ ${maxScore} ta to'g'ri`}</div>
        <div className="result-progress-wrap">
          <div className="result-progress-head">
            <span>🧠 Natija</span>
            <span>{pct}%</span>
          </div>
          <div className="result-progress-track">
            <div className="result-progress-fill" style={{ width: barW + "%" }} />
          </div>
        </div>
        <div className="result-level-badge" style={{ background: lvlStyle.bg, color: lvlStyle.color }}>
          {lvlStyle.label}
        </div>
      </div>

      {correctItems && correctItems.length > 0 && (
        <div className="result-correct">
          <p>✓ To'g'ri javoblar:</p>
          <div className="result-tags">
            {correctItems.map((c, i) => <span key={i} className="tag-green">{c}</span>)}
          </div>
        </div>
      )}

      {missedItems && missedItems.length > 0 && (
        <div className="result-missed">
          <p>⚠ Eslab qolmagan:</p>
          <div className="result-tags">
            {missedItems.map((m, i) => <span key={i} className="tag-orange">{m}</span>)}
          </div>
        </div>
      )}

      <div className="result-btns">
        <button className="btn-primary" onClick={onRetry}>🔄 Qayta boshlash</button>
        <button className="btn-secondary" onClick={onBack}>← Mashqlar ro'yxati</button>
      </div>
    </div>
  );
}

function ExerciseShell({ title, stepTitle, totalSteps, currentStep, children, onBack }) {
  return (
    <div className="ex-shell">
      <div className="ex-shell-header">
        <button className="ex-back-nav" onClick={onBack}>← Orqaga</button>
        <div className="ex-shell-title">{title}</div>
        <StepDots total={totalSteps} current={currentStep} />
      </div>
      <div className="ex-shell-step-label">{stepTitle}</div>
      <div className="ex-shell-body">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════
// 1. XOTIRA MASHQI — RASM ESLASH
// ═══════════════════════════════════════
const MEMORY_OBJECTS = [
  { icon: "📚", label: "Kitob" }, { icon: "⏰", label: "Soat" }, { icon: "🪴", label: "Gul" },
  { icon: "👓", label: "Ko'zoynak" }, { icon: "📱", label: "Telefon" }, { icon: "📓", label: "Daftar" },
  { icon: "☕", label: "Kofe" }, { icon: "✏️", label: "Qalam" }, { icon: "💻", label: "Noutbuk" },
];
const ALL_CHOICES = [...MEMORY_OBJECTS.map(o => o.label), "Stakan", "Kalit", "Sumka"];

function MemoryExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(5);
  const [fading, setFading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("memory", "Xotira mashqi", result.score, label);
    }
  }, [result]);

  const startTimer = useCallback(() => {
    setStep(1); setTimer(5);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFading(true);
          setTimeout(() => setStep(2), 800);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const toggle = (label) => setSelected(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label]);

  const checkResult = () => {
    const correct = selected.filter(s => MEMORY_OBJECTS.map(o => o.label).includes(s));
    const missed = MEMORY_OBJECTS.map(o => o.label).filter(l => !selected.includes(l));
    const score = correct.length;
    setResult({ score, correct, missed, level: score >= 8 ? "alo" : score >= 5 ? "yaxshi" : "rivojlantir" });
    setStep(3);
  };

  const restart = () => { setStep(0); setTimer(5); setFading(false); setSelected([]); setResult(null); };

  const stepTitles = ["Tayyorgarlik", "Rasmni eslang", "Eslab qoling", "Natija"];

  return (
    <ExerciseShell title="🧠 Xotira mashqi" stepTitle={stepTitles[step]} totalSteps={4} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">👁️</div>
          <h3>Mashqga tayyorlaning</h3>
          <p>Quyidagi rasmga diqqat bilan qarang. 5 soniya ichida imkon qadar ko'proq detallarni eslab qolishga harakat qiling.</p>
          <div className="tip-box">💡 Har bir narsaga nom bering va joylashuvini yodda saqlang</div>
          <button className="btn-primary" onClick={startTimer}>Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <div className="timer-display">
            <div className="timer-circle" style={{ borderColor: timer <= 2 ? "#EF4444" : "#6C63FF" }}>
              <span className="timer-num" style={{ color: timer <= 2 ? "#EF4444" : "#6C63FF" }}>{timer}</span>
            </div>
            <span className="timer-label">soniya qoldi</span>
          </div>
          <div className={`memory-grid ${fading ? "fading" : ""}`}>
            {MEMORY_OBJECTS.map((obj, i) => (
              <div key={i} className="memory-obj">
                <span className="memory-obj-icon">{obj.icon}</span>
                <span className="memory-obj-label">{obj.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h3>Qaysi narsalarni ko'rdingiz?</h3>
          <p>Ko'rgan narsalarni belgilang</p>
          <div className="recall-grid">
            {ALL_CHOICES.map((label, i) => (
              <button key={i} className={`recall-btn ${selected.includes(label) ? "selected" : ""}`} onClick={() => toggle(label)}>
                {selected.includes(label) ? "✓ " : ""}{label}
              </button>
            ))}
          </div>
          <div className="selected-count">{selected.length} ta tanlandi</div>
          <button className="btn-primary" onClick={checkResult} disabled={selected.length === 0}>Natijani tekshirish →</button>
        </div>
      )}

      {step === 3 && result && (
        <ResultCard score={result.score} maxScore={MEMORY_OBJECTS.length}
          level={result.level} correctItems={result.correct} missedItems={result.missed}
          onRetry={restart} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 2. SON QIDIRUV MASHQI
// ═══════════════════════════════════════
const NUMBER_SEQ = "489561348526419569724";
const CORRECT_GROUPS = ["4+8+9", "8+9+5=22? no", "5+6+1=12? no", "6+1+3=10? no", "4+8+3=15✓", "5+6+4=15✓", "1+5+9=15✓"];

function NumberSearchExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [highlighted, setHighlighted] = useState([]);
  const digits = NUMBER_SEQ.split("").map(Number);

  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("numbers", "Son qidiruv", result.score, label);
    }
  }, [result]);

  const correctIndexes = [];
  for (let i = 0; i < digits.length - 2; i++) {
    if (digits[i] + digits[i + 1] + digits[i + 2] === 15) correctIndexes.push(i, i + 1, i + 2);
  }
  const uniqueCorrect = [...new Set(correctIndexes)];

  const countCorrect = () => {
    let count = 0;
    for (let i = 0; i < digits.length - 2; i++) {
      if (digits[i] + digits[i + 1] + digits[i + 2] === 15) count++;
    }
    return count;
  };

  const checkAnswer = () => {
    const userNum = parseInt(answer) || 0;
    const correct = countCorrect();
    const diff = Math.abs(userNum - correct);
    const score = diff === 0 ? 3 : diff === 1 ? 2 : diff <= 2 ? 1 : 0;
    setResult({ userNum, correct, score, level: score === 3 ? "alo" : score >= 1 ? "yaxshi" : "rivojlantir" });
    setHighlighted(uniqueCorrect);
    setStep(2);
  };

  const stepTitles = ["Tayyorgarlik", "Sonlarni qidiring", "Natija"];

  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("division", "Bo'linish mashqi", result.score, label);
    }
  }, [result]);

  return (
    <ExerciseShell title="🔢 Son qidiruv" stepTitle={stepTitles[step]} totalSteps={3} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">🔢</div>
          <h3>Yig'indisi 15 bo'lgan sonlarni toping</h3>
          <p>Quyidagi son qatorida yig'indisi 15 ga teng bo'lgan ketma-ket 3 ta sonlar guruhini toping va nechta ekanini ayting.</p>
          <div className="tip-box">💡 Har uch sonni qo'shib ko'ring: 4+8+9=21, 8+9+5=22...</div>
          <button className="btn-primary" onClick={() => setStep(1)}>Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <h3>Son qatorida qidiring:</h3>
          <div className="number-sequence">
            {digits.map((d, i) => (
              <span key={i} className="digit-box">{d}</span>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Yig'indisi 15 ga teng bo'lgan ketma-ket 3 sonlar guruhini nechta topdingiz?</p>
          <div className="number-input-wrap">
            <input className="ex-input" type="number" min="0" max="20"
              placeholder="Nechta guruh topingiz?" value={answer}
              onChange={e => setAnswer(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={checkAnswer} disabled={!answer}>Javobni tekshirish →</button>
        </div>
      )}

      {step === 2 && result && (
        <div className="step-content">
          <h3>Natija</h3>
          <div className="number-sequence revealed">
            {digits.map((d, i) => {
              const isHighlighted = uniqueCorrect.includes(i);
              return <span key={i} className={`digit-box ${isHighlighted ? "digit-correct" : ""}`}>{d}</span>;
            })}
          </div>
          <div className="result-info-box">
            <div className="info-row"><span>Sizning javobingiz:</span><strong>{result.userNum}</strong></div>
            <div className="info-row"><span>To'g'ri javob:</span><strong style={{ color: "#16A34A" }}>{result.correct} ta guruh</strong></div>
          </div>
          <ResultCard score={result.score} maxScore={3}
            level={result.level} message={`To'g'ri guruhlar: ${result.correct} ta`}
            onRetry={() => { setStep(0); setAnswer(""); setResult(null); setHighlighted([]); }} onBack={onBack} />
        </div>
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 3. BO'LINISH MASHQI
// ═══════════════════════════════════════
const DIVISION_NUMBERS = [33, 74, 56, 66, 18, 42, 15, 81];

function DivisionExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);

  const correct = DIVISION_NUMBERS.filter(n => n % 2 === 0 && n % 3 === 0);
  const toggle = (n) => setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n]);

  const check = () => {
    const userCorrect = selected.filter(n => correct.includes(n));
    const falsePositives = selected.filter(n => !correct.includes(n));
    const missed = correct.filter(n => !selected.includes(n));
    const score = Math.max(0, userCorrect.length - falsePositives.length);
    setResult({ score, userCorrect, falsePositives, missed, level: score >= correct.length ? "alo" : score >= correct.length / 2 ? "yaxshi" : "rivojlantir" });
    setStep(2);
  };

  const stepTitles = ["Tayyorgarlik", "Sonlarni tanlang", "Natija"];

  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("twohands", "Ikki qo'l mashqi", result.score, label);
    }
  }, [result]);

  return (
    <ExerciseShell title="➗ Bo'linish mashqi" stepTitle={stepTitles[step]} totalSteps={3} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">➗</div>
          <h3>2 va 3 ga bo'linadigan sonlar</h3>
          <p>Quyidagi sonlardan bir vaqtda ham 2 ga, ham 3 ga bo'linadigan sonlarni tanlang.</p>
          <div className="tip-box">
            💡 Qoida: Sonning 6 ga bo'linishi = 2 ga ham, 3 ga ham bo'linadi
          </div>
          <div className="example-box">
            <p>Misol: <strong>18 ÷ 2 = 9 ✓</strong> va <strong>18 ÷ 3 = 6 ✓</strong> → To'g'ri!</p>
          </div>
          <button className="btn-primary" onClick={() => setStep(1)}>Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <h3>Mos sonlarni belgilang:</h3>
          <div className="number-buttons">
            {DIVISION_NUMBERS.map(n => (
              <button key={n} className={`num-btn ${selected.includes(n) ? "selected" : ""}`} onClick={() => toggle(n)}>
                {n}
                {selected.includes(n) && <span className="num-check">✓</span>}
              </button>
            ))}
          </div>
          <p className="hint-text">Bir vaqtda 2 ga ham, 3 ga ham bo'linadigan sonlar</p>
          <button className="btn-primary" onClick={check} disabled={selected.length === 0}>Tekshirish →</button>
        </div>
      )}

      {step === 2 && result && (
        <div className="step-content">
          <h3>Javoblar tahlili:</h3>
          <div className="number-buttons">
            {DIVISION_NUMBERS.map(n => {
              const isCorrect = correct.includes(n);
              const isSelected = selected.includes(n);
              let cls = "num-btn ";
              if (isSelected && isCorrect) cls += "num-correct";
              else if (isSelected && !isCorrect) cls += "num-wrong";
              else if (!isSelected && isCorrect) cls += "num-missed";
              return <button key={n} className={cls}>{n}{isSelected && isCorrect ? " ✓" : isSelected && !isCorrect ? " ✗" : isCorrect ? " !" : ""}</button>;
            })}
          </div>
          <div className="legend-row">
            <span className="legend-item" style={{ color: "#16A34A" }}>✓ To'g'ri</span>
            <span className="legend-item" style={{ color: "#EF4444" }}>✗ Noto'g'ri</span>
            <span className="legend-item" style={{ color: "#D97706" }}>! O'tkazib yuborilgan</span>
          </div>
          <ResultCard score={result.score} maxScore={correct.length}
            level={result.level}
            message={`To'g'ri javoblar: ${correct.join(", ")}`}
            onRetry={() => { setStep(0); setSelected([]); setResult(null); }} onBack={onBack} />
        </div>
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 4. IKki QO'L BILAN CHIZISH
// ═══════════════════════════════════════
function TwoHandsExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(60);
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const startTimer = () => {
    setRunning(true); setTimer(60); setCount(0); setStep(1);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setRunning(false); setStep(2); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  //useEffect(() => () => clearInterval(timerRef.current), []);
  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("secondhand", "Sekund strelkasi", result.focusScore, label);
    }
  }, [result]);

  const submitCount = () => {
    const score = count >= 10 ? 3 : count >= 8 ? 2 : count >= 5 ? 1 : 0;
    setResult({ count, score, level: count >= 10 ? "alo" : count >= 5 ? "yaxshi" : "rivojlantir" });
    setStep(3);
  };

  const stepTitles = ["Tayyorgarlik", "Chizayapsiz!", "Natijani kiriting", "Natija"];

  return (
    <ExerciseShell title="✏️ Ikki qo'l mashqi" stepTitle={stepTitles[step]} totalSteps={4} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">✏️</div>
          <h3>Ikki qo'l bilan bir vaqtda chizish</h3>
          <p>Ikkita marker yoki qalam oling. Chap qo'lda aylana, o'ng qo'lda uchburchak chizing — bir vaqtda!</p>
          <div className="two-hands-demo">
            <div className="hand-demo">
              <span style={{ fontSize: 32 }}>👈</span>
              <div className="shape-demo circle-demo" />
              <span style={{ fontSize: 13, color: "#64748B" }}>Aylana</span>
            </div>
            <div style={{ fontSize: 28, color: "#9CA3AF" }}>+</div>
            <div className="hand-demo">
              <span style={{ fontSize: 32 }}>👉</span>
              <div className="shape-demo triangle-demo" />
              <span style={{ fontSize: 13, color: "#64748B" }}>Uchburchak</span>
            </div>
          </div>
          <div className="tip-box">💡 1 daqiqa davomida imkon qadar ko'proq chizing</div>
          <button className="btn-primary" onClick={startTimer}>Tayyor! Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content center">
          <div className="big-timer" style={{ borderColor: timer <= 15 ? "#EF4444" : "#6C63FF" }}>
            <span style={{ color: timer <= 15 ? "#EF4444" : "#6C63FF" }}>{timer}</span>
          </div>
          <p style={{ color: "#64748B", marginBottom: 8 }}>soniya qoldi</p>
          <div className="action-reminder">
            <span>👈 Aylana</span>
            <span style={{ color: "#9CA3AF" }}>+</span>
            <span>👉 Uchburchak</span>
          </div>
          <div className="two-hands-anim">
            <div className="anim-circle" />
            <div className="anim-triangle" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <div className="step-big-icon">🎨</div>
          <h3>Nechta jift chizdingiz?</h3>
          <p>Muvaffaqiyatli chizdigan aylana+uchburchak juftlar sonini kiriting</p>
          <div className="counter-wrap">
            <button className="counter-btn" onClick={() => setCount(c => Math.max(0, c - 1))}>−</button>
            <span className="counter-num">{count}</span>
            <button className="counter-btn" onClick={() => setCount(c => c + 1)}>+</button>
          </div>
          <div className="scoring-guide">
            <div className="score-row"><span>5 dan kam</span><span style={{ color: "#D97706" }}>Rivojlantirish kerak</span></div>
            <div className="score-row"><span>5–7 ta</span><span style={{ color: "#2563EB" }}>O'rtacha</span></div>
            <div className="score-row"><span>8–10 ta</span><span style={{ color: "#16A34A" }}>Yaxshi</span></div>
            <div className="score-row"><span>10+ ta</span><span style={{ color: "#7C3AED" }}>A'lo!</span></div>
          </div>
          <button className="btn-primary" onClick={submitCount}>Natijani ko'rish →</button>
        </div>
      )}

      {step === 3 && result && (
        <ResultCard score={result.score} maxScore={3}
          level={result.level} message={`${result.count} ta jift chizdingiz!`}
          onRetry={() => { setStep(0); setCount(0); setTimer(60); setResult(null); }} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 5. SEKUND STRELKASI
// ═══════════════════════════════════════
function SecondHandExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [totalTime] = useState(120);
  const [running, setRunning] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const clockRef = useRef(null);
  const [clockSec, setClockSec] = useState(0);

  useEffect(() => {
    clockRef.current = setInterval(() => setClockSec(s => (s + 1) % 60), 1000);
    return () => clearInterval(clockRef.current);
  }, []);

  const startFocus = () => {
    setStep(1); setSeconds(0); setInterruptions(0); setRunning(true);
    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s + 1 >= totalTime) { clearInterval(timerRef.current); setRunning(false); setStep(2); return totalTime; }
        return s + 1;
      });
    }, 1000);
  };

  //useEffect(() => () => clearInterval(timerRef.current), []);
  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("secondhand", "Sekund strelkasi", result.focusScore, label);
    }
  }, [result]);

  const markInterruption = () => setInterruptions(c => c + 1);

  const finish = () => {
    const focusScore = Math.max(0, 3 - interruptions);
    setResult({ interruptions, focusScore, level: interruptions <= 2 ? "alo" : interruptions <= 5 ? "yaxshi" : "rivojlantir" });
    setStep(3);
  };

  const pct = Math.round((seconds / totalTime) * 100);
  const rotation = clockSec * 6;

  const stepTitles = ["Tayyorgarlik", "Diqqatni jamlang", "Natija kiritish", "Natija"];

  return (
    <ExerciseShell title="⏱ Sekund strelkasi" stepTitle={stepTitles[step]} totalSteps={4} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">🕐</div>
          <h3>Diqqatni jamlash mashqi</h3>
          <p>2 daqiqa davomida soatning sekund strelkasiga diqqatingizni to'plang. Chalg'isangiz "Chalg'idim" tugmasini bosing.</p>
          <div className="tip-box">💡 Maqsad: Kamroq chalg'ish = kuchli diqqat</div>
          <button className="btn-primary" onClick={startFocus}>Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content center">
          <div className="analog-clock">
            <div className="clock-face">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="clock-mark" style={{ transform: `rotate(${i * 30}deg) translateY(-40px)` }} />
              ))}
              <div className="second-hand" style={{ transform: `rotate(${rotation}deg)` }} />
              <div className="clock-center" />
            </div>
          </div>
          <div className="focus-progress">
            <div className="focus-bar-track">
              <div className="focus-bar-fill" style={{ width: pct + "%" }} />
            </div>
            <span>{Math.floor((totalTime - seconds) / 60)}:{String((totalTime - seconds) % 60).padStart(2, "0")} qoldi</span>
          </div>
          <div className="interruption-count">
            <span>⚡ Chalg'ish soni: </span>
            <strong style={{ color: interruptions > 5 ? "#EF4444" : "#16A34A" }}>{interruptions}</strong>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-orange" onClick={markInterruption}>😵 Chalg'idim</button>
            <button className="btn-secondary" onClick={finish}>Tugatish</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-content center">
          <div className="step-big-icon">🎉</div>
          <h3>Mashq tugadi!</h3>
          <p>Chalg'ish soni: <strong>{interruptions}</strong></p>
          <button className="btn-primary" onClick={finish}>Natijani ko'rish →</button>
        </div>
      )}

      {step === 3 && result && (
        <ResultCard score={result.focusScore} maxScore={3}
          level={result.level}
          message={`Chalg'ish soni: ${result.interruptions} marta`}
          onRetry={() => { setStep(0); setSeconds(0); setInterruptions(0); setResult(null); }} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 6. MARSHRUT ESLASH
// ═══════════════════════════════════════
const ROUTE_ITEMS = ["Maktab", "Do'kon", "Bog'", "Kafe", "Bank", "Shifoxona"];
const ROUTE_ICONS = { "Maktab": "🏫", "Do'kon": "🏪", "Bog'": "🌳", "Kafe": "☕", "Bank": "🏦", "Shifoxona": "🏥" };

function RouteExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(8);
  const [fading, setFading] = useState(false);
  const [userOrder, setUserOrder] = useState([]);
  const [remaining, setRemaining] = useState([...ROUTE_ITEMS]);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const startTimer = () => {
    setStep(1); setTimer(8);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setFading(true); setTimeout(() => setStep(2), 800); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  //useEffect(() => () => clearInterval(timerRef.current), []);
  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("route", "Marshrut eslash", result.score, label);
    }
  }, [result]);

  const addToOrder = (item) => {
    setUserOrder(o => [...o, item]);
    setRemaining(r => r.filter(x => x !== item));
  };

  const checkOrder = () => {
    let score = 0;
    userOrder.forEach((item, i) => { if (item === ROUTE_ITEMS[i]) score++; });
    setResult({ score, level: score >= 5 ? "alo" : score >= 3 ? "yaxshi" : "rivojlantir" });
    setStep(3);
  };

  const restart = () => { setStep(0); setTimer(8); setFading(false); setUserOrder([]); setRemaining([...ROUTE_ITEMS]); setResult(null); };
  const stepTitles = ["Tayyorgarlik", "Marshrutni eslang", "Tartibni tiklang", "Natija"];

  return (
    <ExerciseShell title="🗺 Marshrut eslash" stepTitle={stepTitles[step]} totalSteps={4} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">🗺️</div>
          <h3>Marshrut tartibini eslab qoling</h3>
          <p>Quyidagi joylar tartibini 8 soniya ichida eslab qoling, so'ng xuddi shu tartibda tiklang.</p>
          <div className="tip-box">💡 Joylarni hikoya sifatida ulang: "Avval maktabga, keyin do'konga..."</div>
          <button className="btn-primary" onClick={startTimer}>Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <div className="timer-display">
            <div className="timer-circle" style={{ borderColor: timer <= 3 ? "#EF4444" : "#6C63FF" }}>
              <span className="timer-num" style={{ color: timer <= 3 ? "#EF4444" : "#6C63FF" }}>{timer}</span>
            </div>
          </div>
          <div className={`route-display ${fading ? "fading" : ""}`}>
            {ROUTE_ITEMS.map((item, i) => (
              <div key={i} className="route-item">
                <div className="route-num">{i + 1}</div>
                <div className="route-icon">{ROUTE_ICONS[item]}</div>
                <div className="route-name">{item}</div>
                {i < ROUTE_ITEMS.length - 1 && <div className="route-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h3>Tartibni tiklang:</h3>
          <div className="user-order">
            {userOrder.map((item, i) => (
              <div key={i} className="order-item">
                <span className="order-num">{i + 1}</span>
                <span>{ROUTE_ICONS[item]} {item}</span>
              </div>
            ))}
            {userOrder.length < ROUTE_ITEMS.length && (
              <div className="order-empty">{userOrder.length + 1}...</div>
            )}
          </div>
          <div className="route-choices">
            {remaining.map(item => (
              <button key={item} className="route-choice-btn" onClick={() => addToOrder(item)}>
                {ROUTE_ICONS[item]} {item}
              </button>
            ))}
          </div>
          {userOrder.length === ROUTE_ITEMS.length && (
            <button className="btn-primary" onClick={checkOrder}>Tekshirish →</button>
          )}
        </div>
      )}

      {step === 3 && result && (
        <ResultCard score={result.score} maxScore={ROUTE_ITEMS.length}
          level={result.level} message={`${result.score} ta joy to'g'ri joyda`}
          onRetry={restart} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 7. KUN YAKUNIDA XOTIRA
// ═══════════════════════════════════════
const DAILY_QUESTIONS = [
  { q: "Bugun birinchi uchratgan odamingiz kim edi?", placeholder: "Ismini yoki tavsifini yozing..." },
  { q: "Bugun biror kimning aytgan gapini eslay olasizmi?", placeholder: "Gapni yozib ko'ring..." },
  { q: "Bugun qanday kiyim kiydingiz?", placeholder: "Rang va kiyim turini yozing..." },
  { q: "Bugun nima yedingiz (nonushta)?", placeholder: "Taomni yozing..." },
  { q: "Bugun qanday musiqa eshitdingiz yoki ko'chada qanday ovoz eshitdingiz?", placeholder: "Ovoz yoki musiqa haqida yozing..." },
];

function DailyMemoryExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(DAILY_QUESTIONS.length).fill(""));
  const [result, setResult] = useState(null);

  const nextQ = () => {
    if (qIndex + 1 < DAILY_QUESTIONS.length) setQIndex(q => q + 1);
    else finishQuiz();
  };

  const finishQuiz = () => {
    const filled = answers.filter(a => a.trim().length > 5).length;
    setResult({ filled, level: filled >= 4 ? "alo" : filled >= 2 ? "yaxshi" : "rivojlantir" });
    setStep(2);
  };

  const updateAnswer = (val) => {
    const newAns = [...answers];
    newAns[qIndex] = val;
    setAnswers(newAns);
  };

  const stepTitles = ["Tayyorgarlik", "Savollar", "Natija"];
  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("daily", "Kun yakunida xotira", result.filled, label);
    }
  }, [result]);

  return (
    <ExerciseShell title="🌙 Kun yakunida xotira" stepTitle={stepTitles[step]} totalSteps={3} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">🌙</div>
          <h3>Kun yakunida xotira mashqi</h3>
          <p>Uxlashdan oldin kun davomida bo'lgan voqealarni eslashga harakat qiling. Bu xotirani mustahkamlaydi.</p>
          <div className="tip-box">💡 Eng yaxshi vaqt: Uxlashdan 15-20 daqiqa oldin</div>
          <button className="btn-primary" onClick={() => setStep(1)}>Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <div className="q-counter">{qIndex + 1} / {DAILY_QUESTIONS.length}</div>
          <div className="q-progress-bar-wrap">
            <div className="q-bar" style={{ width: ((qIndex + 1) / DAILY_QUESTIONS.length * 100) + "%" }} />
          </div>
          <h3 style={{ margin: "16px 0 8px" }}>{DAILY_QUESTIONS[qIndex].q}</h3>
          <textarea className="ex-textarea" rows={4}
            placeholder={DAILY_QUESTIONS[qIndex].placeholder}
            value={answers[qIndex]}
            onChange={e => updateAnswer(e.target.value)} />
          <button className="btn-primary" onClick={nextQ}>
            {qIndex + 1 < DAILY_QUESTIONS.length ? "Keyingi savol →" : "Tugatish →"}
          </button>
        </div>
      )}

      {step === 2 && result && (
        <ResultCard score={result.filled} maxScore={DAILY_QUESTIONS.length}
          level={result.level} message={`${result.filled} ta savolga batafsil javob berdingiz`}
          onRetry={() => { setStep(0); setQIndex(0); setAnswers(Array(DAILY_QUESTIONS.length).fill("")); setResult(null); }} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 8. 7 TA PREDMET
// ═══════════════════════════════════════
const HIDDEN_OBJECTS = [
  { icon: "📱", label: "Telefon" }, { icon: "🔑", label: "Kalit" }, { icon: "📖", label: "Kitob" },
  { icon: "✂️", label: "Qaychi" }, { icon: "🖊️", label: "Ruchka" }, { icon: "📎", label: "Qisqich" }, { icon: "🔦", label: "Fonar" },
];

function SevenObjectsExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(10);
  const [hidden, setHidden] = useState(false);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const ALL_OBJ_CHOICES = [...HIDDEN_OBJECTS.map(o => o.label), "Qoshiq", "Kasal", "Soat", "Daftar"];

  const start = () => {
    setStep(1); setTimer(10);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setHidden(true); setTimeout(() => setStep(2), 600); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  //useEffect(() => () => clearInterval(timerRef.current), []);
  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("objects7", "7 ta predmet", result.score, label);
    }
  }, [result]);

  const toggle = (label) => setSelected(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label]);

  const check = () => {
    const correct = selected.filter(s => HIDDEN_OBJECTS.map(o => o.label).includes(s));
    const missed = HIDDEN_OBJECTS.map(o => o.label).filter(l => !selected.includes(l));
    setResult({ score: correct.length, correct, missed, level: correct.length >= 6 ? "alo" : correct.length >= 4 ? "yaxshi" : "rivojlantir" });
    setStep(3);
  };

  const restart = () => { setStep(0); setTimer(10); setHidden(false); setSelected([]); setResult(null); };
  const stepTitles = ["Tayyorgarlik", "Narsalarni eslang", "Javob bering", "Natija"];

  return (
    <ExerciseShell title="📦 7 ta predmet" stepTitle={stepTitles[step]} totalSteps={4} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">📦</div>
          <h3>7 ta narsani eslab qoling</h3>
          <p>10 soniya davomida 7 ta narsaga qarang, so'ng yashiringanida barchasini eslab qoling.</p>
          <div className="tip-box">💡 Narsalarni hikoya bilan bog'lang yoki guruhlab eslab qoling</div>
          <button className="btn-primary" onClick={start}>Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <div className="timer-display">
            <div className="timer-circle" style={{ borderColor: timer <= 3 ? "#EF4444" : "#6C63FF" }}>
              <span className="timer-num" style={{ color: timer <= 3 ? "#EF4444" : "#6C63FF" }}>{timer}</span>
            </div>
          </div>
          <div className={`objects-grid ${hidden ? "fading" : ""}`}>
            {HIDDEN_OBJECTS.map((obj, i) => (
              <div key={i} className="hidden-obj">
                <span style={{ fontSize: 32 }}>{obj.icon}</span>
                <span style={{ fontSize: 12, color: "#64748B" }}>{obj.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h3>Qaysi narsalarni ko'rdingiz?</h3>
          <div className="recall-grid">
            {ALL_OBJ_CHOICES.map((label, i) => (
              <button key={i} className={`recall-btn ${selected.includes(label) ? "selected" : ""}`} onClick={() => toggle(label)}>
                {selected.includes(label) ? "✓ " : ""}{label}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={check} disabled={selected.length === 0}>Tekshirish →</button>
        </div>
      )}

      {step === 3 && result && (
        <ResultCard score={result.score} maxScore={7}
          level={result.level} correctItems={result.correct} missedItems={result.missed}
          onRetry={restart} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 9. XONA TAHLIL
// ═══════════════════════════════════════
const ROOM_OBJECTS = [
  { icon: "🪑", label: "Stul", pos: "chap pastda" }, { icon: "🖼️", label: "Rasm", pos: "devorida" },
  { icon: "💡", label: "Chiroq", pos: "shiftda" }, { icon: "📺", label: "Televizor", pos: "o'ng tomonda" },
  { icon: "🪴", label: "O'simlik", label2: "Gul", pos: "burchakda" }, { icon: "📚", label: "Kitob tokchasi", pos: "devorida" },
  { icon: "🪟", label: "Deraza", pos: "chap tomonda" }, { icon: "🛋️", label: "Divan", pos: "markazda" },
];

function RoomAnalysisExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(12);
  const [fading, setFading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const ALL_CHOICES = [...ROOM_OBJECTS.map(o => o.label), "Shkaf", "Gilamcha", "Oyna", "Eshik"];

  const start = () => {
    setStep(1); setTimer(12);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setFading(true); setTimeout(() => setStep(2), 700); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  //useEffect(() => () => clearInterval(timerRef.current), []);
  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("room", "Xona tahlil", result.score, label);
    }
  }, [result]);

  const toggle = (label) => setAnswers(a => a.includes(label) ? a.filter(x => x !== label) : [...a, label]);

  const check = () => {
    const correct = answers.filter(a => ROOM_OBJECTS.map(o => o.label).includes(a));
    const missed = ROOM_OBJECTS.map(o => o.label).filter(l => !answers.includes(l));
    setResult({ score: correct.length, correct, missed, level: correct.length >= 7 ? "alo" : correct.length >= 4 ? "yaxshi" : "rivojlantir" });
    setStep(3);
  };

  const restart = () => { setStep(0); setTimer(12); setFading(false); setAnswers([]); setResult(null); };
  const stepTitles = ["Tayyorgarlik", "Xonani kuzating", "Narsalarni eslab qoling", "Natija"];

  return (
    <ExerciseShell title="🚪 Xona tahlil" stepTitle={stepTitles[step]} totalSteps={4} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">🚪</div>
          <h3>Xonani tahlil qilish mashqi</h3>
          <p>Xonadagi barcha narsalarga 12 soniya mobaynida qarang. So'ngra qaysi narsalar borligini eslab qoling.</p>
          <div className="tip-box">💡 Narsalarni joylashuviga e'tibor bering — bu eslab qolishni osonlashtiradi</div>
          <button className="btn-primary" onClick={start}>Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <div className="timer-display">
            <div className="timer-circle" style={{ borderColor: timer <= 4 ? "#EF4444" : "#6C63FF" }}>
              <span className="timer-num" style={{ color: timer <= 4 ? "#EF4444" : "#6C63FF" }}>{timer}</span>
            </div>
          </div>
          <div className={`room-view ${fading ? "fading" : ""}`}>
            <div className="room-bg">
              <div className="room-wall">
                {ROOM_OBJECTS.slice(0, 4).map((obj, i) => (
                  <div key={i} className="room-obj" style={{ left: 20 + i * 22 + "%", top: i % 2 === 0 ? "20%" : "55%" }}>
                    <span style={{ fontSize: 28 }}>{obj.icon}</span>
                    <span style={{ fontSize: 10, color: "#64748B" }}>{obj.label}</span>
                  </div>
                ))}
              </div>
              <div className="room-floor">
                {ROOM_OBJECTS.slice(4).map((obj, i) => (
                  <div key={i} className="room-obj" style={{ left: 10 + i * 25 + "%", top: "30%" }}>
                    <span style={{ fontSize: 28 }}>{obj.icon}</span>
                    <span style={{ fontSize: 10, color: "#64748B" }}>{obj.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h3>Xonada qanday narsalar bor edi?</h3>
          <div className="recall-grid">
            {ALL_CHOICES.map((label, i) => (
              <button key={i} className={`recall-btn ${answers.includes(label) ? "selected" : ""}`} onClick={() => toggle(label)}>
                {answers.includes(label) ? "✓ " : ""}{label}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={check} disabled={answers.length === 0}>Tekshirish →</button>
        </div>
      )}

      {step === 3 && result && (
        <ResultCard score={result.score} maxScore={8}
          level={result.level} correctItems={result.correct} missedItems={result.missed}
          onRetry={restart} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 10. SHE'R TAHLIL
// ═══════════════════════════════════════
const POEM = {
  text: "Bahor keldi, gul ochildi,\nDaraxtlar yashnab, bog' to'ldi.\nQushlar sayradi, shamol esdi,\nTabiat go'zal libos kiydi.",
  questions: [
    { q: "She'rda qaysi fasl haqida gaplashilgan?", answer: "Bahor", opts: ["Bahor", "Yoz", "Kuz", "Qish"] },
    { q: "She'rda qanday hayvon tilga olingan?", answer: "Qushlar", opts: ["Kapalak", "Qushlar", "Baliq", "Mushuk"] },
    { q: "She'rda 'bog'' so'zi qaysi satrda kelgan?", answer: "2-satr", opts: ["1-satr", "2-satr", "3-satr", "4-satr"] },
    { q: "She'rning oxirgi so'zi nima?", answer: "kiydi", opts: ["esdi", "ochildi", "kiydi", "to'ldi"] },
  ],
};

function PoemAnalysisExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const selectAnswer = (ans) => {
    const newAns = [...userAnswers, ans];
    setUserAnswers(newAns);
    if (qIndex + 1 < POEM.questions.length) setQIndex(q => q + 1);
    else {
      const score = newAns.filter((a, i) => a === POEM.questions[i].answer).length;
      setResult({ score, level: score >= 4 ? "alo" : score >= 2 ? "yaxshi" : "rivojlantir" });
      setStep(2);
    }
  };

  const restart = () => { setStep(0); setQIndex(0); setUserAnswers([]); setResult(null); };
  const stepTitles = ["She'rni o'qing", "Savollar", "Natija"];
  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("poem", "She'r tahlil", result.score, label);
    }
  }, [result]);

  return (
    <ExerciseShell title="📖 She'r tahlil" stepTitle={stepTitles[step]} totalSteps={3} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">📖</div>
          <h3>She'rni diqqat bilan o'qing</h3>
          <div className="poem-box">
            {POEM.text.split("\n").map((line, i) => <p key={i} className="poem-line">{line}</p>)}
          </div>
          <div className="tip-box">💡 Har bir so'zga e'tibor bering — so'ngra savollar beriladi</div>
          <button className="btn-primary" onClick={() => setStep(1)}>Savollar →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <div className="q-counter">{qIndex + 1} / {POEM.questions.length}</div>
          <div className="q-progress-bar-wrap">
            <div className="q-bar" style={{ width: ((qIndex + 1) / POEM.questions.length * 100) + "%" }} />
          </div>
          <h3 style={{ margin: "16px 0 16px" }}>{POEM.questions[qIndex].q}</h3>
          <div className="poem-opts">
            {POEM.questions[qIndex].opts.map((opt, i) => (
              <button key={i} className="poem-opt-btn" onClick={() => selectAnswer(opt)}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && result && (
        <ResultCard score={result.score} maxScore={POEM.questions.length}
          level={result.level} message={`${result.score} ta savolga to'g'ri javob`}
          onRetry={restart} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 11. YASHIRINGAN ISM
// ═══════════════════════════════════════
const HIDDEN_NAMES = [
  { sentence: "Ota o'g'liga: 'Bilasan jargacha bo'lgan masofa uzoqlik qiladi'", hint: "J-A-R bilan boshlang", answer: "JASMIN", explanation: "jar → Ja + sm + in" },
  { sentence: "Psixologning bolaga qo'ygan tashxis ravshan va aniq edi.", hint: "Aniqlik bildiradi", answer: "RAVSHAN", explanation: "tashxis ravshan → RAVSHAN" },
  { sentence: "Bahorda qo'zigul yuzidagi shabnamni ko'rganmisiz?", hint: "Qo'zi + gul", answer: "ZULFIYA", explanation: "qo'zigul → z+ul+fi+ya" },
  { sentence: "Hali ma'naviyat haqida ko'p gapirishimizga to'g'ri keladi.", hint: "Ma'naviyat ichida", answer: "NAVI", explanation: "ma'naviyat → ma+NAVI+yat" },
];

function HiddenNameExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState([]);
  const [result, setResult] = useState(null);

  const checkAnswer = () => {
    const isCorrect = answer.trim().toUpperCase() === HIDDEN_NAMES[qIndex].answer;
    const newScores = [...scores, isCorrect ? 1 : 0];
    setScores(newScores);
    setRevealed(true);
    setTimeout(() => {
      setRevealed(false); setShowHint(false); setAnswer("");
      if (qIndex + 1 < HIDDEN_NAMES.length) setQIndex(q => q + 1);
      else {
        const total = newScores.reduce((a, b) => a + b, 0);
        setResult({ score: total, level: total >= 4 ? "alo" : total >= 2 ? "yaxshi" : "rivojlantir" });
        setStep(2);
      }
    }, 2000);
  };

  const restart = () => { setStep(0); setQIndex(0); setAnswer(""); setShowHint(false); setRevealed(false); setScores([]); setResult(null); };
  const stepTitles = ["Tayyorgarlik", "Ismlarni toping", "Natija"];
  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("hidden", "Yashiringan ism", result.score, label);
    }
  }, [result]);

  return (
    <ExerciseShell title="🔍 Yashiringan ism" stepTitle={stepTitles[step]} totalSteps={3} currentStep={step} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">🔍</div>
          <h3>Jumlada yashiringan ismni toping</h3>
          <p>Har bir jumlada inson ismi yashiringan. So'zlar ichida diqqat bilan qidiring.</p>
          <div className="example-box">
            <strong>Misol:</strong> "O'quvchi kecha rost so'zlaganidan xursand bo'ldi"<br />
            <span style={{ color: "#6C63FF" }}>→ "rost" ichida: CHAROS (teskari o'qiladi)</span>
          </div>
          <button className="btn-primary" onClick={() => setStep(1)}>Boshlash →</button>
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <div className="q-counter">{qIndex + 1} / {HIDDEN_NAMES.length}</div>
          <div className="q-progress-bar-wrap">
            <div className="q-bar" style={{ width: ((qIndex + 1) / HIDDEN_NAMES.length * 100) + "%" }} />
          </div>
          <div className="hidden-sentence">{HIDDEN_NAMES[qIndex].sentence}</div>
          {showHint && <div className="hint-reveal">💡 {HIDDEN_NAMES[qIndex].hint}</div>}
          <div className="hidden-input-row">
            <input className="ex-input" placeholder="Ismni yozing..."
              value={answer} onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !revealed && checkAnswer()} />
          </div>
          {revealed && (
            <div className={`reveal-result ${scores[scores.length - 1] ? "correct" : "wrong"}`}>
              {scores[scores.length - 1] ? "✓ To'g'ri!" : `✗ Noto'g'ri. To'g'ri javob: ${HIDDEN_NAMES[qIndex].answer}`}
              <br /><small>{HIDDEN_NAMES[qIndex].explanation}</small>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {!showHint && !revealed && <button className="btn-secondary" onClick={() => setShowHint(true)}>💡 Maslahat</button>}
            {!revealed && <button className="btn-primary" onClick={checkAnswer} disabled={!answer.trim()}>Tekshirish →</button>}
          </div>
        </div>
      )}

      {step === 2 && result && (
        <ResultCard score={result.score} maxScore={HIDDEN_NAMES.length}
          level={result.level} message={`${result.score} ta ismni topdingiz`}
          onRetry={restart} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// 12. KO'P OB'EKTLARNI KUZATISH
// ═══════════════════════════════════════
const MOVING_OBJECTS = ["🔴", "🔵", "🟢", "🟡", "🟣"];

function MultiObjectExercise({ onBack }) {
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(30);
  const [targetIdx, setTargetIdx] = useState(0);
  const [positions, setPositions] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [userChoice, setUserChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const TOTAL_ROUNDS = 3;

  const initPositions = useCallback(() => {
    return MOVING_OBJECTS.map(() => ({
      x: Math.random() * 70 + 10,
      y: Math.random() * 60 + 20,
    }));
  }, []);

  const startRound = useCallback(() => {
    const newPos = initPositions();
    setPositions(newPos);
    const target = Math.floor(Math.random() * MOVING_OBJECTS.length);
    setTargetIdx(target);
    setRevealed(false); setUserChoice(null); setTimer(30); setStep(1);

    let moveCount = 0;
    timerRef.current = setInterval(() => {
      moveCount++;
      if (moveCount % 3 === 0) {
        setPositions(prev => prev.map(p => ({
          x: Math.max(5, Math.min(85, p.x + (Math.random() - 0.5) * 20)),
          y: Math.max(10, Math.min(85, p.y + (Math.random() - 0.5) * 20)),
        })));
      }
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setRevealed(true); setStep(2); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [initPositions]);

  //useEffect(() => () => clearInterval(timerRef.current), []);
  useEffect(() => {
    if (result) {
      const label = result.level === "alo" ? "A'lo" : result.level === "yaxshi" ? "Yaxshi" : "Rivojlantirish kerak";
      saveExerciseResult("multiobj", "Ko'p ob'ektlar", result.score, label);
    }
  }, [result]);

  const selectObject = (idx) => {
    if (userChoice !== null) return;
    setUserChoice(idx);
    if (idx === targetIdx) setScore(s => s + 1);
    setTimeout(() => {
      if (round < TOTAL_ROUNDS) { setRound(r => r + 1); startRound(); }
      else {
        const finalScore = score + (idx === targetIdx ? 1 : 0);
        setResult({ score: finalScore, level: finalScore >= 3 ? "alo" : finalScore >= 2 ? "yaxshi" : "rivojlantir" });
        setStep(3);
      }
    }, 1500);
  };

  const stepTitles = ["Tayyorgarlik", "Kuzating", "Tanlang", "Natija"];

  return (
    <ExerciseShell title="👀 Ko'p ob'ektlar" stepTitle={stepTitles[Math.min(step, 3)]} totalSteps={4} currentStep={Math.min(step, 3)} onBack={onBack}>
      {step === 0 && (
        <div className="step-content">
          <div className="step-big-icon">👀</div>
          <h3>Ko'p ob'ektlarni bir vaqtda kuzating</h3>
          <p>Ekranda {MOVING_OBJECTS.length} ta ob'ekt harakatlanadi. Berilgan ob'ektni kuzatib boring va vaqt tugagach toping.</p>
          <div className="tip-box">💡 Ko'zingiz bilan kuzating — ob'ektlar harakatlanadi!</div>
          <button className="btn-primary" onClick={startRound}>Boshlash →</button>
        </div>
      )}

      {step === 1 && positions.length > 0 && (
        <div className="step-content">
          <div className="tracking-header">
            <span>🎯 Kuzating: <strong>{MOVING_OBJECTS[targetIdx]}</strong></span>
            <span className="tracking-timer" style={{ color: timer <= 10 ? "#EF4444" : "#6C63FF" }}>⏱ {timer}s</span>
            <span>Tur: {round}/{TOTAL_ROUNDS}</span>
          </div>
          <div className="tracking-arena">
            {MOVING_OBJECTS.map((obj, i) => (
              <div key={i} className="tracking-obj"
                style={{ left: positions[i]?.x + "%", top: positions[i]?.y + "%", transition: "left 0.8s ease, top 0.8s ease" }}>
                {obj}
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: "#64748B" }}>Vaqt tugagach, kuzatgan ob'ektingizni tanlang</p>
        </div>
      )}

      {step === 2 && positions.length > 0 && (
        <div className="step-content">
          <h3>Qaysi ob'ektni kuzatdingiz?</h3>
          <p style={{ marginBottom: 16 }}>Siz <strong>{MOVING_OBJECTS[targetIdx]}</strong> ni kuzatish kerak edi</p>
          <div className="choice-grid">
            {MOVING_OBJECTS.map((obj, i) => {
              let cls = "choice-btn";
              if (userChoice !== null) {
                if (i === targetIdx) cls += " choice-correct";
                else if (i === userChoice) cls += " choice-wrong";
              }
              return <button key={i} className={cls} onClick={() => selectObject(i)}>{obj}</button>;
            })}
          </div>
          {userChoice !== null && (
            <div className={`reveal-result ${userChoice === targetIdx ? "correct" : "wrong"}`}>
              {userChoice === targetIdx ? "✓ Ajoyib! To'g'ri topdingiz!" : "✗ Xato. Keyingisini sinab ko'ring!"}
            </div>
          )}
        </div>
      )}

      {step === 3 && result && (
        <ResultCard score={result.score} maxScore={TOTAL_ROUNDS}
          level={result.level} message={`${result.score}/${TOTAL_ROUNDS} turda to'g'ri topdingiz`}
          onRetry={() => { setStep(0); setScore(0); setRound(1); setResult(null); }} onBack={onBack} />
      )}
    </ExerciseShell>
  );
}

// ═══════════════════════════════════════
// ASOSIY EXERCISES SAHIFASI
// ═══════════════════════════════════════
const EXERCISES_LIST = [
  { id: "memory",    icon: "🧠", title: "Xotira mashqi",          desc: "Rasmga qarab detallarni eslab qoling",          cat: "Xotira",        level: "Oson",   dur: "2–3 min", color: "#6C63FF" },
  { id: "numbers",   icon: "🔢", title: "Son qidiruv",             desc: "Yig'indisi 15 bo'lgan son guruhlarini toping",  cat: "Mantiq",        level: "O'rta",  dur: "3–5 min", color: "#0891B2" },
  { id: "division",  icon: "➗", title: "Bo'linish mashqi",        desc: "2 va 3 ga bo'linadigan sonlarni tanlang",       cat: "Mantiq",        level: "Oson",   dur: "2–3 min", color: "#059669" },
  { id: "twohands",  icon: "✏️", title: "Ikki qo'l mashqi",       desc: "Ikkala qo'l bilan bir vaqtda turli shakllar",   cat: "Koordinatsiya", level: "Qiyin",  dur: "3–4 min", color: "#DC2626" },
  { id: "secondhand",icon: "⏱", title: "Sekund strelkasi",        desc: "Diqqatni jamlash va chalg'islarni kuzatish",    cat: "Diqqat",        level: "Oson",   dur: "2 min",   color: "#7C3AED" },
  { id: "route",     icon: "🗺", title: "Marshrut eslash",         desc: "Joy tartibini eslab qoling va tiklang",         cat: "Xotira",        level: "O'rta",  dur: "3–4 min", color: "#D97706" },
  { id: "daily",     icon: "🌙", title: "Kun yakunida xotira",     desc: "Kun davomidagi voqealarni eslang",              cat: "Xotira",        level: "Oson",   dur: "5–10 min",color: "#4F46E5" },
  { id: "objects7",  icon: "📦", title: "7 ta predmet",            desc: "Yashiringan 7 ta narsani eslab qoling",         cat: "Xotira",        level: "O'rta",  dur: "3–5 min", color: "#0891B2" },
  { id: "room",      icon: "🚪", title: "Xona tahlil",             desc: "Xonadagi barcha narsalarni eslab qoling",       cat: "Kuzatuvchanlik",level: "O'rta",  dur: "3–4 min", color: "#059669" },
  { id: "poem",      icon: "📖", title: "She'r tahlil",            desc: "She'rni o'qib, savollarga javob bering",        cat: "Xotira",        level: "O'rta",  dur: "5–7 min", color: "#7C3AED" },
  { id: "hidden",    icon: "🔍", title: "Yashiringan ism",         desc: "Jumlalar ichidagi yashiringan ismlarni toping", cat: "Mantiq",        level: "Qiyin",  dur: "4–6 min", color: "#DC2626" },
  { id: "multiobj",  icon: "👀", title: "Ko'p ob'ektlar",          desc: "Harakatlanuvchi ob'ektlarni kuzating",          cat: "Diqqat",        level: "Qiyin",  dur: "3–4 min", color: "#D97706" },
];

const CATS = ["Barchasi", "Xotira", "Diqqat", "Mantiq", "Koordinatsiya", "Kuzatuvchanlik"];
const LEVELS = { "Oson": { bg: "#DCFCE7", color: "#16A34A" }, "O'rta": { bg: "#DBEAFE", color: "#2563EB" }, "Qiyin": { bg: "#FEF3C7", color: "#D97706" } };

export default function Exercises() {
  const [active, setActive] = useState(null);
  const [cat, setCat] = useState("Barchasi");
  const [search, setSearch] = useState("");

  if (active === "memory")     return <MemoryExercise     onBack={() => setActive(null)} />;
  if (active === "numbers")    return <NumberSearchExercise onBack={() => setActive(null)} />;
  if (active === "division")   return <DivisionExercise   onBack={() => setActive(null)} />;
  if (active === "twohands")   return <TwoHandsExercise   onBack={() => setActive(null)} />;
  if (active === "secondhand") return <SecondHandExercise onBack={() => setActive(null)} />;
  if (active === "route")      return <RouteExercise      onBack={() => setActive(null)} />;
  if (active === "daily")      return <DailyMemoryExercise onBack={() => setActive(null)} />;
  if (active === "objects7")   return <SevenObjectsExercise onBack={() => setActive(null)} />;
  if (active === "room")       return <RoomAnalysisExercise onBack={() => setActive(null)} />;
  if (active === "poem")       return <PoemAnalysisExercise onBack={() => setActive(null)} />;
  if (active === "hidden")     return <HiddenNameExercise  onBack={() => setActive(null)} />;
  if (active === "multiobj")   return <MultiObjectExercise onBack={() => setActive(null)} />;

  const filtered = EXERCISES_LIST.filter(e =>
    (cat === "Barchasi" || e.cat === cat) &&
    (e.title.toLowerCase().includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="exercises-page">
      <div className="ex-hero">
        <div className="ex-hero-badge">🧠 Kognitiv rivojlanish</div>
        <h1>Diqqat va xotira <span>mashqlari</span></h1>
        <p>Har kuni 5–10 daqiqa mashq qilib, xotira, diqqat va mantiqiy fikrlashni kuchaytiring</p>
      </div>

      <div className="ex-controls">
        <div className="ex-search-wrap">
          <span className="ex-search-icon">🔍</span>
          <input className="ex-search" placeholder="Mashq qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="ex-filter-tabs">
          {CATS.map(c => (
            <button key={c} className={`ex-ftab ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="ex-grid">
        {filtered.map(ex => {
          const lvl = LEVELS[ex.level];
          return (
            <div key={ex.id} className="ex-card-item" onClick={() => setActive(ex.id)}>
              <div className="ex-card-bar" style={{ background: ex.color }} />
              <div className="ex-card-content">
                <div className="ex-card-head">
                  <div className="ex-card-icon" style={{ background: ex.color + "18" }}>{ex.icon}</div>
                  <span className="ex-card-level" style={{ background: lvl.bg, color: lvl.color }}>{ex.level}</span>
                </div>
                <span className="ex-card-cat">{ex.cat}</span>
                <h3>{ex.title}</h3>
                <p>{ex.desc}</p>
                <div className="ex-card-footer">
                  <span>⏱ {ex.dur}</span>
                  <button className="ex-start-btn" style={{ background: `linear-gradient(90deg, ${ex.color}, ${ex.color}cc)` }}>Boshlash →</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
