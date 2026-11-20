# It's Not Just the Model: Agent Harness Engineering

A short story on **agent harness engineering**, the code around an LLM (loop, tools, context, state, hooks, evaluation) that turns it into a working agent. It's based on one main survey and three companion surveys from May–Sep 2026.

## Links

| Deliverable | Link |
|---|---|
| Medium article | https://medium.com/@keerthanapm257/the-model-was-never-the-whole-agent-reading-the-agent-harness-survey-c83feb2a2618 |
| SlideShare deck | _add link_ |
| Video (15+ min) | _add link_ |

## Papers covered

| # | Paper | Authors | Where / When | Role |
|---|---|---|---|---|
| 1 | Agent Harness for Large Language Model Agents: A Survey | Meng, Wang, Chen, et al. | arXiv:2605.29682 · May 2026 | **Main paper.** H = (E, T, C, S, L, V) taxonomy |
| 2 | Code as Agent Harness | Ning et al. (UIUC, Meta, Stanford) | arXiv:2605.18747 · May 2026 | Code as the substrate of the harness |
| 3 | Harness Engineering for LLM Agents: A Survey of Harness Component Taxonomy, Evaluation, and Model–Harness Coevolution | Li, Wu, Chang | Preprints.org 202606.2203 · Jun 2026 | Model–harness coevolution |
| 4 | Harness-Aware Evaluation of LLM Agents: Systems, Benchmarks, and Protocols | Radwan, Vasilakos, Raza | Preprints.org 202609.2140 · Sep 2026 | Four-factor evaluation framework |

## Summary

**Main taxonomy (Meng et al.).** A harness is six components around the model:

| | Component | Job | Failure if missing |
|---|---|---|---|
| E | Execution loop | observe → think → act, stop, retry | execution runaway |
| T | Tool registry | typed tool catalog, routing (MCP) | tool misuse |
| C | Context manager | what enters the window | context blowout |
| S | State store | persist state, recover | state loss |
| L | Lifecycle hooks | auth, policy, audit, approvals | unmonitored side effects |
| V | Evaluation interface | standard trajectory records | unobservable behavior |

**Key techniques and results on leaderboards (same model, harness changed):**
- SWE-bench: Grok Code Fast 1, 6.7% → 68.3% from an edit-tool format change (vendor report)
- Terminal-Bench 2.0: LangChain DeepAgents, 52.8% → 66.5% from prompts + middleware
- Meta-Harness (automated harness search): 76.4% on Terminal-Bench 2
- SWE-agent's agent-computer interface: +10.7% on SWE-bench Lite vs plain shell
- Holistic Agent Leaderboard: 21,730 rollouts; a standard harness cut eval from weeks to hours

**Ablations:** a verifier added almost nothing (73.0 → 73.2%), multi-candidate search hurt (→ 71.4%), and rewriting tool descriptions cut accuracy loss by ~29% with 150+ tools.

**Companion ideas:**
- *Code as harness:* three layers (interface → mechanisms → multi-agent scaling)
- *Coevolution:* capability support migrates into model weights; governance stays in the harness
- *Evaluation:* a score = Model + Harness + Environment + Evaluator under a Protocol. Examples: 7.8% of accepted SWE-bench Verified patches fail full tests; τ-bench pass@1 >60% vs pass^8 <25%

## Repo structure

```
├── README.md
├── article/
│   └── medium_article.md       # Medium article (written from scratch)
├── slides/
│   ├── agent_harness_engineering.pptx
│   ├── agent_harness_engineering.pdf
│   └── video_script.md         # speaker notes for the 15+ min recording
├── images/                     # all figures (my own redrawings)
├── scripts/
│   ├── make_figures.py         # regenerates images/
│   └── build_deck.js           # regenerates the slide deck
└── video/                      # recorded presentation
```

## Reproduce figures and slides

```bash
pip install matplotlib
python3 scripts/make_figures.py

npm install pptxgenjs
node scripts/build_deck.js
```

## References

1. Q. Meng, Y. Wang, L. Chen, et al. *Agent Harness for Large Language Model Agents: A Survey.* arXiv:2605.29682, 2026. https://arxiv.org/abs/2605.29682
2. X. Ning, K. Tieu, D. Fu, et al. *Code as Agent Harness.* arXiv:2605.18747, 2026. https://arxiv.org/abs/2605.18747
3. J. Li, Y. Wu, Y. Chang. *Harness Engineering for LLM Agents.* Preprints.org, 2026. https://www.preprints.org/manuscript/202606.2203
4. A. Y. Radwan, A. V. Vasilakos, S. Raza. *Harness-Aware Evaluation of LLM Agents.* Preprints.org, 2026. https://www.preprints.org/manuscript/202609.2140
