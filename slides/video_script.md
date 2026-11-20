# Video Script (10–15+ min)

Read these over the slides while recording. About 150 words per minute.

Total: about 2434 words, roughly 16 minutes at a normal pace. Pause on the charts to stay above 15 minutes.

## Slide 1: It's Not Just the Model

Hi everyone, I'm Keerthana. For my short story assignment I picked a topic that's been getting a lot of attention this year: agent harness engineering. The one-line idea is that when you build an LLM agent, the model is only part of the story. The code that wraps the model, which these papers call the harness, decides a lot about whether the agent actually works. I'm going to walk through one main survey paper and three companion surveys, all published between May and September 2026. I'll cover the main taxonomy, the evidence and ablation-style results they lean on, how they think about evaluation, and at the end I'll share my own take on what's convincing and what isn't.

## Slide 2: Same model, different wrapper, very different result

Let me start with the number that got me interested. xAI reported that one of their coding models, Grok Code Fast 1, went from about 6.7 percent on SWE-bench to about 68 percent. They didn't retrain it. They changed the format of the tool the agent uses to edit files. That's a vendor report, so I treat the exact number carefully. But there's a second, more independent example. LangChain took the same coding model on Terminal-Bench 2.0 and went from 52.8 to 66.5 percent by changing only prompts and middleware. That's about a 26 percent relative jump, and it moved them from around 30th to the top 5. And the Holistic Agent Leaderboard ran over 21,000 rollouts and found that standardizing the evaluation harness removed a lot of bugs. So some of what older papers called model failures may actually have been harness failures. That's the motivation for this whole line of work.

## Slide 3: Four surveys, one idea

Here are the four papers. The main one is Meng and colleagues, Agent Harness for Large Language Model Agents: A Survey, on arXiv in May 2026. It gives the formal definition and the six-part taxonomy I'll spend most of the time on. The second is Code as Agent Harness by Ning and 41 co-authors from UIUC, Meta and Stanford. It argues code is becoming the material the whole harness is built from. The third, by Li, Wu and Chang, looks at how the harness and the model co-evolve over time, meaning which jobs move into the model and which stay outside. And the fourth, by Radwan, Vasilakos and Raza, is about evaluation: if the harness matters this much, then a benchmark score describes a whole configuration, not just a model. Together they cover architecture, evidence, the future, and measurement.

## Slide 4: From prompt engineering to harness engineering

Meng and colleagues tell the history as three shifts. Around 2022 and 2023 it was prompt engineering: you cared about one good answer, so chain-of-thought, few-shot examples and templates. In 2024 and 2025 the focus moved to context engineering: agents ran for many steps, so the question became what goes into the context window, through retrieval, memory and summarizing old turns. Now, in 2025 and 2026, it's harness engineering. Agents run for hours, touch real systems, and need to be audited, so the problem is the whole runtime. They also show the idea has older roots: software test harnesses like JUnit from the 90s, reinforcement-learning environment APIs, and early agent frameworks like AutoGPT, which gave us a long list of failure modes. I appreciate that the authors are upfront that none of the pieces is new. The contribution is treating the harness as one object you can study.

## Slide 5: The taxonomy: H = (E, T, C, S, L, V)

This is the core of the main paper. A harness is a tuple of six components wrapped around the model. E is the execution loop: observe, think, act, and decide when to stop or retry. T is the tool registry: a typed, validated catalog of tools, and this is where protocols like MCP live. C is the context manager, which decides what goes into the window. S is the state store, which persists task state and memory and lets you recover after a crash. L is lifecycle hooks: code that runs before and after each action for auth, policy, audit and human approval. And V is the evaluation interface, which records trajectories and success signals in a standard format. The paper says E and T are the minimum, since without a loop there's no multi-step behavior and without tools the agent can't do anything. The other four are what make it production-grade. One subtle point: L controls what happens, while V records what happened.

## Slide 6: Each component guards against a failure mode

The paper ties each component to the failure you get when it's missing or weak. A weak loop gives you execution runaway: the agent loops forever and burns budget. A weak tool registry gives you tool misuse, like wrong arguments or the wrong tool. A weak context manager gives you context blowout, where the window fills with junk and the model loses track. A weak state store gives you state loss, so a crash means starting over. Missing hooks mean unmonitored side effects, things that happen in the real world that nobody approved. And missing evaluation means unobservable behavior: you can't tell why it failed. The paper also says how much of each you need depends on the task. A single-turn Q and A bot barely needs more than E, T and C. A software-engineering agent or a multi-agent system needs basically all six. Coming from backend work, this maps almost one to one onto retries, API contracts, caching, persistence, middleware and observability.

