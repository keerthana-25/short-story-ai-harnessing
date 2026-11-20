// Build the slide deck. Run: node scripts/build_deck.js
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
let applyTheme = null;
try { ({ applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js")); } catch (e) { /* optional: writes theme colors */ }

const ROOT = path.join(__dirname, "..");
const IMG = (f) => path.join(ROOT, "images", f);
const OUT = path.join(ROOT, "slides", "agent_harness_engineering.pptx");

const THEME = {
  name: "Harness",
  headFontFace: "Calibri",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B1F2B", lt1: "FFFFFF", dk2: "4A4F5E", lt2: "EFEDFB",
    accent1: "6250D6", accent2: "2A78D6", accent3: "1BAF7A", accent4: "EB6834",
    accent5: "E34948", accent6: "008300", hlink: "2A78D6", folHlink: "6250D6",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Agent Harness Engineering";
pres.author = "Keerthana";
const C = pres.SchemeColor;
const W = 13.333;

pres.defineSlideMaster({
  title: "DARK",
  background: { color: C.text1 },
  objects: [],
  placeholders: [],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  objects: [
    { text: { text: "Agent Harness Engineering · Short Story", options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.text2, isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.text2, align: "right" },
});

let sectionTitle = "";
function content(title, notes) {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle });
  s.addText(title, { x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontSize: 32, bold: true, color: C.text1, valign: "middle", isTextBox: true, margin: 0, objectName: "Title" });
  if (notes) s.addNotes(notes);
  return s;
}
function section(t) { sectionTitle = t; pres.addSection({ title: t }); }

function fitImage(s, file, ratio, x, y, w, h, name) {
  let iw = w, ih = w / ratio;
  if (ih > h) { ih = h; iw = h * ratio; }
  s.addImage({ path: IMG(file), x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih, objectName: name, altText: name });
}

function card(s, x, y, w, h, head, body, opts = {}) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: opts.fill || C.background2 }, line: { color: opts.fill || C.background2 }, objectName: "card " + head });
  s.addText([
    { text: head, options: { bold: true, fontSize: opts.headSize || 18, color: opts.headColor || C.text1, breakLine: true } },
    { text: body, options: { fontSize: opts.bodySize || 14, color: C.text2 } },
  ], { x: x + 0.25, y: y + 0.15, w: w - 0.5, h: h - 0.3, valign: "top", isTextBox: true, margin: 0, paraSpaceAfter: 4 });
}

function bullets(s, items, x, y, w, h, size = 16) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1 } })),
    { x, y, w, h, fontSize: size, color: C.text1, valign: "top", paraSpaceAfter: 10, isTextBox: true, margin: 0 });
}

function stat(s, x, y, w, big, label, color, size) {
  s.addText(big, { x, y, w, h: 1.0, fontSize: size || 40, bold: true, color: color || C.accent1, isTextBox: true, margin: 0 });
  s.addText(label, { x, y: y + 1.05, w, h: 0.9, fontSize: 14, color: C.text2, valign: "top", isTextBox: true, margin: 0 });
}

// ---------- 1. Title ----------
section("Intro");
{
  const s = pres.addSlide({ masterName: "DARK", sectionTitle });
  s.addText("It's Not Just the Model", { x: 0.8, y: 2.0, w: 11.5, h: 1.2, fontSize: 48, bold: true, color: C.background1, isTextBox: true, margin: 0 });
  s.addText("A field guide to agent harness engineering, from four 2026 surveys", { x: 0.8, y: 3.25, w: 11.5, h: 0.7, fontSize: 22, color: "C9C4F2", isTextBox: true, margin: 0 });
  s.addText("Short Story Assignment · Keerthana · SJSU MS Data Science", { x: 0.8, y: 5.8, w: 11.5, h: 0.5, fontSize: 16, color: "B8BCC8", isTextBox: true, margin: 0 });
  s.addNotes("Hi everyone, I'm Keerthana. For my short story assignment I picked a topic that's been getting a lot of attention this year: agent harness engineering. The one-line idea is that when you build an LLM agent, the model is only part of the story. The code that wraps the model, which these papers call the harness, decides a lot about whether the agent actually works. I'm going to walk through one main survey paper and three companion surveys, all published between May and September 2026. I'll cover the main taxonomy, the evidence and ablation-style results they lean on, how they think about evaluation, and at the end I'll share my own take on what's convincing and what isn't.");
}

