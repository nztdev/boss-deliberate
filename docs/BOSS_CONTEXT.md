# deliberate — Agent Session Brief
**Repo:** https://github.com/nztdev/boss-deliberate
**Parent engine:** https://github.com/nztdev/boss-kernel (engine/engine.js)
**Current phase:** Phase 2 — Deliberation Layer PWA
**Live URL:** https://nztdev.github.io/boss-deliberate/app

> Read this file before touching any code.
> Update phase and task sections at the start of each new session.

---

## What deliberate is

A standalone PWA that exposes the B.O.S.S. deliberation engine directly to
end users. Users ask questions; the engine consults multiple AI models in
parallel, measures agreement, and returns a filtered answer with a
confidence score and optional transparency trace.

This is NOT the B.O.S.S. kernel. There are no nodes, no canvas, no
force-directed graph. The engine is the entire product here.

---

## Repository structure

```
boss-deliberate/
├── app/
│   ├── index.html      ← PWA interface (single file, all logic inline)
│   ├── sw.js           ← Service worker
│   └── manifest.json   ← PWA manifest
├── engine/
│   └── engine.js       ← Deliberation engine (copy from boss-kernel)
├── docs/
│   └── BOSS_CONTEXT.md ← This file
├── .gitignore
├── LICENSE
└── README.md
```

---

## Engine architectural locks (must not be modified)

These apply to `engine/engine.js`. Any change to these requires
explicit approval from the project maintainer.

```
1. LLMNode.score(): standingWave = resonance × matchGate × (1 + 0.3·sin)
   where matchGate = Math.max(match, 0.15)
   This is the engine version — different from the BOSS kernel's formula.
   The matchGate prevents pool construction order from dominating routing.

2. savePool() returns a JSON string — it does NOT touch localStorage.
   loadPool(serialised, keys) accepts a JSON string — it does NOT read localStorage.
   The application layer (index.html) handles storage. engine.js is storage-agnostic.

3. deliberate() is async and returns a DelibeResult — never throws.
   Errors are returned in result.error, not thrown.

4. DISSONANCE_AGREE = 0.35 (calibrated — do not change without re-running test suite)
   DISSONANCE_WARN  = 0.60 (calibrated — do not change without re-running test suite)

5. Gemini model string: 'gemini-2.5-flash' (confirmed working 2026-04-05)
   Groq model string: 'llama-3.1-8b-instant'
   Mistral: 'mistralai/Mistral-7B-Instruct-v0.3' via HuggingFace Inference API
```

---

## Validated specialty strings (engine/engine.js buildDefaultPool)

These were calibrated across 4 test rounds. Do not change without
re-running the Phase 1 test suite.

```
Groq:    fast factual retrieval summarisation concise answer general knowledge lookup quick response data fact
Gemini:  reasoning analysis explain science ethics philosophy context synthesis creative writing nuanced understanding deep explanation
Mistral: code generation technical explanation structured output logical reasoning european languages
```

---

## App architecture (app/index.html)

Single HTML file. ES module import of `../engine/engine.js`.
No external JS dependencies. No build step required.

**Key functions:**
- `runDeliberate()` — main pipeline, calls `deliberate()` from engine
- `renderOutput(result)` — populates the output card from a DelibeResult
- `toggleTransparency()` — shows/hides the deliberation trace panel
- `saveSettings()` / `loadKeys()` — localStorage key management
- `rebuildPool()` — reconstructs pool from saved state + current keys

**localStorage keys:**
- `DELIBERATE_KEYS` — `{ groq, gemini, hf }` API keys
- `DELIBERATE_POOL` — serialised pool state (warmth, resonance, bonds)
  stored as the JSON string returned by `savePool(pool)`

**API keys are never logged, never sent anywhere except their respective APIs.**

---

## Regression patterns to watch for

| Pattern | Why wrong |
|---------|-----------|
| `localStorage` calls inside engine.js | Engine must be storage-agnostic |
| `standingWave = resonance * (1 + 0.3 * phase)` without matchGate | Reverts pool-order dominance fix |
| `gemini-1.5-flash` or `gemini-1.5-flash-latest` | Use `gemini-2.5-flash` |
| `throw` inside `deliberate()` | Must return error in result object |
| Hardcoded API keys anywhere | Keys must come from user localStorage |
| DOM manipulation in engine.js | Engine has no DOM dependencies |

---

## GitHub Pages deployment

Deployed from `main` branch, `/app` folder.
URL: `https://nztdev.github.io/boss-deliberate/app`

The `manifest.json` start_url and scope are set to `/boss-deliberate/app/`.
Do not change these without updating the manifest.

---

## Current session task

[Update this section before each Antigravity session]

**Phase 2.5 — User testing and specialty string refinement**

After deploying the PWA, collect real usage data:
1. What intents are users sending?
2. Which model wins most often — is Groq still dominant?
3. Are there intent types where the birth signal fires (no good match)?
4. What does the 429 quota error rate look like in real usage?

Do not modify engine.js during this phase. Report observations only.
Bring results to Claude for interpretation and any necessary changes.
