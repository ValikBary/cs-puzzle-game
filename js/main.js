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
    name: "Binary to Deciaml",
    icon: "🔢",
    desc: "Convert binary numbers to decimal values",
    color: "#00f5ff",
    difficulty: "Easy",
  },
  {
    id: 2,
    name: "If / Else",
    icon: "🧠",
    desc: "Fill in the missing condition to fix the code",
    color: "orange",
    difficulty: "Medium",
  },
  {
    id: 3,
    name: "Logic Gates",
    icon: "⚡",
    desc: "Pick the right gate so the output is 1",
    color: "#ff006e",
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

// ── LEVEL 1 - BINARY TO DECIMAL QUESTIONS ───────────────
function generateBinaryQuestions(count = 7) {
  const questions = [];
  const used = new Set();

  while (questions.length < count) {
    // random number between 1–31 (avoid 0 for simplicity)
    const max = questions.length < 3 ? 15 : 63; // harder later
    const num = Math.floor(Math.random() * max) + 1;

    if (used.has(num)) continue;
    used.add(num);

    const binary = num.toString(2);

    // build explanation dynamically
    const bits = binary.split("").reverse();
    const explanationParts = bits.map((bit, i) => {
      const value = 2 ** i;
      return `${bit}×${value}`;
    });

    questions.push({
      binary,
      answer: num,
      explanation: `${binary} = ${explanationParts.reverse().join(" + ")} = ${num}`
    });
  }

  return questions;
}

/*const BINARY_QUESTIONS = [
  {
    binary: "0011",
    answer: 3,
    explanation: "0011 = 0*8 + 0*4 + 1*2 + 1*1 = 3",
  },
  {
    binary: "0101",
    answer: 5,
    explanation: "0101 = 0*8 + 1*4 + 0*2 + 1*1 = 5",
  },
  {
    binary: "1010",
    answer: 10,
    explanation: "1010 = 1*8 + 0*4 + 1*2 + 0*1 = 10",
  },
  {
    binary: "1111",
    answer: 15,
    explanation: "1111 = 1*8 + 1*4 + 1*2 + 1*1 = 15",
  },
  {
    binary: "10010",
    answer: 18,
    explanation: "10010 = 1*16 + 0*8 + 0*4 + 1*2 + 0*1 = 18",
  }
];*/

// ── LEVEL 2 – IF/ELSE QUESTIONS ───────────────
const IF_ELSE_QUESTIONS = [
  {
    context:
      "🗳️ You're building a voting app. The user entered their age - check if they're old enough to vote.",
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
    context:
      "📝 A student just finished their exam. They need 50 or more to pass - write the condition!",
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
    context:
      "💡 You're coding a smart home app. Check if the lights are on to decide what to display.",
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
  {
    context:
      "🌡️ A weather app needs to warn users when it's too hot. Set the threshold at 30 degrees.",
    code: [
      { text: "temperature = 35", type: "normal" },
      { text: "", type: "blank-line" },
      { text: "if _____ :", type: "has-blank", blankIdx: 0 },
      { text: '  print("It is hot outside!")', type: "normal" },
      { text: "else:", type: "normal" },
      { text: '  print("Nice weather.")', type: "normal" },
    ],
    blanks: [""],
    options: [
      "temperature > 30",
      "temperature < 30",
      "temperature == 35",
      "temperature > 100",
    ],
    correctAnswers: ["temperature > 30"],
    explanation:
      "temperature = 35, so temperature > 30 is True and prints 'It is hot outside!'. The > operator means strictly greater than.",
  },
  {
    context:
      "🔐 You're building a login system. Compare what the user typed with the real password.",
    code: [
      { text: "password = 'abc123'", type: "normal" },
      { text: "user_input = 'abc123'", type: "normal" },
      { text: "", type: "blank-line" },
      { text: "if _____ :", type: "has-blank", blankIdx: 0 },
      { text: '  print("Access granted!")', type: "normal" },
      { text: "else:", type: "normal" },
      { text: '  print("Wrong password.")', type: "normal" },
    ],
    blanks: [""],
    options: [
      "user_input == password",
      "user_input > password",
      "user_input = password",
      "user_input != password",
    ],
    correctAnswers: ["user_input == password"],
    explanation:
      "We use == to compare two values. user_input = password would be assignment (a bug!), and != means 'not equal'.",
  },
  {
    context:
      "🎮 You're coding a game. When the player runs out of lives it's game over - check for it!",
    code: [
      { text: "lives = 0", type: "normal" },
      { text: "", type: "blank-line" },
      { text: "if _____ :", type: "has-blank", blankIdx: 0 },
      { text: '  print("Game over!")', type: "normal" },
      { text: "else:", type: "normal" },
      { text: '  print("Keep playing!")', type: "normal" },
    ],
    blanks: [""],
    options: ["lives == 0", "lives > 0", "lives >= 1", "lives != 0"],
    correctAnswers: ["lives == 0"],
    explanation:
      "lives = 0, so we check lives == 0 which is True — prints 'Game over!'. lives > 0 and lives >= 1 would be False here.",
  },
  {
    context:
      "🌧️ A weather app needs to warn you if you'll get wet. You need an umbrella when it rains!",
    code: [
      { text: "is_raining = True", type: "normal" },
      { text: "has_umbrella = False", type: "normal" },
      { text: "", type: "blank-line" },
      { text: "if _____ :", type: "has-blank", blankIdx: 0 },
      { text: '  print("You will get wet!")', type: "normal" },
      { text: "else:", type: "normal" },
      { text: '  print("You are fine!")', type: "normal" },
    ],
    blanks: [""],
    options: [
      "is_raining and not has_umbrella",
      "is_raining or has_umbrella",
      "not is_raining",
      "has_umbrella == True",
    ],
    correctAnswers: ["is_raining and not has_umbrella"],
    explanation:
      "We need BOTH conditions: it's raining AND you don't have an umbrella. 'and' checks both, 'not' flips False to True. This introduces combining conditions!",
  },
];

// ── LEVEL 3 – LOGIC GATES ─────────────────────
// ── GATE DATA ─────────────────────────────────
const GATE_DATA = [
  {
    id: "AND",
    name: "AND gate",
    inputs: 2,
    desc: "The AND gate outputs 1 only when ALL inputs are 1. Think of it like two switches in series — both must be on for the light to work.",
    fn: (a, b) => a & b,
    realWorld: "🔒 Real-world example: A security door that requires both a keycard AND a PIN — both must be correct.",
  },
  {
    id: "OR",
    name: "OR gate",
    inputs: 2,
    desc: "The OR gate outputs 1 when ANY input is 1. Like two switches in parallel — either one being on powers the light.",
    fn: (a, b) => a | b,
    realWorld: "🚨 Real-world example: A fire alarm triggered by a smoke sensor OR a heat sensor — either one sets it off.",
  },
  {
    id: "NOT",
    name: "NOT gate (inverter)",
    inputs: 1,
    desc: "The NOT gate flips the input. If A is 1, output is 0. If A is 0, output is 1. It has only one input.",
    fn: (a) => (a === 1 ? 0 : 1),
    realWorld: "💡 Real-world example: A night light — when the sensor detects daylight (1), the NOT gate outputs 0 to keep the light off.",
  },
  {
    id: "NAND",
    name: "NAND gate",
    inputs: 2,
    desc: "NAND = NOT AND. Outputs 0 only when ALL inputs are 1, and 1 for everything else. NAND is universal — any logic circuit can be built from NAND gates alone.",
    fn: (a, b) => ((a & b) === 1 ? 0 : 1),
    realWorld: "🏭 Real-world example: Used in RAM and Flash memory chips — NAND flash is what powers USB drives and SSDs.",
  },
  {
    id: "NOR",
    name: "NOR gate",
    inputs: 2,
    desc: "NOR = NOT OR. Outputs 1 only when ALL inputs are 0. Like NAND, NOR is also universal and can build any circuit on its own.",
    fn: (a, b) => ((a | b) === 1 ? 0 : 1),
    realWorld: "🌐 Real-world example: Early internet routers used NOR-based logic. Also used in first-generation space computers.",
  },
  {
    id: "XOR",
    name: "XOR gate (exclusive OR)",
    inputs: 2,
    desc: "XOR outputs 1 only when inputs are DIFFERENT. If both are the same (both 0 or both 1), output is 0. Essential in arithmetic circuits.",
    fn: (a, b) => a ^ b,
    realWorld: "➕ Real-world example: XOR gates form the core of binary adders in CPUs — adding two bits uses exactly one XOR gate and one AND gate.",
  },
];
 
// ── HELPERS ───────────────────────────────────
function computeGateValue(id, a, b) {
  switch (id) {
    case "AND":  return a & b;
    case "OR":   return a | b;
    case "NOT":  return a === 1 ? 0 : 1;
    case "XOR":  return a ^ b;
    case "NAND": return (a & b) === 1 ? 0 : 1;
    case "NOR":  return (a | b) === 1 ? 0 : 1;
    default:     return 0;
  }
}
 
function getTruthRows(gate) {
  if (gate.inputs === 1)
    return [[0, gate.fn(0)], [1, gate.fn(1)]];
  return [
    [0, 0, gate.fn(0, 0)],
    [0, 1, gate.fn(0, 1)],
    [1, 0, gate.fn(1, 0)],
    [1, 1, gate.fn(1, 1)],
  ];
}
 
// ── SVG GATE BODY PATH ────────────────────────
function gateBodyPath(id, gx, gy, gw, gh, cx, cy) {
  if (id === "AND" || id === "NAND")
    return `M ${gx} ${gy} L ${gx} ${gy+gh} L ${gx+gw/2} ${gy+gh} A ${gh/2} ${gh/2} 0 0 0 ${gx+gw/2} ${gy} Z`;
  if (id === "OR" || id === "NOR")
    return `M ${gx} ${gy} Q ${gx+gw*0.3} ${cy} ${gx} ${gy+gh} Q ${gx+gw*0.7} ${gy+gh} ${gx+gw} ${cy} Q ${gx+gw*0.7} ${gy} ${gx} ${gy}`;
  if (id === "XOR")
    return `M ${gx+10} ${gy} Q ${gx+gw*0.3+10} ${cy} ${gx+10} ${gy+gh} Q ${gx+gw*0.7+10} ${gy+gh} ${gx+gw+10} ${cy} Q ${gx+gw*0.7+10} ${gy} ${gx+10} ${gy}`;
  if (id === "NOT")
    return `M ${gx+10} ${gy} L ${gx+gw-10} ${cy} L ${gx+10} ${gy+gh} Z`;
  return "";
}
 
// ── CHALLENGE PUZZLES — 15 total ──────────────
 
const VERIFIED_PUZZLES = [
 
  // ── TIER 1: Single gate — find the output (3 questions) ──
  {
    tier: 1, label: "Easy",
    type: "output", gate1: "AND",
    a: 0, b: 1, answer: 0,
    desc: "A = 0, B = 1  →  AND gate  →  output?",
    explain: "AND only outputs 1 when BOTH inputs are 1. A = 0, so output = 0 regardless of B.",
  },
  {
    tier: 1, label: "Easy",
    type: "output", gate1: "NAND",
    a: 1, b: 0, answer: 1,
    desc: "A = 1, B = 0  →  NAND gate  →  output?",
    explain: "NAND = NOT AND. AND(1,0) = 0, then NOT flips it to 1. NAND only outputs 0 when BOTH inputs are 1 — here B = 0 so output = 1.",
  },
  {
    tier: 1, label: "Easy",
    type: "output", gate1: "XOR",
    a: 0, b: 1, answer: 1,
    desc: "A = 0, B = 1  →  XOR gate  →  output?",
    explain: "XOR outputs 1 only when inputs are DIFFERENT. A = 0 and B = 1 are different, so output = 1.",
  },
 
  // ── TIER 2: Two-gate chain — find the final output (4 questions) ──
  {
    tier: 2, label: "Medium",
    type: "output", gate1: "AND", gate2: "NOT",
    a: 1, b: 1, answer: 0,
    desc: "A = 1, B = 1  →  AND  →  NOT  →  output?",
    explain: "Step 1: AND(1,1) = 1.  Step 2: NOT(1) = 0.  Final = 0.  AND followed by NOT is exactly what a NAND gate does.",
  },
  {
    tier: 2, label: "Medium",
    type: "output", gate1: "XOR", gate2: "NOT",
    a: 1, b: 0, answer: 0,
    desc: "A = 1, B = 0  →  XOR  →  NOT  →  output?",
    explain: "Step 1: XOR(1,0) = 1 (inputs are different).  Step 2: NOT(1) = 0.  Final = 0.",
  },
  {
    tier: 2, label: "Medium",
    type: "output", gate1: "OR", gate2: "AND",
    a: 1, b: 0, cInput: 1, answer: 1,
    desc: "A = 1, B = 0  →  OR  →  then AND with C = 1  →  output?",
    explain: "Step 1: OR(1,0) = 1 (at least one input is 1).  Step 2: AND(1,1) = 1.  Final = 1.",
  },
  {
    tier: 2, label: "Medium",
    type: "output", gate1: "NAND", gate2: "OR",
    a: 0, b: 0, cInput: 0, answer: 1,
    desc: "A = 0, B = 0  →  NAND  →  then OR with C = 0  →  output?",
    explain: "Step 1: NAND(0,0) = 1 (not both 1, so NAND gives 1).  Step 2: OR(1,0) = 1.  Final = 1.",
  },
 
  // ── TIER 3: Three-gate chain — find the final output (3 questions) ──
  {
    tier: 3, label: "Hard",
    type: "output", gate1: "AND", gate2: "OR", gate3: "XOR",
    a: 1, b: 0, cInput: 1, answer: 0,
    desc: "A=1, B=0 → AND → OR with C=1 → XOR with D=1 → output?",
    explain: "Step 1: AND(1,0)=0.  Step 2: OR(0,1)=1.  Step 3: XOR(1,1)=0 (same inputs).  Final = 0.",
  },
  {
    tier: 3, label: "Hard",
    type: "output", gate1: "NOR", gate2: "AND", gate3: "XOR",
    a: 0, b: 0, cInput: 1, answer: 0,
    desc: "A=0, B=0 → NOR → AND with C=1 → XOR with D=1 → output?",
    explain: "Step 1: NOR(0,0)=1 (both inputs 0, so NOR gives 1).  Step 2: AND(1,1)=1.  Step 3: XOR(1,1)=0 (same inputs).  Final = 0.",
  },
  {
    tier: 3, label: "Hard",
    type: "output", gate1: "NAND", gate2: "XOR", gate3: "AND",
    a: 1, b: 1, cInput: 1, answer: 1,
    desc: "A=1, B=1 → NAND → XOR with C=1 → AND with D=1 → output?",
    explain: "Step 1: NAND(1,1)=0.  Step 2: XOR(0,1)=1 (inputs differ).  Step 3: AND(1,1)=1.  Final = 1.",
  },
 
  // ── TIER 4: Identify the missing gate — output shown (3 questions) ──
  {
    tier: 4, label: "Hard",
    type: "identify",
    a: 1, b: 1, target: 1,
    answer: "OR",
    options: ["XOR", "NOR", "OR", "NAND"],
    desc: "A = 1, B = 1  →  ???  →  output = 1.  Which gate?",
    explain: "XOR(1,1)=0 ✗  NOR(1,1)=0 ✗  NAND(1,1)=0 ✗  OR(1,1)=1 ✓.  OR is the only gate in this list that outputs 1 when both inputs are 1.",
  },
  {
    tier: 4, label: "Hard",
    type: "identify",
    a: 0, b: 0, target: 1,
    answer: "NOR",
    options: ["AND", "OR", "XOR", "NOR"],
    desc: "A = 0, B = 0  →  ???  →  output = 1.  Which gate?",
    explain: "AND(0,0)=0 ✗  OR(0,0)=0 ✗  XOR(0,0)=0 ✗  NOR(0,0)=1 ✓.  NOR outputs 1 only when ALL inputs are 0.",
  },
  {
    tier: 4, label: "Hard",
    type: "identify",
    a: 0, b: 1, target: 0,
    answer: "AND",
    options: ["OR", "AND", "NAND", "XOR"],
    desc: "A = 0, B = 1  →  ???  →  output = 0.  Which gate?",
    explain: "OR(0,1)=1 ✗  XOR(0,1)=1 ✗  NAND(0,1)=1 ✗  AND(0,1)=0 ✓.  AND needs BOTH inputs to be 1 — since A = 0, output is always 0.",
  },
 
  // ── TIER 5: Identify missing gate in a chain — work backwards (2 questions) ──
  {
    tier: 5, label: "Expert",
    type: "identify_chain",
    gate2: "NOT",
    a: 1, b: 1, target: 1,
    answer: "NAND",
    options: ["AND", "NAND", "OR"],
    desc: "A=1, B=1 → ??? → NOT → final output = 1.  Which gate fills ???",
    explain: "Work backwards: NOT gives 1 only when its input is 0.  So gate 1 must output 0.  AND(1,1)=1 ✗  OR(1,1)=1 ✗  NAND(1,1)=0 ✓.  Only NAND gives 0 when both inputs are 1.",
  },
  {
    tier: 5, label: "Expert",
    type: "identify_chain",
    gate2: "NOT",
    a: 0, b: 1, target: 0,
    answer: "OR",
    options: ["AND", "NOR", "OR"],
    desc: "A=0, B=1 → ??? → NOT → final output = 0.  Which gate fills ???",
    explain: "Work backwards: NOT gives 0 only when its input is 1.  So gate 1 must output 1.  AND(0,1)=0 ✗  NOR(0,1)=0 ✗  OR(0,1)=1 ✓.  OR outputs 1 whenever at least one input is 1.",
  },
];
 
// SVG COMPONENTS
const WIRE_ON      = "#1D9E75";
const WIRE_OFF     = "#A32D2D";
const WIRE_NEUTRAL = "#6a7a9a";
const WIRE_Q       = "#378ADD";
const wireColor = (v) => (v === 1 ? WIRE_ON : WIRE_OFF);
 
// ── Practice mode: interactive diagram with clickable input circles ──
function GateDiagram({ gateId, inputA, inputB, output, onToggleA, onToggleB }) {
  const isSingle = gateId === "NOT";
  const bubble   = gateId === "NAND" || gateId === "NOR";
  const isXOR    = gateId === "XOR";
  const cx = 340, cy = 70, gw = 80, gh = 60;
  const gx = cx - gw/2, gy = cy - gh/2;
  const midA = isSingle ? cy : cy - 18;
  const midB = cy + 18;
  const bodyPath = gateBodyPath(gateId, gx, gy, gw, gh, cx, cy);
  const outX = gx + gw + (bubble ? 10 : 0) + (gateId === "NOT" ? 3 : 0);
 
  const [pulseKey, setPulseKey] = React.useState(0);
  React.useEffect(() => { setPulseKey(k => k + 1); }, [output]);
  const [showHint, setShowHint] = React.useState(true);
  React.useEffect(() => { const t = setTimeout(() => setShowHint(false), 3000); return () => clearTimeout(t); }, []);
 
  return (
    <>
      <style>{`
        @keyframes outputPulse { 0%{r:6;opacity:1} 40%{r:11;opacity:0.5} 100%{r:6;opacity:1} }
        .output-pulse { animation: outputPulse 0.35s ease-out; }
        .hint-fade { transition: opacity 1s ease; }
      `}</style>
      <svg width="100%" viewBox="0 0 680 160" style={{ marginBottom: 16, display: "block" }}>
 
        {/* Input A wire */}
        <line x1={gx-90} y1={midA} x2={isSingle ? gx+10 : gx} y2={midA}
          stroke={wireColor(inputA)} strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: "stroke 0.2s" }} />
        <g style={{ cursor: "pointer" }} onClick={() => { playSound("click"); onToggleA(); }}>
          <circle cx={gx-90} cy={midA} r={8} fill={wireColor(inputA)} style={{ transition: "fill 0.2s" }} />
          <circle cx={gx-90} cy={midA} r={16} fill="transparent" />
          <text x={gx-90} y={midA+1} textAnchor="middle" dominantBaseline="central"
            fontSize={9} fontWeight="700" fontFamily="monospace" fill="white"
            style={{ pointerEvents: "none" }}>{inputA}</text>
        </g>
        <text x={gx-106} y={midA+4} textAnchor="end" fontSize={12} fontFamily="monospace" fill="var(--text-dim)">A</text>
        <text x={gx-90} y={midA+22} textAnchor="middle" fontSize={10} fontFamily="monospace"
          fill="var(--text-dim)" opacity={showHint ? 0.7 : 0} className="hint-fade"
          style={{ pointerEvents: "none" }}>click</text>
 
        {/* Input B wire */}
        {!isSingle && (
          <>
            <line x1={gx-90} y1={midB} x2={gx} y2={midB}
              stroke={wireColor(inputB)} strokeWidth="2.5" strokeLinecap="round"
              style={{ transition: "stroke 0.2s" }} />
            <g style={{ cursor: "pointer" }} onClick={() => { playSound("click"); onToggleB(); }}>
              <circle cx={gx-90} cy={midB} r={8} fill={wireColor(inputB)} style={{ transition: "fill 0.2s" }} />
              <circle cx={gx-90} cy={midB} r={16} fill="transparent" />
              <text x={gx-90} y={midB+1} textAnchor="middle" dominantBaseline="central"
                fontSize={9} fontWeight="700" fontFamily="monospace" fill="white"
                style={{ pointerEvents: "none" }}>{inputB}</text>
            </g>
            <text x={gx-106} y={midB+4} textAnchor="end" fontSize={12} fontFamily="monospace" fill="var(--text-dim)">B</text>
            <text x={gx-90} y={midB+22} textAnchor="middle" fontSize={10} fontFamily="monospace"
              fill="var(--text-dim)" opacity={showHint ? 0.7 : 0} className="hint-fade"
              style={{ pointerEvents: "none" }}>click</text>
          </>
        )}
 
        {/* Gate body */}
        <path d={bodyPath} fill="var(--surface2)" stroke="var(--text)" strokeWidth="1.5" strokeLinejoin="round"
          style={{ transition: "stroke 0.2s" }} />
        {isXOR && (
          <path d={`M ${gx} ${gy} Q ${gx+gw*0.25} ${cy} ${gx} ${gy+gh}`}
            fill="none" stroke="var(--text)" strokeWidth="1.5" opacity="0.5" />
        )}
        {(bubble || gateId === "NOT") && (
          <circle cx={gx+gw+(gateId==="NOT"?3:5)} cy={cy} r={5}
            fill="var(--bg)" stroke="var(--text)" strokeWidth="1.5" />
        )}
        <text x={cx} y={cy+4} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight="500" fontFamily="monospace" fill="var(--text)">{gateId}</text>
 
        {/* Output wire — coloured because this is practice mode, not a puzzle */}
        <line x1={outX} y1={cy} x2={outX+90} y2={cy}
          stroke={wireColor(output)} strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: "stroke 0.2s" }} />
        <circle key={pulseKey} cx={outX+90} cy={cy} r={8}
          fill={wireColor(output)} className="output-pulse" style={{ transition: "fill 0.2s" }} />
        <text x={outX+90} y={cy+1} textAnchor="middle" dominantBaseline="central"
          fontSize={9} fontWeight="700" fontFamily="monospace" fill="white"
          style={{ pointerEvents: "none" }}>{output}</text>
        <text x={outX+106} y={cy+4} fontSize={12} fontFamily="monospace" fill="var(--text-dim)">out</text>
      </svg>
    </>
  );
}
 
