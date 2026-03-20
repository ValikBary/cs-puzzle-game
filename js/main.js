
// =============================================
// CS PUZZLE GAME - Main React App
// Team: Valik, Simon, Fred
// =============================================

const { useState, useEffect, useRef } = React;

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
    options: ["lights_on == True", "lights_on", "not lights_on", "lights_on > 0"],
    correctAnswers: ["lights_on == True", "lights_on"],
    explanation:
      "lights_on is False, so the condition fails and we get 'It is dark!'. Both 'lights_on == True' and 'lights_on' are valid ways to check a boolean!",
  },
];

// ── LEVEL 2 – LOGIC GATES ─────────────────────
const GATE_PUZZLES = [
  { a: 1, b: 1, target: 1, correct: "AND",  hint: "AND outputs 1 only when BOTH inputs are 1" },
  { a: 1, b: 0, target: 1, correct: "OR",   hint: "OR outputs 1 when AT LEAST ONE input is 1" },
  { a: 0, b: 0, target: 1, correct: "NOR",  hint: "NOR is the opposite of OR — outputs 1 only when both are 0" },
  { a: 1, b: 1, target: 0, correct: "XOR",  hint: "XOR outputs 1 only when inputs are DIFFERENT" },
  { a: 0, b: 1, target: 0, correct: "AND",  hint: "AND needs BOTH inputs to be 1. Here one is 0, so output is 0" },
];

const GATE_TYPES = ["AND", "OR", "NOT", "XOR", "NAND", "NOR"];

function computeGate(gate, a, b) {
  switch (gate) {
    case "AND":  return a & b;
    case "OR":   return a | b;
    case "NOT":  return a === 1 ? 0 : 1;
    case "XOR":  return a ^ b;
    case "NAND": return (a & b) === 1 ? 0 : 1;
    case "NOR":  return (a | b) === 1 ? 0 : 1;
    default:     return 0;
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
      { code: "    total = num          # ← this line replaces instead of adds!", bug: true },
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

// ── LEVEL 4 – TEXT ADVENTURE ──────────────────
const ADVENTURE = {
  start: "room1",
  rooms: {
    room1: {
      enterFirst: `> INITIALISING USER TRANSFER...
Your body dissolves into glowing particles.
You feel yourself being pulled apart... then reassembled.
A platform of energy stabilises beneath your feet, holding your form together.

> WARNING: CONSCIOUSNESS TRANSFER UNSTABLE
> USER SUCCESSFULLY DIGITISED`,
      enterOther: "You return to the digitising platform. The system hums quietly around you.",
      desc: `Streams of data pulse through the walls like veins of light.
This is where you entered the system.
A single pathway leads deeper into the network.
      
Paths detected: NORTH.`,
      exits: { 
        north: "core"
      },
    },
    core: {
      enterFirst: `> CORE SYSTEM ACCESSED
You step into the heart of the system.
Data streams converge here, flowing in all directions.
A large firewall pulses at the far end - blocking your escape`,
      enterOther: "You return to the core system. DAta streams continue to pulse around you.",
      desc: `You stand within the central node of the network.
Streams of data surge through glowing pathways, branching in every direction.

A translucent screen materialises in front of you.

> OBJECTIVE: LOCATE ACCESS CODE TO BYPASS FIREWALL

The firewall looms ahead - a barrier between you and escape.

Other paths lead deeper into the system.

Paths detected: NORTH, EAST, SOUTH, WEST, FIREWALL`,
      exits: {
        north: "loopRoom",
        east: "logic",
        south: "debug",
        west: "room1",
        firewall: "firewall"
      }
    },
    firewall: {
      // enterFirst: ""
      // enterOther: ""
      desc: "> FIREWALL ACTIVE\n\nA glowing barrier blocks your exit from the system.\n\nBinary access code required.\n\nConvert the collected binary sequence into decimal.\n\nType: solve [decimal]",
      exits: {
        west: "core"
      },
      puzzle: {
        type: "binary",
        success: "exit"
      }
    },
    logic: {
      // enterFirst: ""
      // enterOther: ""
      desc: "> LOGIC NODE\n\nA circuit forms in front of you...",
      exits: {},
      puzzle: {
        success: "firewall"
      }
    },
    loopRoom: {
      // enterFirst: ""
      // enterOther: ""
      desc: "",
      exits: {
        north: "loop",
        east: "loop",
        south: "loop",
        west: "loop",
      }
    },   
    loop: {
      // enterFirst: ""
      // enterOther: ""
      desc: "You walk forward..\n\nThe system flickers...\n\nYou are back where you started.\n\nPaths: NORTH, EAST, SOUTH, WEST",
      exits: {
        north: "loop",
        east: "loop",
        south: "loop",
        west: "loop",
      },
      puzzle: {
        answer: "break",
        success: "debug"
      }
    },
    debug: {
      // enterFirst: ""
      // enterOther: ""
      desc: "> DEBUG TERMINAL\n\n> ERROR DETECTED\n\nCode snippet:\n\n total = num\n\nThe system is not accumulating values correctly.\n\nType: solve [code]",
      exits: {},
      puzzle: {
        answer: "total += num",
        success: "exit"
      }
    },
    exit: {
      desc: "> SYSTEM RESTORED\n\nAll errors resolved.\n\nYou feel your body reforming...\n\n> EXITING DIGITAL WORLD...\n\n🎉 You escaped the system!",
      exits: {},
      win: true
    },    
  },
};

const ROOM_BITS = {
  loop: 1,
  debug: 0,
  logic: 1
};


// ══════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════

// ── HOME SCREEN ───────────────────────────────
function HomeScreen({ completedLevels, scores, onSelectLevel }) {
  return (
    <div className="screen">
      <div style={{ marginBottom: 8 }}>
        <div className="home-subtitle" style={{ marginBottom: 4 }}>
          <span>TEAM SOFTWARE ENGINEERING</span> — University of Lincoln
        </div>
      </div>
      <div className="home-title">
        CS PUZZLE<br />GAME <span className="blinking-cursor" />
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
                LEVEL {lvl.id} · {lvl.difficulty === "Easy" ? "🟢 Easy" : lvl.difficulty === "Medium" ? "🟡 Medium" : "🔴 Hard"}
              </div>
              <div className="level-icon">{lvl.icon}</div>
              <div className="level-name">{lvl.name}</div>
              <div className="level-desc">{lvl.desc}</div>
              {done && (
                <div className="level-badge" title="Completed!">✅</div>
              )}              
              {scores[lvl.id] != null && (
                <div style={{ marginTop: 10, fontSize: "0.7rem", color: lvl.color }}>
                  Best: {scores[lvl.id]} pts
                </div>
              )}
            </div>
          );
        })}
      </div>      
      <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textAlign: "center" }}>
        Play any level — explore different Computer Science concepts 🚀
      </div>
    </div>
  );
}

