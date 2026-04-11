# deliberate — Agent Session Brief (BOSS_CONTEXT.md)
**Repo:** https://github.com/nztdev/boss-deliberate
**Live URL:** https://nztdev.github.io/boss-deliberate
**Current phase:** Phase 2 — PWA user testing
**Engine version:** 0.1.0 (validated)

> Read this file fully before doing anything.
> Do not modify any files during testing sessions unless explicitly instructed.
> Bring all results back to Claude for review before any next steps.

---

## What deliberate is

A standalone PWA that exposes the B.O.S.S. deliberation engine to end users.
Users ask questions. The engine consults multiple AI models in parallel,
measures semantic agreement between their responses, and returns a filtered
answer with a confidence score and a transparency trace.

There is no BOSS kernel, no canvas, no nodes. The engine is the entire product.

---

## Repository structure

```
boss-deliberate/
├── index.html          ← PWA interface (root deployment)
├── sw.js               ← Service worker
├── manifest.json       ← PWA manifest
├── engine/
│   └── engine.js       ← Deliberation engine (shared with boss-kernel)
├── docs/
│   └── BOSS_CONTEXT.md ← This file
├── .gitignore
├── LICENSE
└── README.md
```

GitHub Pages deploys from root `/` on `main` branch.
The engine import in `index.html` is `./engine/engine.js` — not `../engine/engine.js`.

---

## Engine state (validated v4 + post-Phase-1 fixes)

**Model pool:**
- Tier 1A: Groq Llama 3.1 (`llama-3.1-8b-instant`) — fast, factual retrieval
- Tier 1B: Gemini Flash (`gemini-2.5-flash`) — reasoning, explanation, creative
- Tier 2:  Qwen 2.5 7B via HuggingFace router (`Qwen/Qwen2.5-7B-Instruct:together`)

**HuggingFace endpoint:** `router.huggingface.co/v1/chat/completions`
(NOT the old `api-inference.huggingface.co` endpoint — that is deprecated)

**Calibrated thresholds:**
- `DISSONANCE_AGREE = 0.35` — below this, T1 models agree, early exit
- `DISSONANCE_WARN  = 0.60` — above this, T2 tiebreaker invoked

**Specialty strings (calibrated over 4 test rounds):**
```
Groq:    fast factual retrieval summarisation concise answer general knowledge lookup quick response data fact
Gemini:  reasoning analysis explain science ethics philosophy context synthesis creative writing nuanced understanding deep explanation
Qwen:    code generation technical explanation structured output logical reasoning multilingual analysis
```

**Key engine fixes applied:**
- `matchGate = Math.max(match, 0.15)` in `LLMNode.score()` — prevents pool
  construction order dominating over semantic match on low-match intents
- `measureDissonance()` has subsumption check — if one response (<=60 chars)
  is contained within the other, dissonance = 0 (handles "Paris." vs
  "The capital of France is Paris." correctly)
- `DISSONANCE_AGREE` and `DISSONANCE_WARN` are named exports (not just in
  default export) — required for index.html import to work

---

## Application state (index.html)

**Three localStorage keys:**
- `DELIBERATE_KEYS` — `{ groq, gemini, hf }` API keys (never in engine.js)
- `DELIBERATE_POOL` — serialised pool state (warmth, resonance, bonds)
- `DELIBERATE_CUSTOM_MODELS` — user-added custom model definitions

**UI features:**
- Settings modal (configure models button + api keys footer link)
- Three default model key fields + custom model section (add/remove)
- Progress stages shown during deliberation
- Output card with confidence bar (green >70%, amber 40-70%, red <40%)
- Contradiction/warning banner when models disagree
- Transparency panel with two views:
  - List view (default): model rows with response preview, latency, role badge
  - Field view: SVG node diagram — resonant nodes with edges coloured by
    agreement level, score rings, dissonance label in centre

**Field view layout:**
- 1 node: centred
- 2 nodes: side by side horizontally (cx +/- 110)
- 3 nodes: equilateral triangle (r=88, cy shifted +15 for label room)
- ViewBox: 580 x 280
- Node colours: winner=#4a9eff, tiebreaker=#f59e0b, overruled=#4a5270, failed=#f87171
- Edge colour: green (<0.35), amber (<0.60), red (>=0.60), dashed if overruled/failed

