# CB-CAP product story video

An 80-second story video for all stakeholders and social posts. It comes in two formats from one source.

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

| Time | Beat | Voiceover (on screen) |
|---|---|---|
| 0:00 | Barriers, felt | The ride never came. / The clinic closed before her shift ended. / The form asked for papers she didn't have. / The next appointment was six weeks away. (Ink background. Each line is named as a barrier type and has its own real-world sound.) |
| 0:14 | Insight | Each one is a barrier on the way to care. And most of them are never counted. |
| 0:21 | Why it matters | Most local health departments serve fewer than 50,000 people. / Small teams. Big questions. Every number has to hold up. |
| 0:30 | Promise | CB-CAP. Know where care breaks. Show the proof. |
| 0:36 | Proof | See where residents drop off, between referral and care. |
| 0:42 | Proof | See which barriers stop them, by kind of help and neighborhood. (The four barriers from the opening, now counted.) |
| 0:48 | Proof | Small counts stay hidden, so no one can be identified. |
| 0:54 | Proof | Every number shows its source, its year, and its range. |
| 0:59 | Proof | Your plan becomes your yearly report. People approve every word. |
| 1:05 | Benefit | So you walk into the budget meeting with proof. |
| 1:09 | Call to action | Bring CB-CAP to your county. Talk to the SozoRock Foundation. |
| 1:14 | Foundation sign-off | Care. For Every Zip Code |

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

## Sound

- **Voice:** "Katie" from the ElevenLabs voice library (`eleven_v4`), recorded as one continuous take (`assets/audio/vo-take.mp3`).
  - `tools/voice.py` cuts each line at its word timings (`vo-words.json`, from an ElevenLabs transcript) and spaces the lines out, so the read stays natural.
  - The transcript matched the script word for word.
- **Sound effects:** generated with ElevenLabs, in `assets/audio/sfx/`.
  - Real-world sounds, one for each barrier:
    - a bus pulling away in the rain
    - a clinic door locking
    - papers shuffling
    - a busy signal
  - Production sounds: a low impact under the promise and the sign-off, soft transitions, cursor clicks, and a stamp when the report is approved.
  - Cue times are in `script.json`. The page adds the clicks.
- **No music yet.** The ElevenLabs connection used here can't make music. Add the full ElevenLabs connector (`https://api.elevenlabs.io/v1/mcp`) or supply a licensed track, and it goes under the voice.
- **License:** the voice and sound effects were generated on the connected ElevenLabs account. Commercial use depends on that account's plan, so confirm it before paid promotion.
- **Fonts:** Newsreader and Source Sans 3, under the SIL Open Font License (`assets/fonts/OFL.txt`).

## Build

```
./build.sh        # needs python3, ffmpeg, and Node with Playwright
```

- Edit `script.json` to change pauses or sound cues.
- Changing the words means recording a new take: replace `vo-take.mp3` and `vo-words.json`.
- If a line in the script can't be found in the take, the build stops.
- Use `node tools/render.cjs --stills 12,40` (add `--vertical` for the vertical format) for review stills.
