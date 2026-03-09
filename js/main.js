
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
    name: "Text Adventure",
    icon: "🗺️",
    desc: "Type commands to escape the maze",
    color: "#7fff00",
    difficulty: "Medium",
  },
  {
    id: 4,
    name: "Debug Mode",
    icon: "🐛",
    desc: "Find the bug hiding in the code",
    color: "#ffd60a",
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

// ── LEVEL 3 – TEXT ADVENTURE ──────────────────
const ADVENTURE = {
  start: "room1",
  rooms: {
    room1: {
      desc: "You wake up in a dark server room. Fans hum around you. There is a door to the NORTH and a terminal to the EAST.",
      exits: { north: "room2", east: "terminal1" },
    },
    room2: {
      desc: "A long corridor. Cables snake along the floor. You can go SOUTH back to the server room, or WEST to the control room.",
      exits: { south: "room1", west: "room3" },
    },
    terminal1: {
      desc: "A glowing terminal. It shows: ACCESS CODE = loops + 1. You can go WEST to leave.",
      exits: { west: "room1" },
      secret: true,
    },
    room3: {
      desc: "The control room! An exit door stands to the NORTH. A keypad blocks the door — enter the code: type 'enter 42'.",
      exits: { south: "room2" },
      puzzle: true,
    },
    exit: {
      desc: "🎉 You escaped the maze! The fresh air hits your face. You win!",
      exits: {},
      win: true,
    },
  },
};

// ── LEVEL 4 – DEBUG ───────────────────────────
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
              className={`level-card ${i > 0 && !completedLevels.includes(LEVELS[i-1].id) && i !== 0 ? 'locked' : ''}`}
              style={{ "--card-color": lvl.color }}
              onClick={() => {
                if (i === 0 || completedLevels.includes(LEVELS[i - 1].id)) {
                  onSelectLevel(lvl.id);
                }
              }}
            >
              <div className="level-num">LEVEL {lvl.id} · {lvl.difficulty}</div>
              <div className="level-icon">{lvl.icon}</div>
              <div className="level-name">{lvl.name}</div>
              <div className="level-desc">{lvl.desc}</div>
              {done && (
                <div className="level-badge" title="Completed!">✅</div>
              )}
              {i > 0 && !completedLevels.includes(LEVELS[i - 1].id) && (
                <div className="level-badge" title="Locked">🔒</div>
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
        Complete levels in order to unlock the next one 🔓
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

// ── LEVEL 3 – TEXT ADVENTURE ──────────────────
function Level3({ onComplete, onBack }) {
  const [room, setRoom] = useState("room1");
  const [history, setHistory] = useState([
    { text: "=== CS DUNGEON ESCAPE ===", type: "system" },
    { text: ADVENTURE.rooms["room1"].desc, type: "system" },
    { text: "Type: go north / go east / go south / go west / look / help", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(300);
  const historyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  function addLine(text, type = "system") {
    setHistory(h => [...h, { text, type }]);
  }

  function handleCommand(cmd) {
    const raw = cmd.trim().toLowerCase();
    addLine(`> ${cmd}`, "player");

    const currentRoom = ADVENTURE.rooms[room];

    if (raw === "help") {
      addLine("Commands: go [direction], look, help", "system");
    } else if (raw === "look") {
      addLine(currentRoom.desc, "system");
    } else if (raw.startsWith("go ")) {
      const dir = raw.replace("go ", "").trim();
      if (currentRoom.exits[dir]) {
        const nextId = currentRoom.exits[dir];
        const nextRoom = ADVENTURE.rooms[nextId];
        setRoom(nextId);
        addLine(nextRoom.desc, "system");
        if (nextRoom.win) {
          setWon(true);
          addLine("🎉 You escaped! Well done!", "success");
        }
      } else {
        addLine(`You can't go ${dir} from here.`, "error");
        setScore(s => Math.max(0, s - 10));
      }
    } else if (raw.startsWith("enter ")) {
      if (room === "room3") {
        const code = raw.replace("enter ", "").trim();
        if (code === "42") {
          setRoom("exit");
          addLine("✅ Code accepted! The door opens...", "success");
          addLine(ADVENTURE.rooms["exit"].desc, "system");
          setWon(true);
        } else {
          addLine("❌ Wrong code. Hint: the terminal said loops + 1... think about what loops + 1 could equal.", "error");
          setScore(s => Math.max(0, s - 20));
        }
      } else {
        addLine("There is no keypad here.", "error");
      }
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
        <div className="level-tag">LEVEL 3</div>
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
        {history.map((line, i) => (
          <div key={i} className={`adventure-line ${line.type}`}>{line.text}</div>
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
        💡 Commands: <span style={{ color: "var(--accent3)" }}>go north</span> / <span style={{ color: "var(--accent3)" }}>go south</span> / <span style={{ color: "var(--accent3)" }}>go east</span> / <span style={{ color: "var(--accent3)" }}>go west</span> / <span style={{ color: "var(--accent3)" }}>look</span> / <span style={{ color: "var(--accent3)" }}>enter [code]</span>
      </div>
    </div>
  );
}

// ── LEVEL 4 – DEBUG ───────────────────────────
function Level4({ onComplete, onBack }) {
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
        <div className="level-tag">LEVEL 4</div>
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