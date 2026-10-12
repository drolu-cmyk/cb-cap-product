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
    sf.write(BUILD / "voice.wav", track[: int(total * SR)], SR)

    (BUILD / "timeline.json").write_text(json.dumps({"duration": total, "scenes": scenes}, indent=1))
    (BUILD / "timeline.js").write_text("window.TIMELINE=" + json.dumps({"duration": total, "scenes": scenes}) + ";\n")

    cues = [ln for s in scenes for ln in s["lines"]]
    (OUT / "cb-cap-story.srt").write_text("\n".join(
        f"{n}\n{srt_time(c['start'])} --> {srt_time(c['end'] + 0.3)}\n{c['text']}\n" for n, c in enumerate(cues, 1)))
    (OUT / "cb-cap-story-transcript.txt").write_text(
        "CB-CAP product story. Transcript.\nSample County is fictional. All figures shown are illustrative.\n\n"
        + "\n".join(c["text"] for c in cues) + "\n")
    print(f"duration {total:.1f}s, {len(cues)} lines")


if __name__ == "__main__":
    main()
