import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// DESIGN TOKENS
// ============================================================
const T = {
  skyDeep:   "#060c1f",
  skyMid:    "#0a1535",
  cyan:      "#38e8ff",
  cyanMid:   "#1ec8e8",
  cyanSoft:  "#7dd8e8",
  blue:      "#a8c8f8",
  lavender:  "#c4b8f8",
  rose:      "#f8c0d8",
  mint:      "#a8f0d8",
  gold:      "#f8e0a0",
  text:      "#e8f4ff",
  textSub:   "rgba(200,230,255,0.65)",
  textMuted: "rgba(160,200,240,0.42)",
  border:    "rgba(100,200,255,0.16)",
};

// ============================================================
// DATA
// ============================================================
const MOODS = [
  { id: "happy",    emoji: "😊", label: "うれしい",  color: "#f8e0a0" },
  { id: "calm",     emoji: "😌", label: "おだやか",  color: "#a8f0d8" },
  { id: "loving",   emoji: "🥰", label: "あたたかい",color: "#f8c0d8" },
  { id: "tired",    emoji: "😴", label: "つかれた",  color: "#c4b8f8" },
  { id: "relieved", emoji: "😮‍💨", label: "ほっとした",color: "#a8c8f8" },
  { id: "grateful", emoji: "🫶", label: "ありがたい",color: "#f8c0d8" },
  { id: "peace",    emoji: "🌿", label: "しずか",    color: "#a8f0d8" },
  { id: "sparkle",  emoji: "✨", label: "きらきら",  color: "#f8e0a0" },
];

const WEATHERS = [
  { id: "sunny",  icon: "☀️", label: "晴れ" },
  { id: "cloudy", icon: "☁️", label: "くもり" },
  { id: "rainy",  icon: "🌧️", label: "雨" },
  { id: "part",   icon: "⛅", label: "晴れときどきくもり" },
  { id: "snowy",  icon: "❄️", label: "雪" },
];

const GENTLE = [
  "今日も一日お疲れさまでした。\n小さないいこと、ひとつだけ覚えてる？",
  "書けなくていいよ。スタンプひとつだけでも十分。",
  "頑張らなくていい。ただここに、あなたがいる。",
  "ちいさなことでいい。今日、何かひとつよかったことは？",
  "あなたの今日を、少しだけ教えてほしいな。",
  "完璧じゃなくていい。そのままのあなたでいい。",
];

const DONE_MSG = [
  "今日もよく頑張ったね ✨",
  "小さないいことを見つけてくれてありがとう 🌸",
  "あなたは十分すごい。本当に。",
  "今日のあなたを、ちゃんと残せたね 🌙",
  "こうして続けていることが、もうすてき 🌿",
  "書いてくれて、よかった 💙",
];

const PLACEHOLDERS = [
  ["朝のコーヒーが美味しかった", "電車で席を譲れた", "好きな曲がかかった"],
  ["ランチが思ったよりおいしかった", "同僚に笑顔で挨拶できた", "空がきれいだった"],
  ["帰り道に夕焼けを見た", "お風呂がゆっくり入れた", "ちゃんと眠れそう"],
];

// ============================================================
// STORAGE
// ============================================================
const EK = "sg_entries_v2";
const SK = "sg_settings_v2";
const loadEntries = () => { try { return JSON.parse(localStorage.getItem(EK)) || []; } catch { return []; } };
const saveEntries = (e) => { try { localStorage.setItem(EK, JSON.stringify(e)); } catch {} };
const loadSettings = () => {
  try { return { darkMode: true, notif: true, haptic: true, onboarded: false, ...JSON.parse(localStorage.getItem(SK)) }; }
  catch { return { darkMode: true, notif: true, haptic: true, onboarded: false }; }
};
const saveSettings = (s) => { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} };

const todayKey  = () => new Date().toISOString().split("T")[0];
const randWx    = () => WEATHERS[Math.floor(Math.random() * WEATHERS.length)];
const pick      = (arr) => arr[Math.floor(Math.random() * arr.length)];


// ============================================================
// GLOBAL CSS
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&family=Zen+Kaku+Gothic+New:wght@300;400;700&family=Space+Mono&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;font-family:'Zen Kaku Gothic New','Noto Serif JP',sans-serif;background:#020510;color:#e8f4ff;overflow:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(56,232,255,0.18);border-radius:2px}
textarea,input{font-family:inherit;background:transparent;border:none;outline:none;color:#e8f4ff;resize:none}
button{cursor:pointer;border:none;background:none;font-family:inherit}

@keyframes fadeUp  {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
@keyframes bloomIn {0%{transform:scale(0) rotate(-12deg);opacity:0}65%{transform:scale(1.12) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes floatBob{0%,100%{transform:translateY(0) rotate(0)}40%{transform:translateY(-7px) rotate(2deg)}70%{transform:translateY(-3px) rotate(-1.5deg)}}
@keyframes sway    {0%,100%{transform:rotate(0)}33%{transform:rotate(3.5deg)}66%{transform:rotate(-2.5deg)}}
@keyframes glow    {0%,100%{box-shadow:0 0 16px rgba(56,232,255,0.16)}50%{box-shadow:0 0 34px rgba(56,232,255,0.4)}}
@keyframes sparkUp {0%{opacity:0;transform:translateY(0) scale(0)}40%{opacity:1;transform:translateY(-28px) scale(1)}100%{opacity:0;transform:translateY(-72px) scale(0.12)}}
@keyframes twinkle {0%,100%{opacity:0.22}50%{opacity:1}}
@keyframes pulse   {0%,100%{transform:scale(1)}50%{transform:scale(1.055)}}
@keyframes slideUp {from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes slideIn {from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes lightDrift{0%{opacity:0;transform:translateY(14px) scale(0.6)}45%{opacity:0.9}100%{opacity:0;transform:translateY(-55px) scale(0.25)}}
@keyframes orbPulse{0%,100%{r:3.5;opacity:0.65}50%{r:5;opacity:0.95}}

.glass{background:linear-gradient(135deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.02) 100%);border:1px solid rgba(100,200,255,0.16);border-radius:20px;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.36),inset 0 1px 0 rgba(255,255,255,0.055)}
.neuro{background:linear-gradient(145deg,rgba(10,21,53,0.96),rgba(6,12,31,0.98));box-shadow:5px 5px 14px rgba(0,0,0,0.5),-3px -3px 9px rgba(56,232,255,0.032);border:1px solid rgba(255,255,255,0.042);border-radius:14px}
.btn-cta{background:linear-gradient(135deg,#1ec8e8,#38e8ff);color:#060c1f;font-weight:700;border-radius:50px;box-shadow:0 4px 20px rgba(56,232,255,0.36);transition:transform .15s,box-shadow .15s;letter-spacing:.04em}
.btn-cta:hover{transform:translateY(-1px);box-shadow:0 6px 26px rgba(56,232,255,0.5)}
.btn-cta:active{transform:scale(0.97)}
.btn-ghost{background:rgba(255,255,255,0.055);color:rgba(200,230,255,0.62);border:1px solid rgba(100,200,255,0.16);border-radius:50px;transition:background .15s,color .15s}
.btn-ghost:hover{background:rgba(255,255,255,0.1);color:#e8f4ff}
.tabbar{background:rgba(6,12,31,0.92);backdrop-filter:blur(22px);border-top:1px solid rgba(100,200,255,0.1)}
`;

// ============================================================
// STARFIELD
// ============================================================
function Stars() {
  const stars = useRef(Array.from({ length: 90 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 1.8 + 0.4,
    d: 2 + Math.random() * 3.5, dl: Math.random() * 5,
    c: i % 9 === 0 ? T.cyan : "rgba(200,230,255,0.75)",
  }))).current;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 80% 50% at 18% 8%, rgba(14,32,96,0.65) 0%, transparent 55%),
          radial-gradient(ellipse 55% 38% at 82% 82%, rgba(8,18,48,0.7) 0%, transparent 48%),
          radial-gradient(circle at 50% 50%, #060c1f 0%, #020510 100%)` }} />
      {stars.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s, borderRadius: "50%", background: s.c,
          animation: `twinkle ${s.d}s ease-in-out ${s.dl}s infinite` }} />
      ))}
    </div>
  );
}

