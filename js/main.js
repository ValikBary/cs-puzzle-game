// =============================================
// CS PUZZLE GAME - Main React App
// Team: Valik, Simon, Fred
// =============================================

const { useState, useEffect, useRef } = React;

// ── SOUND ENGINE
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playSound(type) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "correct") {
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "achievement") {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.12 + 0.3,
        );
        o.start(ctx.currentTime + i * 0.12);
        o.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } else if (type === "click") {
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {}
}

// ── ACHIEVEMENTS ──────────────────────────────
const ACHIEVEMENTS = [
  {
    id: "first_blood",
    icon: "🩸",
    title: "First Blood",
    desc: "Got your first correct answer",
  },
  {
    id: "no_mistakes_1",
    icon: "🎯",
    title: "Sharpshooter",
    desc: "Completed If/Else with no wrong answers",
  },
  {
    id: "no_mistakes_2",
    icon: "⚡",
    title: "Logic Lord",
    desc: "Completed Logic Gates with no mistakes",
  },
  {
    id: "no_mistakes_3",
    icon: "🐛",
    title: "Exterminator",
    desc: "Found all bugs on first try",
  },
  {
    id: "escapee",
    icon: "🚀",
    title: "Escapee",
    desc: "Escaped the CS Dungeon",
  },
  {
    id: "all_levels",
    icon: "🏆",
    title: "CS Master",
    desc: "Completed all 4 levels",
  },
];

// ── LEVEL DATA ────────────────────────────────
const LEVELS = [
  {
    id: 1,
    name: "If / Else",
    icon: "🧠",
    desc: "Fill in the missing condition to fix the code",
    color: "#00f5ff",
    difficulty: "Easy",
  },
  {
    id: 2,
    name: "Logic Gates",
    icon: "⚡",
    desc: "Pick the right gate so the output is 1",
    color: "#ff006e",
    difficulty: "Medium",
  },
  {
    id: 3,
    name: "Debug Mode",
    icon: "🐛",
    desc: "Find the bug hiding in the code",
    color: "#ffd60a",
    difficulty: "Medium",
  },
  {
    id: 4,
    name: "Text Adventure",
    icon: "🗺️",
    desc: "Type commands to escape the maze",
    color: "#7fff00",
    difficulty: "Hard",
  },
];

// ── LEVEL 1 – IF/ELSE QUESTIONS ───────────────
const IF_ELSE_QUESTIONS = [
  {
    code: [
      { text: "age = 16", type: "normal" },
      { text: "", type: "blank-line" },
      { text: "if _____ :", type: "has-blank", blankIdx: 0 },
      { text: '  print("You can vote!")', type: "normal" },
      { text: "else:", type: "normal" },
      { text: '  print("Too young to vote.")', type: "normal" },
    ],
    blanks: [""],
    options: ["age > 18", "age >= 18", "age == 16", "age < 18"],
    correctAnswers: ["age >= 18"],
    explanation:
      "age >= 18 means 18 OR older. Since age = 16, it goes to the else branch. The >= operator means 'greater than or equal to'.",
  },
  {
    code: [
      { text: "score = 72", type: "normal" },
      { text: "", type: "blank-line" },
      { text: "if _____ :", type: "has-blank", blankIdx: 0 },
      { text: '  print("You passed!")', type: "normal" },
      { text: "else:", type: "normal" },
      { text: '  print("Try again.")', type: "normal" },
    ],
    blanks: [""],
    options: ["score > 100", "score >= 50", "score == 72", "score < 50"],
    correctAnswers: ["score >= 50"],
    explanation:
      "score >= 50 means the student passed if they got 50 or more. score = 72, so this prints 'You passed!'",
  },
  {
    code: [
      { text: "lights_on = False", type: "normal" },
      { text: "", type: "blank-line" },
      { text: "if _____ :", type: "has-blank", blankIdx: 0 },
      { text: '  print("Room is bright")', type: "normal" },
      { text: "else:", type: "normal" },
      { text: '  print("It is dark!")', type: "normal" },
    ],
    blanks: [""],
    options: [
      "lights_on == True",
      "lights_on",
      "not lights_on",
      "lights_on > 0",
    ],
    correctAnswers: ["lights_on == True", "lights_on"],
    explanation:
      "lights_on is False, so the condition fails and we get 'It is dark!'. Both 'lights_on == True' and 'lights_on' are valid ways to check a boolean!",
  },
];

// ── LEVEL 2 – LOGIC GATES ─────────────────────
const GATE_PUZZLES = [
  {
    a: 1,
    b: 1,
    target: 1,
    correct: "AND",
    hint: "AND outputs 1 only when BOTH inputs are 1",
  },
  {
    a: 1,
    b: 0,
    target: 1,
    correct: "OR",
    hint: "OR outputs 1 when AT LEAST ONE input is 1",
  },
  {
    a: 0,
    b: 0,
    target: 1,
    correct: "NOR",
    hint: "NOR is the opposite of OR — outputs 1 only when both are 0",
  },
  {
    a: 1,
    b: 1,
    target: 0,
    correct: "XOR",
    hint: "XOR outputs 1 only when inputs are DIFFERENT",
  },
  {
    a: 0,
    b: 1,
    target: 0,
    correct: "AND",
    hint: "AND needs BOTH inputs to be 1. Here one is 0, so output is 0",
  },
];

const GATE_TYPES = ["AND", "OR", "NOT", "XOR", "NAND", "NOR"];

function computeGate(gate, a, b) {
  switch (gate) {
    case "AND":
      return a & b;
    case "OR":
      return a | b;
    case "NOT":
      return a === 1 ? 0 : 1;
    case "XOR":
      return a ^ b;
    case "NAND":
      return (a & b) === 1 ? 0 : 1;
    case "NOR":
      return (a | b) === 1 ? 0 : 1;
    default:
      return 0;
  }
}

// ── LEVEL 3 – DEBUG ───────────────────────────
const DEBUG_PUZZLES = [
  {
    title: "Fix the loop",
    lines: [
      { code: "numbers = [1, 2, 3, 4, 5]", bug: false },
      { code: "total = 0", bug: false },
      { code: "for num in numbers:", bug: false },
      {
        code: "    total = num          # ← this line replaces instead of adds!",
        bug: true,
      },
      { code: "print('Sum:', total)", bug: false },
    ],
    bugLine: 3,
    fix: "total += num",
    explanation:
      "Line 4 uses = instead of +=. This REPLACES total each time instead of adding to it. The correct code is: total += num",
  },
  {
    title: "Find the typo",
    lines: [
      { code: 'name = "Alice"', bug: false },
      { code: "if len(name) > 3:", bug: false },
      { code: '    primt("Name is long enough")', bug: true },
      { code: "else:", bug: false },
      { code: '    print("Too short")', bug: false },
    ],
    bugLine: 2,
    fix: 'print("Name is long enough")',
    explanation:
      "Line 3 has a typo: 'primt' instead of 'print'. Python is case-sensitive and every function name must be spelled exactly right!",
  },
  {
    title: "Off by one error",
    lines: [
      { code: "# Print numbers 1 to 5", bug: false },
      { code: "for i in range(1, 5):", bug: true },
      { code: "    print(i)", bug: false },
    ],
    bugLine: 1,
    fix: "for i in range(1, 6):",
    explanation:
      "range(1, 5) produces [1, 2, 3, 4] — it EXCLUDES the end number! To get 1 to 5 inclusive, you need range(1, 6). This is a classic 'off by one' error.",
  },
];

