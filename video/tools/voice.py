"""Copy check, voiceover and timeline for the product story video.

Usage: python voice.py            (needs kokoro-onnx, soundfile, numpy)
Env:   KOKORO_DIR  folder holding kokoro-v1.0.onnx and voices-v1.0.bin
"""
import hashlib, json, os, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILD, OUT = ROOT / "build", ROOT / "out"
SR = 24000

# Brief section 8 plus the locked-copy "never say" list.
BANNED = ["leverage", "empower", "seamless", "solution", "transform", "cutting-edge",
          "robust", "holistic", "synergy", "unlock", "rank", "score", "grade", "index",
          "forecast", "predict", "partner", "client", "diagnose", "allocate", "free"]
MAX_WORDS = 12


def check(script):
    bad = []
    for s in script["scenes"]:
        for ln in s["lines"]:
            words = ln["text"].split()
            if len(words) > MAX_WORDS:
                bad.append(f'{ln["id"]}: {len(words)} words')
            for w in BANNED:
                if re.search(rf"\b{re.escape(w)}", ln["text"], re.I):
                    bad.append(f'{ln["id"]}: banned word "{w}"')
    return bad


def pad(total, voice):
    """Quiet synthesized chord bed, ducked under the voice. No samples, no license."""
    import numpy as np
    n = int(total * SR)
    t = np.arange(n) / SR
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]]  # Cmaj7 Am7 Fmaj7 G
    span = 8.0
    out = np.zeros(n, dtype="float64")
    for k in range(int(total // span) + 2):
        notes = chords[k % len(chords)]
        a, b = k * span - 2.0, (k + 1) * span + 2.0
        w = np.clip(np.minimum((t - a) / 3.0, (b - t) / 3.0), 0, 1)  # 3 s crossfades
        if not w.any():
            continue
        for m in notes:
            f = hz(m)
            for det in (0.998, 1.002):
                out += w * (np.sin(2 * np.pi * f * det * t) + 0.25 * np.sin(4 * np.pi * f * det * t)) / 8
    out *= 0.8 + 0.2 * np.sin(2 * np.pi * t / 11)            # slow breathing
    env = np.convolve(np.abs(voice), np.ones(SR // 5) / (SR // 5), mode="same")
    duck = 1 - 0.55 * np.clip(env / 0.02, 0, 1)                  # dip under speech
    duck = np.convolve(duck, np.ones(SR // 4) / (SR // 4), mode="same")
    fade = np.clip(np.minimum(t / 2.0, (total - t) / 3.0), 0, 1)
    out = out * duck * fade
    return (out / np.max(np.abs(out)) * 0.07).astype("float32")  # about -23 dBFS peak


def srt_time(t):
    ms = round(t * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def main():
    script = json.loads((ROOT / "script.json").read_text())
    bad = check(script)
    if bad:
        sys.exit("Copy check failed:\n  " + "\n  ".join(bad))

    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro
    kdir = Path(os.environ.get("KOKORO_DIR", "."))
    tts = Kokoro(str(kdir / "kokoro-v1.0.onnx"), str(kdir / "voices-v1.0.bin"))

    cache = BUILD / "lines"
    cache.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(exist_ok=True)

    t, scenes, clips = 0.0, [], []
    for s in script["scenes"]:
        start = t
        t += s["pre"]
        lines = []
        for i, ln in enumerate(s["lines"]):
            say = ln.get("say", ln["text"])
            key = hashlib.sha1(f'{script["voice"]}|{script["speed"]}|{say}'.encode()).hexdigest()[:12]
            wav = cache / f"{ln['id']}-{key}.wav"
            if not wav.exists():
                audio, sr = tts.create(say, voice=script["voice"], speed=script["speed"], lang="en-us")
                sf.write(wav, audio, sr)
            audio, _ = sf.read(wav, dtype="float32")
            # Trim model silence so cues sit on the words.
            idx = np.where(np.abs(audio) > 0.01)[0]
            audio = audio[max(0, idx[0] - 600): idx[-1] + 2400]
            dur = len(audio) / SR
            if i:
                t += script["gap"]
            lines.append({"id": ln["id"], "text": ln["text"], "start": round(t, 3), "end": round(t + dur, 3)})
            clips.append((t, audio))
            t += dur
        t += s["post"]
        scenes.append({"id": s["id"], "start": round(start, 3), "end": round(t, 3), "lines": lines})

    total = round(t, 3)
    track = np.zeros(int(total * SR) + SR, dtype="float32")
    for at, audio in clips:
        i = int(at * SR)
        track[i:i + len(audio)] += audio
    track = track[: int(total * SR)]
    if script.get("music"):
        track = track + pad(total, track)
    sf.write(BUILD / "voice.wav", track, SR)

    (BUILD / "timeline.json").write_text(json.dumps({"duration": total, "scenes": scenes}, indent=1))
    (BUILD / "timeline.js").write_text("window.TIMELINE=" + json.dumps({"duration": total, "scenes": scenes}) + ";\n")

    cues = [ln for s in scenes for ln in s["lines"]]
    (OUT / "cb-cap-story.srt").write_text("\n".join(
        f"{n}\n{srt_time(c['start'])} --> {srt_time(c['end'] + 0.3)}\n{c['text']}\n" for n, c in enumerate(cues, 1)))
    (OUT / "cb-cap-story-transcript.txt").write_text(
        "CB-CAP product story. Transcript.\nFigures shown in the video are illustrative.\n\n"
        + "\n".join(c["text"] for c in cues) + "\n")
    print(f"duration {total:.1f}s, {len(cues)} lines")


if __name__ == "__main__":
    main()
