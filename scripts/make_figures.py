"""Generate all figures for the article and slides. Run: python3 scripts/make_figures.py"""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from matplotlib import font_manager

OUT = os.path.join(os.path.dirname(__file__), "..", "images")
os.makedirs(OUT, exist_ok=True)

for f in font_manager.findSystemFonts():
    if "Inter" in f:
        font_manager.fontManager.addfont(f)
plt.rcParams.update({
    "font.family": "Inter", "font.size": 13,
    "axes.edgecolor": "#c9c8c2", "axes.labelcolor": "#52514e",
    "xtick.color": "#52514e", "ytick.color": "#52514e",
    "axes.spines.top": False, "axes.spines.right": False,
    "figure.facecolor": "#fcfcfb", "axes.facecolor": "#fcfcfb",
    "savefig.facecolor": "#fcfcfb",
})

INK, INK2, MUTED = "#0b0b0b", "#52514e", "#8a8984"
BLUE, ORANGE, AQUA, YELLOW, MAGENTA, GREEN, VIOLET, RED = (
    "#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948")
GRID = "#e6e5e0"


def save(fig, name):
    fig.savefig(os.path.join(OUT, name), dpi=200, bbox_inches="tight", pad_inches=0.3)
    plt.close(fig)


def box(ax, x, y, w, h, text, fc, ec=None, tc=INK, fs=13, weight="normal", r=0.02):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0,rounding_size={r}",
                                fc=fc, ec=ec or fc, lw=1.5))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", color=tc,
            fontsize=fs, weight=weight, wrap=True)


def arrow(ax, a, b, color=MUTED, style="-|>", lw=1.6, rad=0.0):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle=style, mutation_scale=16, color=color,
                                 lw=lw, connectionstyle=f"arc3,rad={rad}"))


def tint(hexc, a=0.16):
    h = hexc.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    bg = (252, 252, 251)
    return "#%02x%02x%02x" % tuple(int(bg[i] + (c - bg[i]) * a) for i, c in enumerate((r, g, b)))


# 1. Six-component harness architecture
def fig_harness():
    fig, ax = plt.subplots(figsize=(12, 7))
    ax.set_xlim(0, 12); ax.set_ylim(0, 7); ax.axis("off")
    ax.add_patch(FancyBboxPatch((0.4, 0.4), 11.2, 5.6, boxstyle="round,pad=0,rounding_size=0.25",
                                fc="#f3f2ee", ec="#c9c8c2", lw=1.5, ls="--"))
    ax.text(0.7, 5.7, "Agent harness  H = (E, T, C, S, L, V)", fontsize=15, weight="bold", color=INK)
    box(ax, 4.6, 2.6, 2.8, 1.4, "LLM\n(the model)", INK, tc="white", fs=16, weight="bold", r=0.15)
    comps = [
        ("E  Execution loop", "observe → think → act,\nstop rules, retries", BLUE, (0.8, 3.9)),
        ("T  Tool registry", "typed tool catalog,\nvalidation, routing (MCP)", ORANGE, (0.8, 2.3)),
        ("C  Context manager", "what goes into the window:\ncompaction, retrieval", AQUA, (0.8, 0.7)),
        ("S  State store", "task state, memory,\ncheckpoints, recovery", VIOLET, (8.2, 3.9)),
        ("L  Lifecycle hooks", "pre/post hooks: auth,\npolicy, audit, approvals", RED, (8.2, 2.3)),
        ("V  Evaluation interface", "trajectories + success\nsignals in a standard schema", GREEN, (8.2, 0.7)),
    ]
    for title, sub, c, (x, y) in comps:
        ax.add_patch(FancyBboxPatch((x, y), 3.0, 1.3, boxstyle="round,pad=0,rounding_size=0.12",
                                    fc=tint(c), ec=c, lw=2))
        ax.text(x + 0.15, y + 1.0, title, fontsize=13, weight="bold", color=INK, va="center")
        ax.text(x + 0.15, y + 0.45, sub, fontsize=10.5, color=INK2, va="center")
        if x < 4:
            arrow(ax, (x + 3.0, y + 0.65), (4.6, 3.3), color=c)
        else:
            arrow(ax, (x, y + 0.65), (7.4, 3.3), color=c)
    ax.text(6, 6.55, "Same model, different harness → very different agent", ha="center",
            fontsize=13, color=INK2, style="italic")
    save(fig, "01_harness_six_components.png")