// ---------- 2. Hook ----------
{
  const s = content("Same model, different wrapper, very different result",
    "Let me start with the number that got me interested. xAI reported that one of their coding models, Grok Code Fast 1, went from about 6.7 percent on SWE-bench to about 68 percent. They didn't retrain it. They changed the format of the tool the agent uses to edit files. That's a vendor report, so I treat the exact number carefully. But there's a second, more independent example. LangChain took the same coding model on Terminal-Bench 2.0 and went from 52.8 to 66.5 percent by changing only prompts and middleware. That's about a 26 percent relative jump, and it moved them from around 30th to the top 5. And the Holistic Agent Leaderboard ran over 21,000 rollouts and found that standardizing the evaluation harness removed a lot of bugs. So some of what older papers called model failures may actually have been harness failures. That's the motivation for this whole line of work.");
  stat(s, 0.6, 1.8, 3.8, "6.7 → 68.3%", "Grok Code Fast 1 on SWE-bench after changing only the edit-tool format (vendor report)");
  stat(s, 4.75, 1.8, 3.8, "52.8 → 66.5", "LangChain DeepAgents on Terminal-Bench 2.0 with prompts + middleware only (~26% relative)", C.accent2);
  stat(s, 8.9, 1.8, 3.8, "21,730", "rollouts in the Holistic Agent Leaderboard; a standard harness removed common eval bugs", C.accent3);
  s.addShape(pres.ShapeType.roundRect, { x: 0.6, y: 4.6, w: 12.1, h: 1.6, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "takeaway" });
  s.addText("Takeaway: agent = model + harness. Changing the harness can move results as much as changing the model.",
    { x: 0.9, y: 4.75, w: 11.5, h: 1.3, fontSize: 20, bold: true, color: C.text1, valign: "middle", isTextBox: true, margin: 0 });
}

// ---------- 3. Papers ----------
{
  const s = content("Four surveys, one idea",
    "Here are the four papers. The main one is Meng and colleagues, Agent Harness for Large Language Model Agents: A Survey, on arXiv in May 2026. It gives the formal definition and the six-part taxonomy I'll spend most of the time on. The second is Code as Agent Harness by Ning and 41 co-authors from UIUC, Meta and Stanford. It argues code is becoming the material the whole harness is built from. The third, by Li, Wu and Chang, looks at how the harness and the model co-evolve over time, meaning which jobs move into the model and which stay outside. And the fourth, by Radwan, Vasilakos and Raza, is about evaluation: if the harness matters this much, then a benchmark score describes a whole configuration, not just a model. Together they cover architecture, evidence, the future, and measurement.");
  const ps = [
    ["Main paper", "Agent Harness for LLM Agents: A Survey", "Meng, Wang, Chen et al. · arXiv 2605.29682 · May 2026", "Formal definition + 6-component taxonomy"],
    ["Companion 1", "Code as Agent Harness", "Ning et al. (UIUC, Meta, Stanford) · arXiv 2605.18747 · May 2026", "Code as the substrate of the harness"],
    ["Companion 2", "Harness Engineering for LLM Agents", "Li, Wu, Chang · Preprints.org · Jun 2026", "Model–harness coevolution"],
    ["Companion 3", "Harness-Aware Evaluation of LLM Agents", "Radwan, Vasilakos, Raza · Preprints.org · Sep 2026", "Scores belong to configurations"],
  ];
  ps.forEach((p, i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 2.6;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: 5.95, h: 2.35, rectRadius: 0.12, fill: { color: i === 0 ? C.accent1 : C.background2 }, line: { color: i === 0 ? C.accent1 : C.background2 }, objectName: "paper " + i });
    const fg = i === 0 ? C.background1 : C.text1, fg2 = i === 0 ? "E4E0FA" : C.text2;
    s.addText([
      { text: p[0].toUpperCase(), options: { fontSize: 12, bold: true, color: fg2, breakLine: true } },
      { text: p[1], options: { fontSize: 20, bold: true, color: fg, breakLine: true } },
      { text: p[2], options: { fontSize: 13, color: fg2, breakLine: true } },
      { text: p[3], options: { fontSize: 15, italic: true, color: fg } },
    ], { x: x + 0.3, y: y + 0.2, w: 5.35, h: 1.95, valign: "top", isTextBox: true, margin: 0, paraSpaceAfter: 6 });
  });
}

