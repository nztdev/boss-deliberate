# deliberate

> Ask once, filter many.

**deliberate** is a multi-model AI deliberation tool. It sends your question to multiple AI models simultaneously, measures how much they agree, and surfaces the most reliable answer — along with the full deliberation trace if you want to see it.

---

## Why deliberate?

Any single AI model can confidently produce a wrong answer. When multiple independent models agree, that convergence is meaningful signal. When they disagree strongly, you should know about it — not receive one model's answer presented as fact.

deliberate makes the deliberation visible and gives you a confidence score grounded in actual model agreement, not marketing.

---

## How it works

1. You ask a question
2. Two Tier 1 models (Groq, Gemini) respond in parallel
3. The engine measures semantic distance between their answers
4. If they agree → synthesised answer returned immediately
5. If they disagree → a Tier 2 tiebreaker (Mistral) is consulted
6. The winning answer is presented with a confidence score
7. A transparency panel shows exactly what each model said

The routing, scoring, and dissonance detection all use the **B.O.S.S. deliberation engine** — the same engine that powers the [B.O.S.S. kernel](https://github.com/nztdev/boss-kernel).

---

## Getting started

**Live PWA:** [nztdev.github.io/boss-deliberate/app](https://nztdev.github.io/boss-deliberate/app)

No install required. Open in any browser and add your API keys under "configure models".

**API keys needed (all free tier):**

| Model | Provider | Key format | Free tier link |
|-------|----------|-----------|----------------|
| Groq Llama 3.1 | Groq | `gsk_…` | [console.groq.com](https://console.groq.com) |
| Gemini 2.5 Flash | Google AI Studio | `AIza…` | [aistudio.google.com](https://aistudio.google.com) |
| Mistral 7B | HuggingFace | `hf_…` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |

Keys are stored in your browser only. They are never sent anywhere except directly to the respective API.

---

## Repository structure

```
boss-deliberate/
├── app/
│   ├── index.html      ← PWA interface
│   ├── sw.js           ← Service worker (offline shell)
│   └── manifest.json   ← PWA manifest
├── engine/
│   └── engine.js       ← B.O.S.S. deliberation engine (shared)
├── docs/
│   └── BOSS_CONTEXT.md ← Agent session brief
├── .gitignore
├── LICENSE
└── README.md
```

---

## Running locally

```bash
git clone https://github.com/nztdev/boss-deliberate
cd boss-deliberate/app
python3 -m http.server 8080
# open http://localhost:8080
```

Requires a local server (not `file://`) for ES module imports to work.

---

## Roadmap

- [ ] Conversation history (ask follow-up questions)
- [ ] Voice input via Web Speech API
- [ ] Export deliberation trace as Markdown
- [ ] Native app wrapper (iOS/Android via Capacitor)
- [ ] More models in the pool (Claude, Llama local via Ollama)

---

## Part of B.O.S.S.

deliberate is the standalone deployment of the deliberation layer component of [B.O.S.S.](https://github.com/nztdev/boss-kernel) — a biological operating system that routes AI intent through resonance physics rather than static rules.

---

MIT License · [nztdev](https://github.com/nztdev)
