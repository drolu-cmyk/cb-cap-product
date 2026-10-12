# CB-CAP product story video

A 70-second story video for all stakeholders and social posts. It comes in two formats from one source.

| File | Use |
|---|---|
| `out/cb-cap-story.mp4` | 1920×1080, for YouTube, LinkedIn, websites and presentations |
| `out/cb-cap-story-vertical.mp4` | 1080×1920, for Reels, Shorts and TikTok. Text stays clear of the platforms' top and bottom buttons. |
| `out/cb-cap-story.srt` | Caption file to upload alongside the video |
| `out/cb-cap-story-transcript.txt` | Plain transcript |
| `script.json` | Voiceover lines and scene timing. **The source of truth.** |
| `story.html` | Animated scenes. Add `?format=vertical` for the vertical version, `&t=40` for a single moment. |

Captions are burned in, because most social viewers watch with the sound off.

## Story

| Time | Beat | Voiceover |
|---|---|---|
| 0:00 | Hook | Picture a county where 612 residents were referred for help. / 256 of them never got there. |
| 0:08 | Why it matters | Most local health departments serve fewer than 50,000 people. |
| 0:13 | Tension | Their directors are asked to prove what the community needs. / But yearly numbers show need, not where people get stuck. / So every year, the case starts over from a pile of spreadsheets. |
| 0:25 | Promise | CB-CAP. Know where care breaks. Show the proof. |
| 0:29 | Proof | See where residents drop off, by kind of help, area and season. |
| 0:35 | Proof | Small counts stay hidden, so no one can be identified. |
| 0:41 | Proof | Every figure carries its source, its year and its range. |
| 0:46 | Proof | Your plan becomes your yearly report. / A person approves every word. |
| 0:52 | Benefit | Walk into the budget meeting with proof, not a pile of spreadsheets. |
| 0:57 | Reasons to believe | Sources shown. Nobody identifiable. People decide. |
| 1:02 | Call to action | Want this for your county? Talk to the SozoRock Foundation. |

## Rules applied

- No "Sample County" or "fictional" anywhere public-facing.
  - The voiceover frames the opening as a hypothetical ("Picture a county").
  - The app header says "Your county".
  - A small "Illustrative figures" tag appears on the screens that show data, and the end card says the same.
  - The brief requires invented data to be labeled. Health officials will check this, so unlabeled made-up numbers would cost credibility.
- The one real-world figure is sourced on screen:
  - NACCHO, *2022 National Profile of Local Health Departments*: 62% of the 2,512 departments studied serve fewer than 50,000 people.
  - Confirm the figure against the report before publishing.
- `tools/voice.py` stops the build on any line over twelve words, or any banned word from the brief or `docs/product/00-LOCKED-COPY.md`.
- No "free", no state names, no technology or platform names. The optional Ask feature is not shown.

## Before posting publicly

1. **Copy freeze (Maven):** this follows the brief's naming and promise, not `00-LOCKED-COPY.md`.
2. **Foundation approval** of the call to action and `sozorockfoundation.org/partner`.
3. **Check the NACCHO figure** against the source PDF.

## Voice, fonts, licenses

- **Voice:** Kokoro-82M, voice `af_heart`, run locally. The model and voices are Apache 2.0, so there is no cost and no account. It is a synthetic voice.
- **Music:** a quiet chord bed synthesized in `tools/voice.py` that dips under the voice. There are no samples, so there's nothing to license. Set `"music": false` in `script.json` to turn it off.
- **Fonts:** Newsreader and Source Sans 3, under the SIL Open Font License (`assets/fonts/OFL.txt`).

## Build

```
pip install kokoro-onnx soundfile        # in a virtualenv
# Download kokoro-v1.0.onnx and voices-v1.0.bin from
# github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
KOKORO_DIR=/path/to/models PYTHON=/path/to/venv/python ./build.sh
```

The build needs Node with Playwright, plus ffmpeg.
Edit `script.json`, then rebuild: the scene timing follows the voice automatically.
Use `node tools/render.cjs --vertical` for the vertical cut, and `--stills 12,40` to render review stills.