## Slide 7: Grading real systems: V is the weakest column

Next, the survey scores real systems against these six components. I redrew their table here. Dark blue means full support, light blue partial, and an x means absent. You can see the families. Full-stack harnesses like Claude Code, OpenHands and AIOS cover almost everything. Frameworks like LangChain, LangGraph and LlamaIndex give you building blocks, but lifecycle hooks and evaluation are mostly left to you. Capability modules like MemGPT, Voyager and Reflexion go deep on one thing, usually state or memory. Multi-agent frameworks like MetaGPT and AutoGen nail the loop but are partial elsewhere. Evaluation infrastructure like HAL and OSWorld is, unsurprisingly, strong on V. The big pattern is that V, the evaluation interface, is the weakest column. The paper says it's partial or missing in 14 of 22 systems, and most production harnesses only give you flat logs.

## Slide 8: Evidence: hold the model fixed, change the harness

Here's the evidence in one chart. In both cases the model is fixed and only the harness changes. The Grok jump is the most dramatic, but it's a vendor report, and the paper itself gives two slightly different after numbers, 68.3 and 70.8. The LangChain result is more modest and more believable: 52.8 to 66.5 on Terminal-Bench 2.0. On the right are a few more data points. Meta-Harness, which automatically searches over harness designs, reached 76.4 percent on Terminal-Bench 2 and gained 4.7 points on math reasoning. SWE-agent's custom agent-computer interface resolved 10.7 percent more SWE-bench Lite tasks than a plain shell with the same GPT-4 Turbo model. And HAL cut evaluation time from weeks to hours just by standardizing the harness.

## Slide 9: Ablations: more harness isn't automatically better

This slide is the ablation story, and I think it's important. Not every harness addition helps. In one study cited by the evaluation survey, adding a verifier moved resolution from 73.0 to 73.2 percent, basically nothing. Adding a multi-candidate search module actually dropped it to 71.4. Li and colleagues report that rewriting tool descriptions reduced the accuracy drop by about 29 percent when the agent had more than 150 tools to choose from. And the main survey's challenges section points out that removing tools can sometimes help more than adding them. So every component has a cost in tokens, latency and confusion. Good harness engineering is about choosing what to include, not stacking everything on.

## Slide 10: Nine open challenges (and they're coupled)

The main survey lists nine challenge areas. Sandboxing and security, including memory poisoning and tools that are safe alone but dangerous combined. Evaluation, where environments drift and tasks are ambiguous. Protocol standardization, with MCP for tools and A2A for agent-to-agent. Runtime context management, because attention gets diluted as the window fills up. Knowledge and context engineering. Tool-use governance. Memory architecture. Planning-loop governance. And multi-agent coordination. Their key point is that these are coupled. Your context manager interacts with your hooks, and your state store interacts with your tools. You can't really tune one piece in isolation, which is also why the ablation results on the last slide are so mixed.

## Slide 11: A concrete trade-off: sandboxing tools

Sandboxing is a good concrete example of these trade-offs. The survey compares isolation options by startup latency and memory overhead. A bare process starts in about 10 milliseconds with no extra memory, but gives you almost no isolation. WebAssembly is also fast and light but limited in what it can run. Docker takes about a second and 10 to 50 megabytes. gVisor gives strong isolation but takes around 2 seconds and 50 to 100 megabytes. Firecracker microVMs sit in a sweet spot at about 125 milliseconds and 5 to 15 megabytes, which is why you see them in production agent platforms. The survey also mentions practitioner setups like Stripe's: dev boxes spin up in under 10 seconds, and the agent gets at most two CI rounds before a human is pulled in. That second rule is a lifecycle hook written straight into the workflow.

## Slide 12: Companion 1: code is the harness