// ---------- 4. Evolution ----------
section("Main survey");
{
  const s = content("From prompt engineering to harness engineering",
    "Meng and colleagues tell the history as three shifts. Around 2022 and 2023 it was prompt engineering: you cared about one good answer, so chain-of-thought, few-shot examples and templates. In 2024 and 2025 the focus moved to context engineering: agents ran for many steps, so the question became what goes into the context window, through retrieval, memory and summarizing old turns. Now, in 2025 and 2026, it's harness engineering. Agents run for hours, touch real systems, and need to be audited, so the problem is the whole runtime. They also show the idea has older roots: software test harnesses like JUnit from the 90s, reinforcement-learning environment APIs, and early agent frameworks like AutoGPT, which gave us a long list of failure modes. I appreciate that the authors are upfront that none of the pieces is new. The contribution is treating the harness as one object you can study.");
  fitImage(s, "02_evolution.png", 2.585, 0.6, 1.6, 12.1, 4.7, "Evolution diagram");
}

// ---------- 5. Six components ----------
{
  const s = content("The taxonomy: H = (E, T, C, S, L, V)",
    "This is the core of the main paper. A harness is a tuple of six components wrapped around the model. E is the execution loop: observe, think, act, and decide when to stop or retry. T is the tool registry: a typed, validated catalog of tools, and this is where protocols like MCP live. C is the context manager, which decides what goes into the window. S is the state store, which persists task state and memory and lets you recover after a crash. L is lifecycle hooks: code that runs before and after each action for auth, policy, audit and human approval. And V is the evaluation interface, which records trajectories and success signals in a standard format. The paper says E and T are the minimum, since without a loop there's no multi-step behavior and without tools the agent can't do anything. The other four are what make it production-grade. One subtle point: L controls what happens, while V records what happened.");
  fitImage(s, "01_harness_six_components.png", 1.653, 0.6, 1.4, 12.1, 5.4, "Six component harness diagram");
}

// ---------- 6. Failure modes ----------
{
  const s = content("Each component guards against a failure mode",
    "The paper ties each component to the failure you get when it's missing or weak. A weak loop gives you execution runaway: the agent loops forever and burns budget. A weak tool registry gives you tool misuse, like wrong arguments or the wrong tool. A weak context manager gives you context blowout, where the window fills with junk and the model loses track. A weak state store gives you state loss, so a crash means starting over. Missing hooks mean unmonitored side effects, things that happen in the real world that nobody approved. And missing evaluation means unobservable behavior: you can't tell why it failed. The paper also says how much of each you need depends on the task. A single-turn Q and A bot barely needs more than E, T and C. A software-engineering agent or a multi-agent system needs basically all six. Coming from backend work, this maps almost one to one onto retries, API contracts, caching, persistence, middleware and observability.");
  const items = [
    ["E · Execution loop", "Execution runaway: loops forever, burns budget"],
    ["T · Tool registry", "Tool misuse: wrong tool, bad arguments"],
    ["C · Context manager", "Context blowout: window fills with noise"],
    ["S · State store", "State loss: a crash means starting over"],
    ["L · Lifecycle hooks", "Unmonitored side effects: actions nobody approved"],
    ["V · Evaluation interface", "Unobservable behavior: can't tell why it failed"],
  ];
  items.forEach((it, i) => {
    const x = 0.6 + (i % 3) * 4.07, y = 1.6 + Math.floor(i / 3) * 2.15;
    card(s, x, y, 3.87, 1.95, it[0], it[1]);
  });
  s.addText("E + T are necessary. All six at production grade is sufficient.", { x: 0.6, y: 6.15, w: 12.1, h: 0.5, fontSize: 16, italic: true, color: C.accent1, isTextBox: true, margin: 0 });
}