// ============================================================
// PARTICLES
// ============================================================
function Particles({ active, onDone }) {
  const [ps, setPs] = useState([]);
  useEffect(() => {
    if (!active) return;
    setPs(Array.from({ length: 26 }, (_, i) => ({
      id: i, x: 25 + Math.random() * 50,
      dl: Math.random() * 0.65, sz: 7 + Math.random() * 9,
      col: pick([T.cyan, T.blue, T.lavender, T.rose, T.gold, T.mint]),
      sym: pick(["✦","•","✿","◇"]),
    })));
    const t = setTimeout(() => { setPs([]); onDone?.(); }, 2500);
    return () => clearTimeout(t);
  }, [active]);
  if (!ps.length) return null;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 60, overflow: "hidden" }}>
      {ps.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, bottom: "35%",
          fontSize: p.sz, color: p.col, opacity: 0,
          animation: `sparkUp ${1.1 + p.dl}s ease-out ${p.dl}s forwards`,
        }}>{p.sym}</div>
      ))}
    </div>
  );
}

// ============================================================
// BLOOM VISUAL — entries-driven: every record grows the flower
//
// Growth model (purely additive, never subtracts):
//   0 entries  → soil + stem only
//   1–2        → single bud
//   3–6        → 3 petals (inner ring)
//   7–14       → 6 petals (inner + outer ring begins)
//   15–29      → 6 inner + up to 6 outer petals filling in
//   30–49      → full double-ring (12 petals) + small side buds
//   50+        → triple-ring (18 petals) + glowing aureole
//
// Each petal's colour comes from the mood of that specific entry,
// so the flower is literally painted by the user's own feelings.
// ============================================================
function Bloom({ entries, size = 200, interactive }) {
  const [bounce, setBounce] = useState(false);
  const [sparks, setSparks]  = useState([]);
  const total = entries.length;

  const tap = () => {
    if (!interactive) return;
    setBounce(true);
    setSparks(Array.from({ length: 6 }, (_, i) => ({ id: i, a: i * 60 + 30 })));
    setTimeout(() => { setBounce(false); setSparks([]); }, 750);
  };

  const cx = size / 2;
  const cy = size / 2;

  // ── Petal colour palette: mood → colour, fallback to cool gradient ──
  const moodCol = (entry) => {
    if (!entry) return T.cyanSoft;
    const m = MOODS.find(m => m.id === entry.mood);
    return m?.color || T.cyanSoft;
  };

  // ── Build petal layers from actual entries ──
  // Ring 1: up to 6 inner petals  (entries 1–6)
  // Ring 2: up to 6 outer petals  (entries 7–14 → fill one by one from entry 7)
  // Ring 3: up to 6 far petals    (entries 30+)
  // Tiny buds around stem         (entries 15–29 add them)

  const innerCount  = Math.min(total, 6);
  const outerCount  = total >= 7  ? Math.min(total - 6,  6) : 0;
  const farCount    = total >= 30 ? Math.min(total - 29, 6) : 0;
  const budCount    = total >= 15 ? Math.min(Math.floor((total - 14) / 2), 4) : 0;

  const innerR  = size * 0.22;
  const outerR  = size * 0.36;
  const farR    = size * 0.46;
  const petalW  = size * 0.18;
  const petalH  = size * 0.22;
  const outerPW = size * 0.15;
  const outerPH = size * 0.19;
  const farPW   = size * 0.12;
  const farPH   = size * 0.15;

  // Phase helpers
  const hasBud    = total >= 1;
  const hasCenter = total >= 3;
  const hasStem   = true;

  // Glow intensity scales with total
  const glowAlpha = Math.min(0.04 + total * 0.006, 0.22);
  const glowSize  = size * (0.55 + Math.min(total / 50, 1) * 0.3);

  return (
    <div
      onClick={tap}
      style={{
        width: size, height: size, position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: interactive ? "pointer" : "default",
        transform: bounce ? "scale(1.09)" : "scale(1)",
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        animation: total > 0 ? "floatBob 4.8s ease-in-out infinite" : "none",
        flexShrink: 0,
      }}
    >
      {/* Ambient glow — grows with entries */}
      {total > 0 && (
        <div style={{
          position: "absolute",
          width: glowSize, height: glowSize, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(56,232,255,${glowAlpha}) 0%, transparent 70%)`,
          animation: "glow 3.8s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* ── Far petals (ring 3, entries 30+) — rendered first so they sit behind ── */}
      {Array.from({ length: farCount }).map((_, i) => {
        const angle  = (i / 6) * 360 + 30; // offset so they sit between outer
        const rad    = (angle * Math.PI) / 180;
        const ex     = cx + Math.sin(rad) * farR - farPW / 2;
        const ey     = cy - Math.cos(rad) * farR - farPH / 2;
        const col    = moodCol(entries[29 + i]);
        return (
          <div key={`far-${i}`} style={{
            position: "absolute",
            left: ex, top: ey,
            width: farPW, height: farPH,
            background: `radial-gradient(ellipse at 50% 30%, ${col}cc, ${col}44)`,
            borderRadius: "50% 50% 40% 40%",
            transform: `rotate(${angle}deg)`,
            opacity: 0.72,
            boxShadow: `0 0 8px ${col}33`,
            animation: `sway ${4.2 + i * 0.3}s ease-in-out ${i * 0.12}s infinite`,
          }} />
        );
      })}

      {/* ── Outer petals (ring 2, entries 7–12) ── */}
      {Array.from({ length: outerCount }).map((_, i) => {
        const angle  = (i / 6) * 360;
        const rad    = (angle * Math.PI) / 180;
        const ex     = cx + Math.sin(rad) * outerR - outerPW / 2;
        const ey     = cy - Math.cos(rad) * outerR - outerPH / 2;
        const col    = moodCol(entries[6 + i]);
        return (
          <div key={`outer-${i}`} style={{
            position: "absolute",
            left: ex, top: ey,
            width: outerPW, height: outerPH,
            background: `radial-gradient(ellipse at 50% 28%, ${col}dd, ${col}55)`,
            borderRadius: "50% 50% 38% 38%",
            transform: `rotate(${angle}deg)`,
            opacity: 0.85,
            boxShadow: `0 0 10px ${col}44`,
            animation: `sway ${3.8 + i * 0.28}s ease-in-out ${i * 0.1}s infinite`,
          }} />
        );
      })}

      {/* ── Inner petals (ring 1, entries 1–6) ── */}
      {Array.from({ length: innerCount }).map((_, i) => {
        const angle  = (i / 6) * 360;
        const rad    = (angle * Math.PI) / 180;
        const ex     = cx + Math.sin(rad) * innerR - petalW / 2;
        const ey     = cy - Math.cos(rad) * innerR - petalH / 2;
        const col    = moodCol(entries[i]);
        return (
          <div key={`inner-${i}`} style={{
            position: "absolute",
            left: ex, top: ey,
            width: petalW, height: petalH,
            background: `radial-gradient(ellipse at 50% 25%, ${col}ff, ${col}66)`,
            borderRadius: "50% 50% 35% 35%",
            transform: `rotate(${angle}deg)`,
            opacity: 0.92,
            boxShadow: `0 0 14px ${col}55`,
            animation: `sway ${3.4 + i * 0.24}s ease-in-out ${i * 0.08}s infinite`,
          }} />
        );
      })}

      {/* ── Stem & soil (always visible) ── */}
      <div style={{
        position: "absolute",
        bottom: size * 0.08,
        left: "50%", transform: "translateX(-50%)",
        width: size * 0.38, height: size * 0.09,
        background: "linear-gradient(to bottom, #3a2810, #1e1008)",
        borderRadius: "50%",
        boxShadow: "0 3px 8px rgba(0,0,0,0.55)",
      }} />
      <div style={{
        position: "absolute",
        bottom: size * 0.14,
        left: "50%", transform: "translateX(-50%)",
        width: size * 0.028,
        height: total === 0 ? size * 0.3 : size * 0.28,
        background: "linear-gradient(to top, #5a8a50, #a8d898)",
        borderRadius: "2px 2px 0 0",
      }} />

      {/* ── Small side buds (entries 15–28, one per 2 entries) ── */}
      {Array.from({ length: budCount }).map((_, i) => {
        const side   = i % 2 === 0 ? -1 : 1;
        const yOff   = size * (0.22 - i * 0.04);
        const col    = moodCol(entries[14 + i * 2]);
        return (
          <div key={`bud-${i}`} style={{
            position: "absolute",
            bottom: size * 0.14 + yOff,
            left: `calc(50% + ${side * size * 0.04}px)`,
            width: size * 0.07, height: size * 0.1,
            background: `linear-gradient(to top, #6ab06088, ${col}aa)`,
            borderRadius: "50% 50% 40% 40%",
            transform: `rotate(${side * 22}deg)`,
            opacity: 0.8,
          }} />
        );
      })}

      {/* ── Bud (1–2 entries) ── */}
      {hasBud && total < 3 && (
        <div style={{
          position: "absolute",
          bottom: size * 0.38,
          left: "50%", transform: "translateX(-50%)",
          width: size * 0.1, height: size * 0.16,
          background: `linear-gradient(to top, #6ab060, ${moodCol(entries[0])}cc)`,
          borderRadius: "50% 50% 38% 38%",
          boxShadow: `0 0 14px ${moodCol(entries[0])}44`,
        }} />
      )}

      {/* ── Center (3+ entries) ── */}
      {hasCenter && (
        <div style={{
          position: "absolute",
          width: size * 0.16, height: size * 0.16,
          background: "radial-gradient(circle at 40% 38%, #fff8c0, #f0c040)",
          borderRadius: "50%",
          zIndex: 10,
          boxShadow: `0 0 ${size * 0.14}px rgba(248,216,80,0.7), 0 0 ${size * 0.06}px rgba(255,240,160,0.9)`,
          animation: "pulse 2.6s ease-in-out infinite",
        }} />
      )}

      {/* ── Tap sparks ── */}
      {sparks.map(s => {
        const rad = (s.a * Math.PI) / 180;
        return (
          <div key={s.id} style={{
            position: "absolute", fontSize: 10, color: T.cyan, opacity: 0,
            left: `calc(50% + ${Math.sin(rad) * size * 0.34}px)`,
            top:  `calc(50% - ${Math.cos(rad) * size * 0.34}px)`,
            animation: "sparkUp 0.65s ease-out forwards",
          }}>✦</div>
        );
      })}
    </div>
  );
}