Now the companion surveys. Ning and colleagues take a sharper position: code isn't just one tool among many, it's becoming the material the whole harness is built from. They organize this in three layers. At the bottom is the interface. Code is used to reason, like writing a program instead of doing math in free text; to act, like calling APIs and running commands; and as a world model, since tests and simulators are executable descriptions of what correct means. In the middle are mechanisms: planning, memory, tool use and feedback loops, often as plan, execute, verify, where the result of running code drives the next step. At the top is scaling: multiple agents coordinating through shared code artifacts like repositories, tests and reviews, much like human engineering teams. The reason this is appealing is that code is executable, inspectable and stateful. You can run it, read it and diff it, which natural-language reasoning doesn't give you for free.

## Slide 13: Companion 2: will models eat the harness?

Li, Wu and Chang add a time dimension, and I think it's the most interesting idea across the four papers. The boundary between model and harness moves in both directions. Things the harness used to do get trained into the model: function calling and context handling started as harness tricks and are now native model features. And better models change what the harness should focus on. Their prediction is that capability-bearing support, the stuff that helps the model do the task, keeps migrating into the weights. Constraint-bearing support, like permissions, verification and audit, stays outside. They also frame harness design as a multi-objective trade-off across reliability, cost and latency, autonomy, safety and long-horizon continuity. You can't maximize reliability under tight cost and latency limits.

## Slide 14: Companion 3: a score belongs to a configuration

The last companion is about evaluation. If the harness matters this much, a leaderboard row that only names a model is misleading. Radwan, Vasilakos and Raza break any agent result into four factors: the model, the harness, the environment, and the evaluator, meaning what counts as success. All of that is measured under a protocol: the task split, the budget, how many rollouts per task, how results are aggregated, and whether any feedback was used while tuning. Their main recommendation is to change one factor at a time. If you change several at once, call it a configuration-level result rather than claiming a model is better.

## Slide 15: Why it matters: leaderboards can mislead

Here are three numbers from that survey that changed how I read leaderboards. First, 7.8 percent of SWE-bench Verified patches that were accepted actually failed the full developer test suite. The evaluator was too lenient. Second, on AgentRewardBench, rule-based judging underestimated success by up to 18.5 percent and changed the model rankings. Third, on tau-bench, an agent can pass over 60 percent of tasks on a single try but under 25 percent when it has to succeed eight times in a row, which is the pass-hat-eight metric. So reliability and one-shot capability are really different things.

## Slide 16: What eval papers actually vary

They also looked at what the 110 papers they reviewed actually vary. Model factors show up in 65 works. The evaluator in 36, the protocol in 27. Inside the harness, planning and execution show up in 26, context and memory in 24, tool interfaces in 22. Verification and recovery, the part that catches mistakes, shows up in only 7. So as a field we study the piece that's easiest to swap, the model, and mostly ignore the piece that catches errors. That lines up with the main survey's finding that the evaluation interface is the weakest component in real systems.

## Slide 17: My two cents

Here's my own take. First, this matches what I've seen in practice. Coming from distributed systems, a lot of it reads like the agent version of things backend engineers already do: retries and timeouts, API contracts, caches, persistence, middleware and observability. The real value of the survey is giving researchers and infra engineers a shared vocabulary. Second, evaluation is the real gap. Two of these papers point at it from different angles, and if I were picking a project in this space it would be agent-native observability: tracing, replay, and diffs between runs. Third, be careful with the headline numbers. The 10x SWE-bench jump is a vendor report, the main survey is a non-peer-reviewed preprint, and it has small inconsistencies, like 22 versus 23 systems and two different after numbers for Grok. The six-component split is proposed, not empirically validated, and the authors say so. Fourth, the coevolution idea is the one to watch. Harness tricks that help capability will probably get absorbed into models. Governance won't, because you don't want the thing being governed to also be the governor.

## Slide 18: TL;DR

To wrap up. An agent is a model plus a harness, and the harness can move results as much as a model upgrade. Meng and colleagues give us the cleanest taxonomy, the six components E, T, C, S, L and V, and show that most real systems are weakest on evaluation. Ning and colleagues argue that code is becoming the material the harness is built from. Li and colleagues predict that capabilities will keep migrating into models while governance stays in the harness. And Radwan and colleagues remind us that a benchmark score describes a whole configuration, so we should report it that way. Thanks for watching. The Medium article, slides and figures are all linked in my GitHub repo.

## Slide 19: References

These are the four papers I covered. All the figures in the deck are my own redrawings based on these papers. Links to the Medium article, SlideShare and the GitHub repo are in the README.
