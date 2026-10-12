# CB-CAP product story video

A 70-second story video for all stakeholders and social posts. It comes in two formats from one source. It is cut in a creator style:
- a hook in the first two seconds
- fast cuts
- big captions that highlight each word as it is spoken
- zoom-ins on the product

**Current state: SCRATCH VOICE.** The voice in `out/*-scratch-voice.mp4` is a free local model, used to review timing only. The final voice needs a paid ElevenLabs plan (see Sound).

See `FUNDERS.md` for how the video's words map to funder keywords, and `HOST-SHOTS.md` for the on-camera takes to record on a phone.

| File | Use |
|---|---|
| `out/cb-cap-story-scratch-voice.mp4` | 1920×1080, for YouTube, LinkedIn, websites and presentations |
| `out/cb-cap-story-vertical-scratch-voice.mp4` | 1080×1920, for Reels, Shorts and TikTok. Text stays clear of the platforms' top and bottom buttons. |
| `out/cb-cap-story.srt` | Caption file to upload alongside the video |
| `out/cb-cap-story-transcript.txt` | Plain transcript |
| `script.json` | Voiceover lines and scene timing. **The source of truth.** |
| `story.html` | Animated scenes. Add `?format=vertical` for the vertical version, `&t=40` for a single moment. |

Captions are burned in, because most social viewers watch with the sound off.

## Story

| Beat | Voiceover | On screen |
|---|---|---|
| Hook | Your county can't fix what it can't see. | Ink background, words build one at a time |
| Barriers | No ride. / A clinic that closes before your shift ends. / Forms too hard to read. / A six-week wait. / No one who speaks your language. | Each line labeled: Transportation, Work hours, Health literacy, Wait times, Language access. Real-world sound under the first four. |
| Reframe | We count the people who show up. Not the ones who never made it. | "Barriers to care", with the five barriers marked "not counted" |
| Scale | Six in ten local health departments serve fewer than 50,000 people. Small teams. Big jobs. | 6 in 10, waffle chart, NACCHO source |
| Promise | CB-CAP shows where care breaks, so you know what to fix first. | |
| Product | See where people drop off on the way to care. / See which barriers stop them, by neighborhood. / Small numbers stay hidden. Privacy comes first. / Every number shows where it came from. / AI can draft your report. People decide what it says. | The five opening barriers appear again, now counted |
| Funders | Built for health equity, rural health, and small teams doing more. | Keyword chips: health equity, rural health, health access, wait times, transportation, language access, health literacy, workforce capacity, public health data, privacy, AI with people in charge |
| Benefit | Walk into your budget meeting with real numbers. | |
| Call to action | Bring CB-CAP to your county. Talk to the SozoRock Foundation. | |
| Sign-off | Care. For every zip code. | The SozoRock Foundation |

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

- **Voice (now): scratch only.** `tools/scratch_voice.py` builds a take with a free local model (Kokoro).
- **Voice (final):** the ElevenLabs account connected here is on the Free tier, and ElevenLabs has blocked it for "unusual activity" (likely this cloud environment's proxy). The Free tier also does not allow commercial use and requires credit to ElevenLabs. So:
  - Version 3's ElevenLabs voice and sound effects are not cleared for public posting as things stand.
  - On a paid plan, record the script once.
  - Save it as `assets/audio/vo-take.mp3` with the transcript's word timings as `vo-words.json`.
  - Point `voiceover` in `script.json` at them and run `./build.sh`. Timing, captions and cuts all follow the new take.
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