// ---------- 7. Matrix ----------
{
  const s = content("Grading real systems: V is the weakest column",
    "Next, the survey scores real systems against these six components. I redrew their table here. Dark blue means full support, light blue partial, and an x means absent. You can see the families. Full-stack harnesses like Claude Code, OpenHands and AIOS cover almost everything. Frameworks like LangChain, LangGraph and LlamaIndex give you building blocks, but lifecycle hooks and evaluation are mostly left to you. Capability modules like MemGPT, Voyager and Reflexion go deep on one thing, usually state or memory. Multi-agent frameworks like MetaGPT and AutoGen nail the loop but are partial elsewhere. Evaluation infrastructure like HAL and OSWorld is, unsurprisingly, strong on V. The big pattern is that V, the evaluation interface, is the weakest column. The paper says it's partial or missing in 14 of 22 systems, and most production harnesses only give you flat logs.");
  fitImage(s, "04_completeness_matrix.png", 0.973, 0.6, 1.35, 5.6, 5.55, "Completeness matrix");
  card(s, 6.7, 1.6, 6.0, 1.45, "Full-stack harnesses cover nearly everything", "Claude Code, OpenClaw, Hermes, AIOS, OpenHands");
  card(s, 6.7, 3.2, 6.0, 1.45, "Frameworks and modules cover a slice", "LangChain/LangGraph leave L and V to you; MemGPT and Reflexion focus on S");
  card(s, 6.7, 4.8, 6.0, 1.45, "Evaluation (V) is the gap", "Partial or absent in 14 of 22 systems; most production harnesses only offer flat logs", { headColor: C.accent4 });
}

// ---------- 8. Gains ----------
{
  const s = content("Evidence: hold the model fixed, change the harness",
    "Here's the evidence in one chart. In both cases the model is fixed and only the harness changes. The Grok jump is the most dramatic, but it's a vendor report, and the paper itself gives two slightly different after numbers, 68.3 and 70.8. The LangChain result is more modest and more believable: 52.8 to 66.5 on Terminal-Bench 2.0. On the right are a few more data points. Meta-Harness, which automatically searches over harness designs, reached 76.4 percent on Terminal-Bench 2 and gained 4.7 points on math reasoning. SWE-agent's custom agent-computer interface resolved 10.7 percent more SWE-bench Lite tasks than a plain shell with the same GPT-4 Turbo model. And HAL cut evaluation time from weeks to hours just by standardizing the harness.");
  fitImage(s, "03_harness_only_gains.png", 2.316, 0.6, 1.5, 7.6, 4.6, "Harness only gains chart");
  bullets(s, [
    "Meta-Harness (automated harness search): 76.4% on Terminal-Bench 2, +4.7 pts on math",
    "SWE-agent's interface: +10.7% SWE-bench Lite vs plain shell, same GPT-4 Turbo",
    "HAL: standard harness cut evaluation from weeks to hours (~$40K, 9 models × 9 benchmarks)",
  ], 8.5, 1.7, 4.2, 4.6, 15);
}

