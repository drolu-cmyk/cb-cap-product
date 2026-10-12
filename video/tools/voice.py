"""Copy check, voiceover timeline and captions for the product story video.

The voiceover is one recorded take (assets/audio/vo-take.mp3) with per-word
timings (vo-words.json). Each script line is cut from the take at its word
boundaries and placed on the timeline with the scene's pauses, so the video
breathes where the story needs it while the read stays natural.

Usage: python3 tools/voice.py      (needs ffmpeg on PATH; standard library only)
"""
import json, re, subprocess, sys, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILD, OUT = ROOT / "build", ROOT / "out"
SR = 48000

# Brief section 8 plus the locked-copy "never say" list.
BANNED = ["leverage", "empower", "seamless", "solution", "transform", "cutting-edge",
          "robust", "holistic", "synergy", "unlock", "rank", "score", "grade", "index",
          "forecast", "predict", "partner", "client", "diagnose", "allocate", "free"]
MAX_WORDS = 12
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())


def check(script):
    bad = []
    for s in script["scenes"]:
        for ln in s["lines"]:
            if len(ln["text"].split()) > MAX_WORDS:
                bad.append(f'{ln["id"]}: over {MAX_WORDS} words')
            for w in BANNED:
                if re.search(rf"\b{re.escape(w)}", ln["text"], re.I):
                    bad.append(f'{ln["id"]}: banned word "{w}"')
    return bad


def locate(words, say, start):
    """Find the spoken line in the take's word list, from index `start`."""
    want = [norm(w) for w in say.split() if norm(w)]
    have = [norm(w["w"]) for w in words]
    for i in range(start, len(have) - len(want) + 1):
        if have[i:i + len(want)] == want:
            return i, i + len(want) - 1
    sys.exit(f"Line not found in the recorded take: {say!r}. Re-record or fix the script.")


def srt_time(t):
    ms = round(t * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def main():
    script = json.loads((ROOT / "script.json").read_text())
    bad = check(script)
    if bad:
        sys.exit("Copy check failed:\n  " + "\n  ".join(bad))
    vo = script["voiceover"]
    words = json.loads((ROOT / vo["words"]).read_text())
    BUILD.mkdir(exist_ok=True); OUT.mkdir(exist_ok=True)

    # Cut points sit halfway into the silence around each line.
    t, cursor, scenes, cuts = 0.0, 0, [], []
    for s in script["scenes"]:
        start = t
        t += s["pre"]
        lines = []
        for k, ln in enumerate(s["lines"]):
            i, j = locate(words, ln.get("say", ln["text"]), cursor)
            cursor = j + 1
            a = max(0.0, (words[i]["s"] + (words[i - 1]["e"] if i else 0)) / 2 if i else 0.0)
            b = (words[j]["e"] + words[j + 1]["s"]) / 2 if j + 1 < len(words) else words[j]["e"] + 0.3
            a, b = min(a, words[i]["s"] - 0.02), max(b, words[j]["e"] + 0.08)
            if k:
                t += s.get("gap", script["gap"])
            lead = words[i]["s"] - a                       # silence kept before the first word
            lines.append({"id": ln["id"], "text": ln["text"], "start": round(t + lead, 3),
                          "end": round(t + (words[j]["e"] - a), 3)})
            cuts.append((round(t, 3), round(a, 3), round(b - a, 3)))
            t += b - a
        t += s["post"]
        scenes.append({"id": s["id"], "start": round(start, 3), "end": round(t, 3), "lines": lines})
    total = round(t, 3)

    # Assemble the voice track: decode the take once, copy each cut into its slot.
    from array import array
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / vo["audio"]), "-f", "s16le",
                          "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    take = array("h"); take.frombytes(raw)
    track = array("h", bytes(2 * int(total * SR)))
    fade = int(0.03 * SR)
    for at, a, d in cuts:
        seg = take[int(a * SR):int((a + d) * SR)]
        n = len(seg)
        for k in range(min(fade, n)):                      # short fades hide the cut
            seg[k] = seg[k] * k // fade
            seg[n - 1 - k] = seg[n - 1 - k] * k // fade
        o = int(at * SR)
        track[o:o + n] = seg[:max(0, len(track) - o)]
    with wave.open(str(BUILD / "voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(track.tobytes())

    # Sound effects, resolved to absolute times (the page adds cursor clicks).
    at = {s["id"]: s["start"] for s in scenes} | {l["id"]: l["start"] for s in scenes for l in s["lines"]}
    sfx = [{"file": f'assets/audio/sfx/{c["file"]}', "t": round(at[c["at"]] + c.get("offset", 0), 3),
            "gain": c.get("gain", 0), "dur": c.get("dur")} for c in script.get("sfx", [])]

    tl = {"duration": total, "scenes": scenes, "sfx": sfx}
    (BUILD / "timeline.json").write_text(json.dumps(tl, indent=1))
    (BUILD / "timeline.js").write_text("window.TIMELINE=" + json.dumps(tl) + ";\n")

    cues = [l for s in scenes for l in s["lines"]]
    (OUT / "cb-cap-story.srt").write_text("\n".join(
        f"{n}\n{srt_time(c['start'])} --> {srt_time(c['end'] + 0.3)}\n{c['text']}\n" for n, c in enumerate(cues, 1)))
    (OUT / "cb-cap-story-transcript.txt").write_text(
        "CB-CAP product story. Transcript.\nFigures shown in the video are illustrative.\n\n"
        + "\n".join(c["text"] for c in cues) + "\n")
    print(f"duration {total:.1f}s, {len(cues)} lines, {len(sfx)} sound cues")


if __name__ == "__main__":
    main()