// ── Challenge: single gate diagram ──
function ChallengeSVGSingle({ gate1, a, b, isIdentify, target }) {
  const isSingle = gate1 === "NOT";
  const bubble   = gate1 === "NAND" || gate1 === "NOR";
  const isXOR    = gate1 === "XOR";
  const cx = 340, cy = 70, gw = 80, gh = 60;
  const gx = cx - gw/2, gy = cy - gh/2;
  const midA = isSingle ? cy : cy - 18;
  const midB = cy + 18;
  const bodyPath = isIdentify ? null : gateBodyPath(gate1, gx, gy, gw, gh, cx, cy);
  const outX = gx + gw + (!isIdentify && bubble ? 10 : 0) + (!isIdentify && gate1 === "NOT" ? 3 : 0);
 
  return (
    <svg width="100%" viewBox="0 0 680 140" style={{ marginBottom: 16 }}>
      {/* Input A — always coloured, it's given information */}
      <line x1={gx-80} y1={midA} x2={isSingle && !isIdentify ? gx+10 : gx} y2={midA}
        stroke={wireColor(a)} strokeWidth="2" strokeLinecap="round" />
      <circle cx={gx-80} cy={midA} r={5} fill={wireColor(a)} />
      <text x={gx-88} y={midA+4} textAnchor="end" fontSize={12} fontFamily="monospace" fill="var(--text)">A={a}</text>
 
      {/* Input B */}
      {b !== null && (
        <>
          <line x1={gx-80} y1={midB} x2={gx} y2={midB} stroke={wireColor(b)} strokeWidth="2" strokeLinecap="round" />
          <circle cx={gx-80} cy={midB} r={5} fill={wireColor(b)} />
          <text x={gx-88} y={midB+4} textAnchor="end" fontSize={12} fontFamily="monospace" fill="var(--text)">B={b}</text>
        </>
      )}
 
      {/* Gate — real shape or ??? box */}
      {isIdentify ? (
        <>
          <rect x={gx} y={gy} width={gw} height={gh} rx={6}
            fill="var(--surface2)" stroke={WIRE_Q} strokeWidth="1.5" strokeDasharray="6 3" />
          <text x={cx} y={cy+4} textAnchor="middle" dominantBaseline="central"
            fontSize={13} fontWeight="700" fontFamily="monospace" fill={WIRE_Q}>???</text>
        </>
      ) : (
        <>
          <path d={bodyPath} fill="var(--surface2)" stroke="var(--text)" strokeWidth="1.5" />
          {isXOR && (
            <path d={`M ${gx} ${gy} Q ${gx+gw*0.25} ${cy} ${gx} ${gy+gh}`}
              fill="none" stroke="var(--text)" strokeWidth="1.5" opacity="0.5" />
          )}
          {(bubble || gate1 === "NOT") && (
            <circle cx={gx+gw+(gate1==="NOT"?3:5)} cy={cy} r={5}
              fill="var(--bg)" stroke="var(--text)" strokeWidth="1.5" />
          )}
          <text x={cx} y={cy+4} textAnchor="middle" dominantBaseline="central"
            fontSize={11} fontWeight="500" fontFamily="monospace" fill="var(--text)">{gate1}</text>
        </>
      )}
 
      {/* Output — shown for identify (known), dashed ? for output puzzles */}
      {isIdentify ? (
        <>
          <line x1={gx+gw} y1={cy} x2={gx+gw+80} y2={cy} stroke={wireColor(target)} strokeWidth="2" strokeLinecap="round" />
          <circle cx={gx+gw+80} cy={cy} r={8} fill={wireColor(target)} />
          <text x={gx+gw+80} y={cy+1} textAnchor="middle" dominantBaseline="central"
            fontSize={9} fontWeight="700" fontFamily="monospace" fill="white"
            style={{ pointerEvents: "none" }}>{target}</text>
          <text x={gx+gw+96} y={cy+4} fontSize={12} fontFamily="monospace" fill="var(--text-dim)">= {target}</text>
        </>
      ) : (
        <>
          <line x1={outX} y1={cy} x2={outX+80} y2={cy}
            stroke={WIRE_Q} strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
          <circle cx={outX+80} cy={cy} r={5} fill={WIRE_Q} />
          <text x={outX+88} y={cy+4} fontSize={12} fontFamily="monospace" fill={WIRE_Q}>?</text>
        </>
      )}
    </svg>
  );
}
 