// ---------- 9. Ablations ----------
{
  const s = content("Ablations: more harness isn't automatically better",
    "This slide is the ablation story, and I think it's important. Not every harness addition helps. In one study cited by the evaluation survey, adding a verifier moved resolution from 73.0 to 73.2 percent, basically nothing. Adding a multi-candidate search module actually dropped it to 71.4. Li and colleagues report that rewriting tool descriptions reduced the accuracy drop by about 29 percent when the agent had more than 150 tools to choose from. And the main survey's challenges section points out that removing tools can sometimes help more than adding them. So every component has a cost in tokens, latency and confusion. Good harness engineering is about choosing what to include, not stacking everything on.");
  stat(s, 0.6, 1.7, 3.8, "73.0 → 73.2%", "adding a verifier: almost no change", C.accent2);
  stat(s, 4.75, 1.7, 3.8, "73.0 → 71.4%", "adding multi-candidate search: worse", C.accent5);
  stat(s, 8.9, 1.7, 3.8, "−29%", "less accuracy drop after rewriting tool descriptions (150+ tools)", C.accent3);
  card(s, 0.6, 4.4, 12.1, 1.7, "Lesson", "Every component costs tokens, latency and attention. Removing tools can help more than adding them. Measure each piece, one at a time.", { headSize: 20, bodySize: 16 });
}

// ---------- 10. Challenges ----------
{
  const s = content("Nine open challenges (and they're coupled)",
    "The main survey lists nine challenge areas. Sandboxing and security, including memory poisoning and tools that are safe alone but dangerous combined. Evaluation, where environments drift and tasks are ambiguous. Protocol standardization, with MCP for tools and A2A for agent-to-agent. Runtime context management, because attention gets diluted as the window fills up. Knowledge and context engineering. Tool-use governance. Memory architecture. Planning-loop governance. And multi-agent coordination. Their key point is that these are coupled. Your context manager interacts with your hooks, and your state store interacts with your tools. You can't really tune one piece in isolation, which is also why the ablation results on the last slide are so mixed.");
  const ch = ["Sandboxing & security", "Evaluation & benchmarking", "Protocols (MCP, A2A)", "Runtime context management", "Knowledge & context engineering", "Tool-use governance", "Memory architecture", "Planning-loop governance", "Multi-agent coordination"];
  ch.forEach((t, i) => {
    const x = 0.6 + (i % 3) * 4.07, y = 1.55 + Math.floor(i / 3) * 1.55;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: 3.87, h: 1.35, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "challenge " + (i + 1) });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.25, y: y + 0.38, w: 0.6, h: 0.6, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "num " + (i + 1) });
    s.addText(String(i + 1), { x: x + 0.25, y: y + 0.38, w: 0.6, h: 0.6, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText(t, { x: x + 1.05, y: y + 0.15, w: 2.65, h: 1.05, fontSize: 16, bold: true, color: C.text1, valign: "middle", isTextBox: true, margin: 0 });
  });
  s.addText("Couplings like C↔L and S↔T mean you can't tune one component in isolation.", { x: 0.6, y: 6.25, w: 12.1, h: 0.45, fontSize: 15, italic: true, color: C.accent1, isTextBox: true, margin: 0 });
}

// ---------- 11. Sandbox ----------
{
  const s = content("A concrete trade-off: sandboxing tools",
    "Sandboxing is a good concrete example of these trade-offs. The survey compares isolation options by startup latency and memory overhead. A bare process starts in about 10 milliseconds with no extra memory, but gives you almost no isolation. WebAssembly is also fast and light but limited in what it can run. Docker takes about a second and 10 to 50 megabytes. gVisor gives strong isolation but takes around 2 seconds and 50 to 100 megabytes. Firecracker microVMs sit in a sweet spot at about 125 milliseconds and 5 to 15 megabytes, which is why you see them in production agent platforms. The survey also mentions practitioner setups like Stripe's: dev boxes spin up in under 10 seconds, and the agent gets at most two CI rounds before a human is pulled in. That second rule is a lifecycle hook written straight into the workflow.");
  fitImage(s, "05_sandbox_tradeoff.png", 1.569, 0.6, 1.4, 7.6, 5.3, "Sandbox tradeoff chart");
  bullets(s, [
    "Process: ~10 ms, no isolation",
    "Firecracker microVM: ~125 ms, +5–15 MB, the common sweet spot",
    "gVisor: ~2 s, +50–100 MB, strongest here",
    "Stripe: dev box in <10 s, max 2 CI rounds before a human steps in (an L rule)",
  ], 8.6, 1.7, 4.1, 4.8, 15);
}

