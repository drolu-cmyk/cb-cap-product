"""Make a SCRATCH voice take with a local open model (Kokoro), for timing reviews only.

Writes assets/audio/scratch-take.wav and scratch-words.json in the same shape as a
transcribed final take, so tools/voice.py can use either. Word times are estimated
from each line's speech span, which is close enough for captions in a scratch cut.

Usage: KOKORO_DIR=/path/to/models /path/to/venv/python tools/scratch_voice.py
"""
import json, os
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
script = json.loads((ROOT / "script.json").read_text())
kdir = Path(os.environ.get("KOKORO_DIR", "."))
tts = Kokoro(str(kdir / "kokoro-v1.0.onnx"), str(kdir / "voices-v1.0.bin"))

out, words, t, SR = [], [], 0.0, 24000
for s in script["scenes"]:
    for ln in s["lines"]:
        say = ln.get("say", ln["text"])
        audio, sr = tts.create(say, voice="af_heart", speed=1.05, lang="en-us")
        idx = np.where(np.abs(audio) > 0.01)[0]
        audio = audio[max(0, idx[0] - 600): idx[-1] + 1800]
        on = np.where(np.abs(audio) > 0.01)[0]
        a, b = on[0] / SR, on[-1] / SR
        toks = say.split()
        weights = np.array([len(w) + 2 for w in toks], dtype=float)
        edges = a + (b - a) * np.concatenate([[0], np.cumsum(weights) / weights.sum()])
        for k, w in enumerate(toks):
            words.append({"w": w, "s": round(t + edges[k], 3), "e": round(t + edges[k + 1] - 0.03, 3)})
        out.append(audio)
        out.append(np.zeros(int(0.35 * SR), dtype=audio.dtype))
        t += len(audio) / SR + 0.35

sf.write(ROOT / "assets/audio/scratch-take.wav", np.concatenate(out), SR)
(ROOT / "assets/audio/scratch-words.json").write_text(json.dumps(words))
print(f"scratch take {t:.1f}s, {len(words)} words")