// ── Challenge: two-gate chain diagram ──
function ChallengeSVGChain({ gate1, gate2, a, b, cInput, isIdentifyChain, target }) {
  const g1x = 170, g1y = 35, gw = 80, gh = 60;
  const g2x = 370, g2y = 35;
  const cy1 = g1y + gh/2, cy2 = g2y + gh/2;
  const notBubble = gate2 === "NOT" || gate2 === "NOR" || gate2 === "NAND";
  const outX2 = g2x + gw + (notBubble ? 10 : 0);
  const g1path = isIdentifyChain ? null : gateBodyPath(gate1, g1x, g1y, gw, gh, g1x+gw/2, cy1);
  const g2path = gateBodyPath(gate2, g2x, g2y, gw, gh, g2x+gw/2, cy2);
 
  return (
    <svg width="100%" viewBox="0 0 680 140" style={{ marginBottom: 16 }}>
      {/* Gate 1 inputs — coloured, they are given */}
      <line x1={80} y1={cy1-18} x2={g1x} y2={cy1-18} stroke={wireColor(a)} strokeWidth="2" strokeLinecap="round" />
      <circle cx={80} cy={cy1-18} r={5} fill={wireColor(a)} />
      <text x={72} y={cy1-14} textAnchor="end" fontSize={12} fontFamily="monospace" fill="var(--text)">A={a}</text>
 
      {b !== null && b !== undefined && (
        <>
          <line x1={80} y1={cy1+18} x2={g1x} y2={cy1+18} stroke={wireColor(b)} strokeWidth="2" strokeLinecap="round" />
          <circle cx={80} cy={cy1+18} r={5} fill={wireColor(b)} />
          <text x={72} y={cy1+22} textAnchor="end" fontSize={12} fontFamily="monospace" fill="var(--text)">B={b}</text>
        </>
      )}
 
      {/* Gate 1 — real shape or ??? box */}
      {isIdentifyChain ? (
        <>
          <rect x={g1x} y={g1y} width={gw} height={gh} rx={6}
            fill="var(--surface2)" stroke={WIRE_Q} strokeWidth="1.5" strokeDasharray="6 3" />
          <text x={g1x+gw/2} y={cy1+4} textAnchor="middle" dominantBaseline="central"
            fontSize={12} fontWeight="700" fontFamily="monospace" fill={WIRE_Q}>???</text>
        </>
      ) : (
        <>
          <path d={g1path} fill="var(--surface2)" stroke="var(--text)" strokeWidth="1.5" />
          {(gate1==="NAND"||gate1==="NOR") && (
            <circle cx={g1x+gw+5} cy={cy1} r={5} fill="var(--bg)" stroke="var(--text)" strokeWidth="1.5" />
          )}
          <text x={g1x+gw/2} y={cy1+4} textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight="500" fontFamily="monospace" fill="var(--text)">{gate1}</text>
        </>
      )}
 
      {/* Inter-gate wire — ALWAYS neutral grey, never reveals intermediate value */}
      <line
        x1={g1x + gw + (gate1==="NAND"||gate1==="NOR" ? 10 : 0)} y1={cy1}
        x2={gate2==="NOT" ? g2x+10 : g2x} y2={cy2}
        stroke={WIRE_NEUTRAL} strokeWidth="2" strokeLinecap="round"
        strokeDasharray={isIdentifyChain ? "4 3" : "none"}
      />
 
      {/* Optional C input for two-input gate2 */}
      {cInput !== undefined && cInput !== null && gate2 !== "NOT" && (
        <>
          <line x1={g2x-60} y1={cy2+18} x2={g2x} y2={cy2+18}
            stroke={wireColor(cInput)} strokeWidth="2" strokeLinecap="round" />
          <circle cx={g2x-60} cy={cy2+18} r={5} fill={wireColor(cInput)} />
          <text x={g2x-68} y={cy2+22} textAnchor="end" fontSize={12} fontFamily="monospace" fill="var(--text)">C={cInput}</text>
        </>
      )}
 
      {/* Gate 2 — always shown */}
      <path d={g2path} fill="var(--surface2)" stroke="var(--text)" strokeWidth="1.5" />
      {notBubble && (
        <circle cx={g2x+gw+(gate2==="NOT"?3:5)} cy={cy2} r={5}
          fill="var(--bg)" stroke="var(--text)" strokeWidth="1.5" />
      )}
      <text x={g2x+gw/2} y={cy2+4} textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight="500" fontFamily="monospace" fill="var(--text)">{gate2}</text>
 
      {/* Output — shown for identify_chain, dashed ? otherwise */}
      {isIdentifyChain ? (
        <>
          <line x1={outX2} y1={cy2} x2={outX2+70} y2={cy2}
            stroke={wireColor(target)} strokeWidth="2" strokeLinecap="round" />
          <circle cx={outX2+70} cy={cy2} r={8} fill={wireColor(target)} />
          <text x={outX2+70} y={cy2+1} textAnchor="middle" dominantBaseline="central"
            fontSize={9} fontWeight="700" fontFamily="monospace" fill="white"
            style={{ pointerEvents: "none" }}>{target}</text>
          <text x={outX2+86} y={cy2+4} fontSize={12} fontFamily="monospace" fill="var(--text-dim)">= {target}</text>
        </>
      ) : (
        <>
          <line x1={outX2} y1={cy2} x2={outX2+70} y2={cy2}
            stroke={WIRE_Q} strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
          <circle cx={outX2+70} cy={cy2} r={5} fill={WIRE_Q} />
          <text x={outX2+78} y={cy2+4} fontSize={12} fontFamily="monospace" fill={WIRE_Q}>?</text>
        </>
      )}
    </svg>
  );
}
 