// ---------- 12. Code as harness ----------
section("Companion surveys");
{
  const s = content("Companion 1: code is the harness",
    "Now the companion surveys. Ning and colleagues take a sharper position: code isn't just one tool among many, it's becoming the material the whole harness is built from. They organize this in three layers. At the bottom is the interface. Code is used to reason, like writing a program instead of doing math in free text; to act, like calling APIs and running commands; and as a world model, since tests and simulators are executable descriptions of what correct means. In the middle are mechanisms: planning, memory, tool use and feedback loops, often as plan, execute, verify, where the result of running code drives the next step. At the top is scaling: multiple agents coordinating through shared code artifacts like repositories, tests and reviews, much like human engineering teams. The reason this is appealing is that code is executable, inspectable and stateful. You can run it, read it and diff it, which natural-language reasoning doesn't give you for free.");
  fitImage(s, "08_code_as_harness_layers.png", 2.152, 0.6, 1.4, 12.1, 4.4, "Code as harness layers");
  s.addText("Why code: it's executable, inspectable and stateful. You can run it, read it and diff it.", { x: 0.6, y: 6.15, w: 12.1, h: 0.5, fontSize: 17, italic: true, color: C.accent1, isTextBox: true, margin: 0 });
}

// ---------- 13. Coevolution ----------
{
  const s = content("Companion 2: will models eat the harness?",
    "Li, Wu and Chang add a time dimension, and I think it's the most interesting idea across the four papers. The boundary between model and harness moves in both directions. Things the harness used to do get trained into the model: function calling and context handling started as harness tricks and are now native model features. And better models change what the harness should focus on. Their prediction is that capability-bearing support, the stuff that helps the model do the task, keeps migrating into the weights. Constraint-bearing support, like permissions, verification and audit, stays outside. They also frame harness design as a multi-objective trade-off across reliability, cost and latency, autonomy, safety and long-horizon continuity. You can't maximize reliability under tight cost and latency limits.");
  fitImage(s, "09_model_harness_coevolution.png", 2.305, 0.6, 1.4, 12.1, 4.4, "Model harness coevolution diagram");
  s.addText("Prediction: capabilities move into the weights; governance (permissions, verification, audit) stays in the harness.", { x: 0.6, y: 6.1, w: 12.1, h: 0.6, fontSize: 16, italic: true, color: C.accent1, isTextBox: true, margin: 0 });
}

// ---------- 14. Eval framework ----------
{
  const s = content("Companion 3: a score belongs to a configuration",
    "The last companion is about evaluation. If the harness matters this much, a leaderboard row that only names a model is misleading. Radwan, Vasilakos and Raza break any agent result into four factors: the model, the harness, the environment, and the evaluator, meaning what counts as success. All of that is measured under a protocol: the task split, the budget, how many rollouts per task, how results are aggregated, and whether any feedback was used while tuning. Their main recommendation is to change one factor at a time. If you change several at once, call it a configuration-level result rather than claiming a model is better.");
  fitImage(s, "06_eval_four_factor.png", 2.225, 0.6, 1.4, 12.1, 5.3, "Four factor evaluation framework");
}

