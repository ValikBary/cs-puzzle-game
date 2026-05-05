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
  const [score, setScore] = useState(0);
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