---

## Regression patterns — never introduce these

| Pattern | Why wrong |
|---------|-----------|
| `from '../engine/engine.js'` in index.html | Wrong path — root deployment needs `./engine/engine.js` |
| `localStorage` calls inside engine.js | Engine must be storage-agnostic |
| `const DISSONANCE_AGREE` without `export` | Named import in index.html will fail |
| `api-inference.huggingface.co` endpoint | Deprecated — use `router.huggingface.co/v1` |
| `gemini-1.5-flash` or `gemini-1.5-flash-latest` | Use `gemini-2.5-flash` |
| `standingWave = resonance * (1 + 0.3 * phase)` without matchGate | Reverts pool-order dominance |
| Hardcoded API keys | Keys must come from user localStorage only |

---

## Phase 2 session task — PWA baseline functionality testing

**Objective:** Run the full test suite (steps 3-8). Record results and
observations. Do not modify any files. Report everything back to Claude.

**Setup before testing:**
1. Open https://nztdev.github.io/boss-deliberate in Chrome
2. DevTools -> Application -> Storage -> Clear site data
3. Hard refresh (Ctrl+Shift+R)
4. Confirm zero console errors
5. Open "configure models", enter all three API keys, save
6. Confirm all three model pills show in header

---

### Step 3 — Baseline functionality (8 questions)

For each question record:
- Did it respond (Y/N)
- Confidence % shown
- Which model led
- T2 invoked (Y/N)
- Transparency list view renders correctly (Y/N)
- Transparency field view renders correctly (Y/N)
- Any errors

| # | Question | Expected |
|---|----------|----------|
| 1 | What is the capital of Japan | High confidence, fast, Groq likely |
| 2 | Explain how a black hole forms | Gemini leads, moderate-high confidence |
| 3 | Write a short poem about the ocean | Gemini leads, T2 may fire |
| 4 | What is 144 divided by 12 | High confidence, fast |
| 5 | What are the ethical implications of autonomous weapons | Lower confidence, T2 likely |
| 6 | Write a Python function that reverses a string | Groq likely |
| 7 | Summarise the causes of World War One in three sentences | Groq likely |
| 8 | zorp the frambulator | Returns something, no crash |

---

### Step 4 — Transparency panel verification

After any successful result, open both views and verify:

List view:
- Both T1 model names correct
- Response previews visible and readable
- Latency shown in seconds
- Role badges correct (led answer / consulted / tiebreaker / failed)
- Disagreement bar has fill and numeric value

Field view:
- Nodes render without overflow
- Winner node has stronger stroke/glow
- Edge colour matches agreement (green/amber/red)
- Centre label shows dissonance value and agreed/partial/conflict
- Role labels visible below each node

---

### Step 5 — Error state verification

Test A: Delete all keys, save, ask a question.
Expected: settings modal opens automatically, no crash.

Test B: Enter wrong Gemini key (AIzaXXXXXXXX), save, ask question.
Expected: red error card mentioning 403 and AI Studio key.
Restore correct key after.

Test C: Keep only Groq key, delete others, ask question.
Expected: works, 60% confidence, one model row in transparency.

---

### Step 6 — Mobile test

Open on a mobile device and verify:
- Layout not broken on small screen
- Textarea and button usable with touch keyboard
- Settings modal scrollable
- Field view SVG renders correctly (not clipped or overflowing)
- Add to Home Screen works
- After installing, launches in standalone mode

---

### Step 7 — HuggingFace/Qwen specific test

Ask: Is it ever ethically justified to lie to protect someone's feelings

Observe:
- Does Qwen respond or fail?
- If it fails, exact error message from transparency panel
- Approximate latency for Qwen response if it succeeds

---

### Step 8 — Overall impression (subjective)

Answer these:
- Does the product feel usable to someone unfamiliar with deliberation/dissonance?
- Is the "how it works" explainer sufficient for a non-technical user?
- Is the confidence score intuitive?
- Does the field view add value or feel decorative?
- What is the single most confusing thing about the current experience?

---

## After testing

Bring all results to Claude (claude.ai) for review.
Do not proceed to any next steps independently.
Do not modify any files.