// ---------- 15. Eval numbers ----------
{
  const s = content("Why it matters: leaderboards can mislead",
    "Here are three numbers from that survey that changed how I read leaderboards. First, 7.8 percent of SWE-bench Verified patches that were accepted actually failed the full developer test suite. The evaluator was too lenient. Second, on AgentRewardBench, rule-based judging underestimated success by up to 18.5 percent and changed the model rankings. Third, on tau-bench, an agent can pass over 60 percent of tasks on a single try but under 25 percent when it has to succeed eight times in a row, which is the pass-hat-eight metric. So reliability and one-shot capability are really different things.");
  stat(s, 0.6, 1.7, 3.8, "7.8%", "of accepted SWE-bench Verified patches failed the full developer test suite", C.accent5);
  stat(s, 4.75, 1.7, 3.8, "18.5%", "max underestimate from rule-based judging on AgentRewardBench; rankings changed", C.accent4);
  stat(s, 8.9, 1.7, 3.8, ">60% vs <25%", "τ-bench: pass@1 vs pass^8 (succeed 8 times in a row)", C.accent2, 36);
  card(s, 0.6, 4.4, 12.1, 1.75, "Their reporting checklist (short version)", "Disclose the full configuration · sweep one factor at a time · report cost and confidence intervals · keep harness search separate from final eval · separate “model refused” from “harness blocked”", { headSize: 18, bodySize: 15 });
}

// ---------- 16. Corpus chart (native) ----------
{
  const s = content("What eval papers actually vary",
    "They also looked at what the 110 papers they reviewed actually vary. Model factors show up in 65 works. The evaluator in 36, the protocol in 27. Inside the harness, planning and execution show up in 26, context and memory in 24, tool interfaces in 22. Verification and recovery, the part that catches mistakes, shows up in only 7. So as a field we study the piece that's easiest to swap, the model, and mostly ignore the piece that catches errors. That lines up with the main survey's finding that the evaluation interface is the weakest component in real systems.");
  const labels = ["Model factors", "Evaluator", "Protocol", "Planning & execution", "Context & memory", "Tool interfaces", "Verification & recovery"];
  const vals = [65, 36, 27, 26, 24, 22, 7];
  s.addChart(pres.charts.BAR, [{ name: "Works (of 110)", labels: labels.slice().reverse(), values: vals.slice().reverse() }], {
    x: 0.6, y: 1.4, w: 8.0, h: 5.3, barDir: "bar",
    chartColors: ["2A78D6"], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: "1B1F2B",
    catAxisLabelColor: "4A4F5E", valAxisLabelColor: "4A4F5E", catAxisLabelFontSize: 13, valAxisLabelFontSize: 11,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt",
    valGridLine: { color: "E6E5E0", size: 0.75 }, catGridLine: { style: "none" }, showLegend: false,
    showTitle: true, title: "Works (of 110) that study each factor", titleFontSize: 14, titleColor: "1B1F2B", titleFontFace: "+mn-lt",
    barGapWidthPct: 60, objectName: "Corpus coverage chart",
  });
  card(s, 9.0, 1.6, 3.7, 2.2, "65 vs 7", "Model factors are studied 9× more often than verification and recovery.", { headSize: 26 });
  card(s, 9.0, 4.0, 3.7, 2.2, "Same story twice", "Matches the main survey: V (evaluation) is the weakest component in real systems.");
}

// ---------- 17. Two cents ----------
section("Wrap-up");
{
  const s = content("My two cents",
    "Here's my own take. First, this matches what I've seen in practice. Coming from distributed systems, a lot of it reads like the agent version of things backend engineers already do: retries and timeouts, API contracts, caches, persistence, middleware and observability. The real value of the survey is giving researchers and infra engineers a shared vocabulary. Second, evaluation is the real gap. Two of these papers point at it from different angles, and if I were picking a project in this space it would be agent-native observability: tracing, replay, and diffs between runs. Third, be careful with the headline numbers. The 10x SWE-bench jump is a vendor report, the main survey is a non-peer-reviewed preprint, and it has small inconsistencies, like 22 versus 23 systems and two different after numbers for Grok. The six-component split is proposed, not empirically validated, and the authors say so. Fourth, the coevolution idea is the one to watch. Harness tricks that help capability will probably get absorbed into models. Governance won't, because you don't want the thing being governed to also be the governor.");
  const pts = [
    ["Familiar to backend engineers", "Retries, API contracts, caches, middleware, observability: same ideas, new runtime. The win is a shared vocabulary."],
    ["Evaluation is the real gap", "Two surveys point at it. I'd build agent-native observability: tracing, replay, run diffs."],
    ["Read the numbers carefully", "Vendor reports, an unreviewed preprint, small inconsistencies. Strong direction, thin controls."],
    ["Governance stays outside", "Capability tricks get trained into models. Permissions, approvals and audit won't."],
  ];
  pts.forEach((p, i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.55 + Math.floor(i / 2) * 2.55;
    card(s, x, y, 5.95, 2.3, p[0], p[1], { headSize: 20, bodySize: 15 });
  });
}