// ── Challenge: three-gate chain diagram ──
function ChallengeSVGThreeChain({ gate1, gate2, gate3, a, b, cInput }) {
  const gw = 64, gh = 52;
  const g1x = 60,  g1y = 44, cy1 = g1y + gh/2;
  const g2x = 220, g2y = 44, cy2 = g2y + gh/2;
  const g3x = 400, g3y = 44, cy3 = g3y + gh/2;
  const nb1 = gate1==="NAND"||gate1==="NOR";
  const nb2 = gate2==="NAND"||gate2==="NOR"||gate2==="NOT";
  const nb3 = gate3==="NAND"||gate3==="NOR"||gate3==="NOT";
  const g1p = gateBodyPath(gate1, g1x, g1y, gw, gh, g1x+gw/2, cy1);
  const g2p = gateBodyPath(gate2, g2x, g2y, gw, gh, g2x+gw/2, cy2);
  const g3p = gateBodyPath(gate3, g3x, g3y, gw, gh, g3x+gw/2, cy3);
 
  return (
    <svg width="100%" viewBox="0 0 680 140" style={{ marginBottom: 16 }}>
      {/* Gate 1 inputs — coloured (given) */}
      <line x1={8} y1={cy1-14} x2={g1x} y2={cy1-14} stroke={wireColor(a)} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={8} cy={cy1-14} r={4} fill={wireColor(a)} />
      <text x={12} y={cy1-10} fontSize={10} fontFamily="monospace" fill="var(--text)">A={a}</text>
      <line x1={8} y1={cy1+14} x2={g1x} y2={cy1+14} stroke={wireColor(b)} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={8} cy={cy1+14} r={4} fill={wireColor(b)} />
      <text x={12} y={cy1+18} fontSize={10} fontFamily="monospace" fill="var(--text)">B={b}</text>
 
      {/* Gate 1 */}
      <path d={g1p} fill="var(--surface2)" stroke="var(--text)" strokeWidth="1.5" />
      {nb1 && <circle cx={g1x+gw+5} cy={cy1} r={4} fill="var(--bg)" stroke="var(--text)" strokeWidth="1.5" />}
      <text x={g1x+gw/2} y={cy1+3} textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight="500" fontFamily="monospace" fill="var(--text)">{gate1}</text>
 
      {/* G1→G2 wire — neutral grey */}
      <line x1={g1x+gw+(nb1?10:0)} y1={cy1} x2={gate2==="NOT"?g2x+8:g2x} y2={cy2}
        stroke={WIRE_NEUTRAL} strokeWidth="1.5" strokeLinecap="round" />
 
      {/* C input for gate 2 — coloured (given) */}
      {gate2 !== "NOT" && cInput !== undefined && cInput !== null && (
        <>
          <line x1={g2x-30} y1={cy2+14} x2={g2x} y2={cy2+14}
            stroke={wireColor(cInput)} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx={g2x-30} cy={cy2+14} r={4} fill={wireColor(cInput)} />
          <text x={g2x-34} y={cy2+18} textAnchor="end" fontSize={10} fontFamily="monospace" fill="var(--text)">C={cInput}</text>
        </>
      )}
 
      {/* Gate 2 */}
      <path d={g2p} fill="var(--surface2)" stroke="var(--text)" strokeWidth="1.5" />
      {nb2 && <circle cx={g2x+gw+(gate2==="NOT"?3:5)} cy={cy2} r={4} fill="var(--bg)" stroke="var(--text)" strokeWidth="1.5" />}
      <text x={g2x+gw/2} y={cy2+3} textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight="500" fontFamily="monospace" fill="var(--text)">{gate2}</text>
 
      {/* G2→G3 wire — neutral grey */}
      <line x1={g2x+gw+(nb2?8:0)} y1={cy2} x2={gate3==="NOT"?g3x+8:g3x} y2={cy3}
        stroke={WIRE_NEUTRAL} strokeWidth="1.5" strokeLinecap="round" />
 
      {/* D input for gate 3 — coloured (given) */}
      <line x1={g3x-30} y1={cy3+14} x2={g3x} y2={cy3+14}
        stroke={wireColor(1)} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={g3x-30} cy={cy3+14} r={4} fill={wireColor(1)} />
      <text x={g3x-34} y={cy3+18} textAnchor="end" fontSize={10} fontFamily="monospace" fill="var(--text)">D=1</text>
 
      {/* Gate 3 */}
      <path d={g3p} fill="var(--surface2)" stroke="var(--text)" strokeWidth="1.5" />
      {nb3 && <circle cx={g3x+gw+(gate3==="NOT"?3:5)} cy={cy3} r={4} fill="var(--bg)" stroke="var(--text)" strokeWidth="1.5" />}
      <text x={g3x+gw/2} y={cy3+3} textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight="500" fontFamily="monospace" fill="var(--text)">{gate3}</text>
 
      {/* Output — dashed ? */}
      <line x1={g3x+gw+(nb3?8:0)} y1={cy3} x2={g3x+gw+(nb3?8:0)+60} y2={cy3}
        stroke={WIRE_Q} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
      <circle cx={g3x+gw+(nb3?8:0)+60} cy={cy3} r={5} fill={WIRE_Q} />
      <text x={g3x+gw+(nb3?8:0)+68} y={cy3+4} fontSize={12} fontFamily="monospace" fill={WIRE_Q}>?</text>
    </svg>
  );
}
 