// ============================================================
// TAB BAR
// ============================================================
function TabBar({ active, onSelect }) {
  const tabs = [
    { id: "home",    icon: "🌸", label: "ホーム" },
    { id: "ayumi",   icon: "🌟", label: "あゆみ" },
    { id: "settings",icon: "⚙️", label: "設定" },
  ];
  return (
    <div className="tabbar" style={{
      display: "flex", justifyContent: "space-around", padding: "8px 0 18px",
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          padding: "5px 22px", background: "none",
          transform: active === t.id ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.2s",
        }}>
          <span style={{ fontSize: "1.32rem", filter: active === t.id ? "drop-shadow(0 0 7px rgba(56,232,255,0.65))" : "none", transition: "filter .2s" }}>{t.icon}</span>
          <span style={{ fontSize: "0.62rem", color: active === t.id ? T.cyan : T.textMuted, fontFamily: "'Space Mono', monospace", letterSpacing: "0.04em", transition: "color .2s" }}>{t.label}</span>
          {active === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.cyan, boxShadow: `0 0 7px ${T.cyan}` }} />}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// HOME SCREEN — breathing space, emotional-first, no metrics
// ============================================================
function HomeScreen({ entries, onNew, onView }) {
  const today = todayKey();
  const todayEntry = entries.find(e => e.date === today);
  const total = entries.length;

  // Poetic caption — based purely on entry count, no "stage" labels
  const caption =
    total === 0 ? "書けたら、書いてみて" :
    total < 3   ? "芽が出たよ" :
    total < 7   ? "ちゃんと育ってる" :
    total < 15  ? "続けてくれてありがとう" :
    total < 30  ? "きれいに咲いてる" :
                  "こんなに育ったね";

  // Gentle time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 5  ? "夜更かしだね。お疲れさま。" :
    hour < 11 ? "おはよう。今日もここにいるよ。" :
    hour < 17 ? "こんにちは。ひと息ついてね。" :
    hour < 21 ? "お疲れさまでした。" :
               "今日も一日、よく頑張ったね。";

  // Ambient colour from latest mood
  const latestMood = entries.length > 0 ? MOODS.find(m => m.id === entries[0].mood) : null;
  const ambientCol = latestMood?.color || T.cyanSoft;

  return (
    <div style={{
      height: "calc(100% - 90px)",
      display: "flex", flexDirection: "column",
      overflow: "hidden", position: "relative",
    }}>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${ambientCol}10 0%, transparent 68%)`,
        pointerEvents: "none", transition: "background 2s ease",
      }} />

      {/* App name — quiet */}
      <div style={{ padding: "18px 24px 0", flexShrink: 0 }}>
        <div style={{
          fontFamily: "'Noto Serif JP', serif", fontSize: "0.85rem", fontWeight: 300,
          letterSpacing: "0.14em", color: T.textMuted,
        }}>Small Good</div>
      </div>

      {/* Greeting */}
      <div style={{ padding: "14px 24px 0", flexShrink: 0, animation: "fadeDown 0.6s ease-out" }}>
        <div style={{
          fontFamily: "'Noto Serif JP', serif", fontSize: "1.05rem", fontWeight: 300,
          color: T.textSub, lineHeight: 1.7, letterSpacing: "0.03em",
        }}>{greeting}</div>
      </div>

      {/* ── Main visual: flower only, large, centred ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 24px", position: "relative",
      }}>
        <div style={{ animation: "fadeUp 0.55s 0.1s ease-out both" }}>
          <Bloom entries={entries} size={200} interactive />
        </div>

        {/* Whispered caption */}
        <div style={{
          fontFamily: "'Noto Serif JP', serif", fontSize: "0.8rem", fontWeight: 300,
          color: T.textMuted, letterSpacing: "0.09em", marginTop: 12,
          animation: "fadeUp 0.5s 0.3s ease-out both",
        }}>{caption}</div>
      </div>

      {/* ── CTA zone — anchored to bottom, generous padding ── */}
      <div style={{
        padding: "0 24px 20px",
        flexShrink: 0,
        animation: "fadeUp 0.5s 0.6s ease-out both",
      }}>
        {todayEntry ? (
          <>
            {/* Already recorded today — affirm, offer to review */}
            <div style={{
              textAlign: "center",
              fontSize: "0.72rem",
              color: T.textMuted,
              fontFamily: "'Noto Serif JP', serif",
              fontStyle: "italic",
              marginBottom: 10,
            }}>
              今日はもう書いたね ✦
            </div>
            <button onClick={() => onView(todayEntry)} className="btn-ghost" style={{
              width: "100%", padding: "14px",
              fontSize: "0.85rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span>📖</span> 今日の記録を見る
            </button>
          </>
        ) : (
          <>
            {/* Not yet recorded — invite, never pressure */}
            <div style={{
              textAlign: "center",
              fontSize: "0.72rem",
              color: T.textMuted,
              fontFamily: "'Noto Serif JP', serif",
              fontStyle: "italic",
              marginBottom: 10,
            }}>
              {total === 0 ? "書けたら、書いてみて" : "小さなことでいい"}
            </div>
            <button onClick={onNew} className="btn-cta" style={{
              width: "100%", padding: "16px",
              fontSize: "0.92rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span style={{ fontSize: "1.05rem" }}>✍️</span> 今日のことを書く
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ENTRY SCREEN
// ============================================================
function EntryScreen({ onSave, onBack, existing }) {
  const ph = useRef(pick(PLACEHOLDERS)).current;
  const [lines, setLines] = useState(existing ? existing.lines.map(l => l.text) : ["","",""]);
  const [mood, setMood] = useState(existing?.mood || null);
  const [focused, setFocused] = useState(null);
  const [saving, setSaving] = useState(false);
  const wx = useRef(existing?.weather || randWx()).current;
  const now = useRef(new Date()).current;
  const hasContent = lines.some(l => l.trim()) || mood;

  const setLine = (i, v) => { if (v.length > 50) return; setLines(p => { const n=[...p]; n[i]=v; return n; }); };

  const doSave = async () => {
    if (!hasContent) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 380));
    onSave({ lines: lines.filter(l => l.trim()).map((text, index) => ({ index, text })), mood, weather: wx, timeOfDay: now.toTimeString().slice(0,5) });
  };

  const hint = pick(["小さなことでいい ✨","今日もここにいてくれてありがとう 🌿","あなたの言葉を待ってるよ 🌸","ゆっくりでいいよ 🌙"]);

  return (
    <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", height: "calc(100% - 4px)", animation: "slideIn 0.32s cubic-bezier(0.25,1,0.5,1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: "50%",
          background: "rgba(255,255,255,0.055)", border: `1px solid ${T.border}`,
          color: T.textSub, fontSize: "1.1rem",
          display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.05rem", fontWeight: 300 }}>今日のこと</div>
          <div style={{ fontSize: "0.64rem", color: T.textMuted, display: "flex", gap: 8, marginTop: 1 }}>
            <span>{wx.icon} {wx.label}</span>
            <span>🕐 {now.toTimeString().slice(0,5)}</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: "0.75rem", color: T.cyanSoft, textAlign: "center", marginBottom: 13,
        fontFamily: "'Noto Serif JP', serif", fontStyle: "italic", animation: "fadeDown 0.5s ease-out" }}>
        {hint}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 13 }}>
        {lines.map((line, i) => (
          <div key={i} className="neuro" style={{
            padding: "11px 13px",
            border: focused === i ? `1px solid ${T.cyanMid}` : "1px solid rgba(255,255,255,0.042)",
            boxShadow: focused === i ? `0 0 18px rgba(56,232,255,0.17), 5px 5px 14px rgba(0,0,0,0.5), -3px -3px 9px rgba(56,232,255,0.032)` : undefined,
            transition: "border-color .2s, box-shadow .2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: T.cyanMid, opacity: 0.6, minWidth: 16 }}>0{i+1}</span>
              <textarea value={line} onChange={e => setLine(i, e.target.value)}
                onFocus={() => setFocused(i)} onBlur={() => setFocused(null)}
                placeholder={ph[i]} rows={1}
                style={{ flex: 1, fontSize: "0.88rem", lineHeight: 1.55, color: line ? T.text : T.textMuted }} />
              {line && (
                <span style={{ fontSize: "0.57rem", color: line.length > 42 ? T.rose : T.textMuted,
                  fontFamily: "'Space Mono', monospace", minWidth: 28, textAlign: "right" }}>
                  {line.length}/50
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: "0.66rem", color: T.textMuted, marginBottom: 7, fontFamily: "'Space Mono', monospace" }}>
          今の気分は？（これだけでもOK）
        </div>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 3 }}>
          {MOODS.map(m => (
            <button key={m.id} onClick={() => setMood(mood === m.id ? null : m.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "7px 9px", borderRadius: 13, flexShrink: 0,
              background: mood === m.id ? `${m.color}20` : "rgba(255,255,255,0.035)",
              border: `1px solid ${mood === m.id ? m.color + "55" : "rgba(255,255,255,0.07)"}`,
              transform: mood === m.id ? "scale(1.1)" : "scale(1)",
              transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: mood === m.id ? `0 0 13px ${m.color}44` : "none",
            }}>
              <span style={{ fontSize: "1.28rem" }}>{m.emoji}</span>
              <span style={{ fontSize: "0.55rem", color: mood === m.id ? m.color : T.textMuted, whiteSpace: "nowrap" }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button onClick={doSave} disabled={!hasContent || saving} className="btn-cta" style={{
        width: "100%", padding: "15px", fontSize: "0.9rem",
        opacity: hasContent ? 1 : 0.38,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        animation: saving ? "glow 1s ease-in-out infinite" : "none",
      }}>
        {saving ? "✨ 保存中…" : "✨ 記録する"}
      </button>
      <div style={{ height: 14 }} />
    </div>
  );
}

// ============================================================
// COMPLETION SCREEN
// ============================================================
function CompletionScreen({ entry, entries, onDone }) {
  const [pActive, setPActive] = useState(true);
  const msg = useRef(pick(DONE_MSG)).current;
  const mood = MOODS.find(m => m.id === entry?.mood);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", padding: "28px 24px", position: "relative", overflow: "hidden",
      background: "radial-gradient(circle at 50% 38%, rgba(56,232,255,0.09) 0%, transparent 58%)",
      animation: "fadeUp 0.48s ease-out",
    }}>
      <Particles active={pActive} onDone={() => setPActive(false)} />

      <div style={{ animation: "bloomIn 0.72s cubic-bezier(0.34,1.56,0.64,1) forwards", marginBottom: 18 }}>
        <Bloom entries={entries} size={160} />
      </div>

      <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.12rem", fontWeight: 300,
        textAlign: "center", lineHeight: 1.88,
        background: `linear-gradient(135deg, ${T.text}, ${T.cyanSoft})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 10, animation: "fadeUp 0.55s 0.3s ease-out both" }}>
        {msg}
      </div>

      {mood && (
        <div style={{ fontSize: "0.8rem", color: mood.color, marginBottom: 16, animation: "fadeUp 0.5s 0.5s ease-out both" }}>
          {mood.emoji} {mood.label}
        </div>
      )}

      {entry?.lines?.length > 0 && (
        <div className="glass" style={{ width: "100%", padding: "13px 15px", marginBottom: 20,
          animation: "fadeUp 0.5s 0.8s ease-out both" }}>
          {entry.lines.map((l, i) => (
            <div key={i} style={{ fontSize: "0.8rem", color: T.textSub, padding: "3px 0", lineHeight: 1.6 }}>
              <span style={{ color: T.cyanMid, fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", marginRight: 8 }}>0{i+1}</span>
              {l.text}
            </div>
          ))}
        </div>
      )}

      <button onClick={onDone} className="btn-cta" style={{ padding: "13px 42px", fontSize: "0.87rem", animation: "fadeUp 0.5s 1s ease-out both" }}>
        ホームに戻る
      </button>
    </div>
  );
}