# 2. Evolution: prompt -> context -> harness engineering
def fig_evolution():
    fig, ax = plt.subplots(figsize=(12, 4.2))
    ax.set_xlim(0, 12); ax.set_ylim(0, 4.2); ax.axis("off")
    stages = [
        ("Prompt engineering", "2022–23", "Get one good answer:\nCoT, few-shot, templates", BLUE),
        ("Context engineering", "2024–25", "Fill the window right:\nRAG, memory, compaction", AQUA),
        ("Harness engineering", "2025–26", "Run the whole agent:\nloop, tools, state, hooks, evals", VIOLET),
    ]
    for i, (t, yrs, d, c) in enumerate(stages):
        x = 0.3 + i * 4.0
        ax.add_patch(FancyBboxPatch((x, 0.6), 3.4, 2.8, boxstyle="round,pad=0,rounding_size=0.15",
                                    fc=tint(c), ec=c, lw=2))
        ax.text(x + 1.7, 3.0, t, ha="center", fontsize=15, weight="bold", color=INK)
        ax.text(x + 1.7, 2.5, yrs, ha="center", fontsize=12, color=INK2)
        ax.text(x + 1.7, 1.4, d, ha="center", va="center", fontsize=12, color=INK)
        if i < 2:
            arrow(ax, (x + 3.45, 2.0), (x + 3.95, 2.0), color=INK2, lw=2)
    ax.text(6, 0.15, "Older lineages it borrows from: 1990s test harnesses (JUnit) · RL environment APIs · early agent frameworks (AutoGPT, ReAct)",
            ha="center", fontsize=10.5, color=MUTED)
    save(fig, "02_evolution.png")


# 3. Harness-only gains (same model, harness changed)
def fig_gains():
    fig, ax = plt.subplots(figsize=(11, 5.2))
    rows = [
        ("Grok Code Fast 1 · SWE-bench\n(edit-tool format change, vendor report)", 6.7, 68.3),
        ("LangChain DeepAgents · Terminal-Bench 2.0\n(prompts + middleware only)", 52.8, 66.5),
    ]
    ys = [1, 0]
    for y, (lab, a, b) in zip(ys, rows):
        ax.plot([a, b], [y, y], color=GRID, lw=6, solid_capstyle="round", zorder=1)
        ax.scatter([a], [y], s=160, color=MUTED, zorder=3, edgecolor="#fcfcfb", lw=2)
        ax.scatter([b], [y], s=160, color=BLUE, zorder=3, edgecolor="#fcfcfb", lw=2)
        ax.text(a, y + 0.17, f"{a:.1f}%", ha="center", fontsize=12, color=INK2)
        ax.text(b, y + 0.17, f"{b:.1f}%", ha="center", fontsize=12, color=INK, weight="bold")
    ax.set_yticks(ys); ax.set_yticklabels([r[0] for r in rows], fontsize=11.5)
    ax.set_xlim(0, 80); ax.set_ylim(-0.6, 1.6)
    ax.set_xlabel("Task success (%)")
    ax.grid(axis="x", color=GRID, lw=0.8); ax.set_axisbelow(True)
    ax.spines["left"].set_visible(False); ax.tick_params(axis="y", length=0)
    ax.scatter([], [], s=80, color=MUTED, label="before (old harness)")
    ax.scatter([], [], s=80, color=BLUE, label="after (new harness)")
    ax.legend(loc="lower right", frameon=False, fontsize=11)
    ax.set_title("Same model, only the harness changed", loc="left", fontsize=15, weight="bold", color=INK)
    save(fig, "03_harness_only_gains.png")