// NOTE: enterFirst / enterOther not yet implemented in navigation logic
// Will be handled in GO command logic later

// ── LEVEL 4 – TEXT ADVENTURE ──────────────────
// Each room contains:
// enterFirst -> text shown first time entering
// enterOther -> text shown on repeat visits
// desc -> full descriptionshown when player types "look"
// exits -> available directions
// puzzle -> optional puzzle for the room

const binCode = "";
const ADVENTURE = {
  start: "room1",
  rooms: {
    // ROOM 1
    room1: {
      enterFirst: `> INITIALISING USER TRANSFER...
Your body dissolves into glowing particles.
You feel yourself being pulled apart... then reassembled.
A platform of energy stabilises beneath your feet, holding your form together.

> WARNING: CONSCIOUSNESS TRANSFER UNSTABLE
> USER SUCCESSFULLY DIGITISED`,

      enterOther:
        "You return to the digitising platform. The system hums quietly around you.",

      desc: `Streams of data pulse through the walls like veins of light.
This is where you entered the system.
A single pathway leads deeper into the network.
      
Paths detected: NORTH.`,
      exits: {
        north: "core",
      },
    },
    // CORE
    core: {
      enterFirst: `> CORE SYSTEM ACCESSED
You step into the heart of the system.
Data streams converge here, flowing in all directions.
A large firewall pulses at the far end - blocking your escape`,

      enterOther:
        "You return to the core system. Data streams continue to pulse around you.",

      desc: `You stand within the central node of the network.
Streams of data surge through glowing pathways, branching in every direction.

A translucent screen materialises in front of you.

> OBJECTIVE: LOCATE ACCESS CODE TO BYPASS FIREWALL

The firewall looms ahead - a barrier between you and escape.
Multiple paths extend deeper into the system.

Paths detected: NORTH, EAST, SOUTH, WEST, FIREWALL`,

      exits: {
        north: "loopRoom",
        east: "logic",
        south: "debug",
        west: "room1",
        firewall: "firewall",
      },
    },
    // LOGIC
    logic: {
      enterFirst: `> LOGIC NODE ACCESSED
You step into a chamber filled with shifting data structures...
Streams of binary cascade around you as a circuit begins to assemble itself.`,

      enterOther:
        "You return to the logic node. The circuit begins forming again.",

      desc: `A suspended logic circuit stabilises in front of you.
Inputs feed into interconnected gates, each transforming the data as it flows through.
The system requires a final output value.

> EVALUATE LOGIC PATH TO DETERMINE OUTPUT`,

      exits: {},
      puzzle: {
        success: "core",
      },
    },

    // LOOP ROOM
    loopRoom: {
      enterFirst: `You step into a quiet section of the system.
The data streams here feel slower.
Paths branch in all directions.`,

      enterOther:
        "You return to the same quiet section. Something feels slightly off.",

      desc: `The environment here appears stable, but something isn't quite right.
The same structures repeat around you, almost identically.

Paths detected: NORTH, EAST, SOUTH, WEST`,
      exits: {
        north: "loop",
        east: "loop",
        south: "loop",
        west: "loop",
      },
    },

    // LOOP
    loop: {
      enterFirst: `You walk forward.
The system flickers briefly.
You arrive somewhere... familiar.`,

      enterOther: "You move again. The same space quietly reforms around you.",

      desc: `The structures here look identical to where you just were.
Data patterns repeat with unnatural precision.
A faint distortion ripples through the environment.

> SIGNAL INSTABILITY DETECTED

You feel like you've already taken this path.

Paths detected: NORTH, EAST, SOUTH, WEST`,

      exits: {
        north: "loop",
        east: "loop",
        south: "loop",
        west: "loop",
      },
      puzzle: {
        answer: "break",
        success: "core",
      },
    },

    // TODO: Expand debug room to multiple sequential problems
    // DEBUG
    debug: {
      enterFirst: `> DEBUG NODE ACCESSED
You enter a corrupted section of the system.
Fragments of code flicker in and out of existence.
An unstable process is running here.`,

      enterOther: "You return to the debug node. The corrupted code reappears.",

      desc: `A block of code stabilises in front of you.
      
> ERROR DETECTED: INCORRECT ACCUMULATION

total = num

The system is failing to accumulate values correctly.

> IDENTIFY AND CORRECT THE ERROR

Type: solve [code]`,

      exits: {},
      puzzle: {
        answer: "total += num",
        success: "core",
      },
    },

    // FIREWALL
    firewall: {
      enterFirst: `> FIREWALL INTERFACE ACCESSED
You approach the barrier blocking your escape.
The system reacts immediately.

> FINAL SECURITY LAYER DETECTED
> AUTHENTICATION REQUIRED

The firewall pulses violently, resisting access.`,

      enterOther:
        "You return to the firewall. The barrier pulses, awaiting input.",

      desc: `A massive firewall blocks your exit.
Streams of encrypted data surge across its surface.

> ACCESS CONTROL: ENABLED
> AUTHORISATION REQUIRED

Your collected binary fragments must be converted into a decimal key.

> ENTER ACCESS CODE
> CURRENT FRAGMENTS:

Type: solve [decimal]`,

      exits: {
        west: "core",
      },
      puzzle: {
        type: "binary",
        success: "exit",
      },
    },

    // EXIT
    exit: {
      desc: "> SYSTEM RESTORED\n\nAll errors resolved.\n\nYou feel your body reforming...\n\n> EXITING DIGITAL WORLD...\n\n🎉 You escaped the system!",
      exits: {},
      win: true,
    },
  },
};

// Each puzzle room contributes a binary digit
// These are collected and used to unlock the firewall
// TODO: Prevent collecting multiple bits from the same room
const ROOM_BITS = {
  loop: 1,
  debug: 0,
  logic: 1,
};

// ══════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════

// ── ACHIEVEMENT TOAST ─────────────────────────
function AchievementToast({ achievement, onDone }) {
  useEffect(() => {
    playSound("achievement");
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        border: "1px solid var(--accent3)",
        borderRadius: 12,
        padding: "14px 20px",
        boxShadow: "0 0 24px rgba(255,214,10,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        animation: "slideIn 0.4s ease",
        maxWidth: 300,
      }}
    >
      <div style={{ fontSize: "2rem" }}>{achievement.icon}</div>
      <div>
        <div
          style={{
            fontSize: "0.65rem",
            color: "var(--accent3)",
            letterSpacing: 2,
            marginBottom: 2,
          }}
        >
          ACHIEVEMENT UNLOCKED
        </div>
        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
          {achievement.title}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
          {achievement.desc}
        </div>
      </div>
    </div>
  );
}