// LEVEL 3 — PRACTICE MODE
function Level3Practice({ onProceedToChallenge, onBack }) {
  const [gateIdx, setGateIdx]     = useState(0);
  const [inputA, setInputA]       = useState(0);
  const [inputB, setInputB]       = useState(0);
  const [showTable, setShowTable] = useState(false);
 
  const gate   = GATE_DATA[gateIdx];
  const output = gate.inputs === 1 ? gate.fn(inputA) : gate.fn(inputA, inputB);
  const rows   = getTruthRows(gate);
  const currentRowKey = gate.inputs === 1 ? `${inputA}` : `${inputA}${inputB}`;
 
  function selectGate(i) {
    setGateIdx(i);
    setInputA(0);
    setInputB(0);
    setShowTable(false);
    playSound("click");
  }
 
  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="btn btn-ghost"
          style={{ padding: "6px 12px", fontSize: "0.7rem" }} onClick={onBack}>
          ← Back
        </button>
        <div className="level-tag">LEVEL 3 · PRACTICE</div>
        <div className="game-title">Logic Gates</div>
      </div>
 
      {/* Gate selector pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {GATE_DATA.map((g, i) => (
          <button key={g.id} onClick={() => selectGate(i)} style={{
            padding: "6px 16px", borderRadius: 999,
            border: `1px solid ${gateIdx===i ? "var(--accent)" : "var(--border)"}`,
            background: gateIdx===i ? "rgba(0,245,255,0.1)" : "var(--surface)",
            color: gateIdx===i ? "var(--accent)" : "var(--text-dim)",
            fontFamily: "monospace", fontSize: "0.8rem",
            cursor: "pointer", transition: "all 0.2s",
          }}>{g.id}</button>
        ))}
      </div>
 
      {/* Gate description */}
      <div className="code-block" style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: "0.65rem", color: "var(--accent)",
          letterSpacing: 3, marginBottom: 8,
          fontFamily: "'Orbitron', sans-serif",
        }}>
          {gate.name.toUpperCase()}
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 0 }}>
          {gate.desc}
        </p>
      </div>
 
      <div className="info-box" style={{ marginBottom: 12 }}>
        💡 Click the <span style={{ color: "var(--accent3)" }}>input circles</span> on
        the diagram to toggle A and B live
      </div>
 
      {/* Interactive SVG */}
      <GateDiagram
        gateId={gate.id} inputA={inputA} inputB={inputB} output={output}
        onToggleA={() => setInputA(a => a===0 ? 1 : 0)}
        onToggleB={() => setInputB(b => b===0 ? 1 : 0)}
      />
 
      {/* Live output bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "12px 16px", borderRadius: 8,
        background: "var(--surface)",
        border: `1px solid ${output ? "var(--accent3)" : "var(--accent2)"}`,
        marginBottom: 16, transition: "border-color 0.2s",
      }}>
        <div style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>Output</div>
        <div style={{
          fontSize: "2rem", fontWeight: 700, fontFamily: "monospace",
          color: output ? "var(--accent3)" : "var(--accent2)",
          transition: "color 0.2s", minWidth: 28, textAlign: "center",
        }}>{output}</div>
        <div style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
          {output ? "HIGH — current flows" : "LOW — no current"}
        </div>
        <div style={{
          marginLeft: "auto", fontSize: "0.75rem",
          color: "var(--text-dim)", fontFamily: "monospace",
        }}>
          {gate.inputs === 2
            ? `${gate.id}(${inputA}, ${inputB}) = ${output}`
            : `${gate.id}(${inputA}) = ${output}`}
        </div>
      </div>
 
      {/* Truth table */}
      <button className="btn btn-ghost"
        style={{ marginBottom: 12, fontSize: "0.75rem", padding: "8px 16px" }}
        onClick={() => setShowTable(t => !t)}>
        {showTable ? "▲ Hide" : "▼ Show"} truth table
      </button>
 
      {showTable && (
        <div className="code-block" style={{ marginBottom: 16, padding: "12px 16px" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontFamily: "monospace", fontSize: "0.85rem",
          }}>
            <thead>
              <tr>
                <th style={{ padding: "6px 12px", color: "var(--text-dim)", textAlign: "center", borderBottom: "1px solid var(--border)" }}>A</th>
                {gate.inputs === 2 && (
                  <th style={{ padding: "6px 12px", color: "var(--text-dim)", textAlign: "center", borderBottom: "1px solid var(--border)" }}>B</th>
                )}
                <th style={{ padding: "6px 12px", color: "var(--text-dim)", textAlign: "center", borderBottom: "1px solid var(--border)" }}>Output</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rowKey   = row.slice(0, -1).join("");
                const isActive = rowKey === currentRowKey;
                return (
                  <tr key={i} style={{
                    background: isActive ? "rgba(0,245,255,0.07)" : "transparent",
                    transition: "background 0.2s",
                  }}>
                    {row.map((v, j) => (
                      <td key={j} style={{
                        padding: "6px 12px", textAlign: "center",
                        borderBottom: "1px solid rgba(0,245,255,0.05)",
                        color: j===row.length-1
                          ? (v ? "var(--accent3)" : "var(--accent2)")
                          : isActive ? "var(--accent)" : "var(--text)",
                        fontWeight: isActive ? 700 : 400,
                        transition: "color 0.2s",
                      }}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 8, fontSize: "0.72rem", color: "var(--text-dim)" }}>
            ↑ Highlighted row = current inputs
          </div>
        </div>
      )}
 
      {/* Real-world example */}
      <div style={{
        padding: "10px 14px", borderRadius: 8,
        background: "rgba(255,214,10,0.07)",
        borderLeft: "3px solid var(--accent3)",
        fontSize: "0.8rem", color: "var(--text-dim)",
        lineHeight: 1.6, marginBottom: 24,
      }}>
        {gate.realWorld}
      </div>
 
      <button className="btn btn-primary" onClick={onProceedToChallenge}>
        Ready for the challenge? →
      </button>
    </div>
  );
}
 