// ---------- 18. TL;DR ----------
{
  const s = pres.addSlide({ masterName: "DARK", sectionTitle });
  s.addText("TL;DR", { x: 0.8, y: 0.6, w: 11.5, h: 0.9, fontSize: 40, bold: true, color: C.background1, isTextBox: true, margin: 0 });
  const items = [
    "Agent = model + harness. The harness can move results as much as a model upgrade.",
    "Meng et al.: H = (E, T, C, S, L, V); most systems are weakest on evaluation (V).",
    "Ning et al.: code is becoming the substrate the harness is built from.",
    "Li et al.: capabilities migrate into models; governance stays in the harness.",
    "Radwan et al.: a benchmark score describes a whole configuration. Report it that way.",
  ];
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1 } })),
    { x: 0.8, y: 1.8, w: 11.7, h: 4.6, fontSize: 20, color: "E8E6F5", paraSpaceAfter: 14, valign: "top", isTextBox: true, margin: 0 });
  s.addNotes("To wrap up. An agent is a model plus a harness, and the harness can move results as much as a model upgrade. Meng and colleagues give us the cleanest taxonomy, the six components E, T, C, S, L and V, and show that most real systems are weakest on evaluation. Ning and colleagues argue that code is becoming the material the harness is built from. Li and colleagues predict that capabilities will keep migrating into models while governance stays in the harness. And Radwan and colleagues remind us that a benchmark score describes a whole configuration, so we should report it that way. Thanks for watching. The Medium article, slides and figures are all linked in my GitHub repo.");
}

// ---------- 19. References ----------
{
  const s = content("References",
    "These are the four papers I covered. All the figures in the deck are my own redrawings based on these papers. Links to the Medium article, SlideShare and the GitHub repo are in the README.");
  const refs = [
    "Q. Meng, Y. Wang, L. Chen, et al. Agent Harness for Large Language Model Agents: A Survey. arXiv:2605.29682, 2026. Catalog: github.com/Gloriaameng/Awesome-Agent-Harness",
    "X. Ning, K. Tieu, D. Fu, et al. Code as Agent Harness. arXiv:2605.18747, 2026.",
    "J. Li, Y. Wu, Y. Chang. Harness Engineering for LLM Agents: A Survey of Harness Component Taxonomy, Evaluation, and Model–Harness Coevolution. Preprints.org 202606.2203, 2026.",
    "A. Y. Radwan, A. V. Vasilakos, S. Raza. Harness-Aware Evaluation of LLM Agents: Systems, Benchmarks, and Protocols. Preprints.org 202609.2140, 2026.",
  ];
  s.addText(refs.map((t, i) => ({ text: t, options: { bullet: { type: "number" }, breakLine: i < refs.length - 1 } })),
    { x: 0.6, y: 1.6, w: 12.1, h: 4.4, fontSize: 16, color: C.text1, paraSpaceAfter: 14, valign: "top", isTextBox: true, margin: 0 });
  s.addText("All figures are my own redrawings based on these papers.", { x: 0.6, y: 6.2, w: 12.1, h: 0.4, fontSize: 13, italic: true, color: C.text2, isTextBox: true, margin: 0 });
}

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await pres.writeFile({ fileName: OUT });
  if (applyTheme) await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