// ── LEVEL 1 – IF/ELSE ─────────────────────────
function Level1({ onComplete, onBack }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = IF_ELSE_QUESTIONS[qIdx];
  const progress = ((qIdx) / IF_ELSE_QUESTIONS.length) * 100;

  function choose(opt) {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (q.correctAnswers.includes(opt)) {
      setScore(s => s + 100);
    }
  }

  function next() {
    if (qIdx + 1 >= IF_ELSE_QUESTIONS.length) {
      setDone(true);
    } else {
      setQIdx(i => i + 1);
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
          <div style={{ color: "var(--text-dim)", marginBottom: 8 }}>If / Else mastered</div>
          <div className="victory-score">{score} pts</div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: 24 }}>
            You correctly matched boolean conditions to expected outputs 🎉
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={onBack}>← Menu</button>
            <button className="btn btn-primary" onClick={() => onComplete(score)}>
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
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "0.7rem" }} onClick={onBack}>← Back</button>
        <div className="level-tag">LEVEL 1</div>
        <div className="game-title">If / Else</div>
        <div className="score-display">{score} pts</div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="info-box">
        Question {qIdx + 1} of {IF_ELSE_QUESTIONS.length} — Fill in the blank to make the code work correctly
      </div>

      <div className="code-block">
        <div style={{ height: 20 }} />
        {q.code.map((line, i) => {
          if (line.type === "blank-line") return <div key={i} style={{ height: 4 }} />;
          if (line.type === "has-blank") {
            const parts = line.text.split("_____");
            return (
              <div className="code-line" key={i}>
                <span className="kw">{parts[0].includes("if") ? "if " : parts[0]}</span>
                <span className="blank">
                  {selected || "?"}
                </span>
                <span>{parts[1]}</span>
              </div>
            );
          }
          return (
            <div className="code-line" key={i}>
              <span
                dangerouslySetInnerHTML={{
                  __html: line.text
                    .replace(/(if|else|print|True|False|and|or|not)/g, '<span class="kw">$1</span>')
                    .replace(/(".*?")/g, '<span class="str">$1</span>')
                    .replace(/(\d+)/g, '<span class="num">$1</span>'),
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="hint-text">💡 Pick the condition that goes inside the <span style={{ color: "var(--accent)" }}>if</span> statement:</div>

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
          <br />{q.explanation}
        </div>
      )}

      {answered && (
        <button className="btn btn-primary" onClick={next} style={{ alignSelf: "flex-end" }}>
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

  const p = GATE_PUZZLES[pIdx];
  const output = computeGate(selectedGate, p.a, p.b);
  const isCorrect = output === p.target;

  function check() {
    if (answered) return;
    setAnswered(true);
    if (isCorrect) setScore(s => s + 100);
  }

  function next() {
    if (pIdx + 1 >= GATE_PUZZLES.length) {
      setDone(true);
    } else {
      setPIdx(i => i + 1);
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
          <div style={{ color: "var(--text-dim)", marginBottom: 8 }}>Logic Gates mastered</div>
          <div className="victory-score">{score} pts</div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: 24 }}>
            You understand AND, OR, XOR, NOR and more — like a real hardware engineer!
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
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "0.7rem" }} onClick={onBack}>← Back</button>
        <div className="level-tag">LEVEL 2</div>
        <div className="game-title">Logic Gates</div>
        <div className="score-display">{score} pts</div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(pIdx / GATE_PUZZLES.length) * 100}%`, background: "linear-gradient(90deg, #ff006e, #ffd60a)" }} />
      </div>

      <div className="info-box">
        Puzzle {pIdx + 1} of {GATE_PUZZLES.length} — Choose a gate so that the output equals <strong style={{ color: "var(--accent3)" }}>{p.target}</strong>
      </div>

      <div className="gates-container">
        <div className="gate-row">
          <div style={{ marginRight: 8 }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: 6 }}>INPUTS</div>
            <div className="gate-inputs">
              <div className={`gate-input ${p.a ? "on" : "off"}`}>{p.a}</div>
              <div className={`gate-input ${p.b ? "on" : "off"}`}>{p.b}</div>
            </div>
          </div>

          <div style={{ fontSize: "1.5rem", color: "var(--text-dim)" }}>→</div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: 6 }}>SELECT GATE</div>
            <select
              className="gate-select"
              value={selectedGate}
              onChange={e => { if (!answered) setSelectedGate(e.target.value); }}
            >
              {GATE_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ fontSize: "1.5rem", color: "var(--text-dim)" }}>→</div>

          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: 6 }}>OUTPUT</div>
            <div className={`gate-output ${output ? "on" : "off"}`}>{output}</div>
          </div>

          <div style={{ marginLeft: 16 }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: 6 }}>NEED</div>
            <div className={`gate-output ${p.target ? "on" : "off"}`}>{p.target}</div>
          </div>
        </div>
      </div>

      <div className="hint-text">
        💡 Gate reference: <span style={{ color: "var(--accent)" }}>AND</span> = both 1 | <span style={{ color: "var(--accent2)" }}>OR</span> = at least one 1 | <span style={{ color: "var(--accent4)" }}>XOR</span> = different inputs | <span style={{ color: "var(--accent3)" }}>NOT</span> = flip input A
      </div>

      {!answered && (
        <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={check}>
          Check Answer
        </button>
      )}

      {answered && (
        <>
          <div className={`feedback-box ${isCorrect ? "correct" : "wrong"}`}>
            <strong>{isCorrect ? "✅ Correct!" : `❌ Not quite — the correct gate was ${p.correct}`}</strong>
            <br />{p.hint}
          </div>
          <button className="btn btn-primary" onClick={next} style={{ alignSelf: "flex-end" }}>
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

  const p = DEBUG_PUZZLES[pIdx];
  const isCorrect = selected === p.bugLine;

  function pickLine(i) {
    if (answered) return;
    setSelected(i);
  }

  function check() {
    if (selected === null || answered) return;
    setAnswered(true);
    if (isCorrect) setScore(s => s + 150);
  }

  function next() {
    if (pIdx + 1 >= DEBUG_PUZZLES.length) {
      setDone(true);
    } else {
      setPIdx(i => i + 1);
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
          <div style={{ color: "var(--text-dim)", marginBottom: 8 }}>Debug Mode cleared</div>
          <div className="victory-score">{score} pts</div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: 24 }}>
            Debugging is one of the most important skills in CS — you've got it! 🐛✅
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={onBack}>← Menu</button>
            <button className="btn btn-primary" onClick={() => onComplete(score)}>🏆 Finish!</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "0.7rem" }} onClick={onBack}>← Back</button>
        <div className="level-tag">LEVEL 3</div>
        <div className="game-title">Debug Mode</div>
        <div className="score-display">{score} pts</div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(pIdx / DEBUG_PUZZLES.length) * 100}%`, background: "linear-gradient(90deg, #ffd60a, #ff006e)" }} />
      </div>

      <div className="info-box">
        Puzzle {pIdx + 1} of {DEBUG_PUZZLES.length} — <strong>{p.title}</strong>: Click the line that contains the bug
      </div>

      <div className="debug-lines">
        {p.lines.map((line, i) => {
          let cls = "debug-line";
          if (selected === i && !answered) cls += " selected-wrong";
          if (answered && i === p.bugLine) cls += " selected-correct";
          else if (answered && selected === i && i !== p.bugLine) cls += " selected-wrong";
          return (
            <div key={i} className={cls} onClick={() => pickLine(i)}>
              <span className="line-num">{i + 1}</span>
              <span
                style={{ flex: 1 }}
                dangerouslySetInnerHTML={{
                  __html: line.code
                    .replace(/(for|in|if|else|print|range|def|return|True|False|and|or|not)/g, '<span class="kw">$1</span>')
                    .replace(/(".*?")/g, '<span class="str">$1</span>')
                    .replace(/(#.*$)/g, '<span class="comment">$1</span>')
                    .replace(/(\d+)/g, '<span class="num">$1</span>'),
                }}
              />
              {selected === i && !answered && <span style={{ color: "var(--accent4)", fontSize: "0.75rem" }}>← selected</span>}
            </div>
          );
        })}
      </div>

      <div className="hint-text">
        💡 Read each line carefully. Look for wrong operators, typos, or logic errors.
      </div>

      {!answered && selected !== null && (
        <button className="btn btn-danger" style={{ alignSelf: "flex-start" }} onClick={check}>
          🐛 Report Bug on Line {selected + 1}
        </button>
      )}

      {answered && (
        <>
          <div className={`feedback-box ${isCorrect ? "correct" : "wrong"}`}>
            <strong>{isCorrect ? "✅ Bug Found!" : `❌ Wrong line — bug was on line ${p.bugLine + 1}`}</strong>
            <br />{p.explanation}
            <br /><br />Fix: <span style={{ fontFamily: "monospace", color: "var(--accent4)" }}>{p.fix}</span>
          </div>
          <button className="btn btn-primary" onClick={next} style={{ alignSelf: "flex-end" }}>
            {pIdx + 1 >= DEBUG_PUZZLES.length ? "🏆 Finish Game" : "Next →"}
          </button>
        </>
      )}
    </div>
  );
}

// ── LEVEL 4 – TEXT ADVENTURE ──────────────────

function Level4({ onComplete, onBack }) {
  const [room, setRoom] = useState("room1");
  const [displayedHistory, setDisplayedHistory] = useState([]);
  const [history, setHistory] = useState([
  { text: "> BOOTING SYSTEM...", type: "system" },
  { text: "> ESTABLISHING LINK...", type: "system" },
  { text: "> WARNING: USER DIGITISED", type: "error" },
  { text: ADVENTURE.rooms["room1"].desc, type: "system" },
  { text: "Type: go [direction] / look / help", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(300);
  const historyRef = useRef(null);
  const inputRef = useRef(null);
  const [loopCount, setLoopCount] = useState(0);
  const [logicPuzzle, setLogicPuzzle] = useState(null )
  const [binaryCode, setBinaryCode] = useState([]);

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

            currentText += currentLine[charIndex - 1] || "";

            setDisplayedHistory(h => {
              const updated = [...h];
              updated[updated.length - 1] = {
                ...line,
                text: currentText,
              };
              return updated;
            });

            if (charIndex < currentLine.length) {
              setTimeout(typeChar, 40);
            } else {
              // add newline after finishing line
              currentText += "\n";
              lineIndex++;

              setTimeout(typeLine, 700); // ⏸ pause between lines
            }
          }

          typeChar();
        }

        typeLine();
      });
    });

    return typingQueue.current;
  }

  function generateLogicPuzzle() {
    const gates = ["AND", "OR", "XOR", "NAND", "NOR"];

    const a = Math.round(Math.random());
    const b = Math.round(Math.random());
    const c = Math.round(Math.random());

    const gate1 = gates[Math.floor(Math.random() * gates.length)];
    const gate2 = gates[Math.floor(Math.random() * gates.length)];

    const step1 = computeGate(gate1, a, b);
    const final = computeGate(gate2, step1, c);

    return {
      a, b, c,
      gate1, gate2,
      answer: String(final)
    };
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

  function handleCommand(cmd) {
    const raw = cmd.trim().toLowerCase();
    addLine(`> ${cmd}`, "player");

    const currentRoom = ADVENTURE.rooms[room];

    // HELP
    if (raw === "help") {
      addLine("Commands: go [direction], look, solve [code], help", "system");
    
    // LOOK
    } else if (raw === "look") {
      addLine(currentRoom.desc, "system");

    // GO
    } else if (raw.startsWith("go ")) {
      const dir = raw.replace("go ", "").trim();

      if (currentRoom.exits[dir]) {
        const nextId = currentRoom.exits[dir];
        const nextRoom = ADVENTURE.rooms[nextId];

        setRoom(nextId);

        // FIREWALL SPECIAL DISPLAY
        if (nextId === "firewall") {
          const code = binaryCode.join("");

          addLine(nextRoom.desc, "system");

          if (code.length > 0) {
            addLine(`> COLLECTED BINARY: ${code}`, "system");
          }

        // LOGIC ROOM
        } else if (nextId === "logic") {
          const newPuzzle = generateLogicPuzzle();
          setLogicPuzzle(newPuzzle);

          const desc = `> LOGIC CIRCUIT DETECTED

          ${newPuzzle.a} ──┐
              ${newPuzzle.gate1} ──┐
          ${newPuzzle.b} ──┘     │
                    ${newPuzzle.gate2} ── ?
          ${newPuzzle.c} ─────────┘

          Type: solve [0 or 1]`;

          addLine(desc, "system");

        // LOOP ROOM
        } else if (nextId === "loopRoom") {
          setLoopCount(c => c + 1);

          addLine(nextRoom.desc, "system");

          setTimeout(() => {
            setLoopCount(c => {
              if (c >= 5) {
                addLine("> WARNING: REPEATING STATE DETECTED", "error");
                addLine("> POSSIBLE INFINITE LOOP", "error");
              }
              return c;
            });
          }, 300);

        // DEFAULT ROOM
        } else {
          addLine(nextRoom.desc, "system");
          setLoopCount(0); // reset when leaving loop
        }
        if (nextRoom.win) {
          setWon(true);
          addLine("🎉 You escaped! Well done!", "success");
        }
      } else {
        addLine(`You can't go ${dir} from here.`, "error");
        setScore(s => Math.max(0, s - 10));
      }
    
    // SOLVE
    } else if (raw.startsWith("solve ")) {
      const answer = raw.replace("solve ", "").trim();

      // LOGIC ROOM SPECIAL HANDLING
      if (room === "logic" && logicPuzzle) {
        if (answer === logicPuzzle.answer) {
          const nextRoom = ADVENTURE.rooms[currentRoom.puzzle.success];
          const bit = ROOM_BITS[room] ?? Math.round(Math.random());

          setRoom(currentRoom.puzzle.success);

          addLine("✅ Correct — circuit solved!", "success")
            .then(() => {
              setBinaryCode(prev => [...prev, bit]);
              return addLine(`> DATA FRAGMENT ACQUIRED: ${bit}`, "system");
            })
            .then(() => addLine("> PROCESSING...", "system"))
            .then(() => new Promise(r => setTimeout(r, 2000)))
            .then(() => {
              setDisplayedHistory([]);
              return addLine(nextRoom.desc, "system");
            });

        } else {
          addLine(`❌ Incorrect — evaluate ${logicPuzzle.gate1} then ${logicPuzzle.gate2}`, "error");
          addLine("💡 AND=both 1 | OR=any 1 | XOR=different | NAND=NOT AND | NOR=NOT OR", "system");
          setScore(s => Math.max(0, s - 10));
        }

        return;
      }

      if (room === "firewall") {
        const binaryString = binaryCode.join("");

        if (binaryString.length === 0) {
          addLine("❌ No data fragments collected.", "error");
          return;
        }

        const correctDecimal = parseInt(binaryString, 2);

        if (answer === String(correctDecimal)) {
          addLine("✅ ACCESS GRANTED — FIREWALL DISABLED", "success");

          const nextRoom = ADVENTURE.rooms[currentRoom.puzzle.success];
          setRoom(currentRoom.puzzle.success);

          addLine("> DECRYPTING...", "system")
            .then(() => new Promise(r => setTimeout(r, 800)))
            .then (() => addLine("> ACCESSING CORE...", "system"))
            .then(() => new Promise(r => setTimeout(r, 800)))
            .then(() => {
              setDisplayedHistory([]);
              return addLine(nextRoom.desc, "system");
            })
        } else {
          addLine(`❌ Incorrect. Hint: ${binaryString} (binary) → ? (decimal)`, "error");
          setScore(s => Math.max(0, s - 10));
        }

        return;
      }

      // 🔥 ALL PUZZLES
      if (currentRoom.puzzle) {
        if (answer === currentRoom.puzzle.answer) {
          const nextRoom = ADVENTURE.rooms[currentRoom.puzzle.success];

          const bit = ROOM_BITS[room] ?? Math.round(Math.random());

          setRoom(currentRoom.puzzle.success);

          addLine("✅ SOLUTION ACCEPTED", "success")
          .then(() => {
            setBinaryCode(prev => [...prev, bit]);
            return addLine(`> DATA FRAGMENT ACQUIRED: ${bit}`, "system");
          })
          .then(() => {
            return addLine(`> CURRENT CODE: ${binaryCode.concat(bit).join("")}`, "system");
          })
          .then(() => addLine("> PROCESSING...", "system"))
          .then(() => new Promise(r => setTimeout(r, 2000)))
          .then(() => {
            setDisplayedHistory([]);
            return addLine(nextRoom.desc, "system");
          });
          

        } else {
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
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "0.7rem" }} onClick={onBack}>← Back</button>
        <div className="level-tag">LEVEL 4</div>
        <div className="game-title">Text Adventure</div>
        <div className="score-display">{score} pts</div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: "60%", background: "linear-gradient(90deg, #7fff00, #00f5ff)" }} />
      </div>

      <div className="info-box">
        Escape the CS Dungeon! Type commands to navigate. Wrong commands cost points 💀
      </div>

      <div className="adventure-box" ref={historyRef}>
        {displayedHistory.map((line, i) => (
          <div key={i} className={`adventure-line ${line.type}`} style={{ whiteSpace: "pre-wrap" }}>{line.text}</div>
        ))}
      </div>

      <div className="adventure-input-row">
        <span className="adventure-prompt">$&gt;&nbsp;</span>
        <input
          ref={inputRef}
          className="adventure-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="type a command and press Enter..."
          autoFocus
        />
      </div>

      <div className="hint-text">
        💡 Commands: <span style={{ color: "var(--accent3)" }}>go north</span> / <span style={{ color: "var(--accent3)" }}>go south</span> / <span style={{ color: "var(--accent3)" }}>go east</span> / <span style={{ color: "var(--accent3)" }}>go west</span> / <span style={{ color: "var(--accent3)" }}>look</span> / <span style={{ color: "var(--accent3)" }}>solve [code]</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════
function App() {
  const [screen, setScreen] = useState("home"); // home | level1 | level2 | level3 | level4
  const [completedLevels, setCompletedLevels] = useState([]);
  const [scores, setScores] = useState({});

  function completeLevel(levelId, pts) {
    setCompletedLevels(prev => prev.includes(levelId) ? prev : [...prev, levelId]);
    setScores(prev => ({ ...prev, [levelId]: Math.max(prev[levelId] || 0, pts) }));
    // Auto-go to next level or home
    const nextId = levelId + 1;
    if (nextId <= 4) {
      setScreen(`level${nextId}`);
    } else {
      setScreen("home");
    }
  }

  if (screen === "home") {
    return <HomeScreen completedLevels={completedLevels} scores={scores} onSelectLevel={id => setScreen(`level${id}`)} />;
  }
  if (screen === "level1") {
    return <Level1 onComplete={pts => completeLevel(1, pts)} onBack={() => setScreen("home")} />;
  }
  if (screen === "level2") {
    return <Level2 onComplete={pts => completeLevel(2, pts)} onBack={() => setScreen("home")} />;
  }
  if (screen === "level3") {
    return <Level3 onComplete={pts => completeLevel(3, pts)} onBack={() => setScreen("home")} />;
  }
  if (screen === "level4") {
    return <Level4 onComplete={pts => completeLevel(4, pts)} onBack={() => setScreen("home")} />;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);