// ── HOME SCREEN ───────────────────────────────
function HomeScreen({ completedLevels, scores, onSelectLevel, unlockedAchievements }) {
  return (
    <div className="screen">
      <div style={{ marginBottom: 8 }}>
        <div className="home-subtitle" style={{ marginBottom: 4 }}>
          <span>TEAM SOFTWARE ENGINEERING</span> — University of Lincoln
        </div>
      </div>
      <div className="home-title">
        CS PUZZLE
        <br />
        GAME <span className="blinking-cursor" />
      </div>
      <div className="home-subtitle" style={{ marginBottom: 0 }}>
        Learn Computer Science by Playing
      </div>

      <div className="level-grid" style={{ marginTop: 36 }}>
        {LEVELS.map((lvl, i) => {
          const done = completedLevels.includes(lvl.id);
          return (
            <div
              key={lvl.id}
              className="level-card"
              style={{ "--card-color": lvl.color }}
              onClick={() => onSelectLevel(lvl.id)}
            >
              <div className="level-num">
                LEVEL {lvl.id} ·{" "}
                {lvl.difficulty === "Easy"
                  ? "🟢 Easy"
                  : lvl.difficulty === "Medium"
                    ? "🟡 Medium"
                    : "🔴 Hard"}
              </div>
              <div className="level-icon">{lvl.icon}</div>
              <div className="level-name">{lvl.name}</div>
              <div className="level-desc">{lvl.desc}</div>
              {done && (
                <div className="level-badge" title="Completed!">
                  ✅
                </div>
              )}
              {scores[lvl.id] != null && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: "0.7rem",
                    color: lvl.color,
                  }}
                >
                  Best: {scores[lvl.id]} pts
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontSize: "0.72rem",
          color: "var(--text-dim)",
          textAlign: "center",
        }}
      >
        Play any level — explore different Computer Science concepts 🚀
      </div>
      {/* ── ACHIEVEMENTS ── */}
      {unlockedAchievements.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", letterSpacing: 2, marginBottom: 12, textAlign: "center" }}>
            YOUR ACHIEVEMENTS
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {ACHIEVEMENTS.map(a => (
              <div key={a.id} title={a.desc} style={{
                fontSize: "1.6rem",
                opacity: unlockedAchievements.includes(a.id) ? 1 : 0.2,
                filter: unlockedAchievements.includes(a.id) ? "none" : "grayscale(1)",
                cursor: "default",
                transition: "all 0.3s"
              }}>
                {a.icon}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── LEVEL 1 – IF/ELSE ─────────────────────────
function Level1({ onComplete, onBack, onAchievement }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0); // ── NEW
  const [firstCorrect, setFirstCorrect] = useState(false); // ── NEW

  const q = IF_ELSE_QUESTIONS[qIdx];
  const progress = (qIdx / IF_ELSE_QUESTIONS.length) * 100;

  function choose(opt) {
    if (answered) return;
    playSound(q.correctAnswers.includes(opt) ? "correct" : "wrong"); // ── NEW
    setSelected(opt);
    setAnswered(true);
    if (q.correctAnswers.includes(opt)) {
      setScore((s) => s + 100);
      // ── First Blood achievement ──
      if (!firstCorrect) {
        setFirstCorrect(true);
        onAchievement("first_blood");
      }
    } else {
      setMistakes((m) => m + 1); // ── NEW
    }
  }

  function next() {
    if (qIdx + 1 >= IF_ELSE_QUESTIONS.length) {
      setDone(true);
    } else {
      setQIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  const isCorrect = answered && q.correctAnswers.includes(selected);

  if (done) {
    const stars = score >= 300 ? "⭐⭐⭐" : score >= 200 ? "⭐⭐" : "⭐";
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">LEVEL COMPLETE!</div>
          <div className="stars">{stars}</div>
          <div style={{ color: "var(--text-dim)", marginBottom: 8 }}>
            If / Else mastered
          </div>
          <div className="victory-score">{score} pts</div>
          <div
            style={{
              color: "var(--text-dim)",
              fontSize: "0.8rem",
              marginBottom: 24,
            }}
          >
            You correctly matched boolean conditions to expected outputs 🎉
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={onBack}>
              ← Menu
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onComplete(score, mistakes)}
            >
              Next Level →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <button
          className="btn btn-ghost"
          style={{ padding: "6px 12px", fontSize: "0.7rem" }}
          onClick={onBack}
        >
          ← Back
        </button>
        <div className="level-tag">LEVEL 1</div>
        <div className="game-title">If / Else</div>
        <div className="score-display">{score} pts</div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="info-box">
        Question {qIdx + 1} of {IF_ELSE_QUESTIONS.length} — Fill in the blank to
        make the code work correctly
      </div>

      <div className="code-block">
        <div style={{ height: 20 }} />
        {q.code.map((line, i) => {
          if (line.type === "blank-line")
            return <div key={i} style={{ height: 4 }} />;
          if (line.type === "has-blank") {
            const parts = line.text.split("_____");
            return (
              <div className="code-line" key={i}>
                <span className="kw">
                  {parts[0].includes("if") ? "if " : parts[0]}
                </span>
                <span className="blank">{selected || "?"}</span>
                <span>{parts[1]}</span>
              </div>
            );
          }
          return (
            <div className="code-line" key={i}>
              <span
                dangerouslySetInnerHTML={{
                  __html: line.text
                    .replace(
                      /(if|else|print|True|False|and|or|not)/g,
                      "<span class='kw'>$1</span>",
                    )
                    .replace(/(".*?")/g, "<span class='str'>$1</span>")
                    .replace(/(\d+)/g, "<span class='num'>$1</span>"),
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="hint-text">
        💡 Pick the condition that goes inside the{" "}
        <span style={{ color: "var(--accent)" }}>if</span> statement:
      </div>

      <div className="options-grid">
        {q.options.map((opt) => {
          let cls = "option-btn";
          if (answered) {
            if (q.correctAnswers.includes(opt)) cls += " correct";
            else if (opt === selected) cls += " wrong";
          }
          return (
            <button key={opt} className={cls} onClick={() => choose(opt)}>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`feedback-box ${isCorrect ? "correct" : "wrong"}`}>
          <strong>{isCorrect ? "✅ Correct!" : "❌ Not quite!"}</strong>
          <br />
          {q.explanation}
        </div>
      )}

      {answered && (
        <button
          className="btn btn-primary"
          onClick={next}
          style={{ alignSelf: "flex-end" }}
        >
          {qIdx + 1 >= IF_ELSE_QUESTIONS.length ? "See Results →" : "Next →"}
        </button>
      )}
    </div>
  );
}

// ── LEVEL 2 – LOGIC GATES ─────────────────────
function Level2({ onComplete, onBack }) {
  const [pIdx, setPIdx] = useState(0);
  const [selectedGate, setSelectedGate] = useState("AND");
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const p = GATE_PUZZLES[pIdx];
  const output = computeGate(selectedGate, p.a, p.b);
  const isCorrect = output === p.target;

 function check() {
  if (answered) return;
  playSound(isCorrect ? "correct" : "wrong"); 
  setAnswered(true);
  if (isCorrect) setScore(s => s + 100);
  else setMistakes(m => m + 1);
}

  function next() {
    if (pIdx + 1 >= GATE_PUZZLES.length) {
      setDone(true);
    } else {
      setPIdx((i) => i + 1);
      setSelectedGate("AND");
      setAnswered(false);
    }
  }

  if (done) {
    const stars = score >= 500 ? "⭐⭐⭐" : score >= 300 ? "⭐⭐" : "⭐";
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">LEVEL COMPLETE!</div>
          <div className="stars">{stars}</div>
          <div style={{ color: "var(--text-dim)", marginBottom: 8 }}>
            Logic Gates mastered
          </div>
          <div className="victory-score">{score} pts</div>
          <div
            style={{
              color: "var(--text-dim)",
              fontSize: "0.8rem",
              marginBottom: 24,
            }}
          >
            You understand AND, OR, XOR, NOR and more — like a real hardware
            engineer!
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={onBack}>
              ← Menu
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onComplete(score, mistakes)}
            >
              Next Level →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <button
          className="btn btn-ghost"
          style={{ padding: "6px 12px", fontSize: "0.7rem" }}
          onClick={onBack}
        >
          ← Back
        </button>
        <div className="level-tag">LEVEL 2</div>
        <div className="game-title">Logic Gates</div>
        <div className="score-display">{score} pts</div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${(pIdx / GATE_PUZZLES.length) * 100}%`,
            background: "linear-gradient(90deg, #ff006e, #ffd60a)",
          }}
        />
      </div>

      <div className="info-box">
        Puzzle {pIdx + 1} of {GATE_PUZZLES.length} — Choose a gate so that the
        output equals{" "}
        <strong style={{ color: "var(--accent3)" }}>{p.target}</strong>
      </div>

      <div className="gates-container">
        <div className="gate-row">
          <div style={{ marginRight: 8 }}>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                marginBottom: 6,
              }}
            >
              INPUTS
            </div>
            <div className="gate-inputs">
              <div className={`gate-input ${p.a ? "on" : "off"}`}>{p.a}</div>
              <div className={`gate-input ${p.b ? "on" : "off"}`}>{p.b}</div>
            </div>
          </div>

          <div style={{ fontSize: "1.5rem", color: "var(--text-dim)" }}>→</div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                marginBottom: 6,
              }}
            >
              SELECT GATE
            </div>
            <select
              className="gate-select"
              value={selectedGate}
              onChange={(e) => {
                if (!answered) setSelectedGate(e.target.value);
              }}
            >
              {GATE_TYPES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: "1.5rem", color: "var(--text-dim)" }}>→</div>

          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                marginBottom: 6,
              }}
            >
              OUTPUT
            </div>
            <div className={`gate-output ${output ? "on" : "off"}`}>
              {output}
            </div>
          </div>

          <div style={{ marginLeft: 16 }}>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                marginBottom: 6,
              }}
            >
              NEED
            </div>
            <div className={`gate-output ${p.target ? "on" : "off"}`}>
              {p.target}
            </div>
          </div>
        </div>
      </div>

      <div className="hint-text">
        💡 Gate reference: <span style={{ color: "var(--accent)" }}>AND</span> =
        both 1 | <span style={{ color: "var(--accent2)" }}>OR</span> = at least
        one 1 | <span style={{ color: "var(--accent4)" }}>XOR</span> = different
        inputs | <span style={{ color: "var(--accent3)" }}>NOT</span> = flip
        input A
      </div>

      {!answered && (
        <button
          className="btn btn-primary"
          style={{ alignSelf: "flex-start" }}
          onClick={check}
        >
          Check Answer
        </button>
      )}

      {answered && (
        <>
          <div className={`feedback-box ${isCorrect ? "correct" : "wrong"}`}>
            <strong>
              {isCorrect
                ? "✅ Correct!"
                : `❌ Not quite — the correct gate was ${p.correct}`}
            </strong>
            <br />
            {p.hint}
          </div>
          <button
            className="btn btn-primary"
            onClick={next}
            style={{ alignSelf: "flex-end" }}
          >
            {pIdx + 1 >= GATE_PUZZLES.length ? "See Results →" : "Next →"}
          </button>
        </>
      )}
    </div>
  );
}

// ── LEVEL 3 – DEBUG ───────────────────────────
function Level3({ onComplete, onBack }) {
  const [pIdx, setPIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const p = DEBUG_PUZZLES[pIdx];
  const isCorrect = selected === p.bugLine;

  function pickLine(i) {
    if (answered) return;
    playSound("click");
    setSelected(i);
  }

  function check() {
  if (selected === null || answered) return;
  playSound(isCorrect ? "correct" : "wrong"); 
  setAnswered(true);
  if (isCorrect) setScore(s => s + 150);
  else setMistakes(m => m + 1);
}


  function next() {
    if (pIdx + 1 >= DEBUG_PUZZLES.length) {
      setDone(true);
    } else {
      setPIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  if (done) {
    const stars = score >= 450 ? "⭐⭐⭐" : score >= 300 ? "⭐⭐" : "⭐";
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">ALL BUGS FOUND!</div>
          <div className="stars">{stars}</div>
          <div style={{ color: "var(--text-dim)", marginBottom: 8 }}>
            Debug Mode cleared
          </div>
          <div className="victory-score">{score} pts</div>
          <div
            style={{
              color: "var(--text-dim)",
              fontSize: "0.8rem",
              marginBottom: 24,
            }}
          >
            Debugging is one of the most important skills in CS — you've got it!
            🐛✅
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={onBack}>
              ← Menu
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onComplete(score, mistakes)}
            >
              🏆 Finish!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <button
          className="btn btn-ghost"
          style={{ padding: "6px 12px", fontSize: "0.7rem" }}
          onClick={onBack}
        >
          ← Back
        </button>
        <div className="level-tag">LEVEL 3</div>
        <div className="game-title">Debug Mode</div>
        <div className="score-display">{score} pts</div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${(pIdx / DEBUG_PUZZLES.length) * 100}%`,
            background: "linear-gradient(90deg, #ffd60a, #ff006e)",
          }}
        />
      </div>

      <div className="info-box">
        Puzzle {pIdx + 1} of {DEBUG_PUZZLES.length} — <strong>{p.title}</strong>
        : Click the line that contains the bug
      </div>

      <div className="debug-lines">
        {p.lines.map((line, i) => {
          let cls = "debug-line";
          if (selected === i && !answered) cls += " selected-wrong";
          if (answered && i === p.bugLine) cls += " selected-correct";
          else if (answered && selected === i && i !== p.bugLine)
            cls += " selected-wrong";
          return (
            <div key={i} className={cls} onClick={() => pickLine(i)}>
              <span className="line-num">{i + 1}</span>
              <span
                style={{ flex: 1 }}
                dangerouslySetInnerHTML={{
                  __html: line.code
                    .replace(
                      /(for|in|if|else|print|range|def|return|True|False|and|or|not)/g,
                      '<span class="kw">$1</span>',
                    )
                    .replace(/(".*?")/g, '<span class="str">$1</span>')
                    .replace(/(#.*$)/g, '<span class="comment">$1</span>')
                    .replace(/(\d+)/g, '<span class="num">$1</span>'),
                }}
              />
              {selected === i && !answered && (
                <span style={{ color: "var(--accent4)", fontSize: "0.75rem" }}>
                  ← selected
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="hint-text">
        💡 Read each line carefully. Look for wrong operators, typos, or logic
        errors.
      </div>

      {!answered && selected !== null && (
        <button
          className="btn btn-danger"
          style={{ alignSelf: "flex-start" }}
          onClick={check}
        >
          🐛 Report Bug on Line {selected + 1}
        </button>
      )}

      {answered && (
        <>
          <div className={`feedback-box ${isCorrect ? "correct" : "wrong"}`}>
            <strong>
              {isCorrect
                ? "✅ Bug Found!"
                : `❌ Wrong line — bug was on line ${p.bugLine + 1}`}
            </strong>
            <br />
            {p.explanation}
            <br />
            <br />
            Fix:{" "}
            <span style={{ fontFamily: "monospace", color: "var(--accent4)" }}>
              {p.fix}
            </span>
          </div>
          <button
            className="btn btn-primary"
            onClick={next}
            style={{ alignSelf: "flex-end" }}
          >
            {pIdx + 1 >= DEBUG_PUZZLES.length ? "🏆 Finish Game" : "Next →"}
          </button>
        </>
      )}
    </div>
  );
}

// -- LEVEL 4 STATE
// room -> current player location
// displayedHistory -> what is currently shown on screen
// history -> intial boot sequence
// loopCount -> tracks how many times player loops (used for glitch effect)
// logicPuzzle  -> stores current generated logic puzzle
// binaryCode -> stores collected binary digits from puzzles

// ── LEVEL 4 – TEXT ADVENTURE ──────────────────

function Level4({ onComplete, onBack }) {
  const [room, setRoom] = useState("room1");
  const [displayedHistory, setDisplayedHistory] = useState([]);

  // Initial boot sequence (used once on load)
  const [history, setHistory] = useState([
  { text: "> BOOTING SYSTEM...", type: "system" },
  { text: "> ESTABLISHING LINK...", type: "system" },
  { text: "> WARNING: USER DIGITISED", type: "error" },
  { text: ADVENTURE.rooms["room1"].enterFirst, type: "system" },
  { text: "Type: go [direction] / look / help", type: "system" },
  ]);

  const [input, setInput] = useState("");
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(300);
  const historyRef = useRef(null);
  const inputRef = useRef(null);
  const [loopCount, setLoopCount] = useState(0);
  const [logicPuzzle, setLogicPuzzle] = useState(null);
  const [logicStage, setLogicStage] = useState(1);
  const [logicScreen, setLogicScreen] = useState(false);
  const [binaryCode, setBinaryCode] = useState([]);
  const [glitch, setGlitch] = useState(false);
  const [visitedRooms, setVisitedRooms] = useState({});
  const [completedRooms, setCompletedRooms] = useState({});
  const [locked, setLocked] = useState(false);
  const [debugStage, setDebugStage] = useState(1);
  const [debugPuzzle, setDebugPuzzle] = useState(null);
  const CHAR_SPEED  = 35;
  const LINE_DELAY = 600;

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTo({
        top: historyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [displayedHistory]);

  useEffect(() => {
    history.forEach((line) => {
      addLine(line.text, line.type);
    });
  }, []);

  const typingQueue = useRef(Promise.resolve());

  function addLine(text, type = "system") {
    typingQueue.current = typingQueue.current.then(() => {
      return new Promise((resolve) => {
        const line = { text: "", type };

        setDisplayedHistory(h => [...h, line]);

        const lines = text.split("\n");
        let currentText = "";
        let lineIndex = 0;

        function typeLine() {
          if (lineIndex >= lines.length) {
            resolve();
            return;
          }

          let charIndex = 0;
          const currentLine = lines[lineIndex];

          function typeChar() {
            charIndex++;

            //currentText += currentLine[charIndex - 1] || "";
            const nextChar = currentLine[charIndex - 1] || "";

            // APPLY GLITCH DURING TYPING
            if (glitch && Math.random() < 0.15) {
              const glitchChars = "!@#$%^&*<>?/[]{}";
              currentText = glitchText(currentText, 0.5);
              currentText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
              currentText += nextChar || "";
            }

            setDisplayedHistory(h => {
              const updated = [...h];
              updated[updated.length - 1] = {
                ...line,
                text: currentText,
              };
              return updated;
            });

            if (charIndex < currentLine.length) {
              setTimeout(typeChar, CHAR_SPEED);
            } else {
              // add newline after finishing line
              currentText += "\n";
              lineIndex++;

              setTimeout(typeLine, LINE_DELAY); // ⏸ pause between lines
            }
          }

          typeChar();
        }

        typeLine();
      });
    });

    return typingQueue.current;
  }

  function loadNewRoom(text) {
    setDisplayedHistory([]);

    return addLine("> TRANSFERRING TO NEW NODE...", "system")
      .then(() => new Promise(r => setTimeout(r, 800)))
      .then(() => {
        setDisplayedHistory([]);
        return addLine(text, "system");
      });
  }

  function getRoomText(roomId) {
    const roomData = ADVENTURE.rooms[roomId];
    const hasVisited = visitedRooms[roomId];

    if (!hasVisited) return roomData.enterFirst || roomData.desc;
    return roomData.enterOther || roomData.desc;
  }

  function completeRoom(roomId, delay, latestCode = binaryCode) {
    const nextRoomId = "core";

    setCompletedRooms(prev => ({
      ...prev,
      [roomId]: true
    }));

    setRoom(nextRoomId);

    return new Promise(r => setTimeout(r, delay))
      .then(() => {
        const textToShow = getRoomText(nextRoomId);
        return loadNewRoom(textToShow);
      })
      .then(() => {
        // ALWAYS remind player of code
        return addLine(`> CURRENT CODE: ${latestCode.join("") || "NONE"}`, "system");
      });
  }

  function handleRoomSuccess(roomId, bits = 1, delay = 1200) {
    return addLine("✅ NODE STABILISED", "success")
      .then(() => new Promise(r => setTimeout(r, 800)))

      .then(() => {
        if (bits > 0) return awardBits(bits);

        addLine("> NO DATA RECOVERED", "error")
        return Promise.resolve(binaryCode);
      })
      .then(updatedCode => {
        return new Promise(r => setTimeout(() => r(updatedCode), 1500));
      })
      .then(updatedCode => {
        setCompletedRooms(prev => ({
          ...prev,
          [roomId]: true
        }));

        return completeRoom(roomId, delay, updatedCode);
      });
  }

  function generateLogicPuzzle(stage = 1) {
    const gates = ["AND", "OR", "XOR", "NAND", "NOR"]; 

    const a = Math.round(Math.random());
    const b = Math.round(Math.random());
    const c = Math.round(Math.random());
    const d = Math.round(Math.random());

    const gate1 = gates[Math.floor(Math.random() * gates.length)];
    const gate2 = gates[Math.floor(Math.random() * gates.length)];
    const gate3 = gates[Math.floor(Math.random() * gates.length)];

    if (stage === 1) {
      const answer = computeGate(gate1, a, b);
      return { stage, a, b, gate1, answer: String(answer) };
    }

    if (stage === 2) {
      const step1 = computeGate(gate1, a, b);
      const answer = computeGate(gate2, step1, c);
      return { stage, a, b, c, gate1, gate2, answer: String(answer) };
    }

    // stage 3
    const step1 = computeGate(gate1, a, b);
    const step2 = computeGate(gate2, c, d);
    const answer = computeGate(gate3, step1, step2);

    return {
      stage,
      a, b, c, d,
      gate1, gate2, gate3,
      answer: String(answer)
    };
  }

  function getLoopBits(loopCount) {
    if (loopCount <= 3) return 3; // fast escape
    if (loopCount <= 6) return 2; // medium
    if (loopCount <= 8) return 1; // slow
    return 0; // crash (loop 9)
  }

  function computeGate(gate, a, b) {
    switch (gate) {
      case "AND": return a & b;
      case "OR": return a | b;
      case "XOR": return a ^ b;
      case "NAND": return (a & b) === 1 ? 0 : 1;
      case "NOR": return (a | b) === 1 ? 0 : 1;
      default: return 0;
    }
  }

  function glitchText(text, intensity = 0.1) {
    const chars = "!@#$%^&*<>?/[]{}";
    
    return text
      .split("")
      .map(char => {
        if (Math.random() < intensity) {
          return chars[Math.floor(Math.random() * chars.length)];
        }
        return char;
      })
      .join("");
  }

  function triggerGlitch(duration = 200) {
    setGlitch(true);
    setTimeout(() => setGlitch(false), duration);
  }

  function awardBits(count) {
    return new Promise(resolve => {
      setBinaryCode(prev => {
        const spaceLeft = 9 - prev.length;

        const bits = Array.from({ length: count }, () => Math.round(Math.random()));
        const bitsToAdd = bits.slice(0, spaceLeft);

        const updated = [...prev, ...bitsToAdd];

        // 🔥 STAGGERED OUTPUT
        addLine(
          `> DATA FRAGMENT${bitsToAdd.length > 1 ? "S" : ""} ACQUIRED [${updated.length}]: ${bitsToAdd.join(" ")}`,
          "system"
        )

        .then(() => new Promise(r => setTimeout(r, 800))) // ⏸ pause before code

        .then(() => addLine(`> CURRENT CODE: ${updated.join("") || "NONE"}`, "system"))

        .then(() => resolve(updated));

        return updated;
      });
    });
  }

function generateDebugPuzzle(stage = 1) {
    if (stage === 1) {
      return {
        stage,
        question: `Code snippet:\n\nlet total = 0;\ntotal = num;\n\nWhat is the issue?`,
        answer: "overwrite"
      };
    }

    if (stage === 2) {
      return {
        stage,
        question: `Fix the code:\n\nlet total = 0;\ntotal = num;`,
        answer: "total += num"
      };
    }

    // stage 3
    return {
      stage,
      question: `What is the output?\n\nlet x = 2;\nx = x * 3;\nx = x - 1;\nconsole.log(x);`,
      answer: "5"
    };
  }

  // ── COMMAND HANDLER ──────────────────
  // Processes all player input:
  // help -> show commands
  // look -> show room descriptions
  // go -> move between rooms
  // solve -> attempt puzzles
  // uknown -> error handling
  function handleCommand(cmd) {
    if (locked) return;

    const raw = cmd.trim().toLowerCase();
    addLine(`> ${cmd}`, "player");

    // NOTE: currentRoom refers to the room BEFORE movement
    const currentRoom = ADVENTURE.rooms[room];

    // HELP
    if (raw === "help") {
      addLine("Commands: go [direction], look, solve [code], help", "system");
    
    // ── LOOK ──────────────────
    } else if (raw === "look") {
      let diagram = "";

      // LOGIC ROOM
      if (room === "logic" && logicPuzzle) {

        // BUILD DIAGRAM 
        if (logicPuzzle.stage === 1) {          
          diagram = `
    ${logicPuzzle.a} ──┐
        ${logicPuzzle.gate1} ─── ?
    ${logicPuzzle.b} ──┘
    `;
        }

        if (logicPuzzle.stage === 2) {
          diagram = `
    ${logicPuzzle.a} ──┐
        ${logicPuzzle.gate1} ───┐
    ${logicPuzzle.b} ──┘      |
              ${logicPuzzle.gate2} ─── ?
    ${logicPuzzle.c} ─────────┘
    `;
        }

        if (logicPuzzle.stage === 3) {
          diagram = `
    ${logicPuzzle.a} ──┐
        ${logicPuzzle.gate1} ───┐
    ${logicPuzzle.b} ──┘      |
              ${logicPuzzle.gate3} ─── ?
    ${logicPuzzle.c} ──┐      |
        ${logicPuzzle.gate2} ───┘
    ${logicPuzzle.d} ──┘
    `;
        }

        // ── STAGE 1: SHOW DESC + PUZZLE ──────────────────
        if (logicPuzzle.stage === 1) {
          return addLine(currentRoom.desc, "system")
            .then(() => addLine(`> LOGIC STAGE 1/3`, "system"))
            .then(() => addLine(diagram, "system"))
            .then(() => addLine("Type: solve [0 or 1]", "system"));
        }

        // ── STAGE 2/3: PUZZLE ONLY ──────────────────
        return addLine("", "system")
          .then(() => addLine("> RECONFIGURING CIRCUIT...", "system"))
          .then(() => new Promise(r => setTimeout(r, 1000)))
          .then(() => addLine(`> LOGIC STAGE ${logicPuzzle.stage}/3`, "system"))
          .then(() => addLine(diagram, "system"))
          .then(() => addLine("Type: solve [0 or 1]", "system"));

      // DEBUG ROOM
      } else if (room === "debug" && debugPuzzle) {
          return addLine(`> DEBUG STAGE ${debugStage}/3`, "system")
            .then(() => addLine(debugPuzzle.question, "system"))
            .then(() => addLine("Type: solve [answer]", "system"));
      }

      // ── OTHER ROOMS ──────────────────
      return addLine(currentRoom.desc, "system");   

    // ── GO ──────────────────
    } else if (raw.startsWith("go ")) {
      const dir = raw.replace("go ", "").trim();

      if (dir === "firewall" && binaryCode.length < 7) {
        addLine("> ACCESS DENIED - INSUFFICIENT DATA", "error");
        return
      }

      if (currentRoom.exits[dir]) {
        const nextId = currentRoom.exits[dir];
        const nextRoom = ADVENTURE.rooms[nextId];

        setRoom(nextId);

        // ROOM HANDLING

        // FIREWALL SPECIAL DISPLAY
        if (nextId === "firewall") {          
          const textToShow = getRoomText(nextId);

          setVisitedRooms(prev => ({
            ...prev,
            [nextId]: true
          }));

          loadNewRoom(textToShow)
            .then(() => {
              const code = binaryCode.join("");

              addLine(`> DATA FRAGMENTS DETECTED: ${binaryCode.length}`, "system");

              if (code.length > 0) {
                return addLine(`> CURRENT BINARY: ${code}`, "system");
              }
            });          

          const code = binaryCode.join("");
          if (code.length > 0) {
            addLine(`> COLLECTED BINARY: ${code}`, "system")
              .then(() => new Promise(r => setTimeout(r, 600)));
          }

        // LOGIC ROOM
        } else if (nextId === "logic") {
          const textToShow = getRoomText(nextId);
          loadNewRoom(textToShow)
            .then (() => {
              setVisitedRooms(prev => ({
                ...prev,
                [nextId]: true
              }));

              // generate puzzle BUT DO NOT SHOW
              if (!completedRooms["logic"]) {
                const newPuzzle = generateLogicPuzzle();
                setLogicPuzzle(newPuzzle);
                setLogicStage(1);
              }
              
            });          

        // LOOP ROOM
        } else if (nextId === "loopRoom") {
          setLoopCount(0); // reset when entering loop area
          const textToShow = getRoomText(nextId);

          setVisitedRooms(prev => ({
            ...prev,
            [nextId]: true
          })); 

          loadNewRoom(textToShow);
        
        // DEBUG ROOM
        } else if (nextId === "debug") {

          const textToShow = getRoomText(nextId);

          loadNewRoom(textToShow).then(() => {

            setVisitedRooms(prev => ({
              ...prev,
              [nextId]: true
            }));

            if (!completedRooms["debug"]) {
              setDebugStage(1);
              setDebugPuzzle(generateDebugPuzzle(1));
            }

          });

        // DEFAULT ROOM
        } else {
          const textToShow = getRoomText(nextId);

          setVisitedRooms(prev => ({
            ...prev,
            [nextId]: true
          }));

          // LOOP TRACKING
          loadNewRoom(textToShow).then(() => {
            if (nextId === "loop") {
              setLoopCount(c => {
                const newCount = c + 1;

                if (newCount === 3) {
                  triggerGlitch(1500);
                  addLine("> SIGNAL INSTABILITY DETECTED", "error");
                }
                if (newCount === 5) {
                  addLine(glitchText("> DATA PATTERN REPEATING", 0.1), "error");
                }
                if (newCount === 6) {
                  addLine("> HINT: NOT ALL PATHS REQUIRE MOVEMENT", "system");
                }
                if (newCount === 7) { 
                  addLine(glitchText("> WARNING: RECURSIVE STATE CONFIRMED", 0.12), "error");
                }

                // 💀 LOOP CRASH
                if (newCount === 9) {
                  setLocked(true);

                  triggerGlitch(2000);

                  addLine("> SYSTEM ERROR: INFINITE LOOP", "error")
                    .then(() => addLine("> CRITICAL FAILURE DETECTED", "error"))
                    .then(() => new Promise(r => setTimeout(r, 800)))

                    .then(() => {
                      setDisplayedHistory([]);
                      return addLine("> SYSTEM COLLAPSE", "error");
                    })

                    .then(() => new Promise(r => setTimeout(r, 1000)))

                    .then(() => {
                      setDisplayedHistory([]);
                      return addLine("> REBOOTING SYSTEM...", "system");
                    })

                    .then(() => new Promise(r => setTimeout(r, 1200)))

                    .then(() => {
                      setRoom("core");
                      setLoopCount(0);
                      setLocked(false);

                      return loadNewRoom(getRoomText("core"));
                    });

                }

                return newCount;
              });
            
            } else {
              setLoopCount(0);
            }
          });          
        }

        // ── WIN CHECK ──────────────────
        if (nextRoom.win) {
          setWon(true);
        }
      } else {
        addLine(`You can't go ${dir} from here.`, "error");
        setScore(s => Math.max(0, s - 10));
      }
      
    // ── SOLVE COMMAND ──────────────────
    // Handles all puzzle solving logic
    // logic -> evaluates circuit puzzles
    // debug -> fixes code issues
    // loop -> breaks infinite loop
    // firewall -> converts binary to decimal
    // Also manages binary fragment collection system
    } else if (raw.startsWith("solve ")) {
      if (completedRooms[room]) {
        addLine("> This node has already been stabilised.", "system");
        return;
      }

      const answer = raw.replace("solve ", "").trim();

      // LOGIC ROOM SPECIAL HANDLING
      if (room === "logic" && logicPuzzle) {

        if (answer === logicPuzzle.answer) {

          return addLine("✅ Correct", "success")

            .then(() => {

              // FINAL STAGE
              if (logicStage === 3) {
                return handleRoomSuccess(room, 3); // 🎯 total reward    
              }

              // MOVE TO NEXT STAGE
              const nextStage = logicStage + 1;

              setLogicStage(nextStage);
              setLogicPuzzle(generateLogicPuzzle(nextStage));

              return addLine(`> STAGE ${logicStage}/3 COMPLETE`, "system")
                .then(() => new Promise(r => setTimeout(r, 500)))
                .then(() => addLine(`> ADVANCING TO STAGE ${nextStage}/3`, "system"))
                .then(() => addLine("> Type 'look' to inspect new circuit", "system"));
            });

        } else {
          triggerGlitch(300);
          addLine("❌ Incorrect - try again.", "error");
          addLine("💡 AND=both 1 | OR=any 1 | XOR=different | NAND=NOT AND | NOR=NOT OR", "system");
          setScore(s => Math.max(0, s - 10));
        }

        return;
      }
    
      // LOOP
      if (room === "loop") {

        if (answer === "break") {

          const bits = getLoopBits(loopCount);

          return addLine("✅ Loop broken", "success")
            .then(() => addLine("> ATTEMPTING MANUAL OVERRIDE...", "system"))
                .then(() => new Promise(r => setTimeout(r, 600)))
                .then(() => addLine("> INTERRUPTING LOOP...", "error"))
                .then(() => new Promise(r => setTimeout(r, 600)))
                .then(() => {
                  triggerGlitch(800);
                  addLine("> REALITY DESYNCHRONISING...", "error");
                })
                .then(() => new Promise(r => setTimeout(r, 1200)))

            .then(() => {
              if (bits === 0) {
                return addLine("> NO DATA RECOVERED", "error")
                  .then(() => completeRoom(room, 1200, binaryCode));
              }

              return handleRoomSuccess(room, bits);
            });

        } else {
          triggerGlitch(300);
          addLine("❌ That doesn't break the loop.", "error");
          setScore(s => Math.max(0, s - 10));
        }

        return;
      }      

      // FIREWALL
      if (room === "firewall") {
        const binaryString = binaryCode.join("");
        const bitCount = binaryString.length;

        // HIDDEN FROM PLAYER
        if (bitCount < 7) {
          triggerGlitch(400);
          addLine("> ACCESS DENIED", "error");
          addLine("> INSUFFICIENT DATA", "error");
          return;
        }

        const correctDecimal = parseInt(binaryString, 2);
        const userValue = parseInt(answer, 10);

        // INVALID INPUT
        if (isNaN(userValue)) {
          addLine("> INVALID INPUT - ENTER DECIMAL VALUE", "error");
          return;
        }

        // CORRECT
        if (userValue === correctDecimal) {
          addLine("> AUTHENTICATION SUCCESSFUL", "success")
            .then(() => addLine("> VALIDATING...", "system"))
            .then(() => new Promise(r => setTimeout(r, 600)))
            .then(() => addLine("> DECRYPTING...", "system"))
            .then(() => new Promise(r => setTimeout(r, 600)))
            .then(() => addLine("> BYPASSING SECURITY...", "system"))
            .then(() => triggerGlitch(1200))
            .then(() => new Promise(r => setTimeout(r, 800)))

            .then(() => {
              setDisplayedHistory([]);
              return addLine("> ACCESS GRANTED", "success");
            })

            .then(() => new Promise(r => setTimeout(r, 600)))

            .then(() => {
              const nextRoom = ADVENTURE.rooms[currentRoom.puzzle.success];
              setRoom(currentRoom.puzzle.success);
              return loadNewRoom(nextRoom.desc);
            });
        } else {
          // SMART FEEDBACK
          if (userValue > correctDecimal) {
            addLine("❌ ACCESS DENIED", "error");
            addLine("> ERROR VALUE TOO HIGH", "system");
          } else {
            addLine("❌ ACCESS DENIED", "error");
            addLine("> ERROR VALUE TOO LOW", "system");
          }

          setScore(s => Math.max(0, s - 10));
        }

        return;

      }
      
      // DEBUG ROOM
      if (room === "debug" && debugPuzzle) {

        if (answer === debugPuzzle.answer) {

          return addLine("✅ Fix applied", "success")

            .then(() => {

              // FINAL STAGE
              if (debugStage === 3) {
                return handleRoomSuccess(room, 3); // 🎯 reward
              }

              // NEXT STAGE
              const nextStage = debugStage + 1;

              setDebugStage(nextStage);
              setDebugPuzzle(generateDebugPuzzle(nextStage));

              return addLine(`> DEBUG STAGE ${debugStage}/3 RESOLVED`, "system")
                .then(() => new Promise(r => setTimeout(r, 500)))
                .then(() => addLine(`> LOADING NEXT ERROR...`, "error"))
                .then(() => new Promise(r => setTimeout(r, 800)))
                .then(() => addLine("> Type 'look' to inspect code", "system"));
            });

        } else {
          triggerGlitch(300);
          addLine("❌ Incorrect. Analyse the code carefully.", "error");
          setScore(s => Math.max(0, s - 10));
        }

        return;
      }

      // 🔥 ALL PUZZLES
      if (currentRoom.puzzle) {
        if (answer === currentRoom.puzzle.answer) {
          const nextRoom = ADVENTURE.rooms[currentRoom.puzzle.success];

          const bit = Math.round(Math.random());

          setRoom(currentRoom.puzzle.success);

          return handleRoomSuccess(room, 1);         

        } else {
          triggerGlitch(300);
          addLine("❌ Incorrect solution. Try again.", "error");
          setScore(s => Math.max(0, s - 10));
        }
      } else {
        addLine("Nothing to solve here.", "error");
      }
    // UNKNOWN COMMAND      
    } else {
      addLine(`Unknown command: '${raw}'. Type 'help' for commands.`, "error");
      setScore(s => Math.max(0, s - 5));
    }
  }
  // End of command handler
  // Controls full game flow and progression logic

  function onKeyDown(e) {
    if (e.key === "Enter" && input.trim()) {
      handleCommand(input);
      setInput("");
    }
  }

  if (won) {
    const stars = score >= 280 ? "⭐⭐⭐" : score >= 180 ? "⭐⭐" : "⭐";
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">ESCAPED!</div>
          <div className="stars">{stars}</div>
          <div style={{ color: "var(--text-dim)", marginBottom: 8 }}>Text Adventure complete</div>
          <div className="victory-score">{score} pts</div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: 24 }}>
            The answer was 42 — <em>"loops + 1"</em> = a reference to the classic programming joke! (Also the answer to life, the universe and everything 😄)
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={onBack}>← Menu</button>
            <button className="btn btn-primary" onClick={() => onComplete(score)}>Next Level →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <button
          className="btn btn-ghost"
          style={{ padding: "6px 12px", fontSize: "0.7rem" }}
          onClick={onBack}
        >
          ← Back
        </button>
        <div className="level-tag">LEVEL 4</div>
        <div className="game-title">Text Adventure</div>
        <div className="score-display">{score} pts</div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: "60%",
            background: "linear-gradient(90deg, #7fff00, #00f5ff)",
          }}
        />
      </div>

      <div className="info-box">
        Escape the CS Dungeon! Type commands to navigate. Wrong commands cost
        points 💀
      </div>

      <div
        className={`adventure-box ${glitch ? "glitch" : ""}`}
        ref={historyRef}
      >
        {displayedHistory.map((line, i) => (
          <div
            key={i}
            className={`adventure-line ${line.type}`}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div className="adventure-input-row">
        <span className="adventure-prompt">$&gt;&nbsp;</span>
        <input
          disabled={locked}
          ref={inputRef}
          className="adventure-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="type a command and press Enter..."
          autoFocus
        />
      </div>

      <div className="hint-text">
        💡 Commands: <span style={{ color: "var(--accent3)" }}>go north</span> /{" "}
        <span style={{ color: "var(--accent3)" }}>go south</span> /{" "}
        <span style={{ color: "var(--accent3)" }}>go east</span> /{" "}
        <span style={{ color: "var(--accent3)" }}>go west</span> /{" "}
        <span style={{ color: "var(--accent3)" }}>look</span> /{" "}
        <span style={{ color: "var(--accent3)" }}>solve [code]</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════
function App() {
  const [screen, setScreen] = useState("home");
  const [completedLevels, setCompletedLevels] = useState([]);
  const [scores, setScores] = useState({});
  // ── NEW ──
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [toastQueue, setToastQueue] = useState([]);

  function unlockAchievement(id) {
    if (unlockedAchievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    if (!achievement) return;
    setUnlockedAchievements((prev) => [...prev, id]);
    setToastQueue((prev) => [...prev, achievement]);
  }

  function dismissToast() {
    setToastQueue((prev) => prev.slice(1));
  }

  function completeLevel(levelId, pts, mistakes = 0) {
    setCompletedLevels((prev) =>
      prev.includes(levelId) ? prev : [...prev, levelId],
    );
    setScores((prev) => ({
      ...prev,
      [levelId]: Math.max(prev[levelId] || 0, pts),
    }));

    // ── ACHIEVEMENTS ON LEVEL COMPLETE ──
    if (mistakes === 0) {
      const ids = {
        1: "no_mistakes_1",
        2: "no_mistakes_2",
        3: "no_mistakes_3",
      };
      if (ids[levelId]) unlockAchievement(ids[levelId]);
    }
    if (levelId === 4) unlockAchievement("escapee");

    const newCompleted = completedLevels.includes(levelId)
      ? completedLevels
      : [...completedLevels, levelId];
    if (newCompleted.length >= 4) unlockAchievement("all_levels");

    const nextId = levelId + 1;
    if (nextId <= 4) setScreen(`level${nextId}`);
    else setScreen("home");
  }

  return (
    <>
      {screen === "home" && (
        <HomeScreen
          completedLevels={completedLevels}
          scores={scores}
          unlockedAchievements={unlockedAchievements}
          onSelectLevel={(id) => setScreen(`level${id}`)}
        />
      )}
      {screen === "level1" && (
        <Level1
          onComplete={(pts, mistakes) => completeLevel(1, pts, mistakes)}
          onBack={() => setScreen("home")}
          onAchievement={unlockAchievement}
        />
      )}
      {screen === "level2" && (
        <Level2
          onComplete={(pts, mistakes) => completeLevel(2, pts, mistakes)}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "level3" && (
        <Level3
          onComplete={(pts, mistakes) => completeLevel(3, pts, mistakes)}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "level4" && (
        <Level4
          onComplete={(pts) => completeLevel(4, pts)}
          onBack={() => setScreen("home")}
        />
      )}
      {toastQueue.length > 0 && (
        <AchievementToast achievement={toastQueue[0]} onDone={dismissToast} />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
