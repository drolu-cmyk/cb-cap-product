---
name: cb-cap-video
description: Make or revise the CB-CAP product story video and its social cuts (video/ folder). Use for any change to the script, voice, captions, scenes, sound, funder framing or posting checklist for CB-CAP or SozoRock Foundation videos.
---

# CB-CAP video

The source is `video/`: `script.json` (lines and timing), `story.html` (scenes), `tools/` (voice, render). `./build.sh` renders 1920x1080 and 1080x1920.

## Story spine
Hook (2 s) → five barriers as moments → reframe → scale fact → "Counties are rebuilding for the age of AI. Public health can't be left out." → promise → product (drop-off, barriers, privacy, sources) → AI beat → funder keywords → benefit → ask → "Care. For Every Zip Code".

## Words
- Plain words, one idea per line, 12 words or fewer. `tools/voice.py` blocks longer lines and banned words.
- Banned: leverage, empower, seamless, solution, transform, cutting-edge, robust, holistic, synergy, unlock, rank, score, grade, index, forecast, predict, partner, client, diagnose, allocate, free (until the Foundation approves it). Also avoid generic words such as "proof".
- No state names. No technology or platform names. Named sources only on screen (for example NACCHO).
- Promise: "CB-CAP shows where care breaks, so you know what to fix first."
- Foundation sign-off: "Care. For Every Zip Code" (as given by the user).

## AI, said plainly
AI writes the first draft. It never sees private data. It never makes up numbers. A person checks every word. Numbers are counted, not generated.

## Funder keywords
Health equity, rural health, health access, wait times, transportation, language access, health literacy, workforce capacity, public health data, privacy, responsible AI. See `video/FUNDERS.md`; verify any figure before quoting it.

## Style
Creator-style, after Riley Brown and Shawn Kanungo: hook in 2 seconds, one bold reframe, show the product working, fast cuts, big captions that highlight each word as it is spoken, small zoom-ins, a real person on camera when available (`video/HOST-SHOTS.md`). Look: white ground, ink #0a1b2b, one blue #1f4fd8 (#7ea3ff on ink), Newsreader and Source Sans 3. No gradients, no generic AI imagery.

## Honesty
- Figures are illustrative: keep the "Illustrative figures" tag on data screens and the line on the end card. Never say "Sample County" publicly.
- Never present invented data as real. Never imply a county or partner relationship that does not exist.

## Music and look
- Music: original score from `tools/score.py` on VSCO-2-CE samples (CC0). No library tracks with unclear licenses.
- Cinematic: letterbox in the dark opening, light grain, slow push-ins, words come into focus as spoken. Keep the white ground clean.
- Say "AI" as one word in voice scripts. "A I" with a space is read as "uh-eye".

## Voice and sound licensing
- Final voice and sound effects must be cleared for commercial use. The ElevenLabs Free tier is not; it needs a paid plan.
- Free options: Kokoro (Apache-2.0, runs locally, used for scratch). Chatterbox (Resemble AI, reportedly MIT) needs huggingface.co allowed in the environment's network settings; confirm its license on the model card.

## Before posting
Maven signs off the copy. The Foundation approves the call to action and the partner link. Someone checks every figure against its source. The voice and sound licenses are cleared.
