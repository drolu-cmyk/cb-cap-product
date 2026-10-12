# CB-CAP product story video

An 84-second story video for all stakeholders: county health departments, the Foundation, funders and partners.
It is 1920×1080 at 30 fps, with a voiceover and burned-in captions.
Sample County is fictional, and every figure shown is illustrative.

| File | What it is |
|---|---|
| `out/cb-cap-story.mp4` | The video |
| `out/cb-cap-story.srt` | Caption file for players that support captions |
| `out/cb-cap-story-transcript.txt` | Plain transcript |
| `script.json` | Voiceover lines and scene timing. **The source of truth.** |
| `story.html` | Animated scenes. Open it with `?t=40` to see a single moment. |
| `tools/voice.py` | Copy check, voiceover, timeline, captions |
| `tools/render.cjs` | Renders each frame and encodes the MP4 |

## Story (P&G order)

| Time | Beat | Voiceover |
|---|---|---|
| 0:00 | Who | In a small county, the health department is a few people. / They answer for every number in the yearly report. |
| 0:08 | Frustration | I know what my community needs. / Proving it means digging through reports and spreadsheets. / And every year, I start over. |
| 0:17 | Insight | Here is what the yearly numbers usually miss. / Residents look for help. Many get referred. / Far fewer complete the step. / Somewhere on the way, care breaks. |
| 0:28 | Promise | Know where care breaks. Show the proof. |
| 0:32 | Proof: Overview | See where residents get stuck, by kind of help, area and season. |
| 0:39 | Proof: Barriers | See which barriers come up most often. |
| 0:43 | Proof: Areas | Small counts are hidden, so no one can be identified. |
| 0:49 | Proof: Evidence | Every figure names its source, its year and its range. / Missing stays missing. It never becomes a zero. |
| 0:57 | Proof: Plan | Each action in your plan links to its evidence. |
| 1:02 | Proof: Report | Your yearly report starts from your plan, not a blank page. / Every draft waits for a person to approve it. |
| 1:10 | Reasons to believe | Sources shown. Nobody identifiable. People decide. |
| 1:16 | Call to action | Want this for your county? Talk to the SozoRock Foundation. |

## Copy rules applied

- The brief's story and promise are used: "Know where care breaks. Show the proof."
- `tools/voice.py` stops the build if any line is over twelve words or uses a banned word from the brief or from `docs/product/00-LOCKED-COPY.md` (including rank, score, grade and index).
- Barrier charts say "most reported", never "ranked".
- "Free" is not used anywhere until the Foundation approves that wording.
- No state names and no technology or platform names.
- The optional Ask feature is not shown.
- The fictional-county label stays on screen the whole time.
- The quote is labeled a composite, not a real person.
- Privacy is shown, not just claimed:
  - Barriers: two counts are hatched, one under 11 and one hidden as a follow-on so the first can't be worked out.
  - Areas: two tiles are hidden.
  - Evidence: one measure says "Not available" instead of zero.

## Needs sign-off before outside use (Maven)

1. **Copy freeze.** This follows the brief, which differs from the locked copy:
   - The name "Community Access Platform" vs. the category "County planning for health access".
   - "Sample County" vs. "SozoRock County".
   - Update the locked copy, or ask for a re-cut in locked lines.
2. **The call to action** "Talk to the SozoRock Foundation" and `sozorockfoundation.org/partner` need Foundation approval of the partnership wording.
3. **The composite quote** should be checked against real conversations.

## Voice, fonts, licenses

- **Voice:** Kokoro-82M, voice `af_heart`, run locally. The model and voices are Apache 2.0, so there is no cost and no account. It is a synthetic voice.
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
Use `node tools/render.cjs --stills 12,40` to render review stills into `build/stills/`.

## Next cuts

- 30 seconds: promise, Overview, Areas, trust, call to action.
- 15 seconds, vertical 1080×1920, for social posts.