# 4. Completeness matrix (Meng et al. Table 4)
def fig_matrix():
    data = [
        ("Full-stack", "Claude Code", "FFFFFP"), ("Full-stack", "OpenClaw/PRISM", "FFFFFF"),
        ("Full-stack", "Hermes", "FFFFFP"), ("Full-stack", "AIOS", "FFFFFP"),
        ("Full-stack", "OpenHands", "FFFFFP"),
        ("Multi-agent", "MetaGPT", "FFPPPP"), ("Multi-agent", "AutoGen", "FFPPPP"),
        ("Multi-agent", "ChatDev", "FPPPPP"), ("Multi-agent", "CAMEL", "FPPPAP"),
        ("Multi-agent", "DeerFlow", "FFPPPP"), ("Multi-agent", "DeepAgents", "FFPPPP"),
        ("Framework", "LangChain", "FFFPPA"), ("Framework", "LangGraph", "FPPPAA"),
        ("Framework", "LlamaIndex", "PFFPAA"), ("Specialized", "SWE-agent", "FFFPPF"),
        ("Capability module", "MemGPT", "AAFFAA"), ("Capability module", "Voyager", "FFPFAP"),
        ("Capability module", "Reflexion", "PAPFAP"), ("Capability module", "Generative Agents", "FAPFAP"),
        ("Capability module", "Concordia", "FAPFAP"),
        ("Eval infra", "HAL", "FFPPPF"), ("Eval infra", "AgentBench", "FPPPAF"),
        ("Eval infra", "OSWorld", "FPPPAF"),
    ]
    cmap = {"F": BLUE, "P": tint(BLUE, 0.35), "A": "#fcfcfb"}
    fig, ax = plt.subplots(figsize=(9, 11))
    cols = ["E", "T", "C", "S", "L", "V"]
    n = len(data)
    for i, (fam, name, row) in enumerate(data):
        y = n - 1 - i
        for j, ch in enumerate(row):
            ax.add_patch(plt.Rectangle((j + 0.04, y + 0.06), 0.92, 0.88, fc=cmap[ch],
                                       ec="#c9c8c2" if ch == "A" else cmap[ch], lw=1))
            if ch == "A":
                ax.text(j + 0.5, y + 0.5, "×", ha="center", va="center", color=MUTED, fontsize=11)
        ax.text(-0.15, y + 0.5, name, ha="right", va="center", fontsize=11, color=INK)
        ax.text(6.2, y + 0.5, fam, ha="left", va="center", fontsize=9.5, color=MUTED)
    for j, c in enumerate(cols):
        ax.text(j + 0.5, n + 0.3, c, ha="center", fontsize=13, weight="bold", color=INK)
    ax.set_xlim(-3.2, 8.4); ax.set_ylim(-1.4, n + 1.2); ax.axis("off")
    for k, (lab, ch) in enumerate([("full", "F"), ("partial", "P"), ("absent", "A")]):
        x = 0.2 + k * 2.0
        ax.add_patch(plt.Rectangle((x, -1.2), 0.5, 0.5, fc=cmap[ch], ec="#c9c8c2"))
        ax.text(x + 0.65, -0.95, lab, va="center", fontsize=11, color=INK2)
    ax.set_title("Which harness components each system covers\n(adapted from Meng et al., Table 4)",
                 fontsize=14, weight="bold", color=INK, loc="left", x=-0.25)
    save(fig, "04_completeness_matrix.png")