// LEVEL 3 — CHALLENGE MODE
function Level3Challenge({ onComplete, onBack, onAchievement }) {
  const [pIdx, setPIdx]         = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore]       = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone]         = useState(false);
  const [firstCorrect, setFirstCorrect] = useState(false);
 
  const puzzles = VERIFIED_PUZZLES;
  const p = puzzles[pIdx];
 
  const isChain         = p.type === "output" && p.gate2 !== undefined && p.gate3 === undefined;
  const isThreeChain    = p.type === "output" && p.gate3 !== undefined;
  const isIdentify      = p.type === "identify";
  const isIdentifyChain = p.type === "identify_chain";
 
  const progress = (pIdx / puzzles.length) * 100;
  const tierColors = { 1: "#00f5ff", 2: "#ffd60a", 3: "#ff006e", 4: "#ff006e", 5: "#b66bff" };
  const tierColor  = tierColors[p.tier] || "var(--accent)";
 
  function checkAnswer(val) {
    if (answered) return;
    const correct = String(val) === String(p.answer);
    setSelected(val);
    setAnswered(true);
    playSound(correct ? "correct" : "wrong");
    if (correct) {
      setScore(s => s + (p.tier * 80));
      if (!firstCorrect) {
        setFirstCorrect(true);
        if (onAchievement) onAchievement("first_blood");
      }
    } else {
      setMistakes(m => m + 1);
    }
  }
 
  function next() {
    if (pIdx + 1 >= puzzles.length) setDone(true);
    else { setPIdx(i => i+1); setAnswered(false); setSelected(null); }
  }
 
  if (done) {
    const maxScore = puzzles.reduce((s, q) => s + q.tier * 80, 0);
    const pct   = Math.round(score / maxScore * 100);
    const stars = pct >= 90 ? "⭐⭐⭐" : pct >= 60 ? "⭐⭐" : "⭐";
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">CHALLENGE COMPLETE!</div>
          <div className="stars">{stars}</div>
          <div style={{ color: "var(--text-dim)", marginBottom: 8 }}>Logic Gates mastered</div>
          <div className="victory-score">{score} pts</div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: 24 }}>
            {pct >= 80
              ? "Excellent — you can trace signals through complex circuits!"
              : pct >= 50
              ? "Good effort — revisit Practice mode to review any tricky gates."
              : "Keep going — head back to Practice and try each gate interactively."}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={onBack}>← Menu</button>
            <button className="btn btn-primary" onClick={() => onComplete(score, mistakes)}>
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
        <button className="btn btn-ghost"
          style={{ padding: "6px 12px", fontSize: "0.7rem" }} onClick={onBack}>
          ← Back
        </button>
        <div className="level-tag">LEVEL 3 · CHALLENGE</div>
        <div className="game-title">Logic Gates</div>
        <div className="score-display">{score} pts</div>
      </div>
 
      <div className="progress-bar">
        <div className="progress-fill" style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #ff006e, #ffd60a)",
        }} />
      </div>
 
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
        {puzzles.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: i < pIdx
              ? "var(--accent3)"
              : i === pIdx ? "var(--accent)" : "var(--border)",
            transition: "background 0.2s",
          }} />
        ))}
      </div>
 
      {/* Tier badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          padding: "3px 10px", borderRadius: 999,
          border: `1px solid ${tierColor}`,
          fontSize: "0.65rem", letterSpacing: 2,
          color: tierColor, fontFamily: "'Orbitron', sans-serif",
        }}>
          {p.label || `TIER ${p.tier}`}
        </div>
        <div style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
          Puzzle {pIdx+1} of {puzzles.length}
        </div>
      </div>
 
      <div className="info-box">{p.desc}</div>
 
      {/* Pick the correct SVG component */}
      {isThreeChain ? (
        <ChallengeSVGThreeChain
          gate1={p.gate1} gate2={p.gate2} gate3={p.gate3}
          a={p.a} b={p.b} cInput={p.cInput}
        />
      ) : isIdentifyChain ? (
        <ChallengeSVGChain
          gate1={null} gate2={p.gate2}
          a={p.a} b={p.b} cInput={p.cInput}
          isIdentifyChain={true} target={p.target}
        />
      ) : isChain ? (
        <ChallengeSVGChain
          gate1={p.gate1} gate2={p.gate2}
          a={p.a} b={p.b} cInput={p.cInput}
          isIdentifyChain={false} target={null}
        />
      ) : (
        <ChallengeSVGSingle
          gate1={p.gate1} a={p.a} b={p.b}
          isIdentify={isIdentify} target={p.target}
        />
      )}
 
      {/* Answer buttons */}
      {(isIdentify || isIdentifyChain) ? (
        <>
          <div className="hint-text">
            {isIdentifyChain
              ? "Which gate fills the ??? box to produce the shown output?"
              : "Which gate produces this output?"}
          </div>
          <div className="options-grid">
            {p.options.map(g => {
              let cls = "option-btn";
              if (answered) {
                if (g === p.answer) cls += " correct";
                else if (selected === g) cls += " wrong";
              }
              return (
                <button key={g} className={cls} onClick={() => checkAnswer(g)}>{g}</button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="hint-text">What is the final output?</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[0, 1].map(v => {
              let cls = "option-btn";
              if (answered) {
                if (v === p.answer) cls += " correct";
                else if (selected === v) cls += " wrong";
              }
              return (
                <button key={v} className={cls}
                  style={{ fontSize: "1.2rem", padding: "14px 32px" }}
                  onClick={() => checkAnswer(v)}>
                  {v}
                </button>
              );
            })}
          </div>
        </>
      )}
 
      {/* Feedback */}
      {answered && (
        <>
          <div className={`feedback-box ${String(selected)===String(p.answer) ? "correct" : "wrong"}`}>
            <strong>
              {String(selected)===String(p.answer) ? "✅ Correct!" : "❌ Not quite —"}
            </strong>
            {" "}{p.explain}
          </div>
          <button className="btn btn-primary" style={{ alignSelf: "flex-end" }} onClick={next}>
            {pIdx+1 >= puzzles.length ? "See Results →" : "Next →"}
          </button>
        </>
      )}
    </div>
  );
}
 
// LEVEL 3 WRAPPER — Practice | Challenge tabs
// This is the single component used for screen "level 3"
function Level3Wrapper({ onComplete, onBack, onAchievement }) {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState("practice");
 
  const tabStyle = (active) => ({
    flex: 1, padding: "10px 0",
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    borderRadius: 6,
    background: active ? "rgba(0,245,255,0.08)" : "var(--surface)",
    color: active ? "var(--accent)" : "var(--text-dim)",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.7rem", letterSpacing: 2,
    cursor: "pointer", transition: "all 0.2s", textAlign: "center",
  });

  if (!started) {
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">LOGIC GATES</div>

          <div style={{ color: "var(--text-dim)", marginBottom: 16 }}>
            Learn how binary inputs pass through logic gates to produce an output.
          </div>

          <div className="info-box" style={{ textAlign: "left" }}>
            <strong>Gate guide:</strong>
            <br /><br />
            AND → 1 only if both inputs are 1
            <br />
            OR → 1 if at least one input is 1
            <br />
            NOT → flips the input (1 → 0, 0 → 1)
            <br />
            NAND → opposite of AND (0 only if both are 1)
            <br />
            NOR → opposite of OR (1 only if both are 0)
            <br />
            XOR → 1 if inputs are different
          </div>
          <div className="hint-text">
            💡 Tip: NAND and NOR are just inverted versions of AND and OR.
          </div>

          <button className="btn btn-primary" onClick={() => setStarted(true)}>
            Start Level →
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="game-screen">
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={tabStyle(tab === "practice")} onClick={() => setTab("practice")}>
          Practice
        </button>
        <button style={tabStyle(tab === "challenge")} onClick={() => setTab("challenge")}>
          Challenge
        </button>
      </div>
 
      {tab === "practice" && (
        <Level3Practice
          onProceedToChallenge={() => setTab("challenge")}
          onBack={onBack}
        />
      )}
      {tab === "challenge" && (
        <Level3Challenge
          onComplete={onComplete}
          onBack={onBack}
          onAchievement={onAchievement}
        />
      )}
    </div>
  );
}

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

// ── LEVEL 4 – TEXT ADVENTURE ──────────────────
// Each room contains:
// enterFirst -> text shown first time entering
// enterOther -> text shown on repeat visits
// desc -> full descriptionshown when player types "look"
// exits -> available directions
// puzzle -> optional puzzle for the room

const ENABLE_DEBUG_ROOM = false; // Set to true to enable the debug room
const ENABLE_IF_ELSE_ROOM = true; // Set to true to enable the if/else room


const binCode = ""
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

      enterOther: "You return to the digitising platform. The system hums quietly around you.",

      desc: `Streams of data pulse through the walls like veins of light.
This is where you entered the system.
A single pathway leads deeper into the network.
      
Paths detected: EAST.`,
      exits: { 
        east: "core"
      },
    },
    // CORE
    core: {
      enterFirst: `> CORE SYSTEM ACCESSED
You step into the heart of the system.
Data streams converge here, flowing in all directions.
A large firewall pulses at the far end - blocking your escape`,

      enterOther: "You return to the core system. Data streams continue to pulse around you.",

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
        ...(ENABLE_IF_ELSE_ROOM && { south: "ifelse" }),
        ...(ENABLE_DEBUG_ROOM && { south: "debug" }),
        west: "room1",
        firewall: "firewall"
      }
    },
    // LOGIC
    logic: {
      enterFirst: `> LOGIC NODE ACCESSED
You step into a chamber filled with shifting data structures...
Streams of binary cascade around you as a circuit begins to assemble itself.`,

      enterOther: "You return to the logic node. The circuit begins forming again.",

      desc: `A suspended logic circuit stabilises in front of you.
Inputs feed into interconnected gates, each transforming the data as it flows through.
The system requires a final output value.

> EVALUATE LOGIC PATH TO DETERMINE OUTPUT`,
      
      exits: {},
      puzzle: {
        success: "core"
      }
    },
    
    // LOOP ROOM
    loopRoom: {
      enterFirst: `You step into a quiet section of the system.
The data streams here feel slower.
Paths branch in all directions.`,

      enterOther: "You return to the same quiet section. Something feels slightly off.",
      
      desc: `The environment here appears stable, but something isn't quite right.
The same structures repeat around you, almost identically.

Paths detected: NORTH, EAST, SOUTH, WEST`,
      exits: {
        north: "loop",
        east: "loop",
        south: "loop",
        west: "loop",
      }
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
        success: "core"
      }
    },

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
        success: "core"
      }
    },

    // IF/ELSE ROOM
    ifelse: {
      enterFirst: `> CONDITIONAL NODE ACCESSED
  
A digital gate materialises in front of you, its logic incomplete.
It requires a condition to determine which path the data should flow through.
A rule flashes in front of you...`,

      enterOther: "You return to the conditional node. The gate awaits your input.",

      desc: `\nThe gate's logic is missing a crucial component - the condition.`,

      exits: {},
    },

    // FIREWALL
    firewall: {
      enterFirst: `> FIREWALL INTERFACE ACCESSED
You approach the barrier blocking your escape.
The system reacts immediately.

> FINAL SECURITY LAYER DETECTED
> AUTHENTICATION REQUIRED

The firewall pulses violently, resisting access.`,

      enterOther: "You return to the firewall. The barrier pulses, awaiting input.",

      desc: `A massive firewall blocks your exit.
Streams of encrypted data surge across its surface.

> ACCESS CONTROL: ENABLED
> AUTHORISATION REQUIRED

Your collected binary fragments must be converted into a decimal key.

> ENTER ACCESS CODE
> CURRENT FRAGMENTS:

Type: solve [decimal]`,

      exits: {
        west: "core"
      },
      puzzle: {
        type: "binary",
        success: "exit"
      }
    },
    
    // EXIT
    exit: {
      desc: "> SYSTEM RESTORED\n\nAll errors resolved.\n\nYou feel your body reforming...\n\n> EXITING DIGITAL WORLD...\n\n🎉 You escaped the system!",
      exits: {},
      win: true
    },    
  },
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
function HomeScreen({
  completedLevels,
  scores,
  onSelectLevel,
  unlockedAchievements,
}) {
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
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-dim)",
              letterSpacing: 2,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            YOUR ACHIEVEMENTS
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.id}
                title={a.desc}
                style={{
                  fontSize: "1.6rem",
                  opacity: unlockedAchievements.includes(a.id) ? 1 : 0.2,
                  filter: unlockedAchievements.includes(a.id)
                    ? "none"
                    : "grayscale(1)",
                  cursor: "default",
                  transition: "all 0.3s",
                }}
              >
                {a.icon}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── LEVEL 1 – BINARY TO DECIMAL ───────────────
function Level1({ onComplete, onBack, onAchievement }) {
  const [started, setStarted] = useState(false);
  const [questions] = useState(() => generateBinaryQuestions(7));
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [firstCorrect, setFirstCorrect] = useState(false);

  const q = questions[qIdx];
  const progress = (qIdx / questions.length) * 100;

  if (!started) {
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">BINARY → DECIMAL</div>

          <div style={{ color: "var(--text-dim)", marginBottom: 16 }}>
            Learn how computers convert binary numbers into decimal.
          </div>

          <div className="info-box" style={{ textAlign: "left" }}>
            <strong>How it works:</strong>
            <br /><br />
            Each position represents a power of 2:
            <br />
            <span style={{ color: "var(--accent)" }}>
              8 &nbsp;&nbsp; 4 &nbsp;&nbsp; 2 &nbsp;&nbsp; 1
            </span>
            <br /><br />
            Multiply each bit by its value, then add:
            <br /><br />
            <span style={{ color: "var(--accent3)" }}>
              1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10
            </span>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setStarted(true)}
          >
            Start Level →
          </button>
        </div>
      </div>
    );
  }

  function checkAnswer() {
    if (answered) return;

    const userValue = Number(answer.trim());
    const correct = userValue === q.answer;

    setAnswered(true);
    playSound(correct ? "correct" : "wrong");

    if (correct) {
      setScore(s => s + 100);

      if (!firstCorrect) {
        setFirstCorrect(true);
        if (onAchievement) onAchievement("first_blood");
      }
    } else {
      setMistakes(m => m + 1);
    }
  }

  function next() {
    if (qIdx + 1 >= questions.length) {
      setDone(true);
    } else {
      setQIdx(i => i + 1);
      setAnswer("");
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
            Binary conversion mastered
          </div>
          <div className="victory-score">{score} pts</div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: 24 }}>
            You converted binary values into decimal numbers.
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
        <div className="game-title">Binary to Decimal</div>
        <div className="score-display">{score} pts</div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="info-box">
        Question {qIdx + 1} of {questions.length} — Convert this binary number into decimal.
      </div>

      <div className="code-block" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: 12 }}>
          Binary
        </div>
        <div style={{ fontSize: "3rem", color: "var(--accent)", letterSpacing: 8 }}>
          {q.binary}
        </div>
        <div style={{ marginTop: 14, fontSize: "0.8rem", color: "var(--text-dim)" }}>
          Use place values: 8, 4, 2, 1 for 4-bit numbers.
        </div>
      </div>

      <div className="hint-text">
        💡 Example: 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10
      </div>

      <div className="adventure-input-row">
        <span className="adventure-prompt">decimal&gt;</span>
        <input
          className="adventure-input"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && answer.trim() && !answered) {
              checkAnswer();
            }
          }}
          placeholder="type decimal answer..."
          disabled={answered}
          autoFocus
        />
      </div>

      {!answered && (
        <button className="btn btn-primary" onClick={checkAnswer} style={{ alignSelf: "flex-start" }}>
          Check Answer
        </button>
      )}

      {answered && (
        <>
          <div className={`feedback-box ${Number(answer.trim()) === q.answer ? "correct" : "wrong"}`}>
            <strong>
              {Number(answer.trim()) === q.answer ? "✅ Correct!" : `❌ Not quite — answer was ${q.answer}`}
            </strong>
            <br />
            {q.explanation}
          </div>

          <button className="btn btn-primary" onClick={next} style={{ alignSelf: "flex-end" }}>
            {qIdx + 1 >= questions.length ? "See Results →" : "Next →"}
          </button>
        </>
      )}
    </div>
  );
}