// ============================================================
// AYUMI SCREEN — stream of light cards, no calendar grid
// ============================================================
function AyumiScreen({ entries, onView }) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const total = entries.length;

  // Group by month — label is soft, not the main info
  const groups = [];
  let lastMk = null;
  sorted.forEach(e => {
    const d = new Date(e.date);
    const mk = `${d.getFullYear()}-${d.getMonth()}`;
    if (mk !== lastMk) { groups.push({ mk, label: `${d.getFullYear()}年 ${d.getMonth()+1}月`, entries: [] }); lastMk = mk; }
    groups[groups.length - 1].entries.push(e);
  });

  return (
    <div style={{ padding: "22px 20px 0", overflowY: "auto", height: "calc(100% - 90px)", animation: "fadeUp 0.42s ease-out" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.12rem", fontWeight: 300, marginBottom: 3 }}>あゆみ</div>
        <div style={{ fontSize: "0.7rem", color: T.textMuted }}>
          {total === 0 ? "まだ記録がないよ 🌱" : `${total} 回、小さないいことを見つけた`}
        </div>
      </div>

      {/* Summary card — flower only */}
      {total > 0 && (
        <div className="glass" style={{ padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
          <Bloom entries={entries} size={58} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.82rem", color: T.text, marginBottom: 6 }}>
              {total} 回、小さないいことを見つけた
            </div>
            <div style={{ fontSize: "0.68rem", color: T.textMuted, lineHeight: 1.7 }}>
              書くたびに、花びらが増えていく
            </div>
          </div>
        </div>
      )}

      {/* Entry cards — no calendar grid */}
      {total === 0 ? (
        <div style={{ textAlign: "center", padding: "38px 0", color: T.textMuted, fontSize: "0.82rem", lineHeight: 2.2 }}>
          書いた日だけが、ここに残る 🌿<br />
          <span style={{ fontSize: "0.7rem" }}>空白は罪じゃない。書いた分だけが積み重なる。</span>
        </div>
      ) : (
        groups.map(group => (
          <div key={group.mk} style={{ marginBottom: 22 }}>
            {/* Month divider — purely contextual, not a "tracker" */}
            <div style={{
              fontSize: "0.65rem", color: T.textMuted, fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.07em", marginBottom: 9,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              {group.label}
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.entries.map((entry, idx) => {
                const mood = MOODS.find(m => m.id === entry.mood);
                const d = new Date(entry.date);
                return (
                  <button key={entry.id || idx} onClick={() => onView(entry)} style={{ width: "100%", textAlign: "left" }}>
                    <div className="glass" style={{
                      padding: "12px 14px",
                      borderLeft: `3px solid ${mood?.color || T.cyanMid}44`,
                      transition: "transform .15s",
                    }}
                      onMouseEnter={ev => ev.currentTarget.style.transform = "translateX(3px)"}
                      onMouseLeave={ev => ev.currentTarget.style.transform = "translateX(0)"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {/* Date shown small — not the dominant element */}
                          <span style={{ fontSize: "0.65rem", color: T.textMuted, fontFamily: "'Space Mono', monospace" }}>
                            {d.getMonth()+1}/{d.getDate()}
                          </span>
                          {entry.weather && <span style={{ fontSize: "0.7rem" }}>{entry.weather.icon}</span>}
                          {entry.timeOfDay && <span style={{ fontSize: "0.62rem", color: T.textMuted }}>{entry.timeOfDay}</span>}
                        </div>
                        {mood && <span style={{ fontSize: "1.05rem" }} title={mood.label}>{mood.emoji}</span>}
                      </div>

                      {entry.lines?.length > 0 ? (
                        entry.lines.slice(0, 2).map((l, i) => (
                          <div key={i} style={{ fontSize: "0.8rem", color: T.textSub, lineHeight: 1.55,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {l.text}
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: "0.76rem", color: T.textMuted, fontStyle: "italic" }}>
                          {mood ? `${mood.emoji} スタンプだけの記録` : "記録"}
                        </div>
                      )}

                      {/* Light dots — purely additive visual indicator */}
                      <div style={{ marginTop: 5, display: "flex", gap: 3 }}>
                        {Array.from({ length: Math.max(entry.lines?.length || 0, mood ? 1 : 0) }).map((_, i) => (
                          <div key={i} style={{
                            width: 4, height: 4, borderRadius: "50%",
                            background: mood?.color || T.cyanMid, opacity: 0.48,
                            boxShadow: `0 0 4px ${mood?.color || T.cyanMid}`,
                          }} />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
      <div style={{ height: 22 }} />
    </div>
  );
}

// ============================================================
// DETAIL MODAL
// ============================================================
function DetailModal({ entry, onClose, onEdit, onDelete }) {
  const mood = MOODS.find(m => m.id === entry?.mood);
  const d = new Date(entry?.date);
  const [confirmDel, setConfirmDel] = useState(false);
  const isToday = entry?.date === todayKey();

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 100,
      background: "rgba(2,5,16,0.72)", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div className="glass" style={{
        width: "100%", borderRadius: "22px 22px 0 0", padding: "22px 20px 30px",
        maxHeight: "78%", overflowY: "auto",
        background: "linear-gradient(180deg, rgba(12,28,72,0.97) 0%, rgba(6,12,31,0.99) 100%)",
        animation: "slideUp 0.36s cubic-bezier(0.25,1,0.5,1)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.14)", borderRadius: 2, margin: "0 auto 17px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 13 }}>
          <div>
            <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.02rem", fontWeight: 300 }}>
              {d.getFullYear()}年{d.getMonth()+1}月{d.getDate()}日
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
              {entry?.weather && <span style={{ fontSize: "0.68rem", color: T.textMuted }}>{entry.weather.icon} {entry.weather.label}</span>}
              {entry?.timeOfDay && <span style={{ fontSize: "0.68rem", color: T.textMuted }}>🕐 {entry.timeOfDay}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {isToday && (
              <button onClick={onEdit} className="btn-ghost" style={{ padding: "5px 13px", fontSize: "0.74rem" }}>編集</button>
            )}
            <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: "50%",
              background: "rgba(255,255,255,0.055)", border: `1px solid ${T.border}`,
              color: T.textSub, fontSize: "0.92rem",
              display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>

        {mood && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
            background: `${mood.color}16`, border: `1px solid ${mood.color}40`,
            borderRadius: 18, padding: "4px 13px", marginBottom: 13 }}>
            <span style={{ fontSize: "1.12rem" }}>{mood.emoji}</span>
            <span style={{ fontSize: "0.74rem", color: mood.color }}>{mood.label}</span>
          </div>
        )}

        <div style={{ marginBottom: 17 }}>
          {entry?.lines?.map((l, i) => (
            <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid rgba(100,200,255,0.07)` }}>
              <span style={{ fontSize: "0.6rem", color: T.cyanMid, fontFamily: "'Space Mono', monospace", marginRight: 10 }}>0{i+1}</span>
              <span style={{ fontSize: "0.87rem", color: T.text, lineHeight: 1.6 }}>{l.text}</span>
            </div>
          ))}
          {(!entry?.lines || entry.lines.length === 0) && mood && (
            <div style={{ fontSize: "0.8rem", color: T.textSub, fontStyle: "italic", padding: "7px 0" }}>スタンプだけの記録</div>
          )}
        </div>

        {!confirmDel ? (
          <button onClick={() => setConfirmDel(true)} style={{ fontSize: "0.74rem", color: `${T.rose}80`, padding: "5px 0" }}>
            🗑 この記録を削除する
          </button>
        ) : (
          <div style={{ display: "flex", gap: 9 }}>
            <button onClick={onDelete} style={{ flex: 1, padding: "10px", borderRadius: 12, fontSize: "0.78rem",
              background: "rgba(248,192,216,0.12)", border: `1px solid rgba(248,192,216,0.28)`, color: T.rose }}>
              削除する
            </button>
            <button onClick={() => setConfirmDel(false)} className="btn-ghost" style={{ flex: 1, padding: "10px", fontSize: "0.78rem" }}>
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS SCREEN
// ============================================================
function SettingsScreen({ settings, onUpdate, entries }) {
  const total = entries.length;
  const toggle = k => onUpdate({ ...settings, [k]: !settings[k] });

  const doExport = () => {
    const text = entries.map(e => {
      const d = new Date(e.date);
      const mood = MOODS.find(m => m.id === e.mood);
      const lines = e.lines?.map(l => `  · ${l.text}`).join("\n") || "";
      return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${e.timeOfDay||""} ${mood ? mood.emoji+mood.label : ""}\n${lines}`;
    }).join("\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    a.download = "small_good.txt"; a.click();
  };

  const doClear = () => {
    if (window.confirm("すべての記録を削除しますか？")) { saveEntries([]); window.location.reload(); }
  };

  const Row = ({ icon, label, val, onToggle, sub }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid rgba(100,200,255,0.055)` }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: "1.02rem" }}>{icon}</span>
          <span style={{ fontSize: "0.85rem", color: T.text }}>{label}</span>
        </div>
        {sub && <div style={{ fontSize: "0.65rem", color: T.textMuted, marginTop: 1, marginLeft: 26 }}>{sub}</div>}
      </div>
      {onToggle && (
        <button onClick={onToggle} style={{
          width: 42, height: 23, borderRadius: 12, position: "relative",
          background: val ? `linear-gradient(90deg, ${T.cyanMid}, ${T.cyan})` : "rgba(255,255,255,0.09)",
          transition: "background .28s",
          boxShadow: val ? `0 0 11px rgba(56,232,255,0.28)` : "none",
        }}>
          <div style={{ position: "absolute", top: 2, width: 19, height: 19, borderRadius: "50%",
            background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            left: val ? 21 : 2, transition: "left .22s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </button>
      )}
    </div>
  );

  return (
    <div style={{ padding: "22px 20px 0", overflowY: "auto", height: "calc(100% - 90px)", animation: "fadeUp 0.42s ease-out" }}>
      <div className="glass" style={{ padding: 18, marginBottom: 17 }}>
        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "0.87rem", color: T.cyanSoft, marginBottom: 16 }}>あなたの花</div>
        {/* Bloom centred — the flower IS the progress */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Bloom entries={entries} size={100} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
          {[
            { v: total, l: "記録の数", c: T.cyan },
            { v: total < 3 ? "芽" : total < 7 ? "蕾" : total < 15 ? "開花中" : total < 30 ? "満開" : "花束", l: "いまの花", c: T.lavender },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontFamily: "'Space Mono', monospace", color: s.c, fontWeight: 700 }}>{s.v}</div>
              <div style={{ fontSize: "0.6rem", color: T.textMuted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass" style={{ padding: "0 16px", marginBottom: 13 }}>
        <Row icon="🔔" label="通知" val={settings.notif} onToggle={() => toggle("notif")} sub="記録のリマインダー" />
        <Row icon="🌙" label="ダークモード" val={settings.darkMode} onToggle={() => toggle("darkMode")} />
        <Row icon="📳" label="ハプティクス" val={settings.haptic} onToggle={() => toggle("haptic")} sub="振動フィードバック" />
      </div>

      <div className="glass" style={{ padding: "0 16px", marginBottom: 13 }}>
        <button onClick={doExport} style={{ width: "100%", padding: "13px 0", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid rgba(100,200,255,0.055)` }}>
          <span>📤</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.84rem", color: T.text }}>データをエクスポート</div>
            <div style={{ fontSize: "0.66rem", color: T.textMuted }}>テキストファイルで保存</div>
          </div>
        </button>
        <button onClick={doClear} style={{ width: "100%", padding: "13px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <span>🗑</span>
          <div style={{ fontSize: "0.84rem", color: T.rose }}>すべての記録を削除</div>
        </button>
      </div>

      <div style={{ textAlign: "center", fontSize: "0.63rem", color: T.textMuted, fontFamily: "'Space Mono', monospace", padding: "6px 0 28px", lineHeight: 2 }}>
        Small Good v2.0.0<br />すべてのデータはこのデバイスに保存されています
      </div>
    </div>
  );
}

// ============================================================
// ONBOARDING
// ============================================================
function Onboarding({ onDone }) {
  const [page, setPage] = useState(0);
  const slides = [
    { em: "🌸", title: "頑張らなくていい", body: "完璧な文章じゃなくていい。\n長くなくていい。\nスタンプひとつだけでも、ちゃんと残る。" },
    { em: "✍️", title: "3行だけ、書く",   body: "最大3行の入力欄。\n「書かなきゃ」というプレッシャーは、ここにはない。\n書いた日だけが、加えられていく。" },
    { em: "🌟", title: "減らない、増えるだけ", body: "休んでも消えない。\n書くたびに、花びらがひとつ増えていく。\n空白は罪じゃない。" },
  ];
  const s = slides[page];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", padding: "36px 26px",
      background: "radial-gradient(circle at 50% 28%, rgba(14,32,96,0.75) 0%, transparent 55%)" }}>
      <div style={{ fontSize: "3.5rem", marginBottom: 20, animation: "bloomIn 0.54s ease-out" }}>{s.em}</div>
      <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.3rem", fontWeight: 300, textAlign: "center", marginBottom: 13,
        background: `linear-gradient(135deg, ${T.text}, ${T.cyanSoft})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {s.title}
      </div>
      <div style={{ fontSize: "0.85rem", color: T.textSub, textAlign: "center", lineHeight: 2.1, whiteSpace: "pre-line", marginBottom: 36 }}>
        {s.body}
      </div>
      <div style={{ display: "flex", gap: 7, marginBottom: 28 }}>
        {slides.map((_, i) => (
          <div key={i} style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 3,
            background: i === page ? T.cyan : "rgba(255,255,255,0.18)",
            transition: "width .28s, background .28s" }} />
        ))}
      </div>
      <button onClick={() => page < slides.length - 1 ? setPage(p => p+1) : onDone()} className="btn-cta"
        style={{ padding: "13px 44px", fontSize: "0.9rem" }}>
        {page < slides.length - 1 ? "次へ" : "はじめる"}
      </button>
      {page < slides.length - 1 && (
        <button onClick={onDone} style={{ marginTop: 13, fontSize: "0.74rem", color: T.textMuted, padding: "5px 14px" }}>スキップ</button>
      )}
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  useEffect(() => {
    const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const [entries,  setEntries]  = useState(() => loadEntries());
  const [settings, setSettings] = useState(() => loadSettings());
  const [screen,   setScreen]   = useState(() => loadSettings().onboarded ? "home" : "onboarding");
  const [tab,      setTab]      = useState("home");
  const [viewing,  setViewing]  = useState(null);
  const [doneEntry,setDoneEntry]= useState(null);
  const [editing,  setEditing]  = useState(null);
  const [toast,    setToast]    = useState(null);

  useEffect(() => { saveEntries(entries); }, [entries]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  useEffect(() => {
    const hasToday = entries.some(e => e.date === todayKey());
    if (!hasToday && settings.onboarded) {
      const t = setTimeout(() => {
        setToast(pick(GENTLE));
        setTimeout(() => setToast(null), 5500);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSave = useCallback((data) => {
    const entry = { id: editing?.id || `e_${Date.now()}`, date: todayKey(), ...data };
    setEntries(p => editing ? p.map(e => e.id === editing.id ? entry : e) : [entry, ...p]);
    setEditing(null); setDoneEntry(entry); setScreen("done");
  }, [editing]);

  const handleDelete = useCallback(() => {
    if (!viewing) return;
    setEntries(p => p.filter(e => e !== viewing));
    setViewing(null);
  }, [viewing]);

  const selectTab = t => { setTab(t); setScreen(t); };
  const goEdit = () => { setEditing(viewing); setViewing(null); setScreen("entry"); };
  const completeOnboard = () => { setSettings(s => ({ ...s, onboarded: true })); setScreen("home"); setTab("home"); };
  const mainTabs = ["home","ayumi","settings"];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#020510", padding: "20px" }}>
      <Stars />

      {/* Phone shell */}
      <div style={{ width: 390, height: 844, background: T.skyDeep, borderRadius: 52,
        border: "2px solid rgba(100,200,255,0.18)", overflow: "hidden", position: "relative",
        boxShadow: "0 0 80px rgba(56,232,255,0.1), 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)",
        zIndex: 10 }}>

        {/* Notch */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 116, height: 32, background: "#020510", borderRadius: "0 0 18px 18px", zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.09)" }} />
          <div style={{ width: 45, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Status bar */}
        <div style={{ position: "absolute", top: 9, left: 22, right: 22, display: "flex", justifyContent: "space-between",
          fontSize: "0.58rem", color: "rgba(255,255,255,0.44)",
          fontFamily: "'Space Mono', monospace", zIndex: 40 }}>
          <span>{new Date().toTimeString().slice(0,5)}</span>
          <span>●●● 🔋</span>
        </div>

        {/* Content area */}
        <div style={{ position: "absolute", inset: 0, top: 32, paddingTop: 8 }}>
          {screen === "onboarding" && <Onboarding onDone={completeOnboard} />}
          {screen === "home"       && <HomeScreen entries={entries} onNew={() => { setEditing(null); setScreen("entry"); }} onView={setViewing} />}
          {screen === "ayumi"      && <AyumiScreen entries={entries} onView={setViewing} />}
          {screen === "settings"   && <SettingsScreen settings={settings} onUpdate={setSettings} entries={entries} />}
          {screen === "entry"      && <EntryScreen onSave={handleSave} onBack={() => setScreen(tab)} existing={editing} />}
          {screen === "done"       && <CompletionScreen entry={doneEntry} entries={entries} onDone={() => { setScreen("home"); setTab("home"); }} />}
          {mainTabs.includes(screen) && <TabBar active={tab} onSelect={selectTab} />}
        </div>

        {viewing && <DetailModal entry={viewing} onClose={() => setViewing(null)} onEdit={goEdit} onDelete={handleDelete} />}

        {toast && (
          <div style={{ position: "absolute", top: 46, left: 14, right: 14, zIndex: 200,
            background: "rgba(6,12,31,0.93)", backdropFilter: "blur(22px)",
            border: `1px solid rgba(100,200,255,0.18)`, borderRadius: 15,
            padding: "11px 14px", display: "flex", alignItems: "flex-start", gap: 10,
            animation: "fadeDown 0.38s ease-out", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: `linear-gradient(135deg, ${T.cyanMid}, ${T.blue})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🌙</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.57rem", color: T.textMuted, fontFamily: "'Space Mono', monospace", letterSpacing: "0.06em" }}>SMALL GOOD</div>
              <div style={{ fontSize: "0.77rem", color: T.text, lineHeight: 1.55, marginTop: 2, whiteSpace: "pre-line" }}>{toast}</div>
            </div>
            <button onClick={() => setToast(null)} style={{ color: T.textMuted, fontSize: "0.9rem", flexShrink: 0, marginTop: 1 }}>×</button>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)",
        fontSize: "0.65rem", color: "rgba(100,150,200,0.3)", fontFamily: "'Space Mono', monospace",
        letterSpacing: "0.07em", zIndex: 5 }}>
        Small Good / 3 Good Things
      </div>
    </div>
  );
}