# 5. Sandbox isolation trade-off
def fig_sandbox():
    pts = [("Process only", 10, 0), ("WebAssembly", 10, 3), ("MicroVM\n(Firecracker)", 125, 10),
           ("Docker / OCI", 1000, 30), ("gVisor", 2000, 75)]
    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.set_xscale("log")
    for name, lat, mem in pts:
        ax.scatter(lat, mem, s=140, color=BLUE, edgecolor="#fcfcfb", lw=2, zorder=3)
        off = {"WebAssembly": (10, 10), "Process only": (10, -16)}.get(name, (10, 6))
        ax.annotate(name, (lat, mem), textcoords="offset points", xytext=off, fontsize=11.5, color=INK)
    ax.set_xlabel("Startup latency (ms, log scale)")
    ax.set_ylabel("Extra memory (MB, midpoint)")
    ax.set_xlim(5, 6000); ax.set_ylim(-8, 95)
    ax.grid(color=GRID, lw=0.8); ax.set_axisbelow(True)
    ax.text(6, 85, "isolation gets stronger →  (roughly) top-right", fontsize=10.5, color=MUTED)
    ax.set_title("Sandboxing the T component: speed vs isolation cost", loc="left",
                 fontsize=15, weight="bold", color=INK)
    save(fig, "05_sandbox_tradeoff.png")


# 6. Four-factor evaluation framework (Radwan et al.)
def fig_eval():
    fig, ax = plt.subplots(figsize=(12, 5))
    ax.set_xlim(0, 12); ax.set_ylim(0, 5); ax.axis("off")
    items = [("M", "Model", "checkpoint, context,\ndecoding", BLUE),
             ("H", "Harness", "memory, tools, control\nflow, verification", VIOLET),
             ("E", "Environment", "tasks, tools,\nexternal state", AQUA),
             ("V", "Evaluator", "what counts\nas success", ORANGE)]
    for i, (k, t, d, c) in enumerate(items):
        x = 0.3 + i * 2.55
        ax.add_patch(FancyBboxPatch((x, 2.3), 2.2, 2.2, boxstyle="round,pad=0,rounding_size=0.15",
                                    fc=tint(c), ec=c, lw=2))
        ax.text(x + 1.1, 3.95, f"{k}  ·  {t}", ha="center", fontsize=13.5, weight="bold", color=INK)
        ax.text(x + 1.1, 3.0, d, ha="center", va="center", fontsize=11, color=INK2)
        if i < 3:
            ax.text(x + 2.37, 3.4, "+", ha="center", va="center", fontsize=20, color=INK2)
    ax.text(10.6, 3.4, "=", ha="center", va="center", fontsize=24, color=INK2)
    ax.add_patch(FancyBboxPatch((10.9, 2.7), 1.0, 1.4, boxstyle="round,pad=0,rounding_size=0.12",
                                fc=INK, ec=INK))
    ax.text(11.4, 3.4, "score", ha="center", va="center", fontsize=12, color="white", weight="bold")
    ax.add_patch(FancyBboxPatch((0.3, 0.4), 11.6, 1.3, boxstyle="round,pad=0,rounding_size=0.12",
                                fc="#f3f2ee", ec="#c9c8c2", lw=1.2, ls="--"))
    ax.text(6.1, 1.25, "P · Protocol = (task split, budget, rollouts per task, aggregation rule, feedback used in selection)",
            ha="center", fontsize=12, color=INK, weight="bold")
    ax.text(6.1, 0.75, "Measured under the protocol. Change one factor at a time, or call it a configuration-level result.",
            ha="center", fontsize=11, color=INK2)
    save(fig, "06_eval_four_factor.png")