// ── LEVEL 2 – IF/ELSE ─────────────────────────
function Level2({ onComplete, onBack, onAchievement }) {
  const [started, setStarted] = useState(false);
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

  if (!started) {
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">IF / ELSE</div>

          <div style={{ color: "var(--text-dim)", marginBottom: 16 }}>
            Complete Python if/else statements by choosing the condition that makes the code behave correctly.
          </div>

          <div className="info-box" style={{ textAlign: "left" }}>
            <strong>How it works:</strong>
            <br /><br />
            Read the scenario, inspect the Python code, then choose the missing condition.
            <br /><br />
            Example:
            <br />
            <span style={{ color: "var(--accent3)" }}>
              if age &gt;= 18:
            </span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;print("You can vote!")
            <br />
            else:
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;print("Too young.")
          </div>

          <button className="btn btn-primary" onClick={() => setStarted(true)}>
            Start Level →
          </button>
        </div>
      </div>
    );
  }

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
        <div className="level-tag">LEVEL 2</div>
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
        <div
          style={{
            fontSize: "0.96rem",
            color: "var(--text-dim)",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            lineHeight: 1.5,
          }}
        >
          {q.context}
        </div>
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

// ── LEVEL 3 – LOGIC GATES ─────────────────────
function Level3({ onComplete, onBack }) {
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
    if (isCorrect) setScore((s) => s + 100);
    else setMistakes((m) => m + 1);
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

  const [started, setStarted] = useState(false);
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
  const [visitedRooms, setVisitedRooms] = useState({
    room1: true
  });
  const [completedRooms, setCompletedRooms] = useState({});
  const [locked, setLocked] = useState(false);
  const [debugStage, setDebugStage] = useState(1);
  const [debugPuzzle, setDebugPuzzle] = useState(null);
  const [debugWrongAttempts, setDebugWrongAttempts] = useState(0);
  const [ifPuzzle, setIfPuzzle] = useState(null);
  const [ifStage, setIfStage] = useState(1);

  const [firewallBoss, setFirewallBoss] = useState(null);
  const [firewallAttempts, setFirewallAttempts] = useState(0);

  const FAST_MODE = true; // for testing true = instant text, false = typewriter effect
  const CHAR_SPEED = FAST_MODE ? 0 : 35;
  const LINE_DELAY = FAST_MODE ? 0 : 700;
  const delay = (ms) => FAST_MODE ? ms * 0.6 : ms; // speed up all timeouts in fast mode
  

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTo({
        top: historyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [displayedHistory]);

  useEffect(() => {
    if (!started) return;

    history.forEach((line) => {
      addLine(line.text, line.type);
    });
  }, [started]);

  const typingQueue = useRef(Promise.resolve());

  function addLine(text, type = "system") {
    typingQueue.current = typingQueue.current.then(() => {
      return new Promise((resolve) => {
        const line = { text: "", type };

        setDisplayedHistory((h) => [...h, line]);

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
              currentText +=
                glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
              currentText += nextChar || "";
            }

            setDisplayedHistory((h) => {
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
      .then(() => new Promise(r => setTimeout(r, delay(800))))
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

  function completeRoom(roomId, delayText, latestCode = binaryCode) {
    const nextRoomId = "core";

    setCompletedRooms(prev => ({
      ...prev,
      [roomId]: true
    }));

    setRoom(nextRoomId);

    return new Promise(r => setTimeout(r, delay(delayText)))
      .then(() => {
        const textToShow = getRoomText(nextRoomId);
        return loadNewRoom(textToShow);
      })
      .then(() => {
        // ALWAYS remind player of code
        return addLine(`> CURRENT CODE: ${latestCode.join("") || "NONE"}`, "system");
      });
  }

  function handleRoomSuccess(roomId, bits = 1, transitionDelay = 1200) {
    return addLine("✅ NODE STABILISED", "success")
      .then(() => new Promise(r => setTimeout(r, delay(800))))

      .then(() => {
        if (bits > 0) return awardBits(bits);

        addLine("> NO DATA RECOVERED", "error");
        return Promise.resolve(binaryCode);
      })

      .then(updatedCode => {
        return new Promise(r => setTimeout(() => r(updatedCode), delay(1500)));
      })

      .then(updatedCode => {
        setCompletedRooms(prev => ({
          ...prev,
          [roomId]: true
        }));

        return completeRoom(roomId, transitionDelay, updatedCode);
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
      a,
      b,
      c,
      d,
      gate1,
      gate2,
      gate3,
      answer: String(answer),
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
      case "AND":
        return a & b;
      case "OR":
        return a | b;
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

  function glitchText(text, intensity = 0.1) {
    const chars = "!@#$%^&*<>?/[]{}";

    return text
      .split("")
      .map((char) => {
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

        .then(() => new Promise(r => setTimeout(r, delay(800)))) // ⏸ pause before code

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
      question: `Code snippet:

total = 0
numbers = [2, 4, 6]

for num in numbers:
    total = num
}

What is the bug?`,
      answers: ["overwrite", "replaces", "assignment", "not accumulating"],
      keywords: ["overwrite", "overwritten", "replace", "replaces"],
      hint: "Look at how the total variable is updated inside the loop. Is it adding to the total or replacing it?"
    };
  }

  if (stage === 2) {
    return {
      stage,
      question: `Fix the broken line:

total = 0
numbers = [2, 4, 6]

for num in numbers:
    total = num
}

Type the corrected line.`,
      answers: ["total += num", "total = total + num"],
      hint: "You want to add num to total, not replace it. Try using += or total = total + num"
    };
  }

  return {
    stage,
    question: `What is the output?

let score = 3;

score += 2;
score *= 4;
score -= 5;

console.log(score);`,
    answers: ["15"],
    hint: "Follow the operations step by step: start with 3, add 2, then multiply by 4, then subtract 5. What do you get?"
  };
}

function generateIfElsePuzzle(stage = 1) {
  if (stage === 1) {
    const energy = Math.floor(Math.random() * 100);
    const threshold = 40;
    const result = energy >= threshold;

    return {
      stage,
      title: "Power threshold",
      condition: `energy >= ${threshold}`,
      variables: [`energy = ${energy}`],
      correct: result ? "north" : "south",
      explanation: `${energy} >= ${threshold} is ${result ? "TRUE" : "FALSE"}.`
    };
  }

  if (stage === 2) {
    const accessLevel = Math.floor(Math.random() * 5) + 1;
    const systemLocked = Math.random() < 0.5;
    const result = accessLevel >= 3 && systemLocked === false;

    return {
      stage,
      title: "Access control",
      condition: `access_level >= 3 and system_locked == False`,
      variables: [
        `access_level = ${accessLevel}`,
        `system_locked = ${systemLocked ? "True" : "False"}`
      ],
      correct: result ? "north" : "south",
      explanation: `Access only succeeds if level is 3 or higher AND the system is not locked.`
    };
  }

  const signalStable = Math.random() < 0.5;
  const overrideActive = Math.random() < 0.5;
  const corruptionLevel = Math.floor(Math.random() * 100);
  const result = (signalStable || overrideActive) && corruptionLevel < 60;

  return {
    stage,
    title: "Nested system condition",
    condition: `(signal_stable or override_active) and corruption_level < 60`,
    variables: [
      `signal_stable = ${signalStable ? "True" : "False"}`,
      `override_active = ${overrideActive ? "True" : "False"}`,
      `corruption_level = ${corruptionLevel}`
    ],
    correct: result ? "north" : "south",
    explanation: `The first part needs either signal_stable OR override_active to be true, and corruption_level must be below 60.`
  };
}

function generateFirewallBoss(codeArray) {
  const original = codeArray.join("");
  const ones = original.split("").filter(bit => bit === "1").length;

  let ruleText = "";
  let transformed = "";

  if (ones > 3) {
    ruleText = `if number_of_1s > 3:
    invert_bits()`;
    transformed = original
      .split("")
      .map(bit => bit === "1" ? "0" : "1")
      .join("");
  } else {
    ruleText = `if number_of_1s > 3:
    invert_bits()
else:
    rotate_left()`;
    transformed = original.slice(1) + original[0];
  }

  return {
    original,
    ones,
    ruleText,
    transformed,
    answer: parseInt(transformed, 2)
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

      // IF/ELSE ROOM
      if (room === "ifelse" && ifPuzzle) {
        return addLine(currentRoom.desc, "system")
          .then(() => addLine(`> IF / ELSE STAGE ${ifStage}/3`, "system"))
          .then(() => addLine("", "system"))
          .then(() => addLine(`> ${ifPuzzle.title.toUpperCase()}`, "system"))
          .then(() => addLine("", "system"))
          .then(() => addLine(ifPuzzle.variables.join("\n"), "system"))
          .then(() => addLine("", "system"))
          .then(() => addLine(`if ${ifPuzzle.condition}:`, "system"))
          .then(() => addLine("    go north", "system"))
          .then(() => addLine("else:", "system"))
          .then(() => addLine("    go south", "system"));
      }

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
          .then(() => new Promise((r) => setTimeout(r, delay(1000))))
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

      // IF/ELSE ROOM COLVING
      if (room === "ifelse" && ifPuzzle) {
        if (dir === ifPuzzle.correct) {
          return addLine("> EVALUATING CONDITION...", "system")
            .then(() => new Promise(r => setTimeout(r, delay(400))))
            .then(() => addLine("> PROCESSING...", "system"))
            .then(() => new Promise(r => setTimeout(r, delay(400))))
            .then(() => addLine("✅ CONDITION EVALUATED CORRECTLY", "success"))
            .then(() => addLine(`> ${ifPuzzle.explanation}`, "system"))
            .then(() => {
              if (ifStage === 3) {
                return handleRoomSuccess("ifelse", 3);
              }

              const nextStage = ifStage + 1;

              setIfStage(nextStage);
              setIfPuzzle(generateIfElsePuzzle(nextStage));

              return addLine(`> IF / ELSE STAGE ${ifStage}/3 COMPLETE`, "system")
                .then(() => new Promise(r => setTimeout(r, delay(500))))
                .then(() => addLine(`> LOADING STAGE ${nextStage}/3`, "system"))
                .then(() => addLine("> Type 'look' to inspect the new condition", "system"));
            });
        }

        triggerGlitch(300);

        addLine("❌ CONDITION FAILED", "error");
        addLine("> PATH INVALID — LOGIC MISMATCH DETECTED", "system");
        addLine("> RE-EVALUATE THE CONDITION", "system");
        setScore(s => Math.max(0, s - 10));
        return;
      }

      if (currentRoom.exits[dir]) {
        const nextId = currentRoom.exits[dir];
        const nextRoom = ADVENTURE.rooms[nextId];

        setRoom(nextId);

        // ROOM HANDLING

        // FIREWALL SPECIAL DISPLAY
        if (nextId === "firewall") {
          const textToShow = getRoomText(nextId);

          setVisitedRooms((prev) => ({
            ...prev,
            [nextId]: true,
          }));

          const boss = generateFirewallBoss(binaryCode);
          setFirewallBoss(boss);
          setFirewallAttempts(0);

          loadNewRoom(textToShow)
            .then(() => {
              const code = binaryCode.join("");

              addLine(`> DATA FRAGMENTS DETECTED: ${binaryCode.length}`, "system");

              if (boss) {
                return addLine(`> CURRENT BINARY: ${boss.original}`, "system")
                  .then(() => addLine("", "system"))
                  .then(() => addLine("> FIREWALL RULE DETECTED:", "system"))
                  .then(() => addLine(boss.ruleText, "system"))
                  .then(() => addLine("", "system"))
                  .then(() => addLine("> Apply the rule, then convert the result to decimal.", "system"))
                  .then(() => addLine("Type: solve [decimal]", "system"));
              }
            });          

          // LOGIC ROOM
        } else if (nextId === "logic") {
          const textToShow = getRoomText(nextId);
          loadNewRoom(textToShow).then(() => {
            setVisitedRooms((prev) => ({
              ...prev,
              [nextId]: true,
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

          setVisitedRooms((prev) => ({
            ...prev,
            [nextId]: true,
          }));

          loadNewRoom(textToShow);

        // IF/ELSE ROOM
        } else if (nextId === "ifelse") {
          const textToShow = getRoomText(nextId);

          setVisitedRooms((prev) => ({
            ...prev,
            [nextId]: true,
          }));

          const puzzle = generateIfElsePuzzle(1);
          setIfPuzzle(puzzle);
          setIfStage(1);

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
              setDebugWrongAttempts(0);
            }

          });

        // DEFAULT ROOM
        } else {
          const textToShow = getRoomText(nextId);

          setVisitedRooms((prev) => ({
            ...prev,
            [nextId]: true,
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
                  addLine(
                    glitchText("> WARNING: RECURSIVE STATE CONFIRMED", 0.12),
                    "error",
                  );
                }

                // 💀 LOOP CRASH
                if (newCount === 9) {
                  setLocked(true);

                  triggerGlitch(2000);

                  addLine("> SYSTEM ERROR: INFINITE LOOP", "error")
                    .then(() => addLine("> CRITICAL FAILURE DETECTED", "error"))
                    .then(() => new Promise(r => setTimeout(r, delay(800))))

                    .then(() => {
                      setDisplayedHistory([]);
                      return addLine("> SYSTEM COLLAPSE", "error");
                    })

                    .then(() => new Promise((r) => setTimeout(r, delay(1000))))

                    .then(() => {
                      setDisplayedHistory([]);
                      return addLine("> REBOOTING SYSTEM...", "system");
                    })

                    .then(() => new Promise(r => setTimeout(r, delay(1200))))

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
        setScore((s) => Math.max(0, s - 10));
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
                .then(() => new Promise(r => setTimeout(r, delay(500))))
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
                .then(() => new Promise(r => setTimeout(r, delay(600))))
                .then(() => addLine("> INTERRUPTING LOOP...", "error"))
                .then(() => new Promise(r => setTimeout(r, delay(600))))
                .then(() => {
                  triggerGlitch(800);
                  return addLine("> REALITY DESYNCHRONISING...", "error");
                })
                .then(() => new Promise(r => setTimeout(r, delay(1200))))

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
          setScore((s) => Math.max(0, s - 10));
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

        if (!firewallBoss) {
          addLine("> FIREWALL ERROR - NO DECRYPTION RULE LOADED", "error");
          return;
        }

        const correctDecimal = firewallBoss.answer;
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
            .then(() => new Promise(r => setTimeout(r, delay(600))))
            .then(() => addLine("> DECRYPTING...", "system"))
            .then(() => new Promise(r => setTimeout(r, delay(600))))
            .then(() => addLine("> BYPASSING SECURITY...", "system"))
            .then(() => triggerGlitch(1200))
            .then(() => new Promise(r => setTimeout(r, delay(800))))

            .then(() => {
              setDisplayedHistory([]);
              return addLine("> ACCESS GRANTED", "success");
            })

            .then(() => new Promise((r) => setTimeout(r, delay(600))))

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

        const userAnswer = answer.trim().toLowerCase();

        let isCorrect = false;
        if (debugPuzzle.keywords) {
          isCorrect = debugPuzzle.keywords.some(keyword =>
            userAnswer.includes(keyword)
          );
        } else if (debugPuzzle.answers) {
          isCorrect = debugPuzzle.answers.includes(userAnswer);
        }

        if (isCorrect) {        

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
              setDebugWrongAttempts(0);

              return addLine(`> DEBUG STAGE ${debugStage}/3 RESOLVED`, "system")
                .then(() => new Promise(r => setTimeout(r, delay(500))))
                .then(() => addLine(`> LOADING NEXT ERROR...`, "error"))
                .then(() => new Promise(r => setTimeout(r, delay(800))))
                .then(() => addLine("> Type 'look' to inspect code", "system"));
            });
          } else {
            triggerGlitch(300);
            setScore(s => Math.max(0, s - 10));

            const newAttempts = debugWrongAttempts + 1;
            setDebugWrongAttempts(newAttempts);

            addLine("❌ Incorrect. Analyse the code carefully.", "error");

            if (newAttempts >= 2 && debugPuzzle.hint) {
              addLine(`💡 Hint: ${debugPuzzle.hint}`, "system");
            }
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
          setScore((s) => Math.max(0, s - 10));
        }
      } else {
        addLine("Nothing to solve here.", "error");
      }
      // UNKNOWN COMMAND
    } else {
      addLine(`Unknown command: '${raw}'. Type 'help' for commands.`, "error");
      setScore((s) => Math.max(0, s - 5));
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

  if (!started) {
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">TEXT ADVENTURE</div>

          <div style={{ color: "var(--text-dim)", marginBottom: 16 }}>
            You have been digitised inside a computer system. Explore rooms, solve puzzles, collect binary fragments, and bypass the firewall to escape.
          </div>

          <div className="info-box" style={{ textAlign: "left" }}>
            <strong>Commands:</strong>
            <br /><br />
            <span style={{ color: "var(--accent3)" }}>go north</span> / 
            <span style={{ color: "var(--accent3)" }}> go south</span> / 
            <span style={{ color: "var(--accent3)" }}> go east</span> / 
            <span style={{ color: "var(--accent3)" }}> go west</span>
            <br /><br />
            <span style={{ color: "var(--accent3)" }}>look</span> — inspect the current room
            <br />
            <span style={{ color: "var(--accent3)" }}>solve [answer]</span> — solve a puzzle
            <br />
            <span style={{ color: "var(--accent3)" }}>help</span> — show commands again
          </div>

          <div className="hint-text">
            💡 Tip: Use <span style={{ color: "var(--accent)" }}>look</span> when entering puzzle rooms.
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setStarted(true)}
          >
            Start Adventure →
          </button>
        </div>
      </div>
    );
  }

  if (won) {
    const stars = score >= 280 ? "⭐⭐⭐" : score >= 180 ? "⭐⭐" : "⭐";
    return (
      <div className="screen">
        <div className="victory-card">
          <div className="victory-title">ESCAPED!</div>
          <div className="stars">{stars}</div>
          <div style={{ color: "var(--text-dim)", marginBottom: 8 }}>
            Text Adventure complete
          </div>
          <div className="victory-score">{score} pts</div>
          <div
            style={{
              color: "var(--text-dim)",
              fontSize: "0.8rem",
              marginBottom: 24,
            }}
          >
            The answer was 42 — <em>"loops + 1"</em> = a reference to the
            classic programming joke! (Also the answer to life, the universe and
            everything 😄)
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={onBack}>
              ← Menu
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onComplete(score)}
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
        <div className="level-tag">LEVEL 4</div>
        <div className="game-title">Text Adventure</div>
        <div className="score-display">{score} pts</div>
      </div>
      {/* <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: "60%",
            background: "linear-gradient(90deg, #7fff00, #00f5ff)",
          }}
        />
      </div> */}

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

  function handleSelectLevel(id) {
  setScreen(`level${id}`);
}

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
      3: "no_mistakes_3"
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
          onAchievement={unlockAchievement}
        />
      )}

      {screen === "level3" && (
        <Level3Wrapper
          onComplete={(pts, mistakes) => completeLevel(3, pts, mistakes)}
          onBack={() => setScreen("home")}
          onAchievement={unlockAchievement}
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