# 7. What the harness-aware evaluation survey's corpus measures
def fig_corpus():
    rows = [("Model factors", 65), ("Evaluator", 36), ("Protocol", 27), ("Planning & execution", 26),
            ("Context & memory", 24), ("Tool interfaces", 22), ("Verification & recovery", 7)]
    fig, ax = plt.subplots(figsize=(10, 5))
    names = [r[0] for r in rows][::-1]; vals = [r[1] for r in rows][::-1]
    colors = [ORANGE if n.startswith("Verification") else BLUE for n in names]
    ax.barh(names, vals, color=colors, height=0.6)
    for y, v in enumerate(vals):
        ax.text(v + 1, y, str(v), va="center", fontsize=11.5, color=INK)
    ax.set_xlabel("Number of works (out of 110) that study it")
    ax.spines["left"].set_visible(False); ax.tick_params(axis="y", length=0)
    ax.grid(axis="x", color=GRID, lw=0.8); ax.set_axisbelow(True)
    ax.set_title("What agent-eval papers actually vary (Radwan et al., 2026)", loc="left",
                 fontsize=15, weight="bold", color=INK)
    save(fig, "07_eval_corpus_coverage.png")


# 8. Code as agent harness - 3 layers (Ning et al.)
def fig_code_layers():
    fig, ax = plt.subplots(figsize=(12, 5.2))
    ax.set_xlim(0, 12); ax.set_ylim(0, 5.2); ax.axis("off")
    layers = [
        ("3 · Scaling the harness", "multi-agent coordination, review and verification over shared code artifacts", VIOLET),
        ("2 · Harness mechanisms", "planning, memory, tool use, feedback-driven control (plan → execute → verify)", AQUA),
        ("1 · Harness interface", "code for reasoning, code for acting, code as a world model (tests, simulators)", BLUE),
    ]
    for i, (t, d, c) in enumerate(layers):
        y = 3.6 - i * 1.5
        ax.add_patch(FancyBboxPatch((0.4, y), 11.2, 1.25, boxstyle="round,pad=0,rounding_size=0.12",
                                    fc=tint(c), ec=c, lw=2))
        ax.text(0.7, y + 0.82, t, fontsize=14, weight="bold", color=INK)
        ax.text(0.7, y + 0.35, d, fontsize=12, color=INK2)
    save(fig, "08_code_as_harness_layers.png")


# 9. Model-harness coevolution
def fig_coevolution():
    fig, ax = plt.subplots(figsize=(12, 4.8))
    ax.set_xlim(0, 12); ax.set_ylim(0, 4.8); ax.axis("off")
    ax.add_patch(FancyBboxPatch((0.4, 0.6), 4.6, 3.6, boxstyle="round,pad=0,rounding_size=0.15",
                                fc=tint(BLUE), ec=BLUE, lw=2))
    ax.text(2.7, 3.7, "Model weights", ha="center", fontsize=15, weight="bold", color=INK)
    ax.text(2.7, 2.2, "function calling\ncontext handling\nlong-horizon skills\n(capability-bearing)",
            ha="center", va="center", fontsize=12, color=INK2)
    ax.add_patch(FancyBboxPatch((7.0, 0.6), 4.6, 3.6, boxstyle="round,pad=0,rounding_size=0.15",
                                fc=tint(VIOLET), ec=VIOLET, lw=2))
    ax.text(9.3, 3.7, "Harness", ha="center", fontsize=15, weight="bold", color=INK)
    ax.text(9.3, 2.2, "permissions\nverification\naudit & approvals\n(constraint-bearing)",
            ha="center", va="center", fontsize=12, color=INK2)
    arrow(ax, (7.0, 3.0), (5.0, 3.0), color=BLUE, lw=2.2)
    ax.text(6.0, 3.25, "trajectories get\ntrained in", ha="center", fontsize=10.5, color=INK2)
    arrow(ax, (5.0, 1.6), (7.0, 1.6), color=VIOLET, lw=2.2)
    ax.text(6.0, 1.0, "better models\nreshape the harness", ha="center", fontsize=10.5, color=INK2)
    save(fig, "09_model_harness_coevolution.png")


if __name__ == "__main__":
    for f in (fig_harness, fig_evolution, fig_gains, fig_matrix, fig_sandbox, fig_eval,
              fig_corpus, fig_code_layers, fig_coevolution):
        f()
    print("done:", sorted(os.listdir(OUT)))
