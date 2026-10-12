"""Original score for the story video, played on real sampled instruments.

Instruments: VS Chamber Orchestra Community Edition (VSCO-2-CE), CC0 1.0 (public
domain: commercial use, no attribution). Sections follow the scene times in
build/timeline.json, and the music dips under the voice in build/voice.wav.

Usage: VSCO_DIR=/path/to/VSCO-2-CE python tools/score.py   (needs numpy, soundfile)
Writes build/music.wav.
"""
import json, os, re
from pathlib import Path
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
LIB = Path(os.environ["VSCO_DIR"])
SR = 48000
NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
midi = lambda name: NOTE[re.match(r"([A-G]#?)", name).group(1)] + 12 * (int(re.search(r"(-?\d)$", name).group(1)) + 1)


def index(folder, pattern, layer):
    """Map MIDI note -> sample file for one instrument articulation."""
    out = {}
    for f in sorted((LIB / folder).glob("*.wav")):
        m = re.search(pattern, f.name)
        if m and layer in f.name:
            out.setdefault(midi(m.group(1)), f)
    return out


piano = {}
for line in (LIB / "Keys/Upright Piano/MappingChart.txt").read_text().splitlines():
    m = re.match(r"(\d{3})=(\d+)", line)
    if m:
        f = LIB / f"Keys/Upright Piano/Player_dyn1_rr1_{m.group(1)}.wav"
        if f.exists():
            piano[int(m.group(2))] = f
INST = {
    "piano": piano,
    "cello": index("Strings/Cello Section/susvib", r"susvib_([A-G]#?\d)_", "_v1_"),
    "viola": index("Strings/Viola Section/susvib", r"susvib_([A-G]#?\d)_", "_v1_"),
    "violin": index("Strings/Violin Section/susVib", r"susVib_([A-G]#?\d)_", "_v1"),
    "bass": index("Strings/Solo Contrabass/SusNV", r"SusNV_([A-G]#?\d)_", "_v1_"),
    "harp": index("Strings/Harp", r"KSHarp_([A-G]#?\d)_", "_mf"),
}
_cache = {}


def load(path):
    if path not in _cache:
        a, sr = sf.read(path, dtype="float32", always_2d=True)
        a = a[:, :2] if a.shape[1] > 1 else np.repeat(a, 2, axis=1)
        n = int(len(a) * SR / sr)
        x = np.linspace(0, len(a) - 1, n)
        _cache[path] = np.stack([np.interp(x, np.arange(len(a)), a[:, c]) for c in range(2)], axis=1)
    return _cache[path]


def tone(inst, note, dur, attack=0.02, release=0.6):
    """One note: nearest sample, pitch-shifted by resampling, with an envelope."""
    bank = INST[inst]
    src = min(bank, key=lambda k: abs(k - note))
    a = load(bank[src])
    ratio = 2 ** ((note - src) / 12)
    n = min(int((dur + release) * SR), int(len(a) / ratio) - 1)
    x = np.arange(n) * ratio
    y = np.stack([np.interp(x, np.arange(len(a)), a[:, c]) for c in range(2)], axis=1)
    env = np.ones(n)
    k = max(1, int(attack * SR)); env[:k] = np.linspace(0, 1, k)
    r = min(n, int(release * SR)); s0 = max(0, min(n - r, int(dur * SR)))
    env[s0:s0 + r] = np.linspace(1, 0, r)[: n - s0]; env[s0 + r:] = 0
    return y * env[:, None]


def main():
    tl = json.loads((ROOT / "build/timeline.json").read_text())
    S = {s["id"]: s for s in tl["scenes"]}
    L = {l["id"]: l for s in tl["scenes"] for l in s["lines"]}
    total = tl["duration"]
    mix = np.zeros((int((total + 6) * SR), 2))

    def put(t, y, gain):
        i = int(t * SR)
        mix[i:i + len(y)] += y[: max(0, len(mix) - i)] * gain

    def chord(t, notes, dur, gain, attack=0.8, release=1.5):
        for inst, n in notes:
            put(t, tone(inst, n, dur, attack, release), gain)

    D2, F2, A2, Bb1, C2 = 38, 41, 45, 34, 36
    # 1. Tension: low drone, one piano note per barrier, timpani roll into the reframe.
    end_a = S["context"]["start"]
    t = 0.0
    while t < end_a:
        chord(t, [("cello", D2), ("bass", D2 - 12)], min(7.0, end_a - t + 1), 0.22, attack=1.5, release=2.0)
        t += 6.0
    put(0.05, tone("piano", 50, 3, release=2.5), 0.5); put(0.05, tone("piano", 57, 3, release=2.5), 0.4)
    for lid, n in zip(["B1", "B2", "B3", "B4", "B5"], [69, 65, 74, 72, 69]):
        put(L[lid]["start"] - 0.05, tone("piano", n, 2.0, release=2.0), 0.55)
    roll = sorted((LIB / "Percussion/Timpani/Rolls").glob("Timpani1_Roll_v3*.wav"))[0]
    r = load(roll)[: int(4.5 * SR)]
    r = r * np.linspace(0, 1, len(r))[:, None] ** 2
    put(max(0, S["turn"]["start"] - 0.5), r, 0.35)
    chord(S["turn"]["start"], [("violin", 69)], S["turn"]["end"] - S["turn"]["start"] + 1, 0.18, attack=1.2)

    # 2. Turning: D minor to F major across the scale fact and "age of AI".
    a, b = S["context"]["start"], S["promise"]["start"]
    prog = [[D2, 57, 62, 65], [Bb1 + 12, 58, 62, 65], [F2, 57, 60, 65], [C2 + 12, 55, 60, 64]]
    step = (b - a) / len(prog)
    for k, (bass, *up) in enumerate(prog):
        chord(a + k * step, [("cello", bass), ("viola", up[0]), ("violin", up[1]), ("violin", up[2])], step + 0.5, 0.2)
    beat = 60 / 92
    t = S["rebuild"]["start"]
    while t < b - 0.2:                                   # quiet piano pulse starts with "age of AI"
        put(t, tone("piano", [65, 69, 72, 69][int((t - S["rebuild"]["start"]) / beat) % 4], beat, release=0.8), 0.28)
        t += beat

    # 3. Promise: timpani hit, full F major, harp upward.
    p = S["promise"]["start"] + 0.3
    hit = sorted((LIB / "Percussion/Timpani").glob("Timpani2_Hit_v3*.wav"))[0]
    put(p, load(hit), 0.55)
    chord(p, [("bass", F2 - 12), ("cello", F2), ("viola", 57), ("violin", 65), ("violin", 69), ("violin", 72)], 4.0, 0.24, attack=0.15)
    for k, n in enumerate([53, 57, 60, 65, 69, 72, 77]):
        put(p + 0.06 * k, tone("harp", n, 1.5, release=2.0), 0.3)

    # 4. Product: steady eighth-note piano over F - C - Dm - Bb, strings underneath.
    a, b = S["where"]["start"], S["fund"]["start"]
    beat, bar = 60 / 96, 4 * 60 / 96
    prog = [(F2, [53, 57, 60]), (C2 + 12, [52, 55, 60]), (D2, [50, 53, 57]), (Bb1 + 12, [50, 53, 58])]
    t, k = a, 0
    while t < b:
        bass, triad = prog[(k // 2) % 4]
        if k % 2 == 0:
            chord(t, [("cello", bass), ("viola", triad[1] + 12), ("violin", triad[2] + 12)], 2 * bar, 0.13, attack=0.6)
        for e in range(8):
            if t + e * beat / 2 < b:
                put(t + e * beat / 2, tone("piano", (triad + [triad[0] + 12])[[0, 1, 2, 3, 2, 1, 2, 3][e]] + 12, beat / 2, release=0.5), 0.24)
        t += bar; k += 1

    # 5. Lift into the ask, then resolve under the tagline.
    a = S["fund"]["start"]
    for k, (bass, triad) in enumerate([(Bb1 + 12, [58, 62, 65]), (C2 + 12, [60, 64, 67]), (D2, [62, 65, 69]), (C2 + 12, [60, 64, 67])]):
        tt = a + k * (S["cta"]["start"] - a) / 4
        chord(tt, [("cello", bass), ("viola", triad[0]), ("violin", triad[1] + 12), ("violin", triad[2] + 12)], (S["cta"]["start"] - a) / 4 + 0.5, 0.2)
    put(S["cta"]["start"] - 3.0, r, 0.3)
    c = S["cta"]["start"]
    chord(c, [("cello", F2), ("viola", 60), ("violin", 69), ("violin", 72)], S["tagline"]["start"] - c + 0.5, 0.2)
    g = S["tagline"]["start"] + 0.15
    put(g, load(hit), 0.5)
    chord(g, [("bass", F2 - 12), ("cello", F2), ("viola", 60), ("violin", 65), ("violin", 69), ("violin", 77)], total - g + 1.0, 0.24, attack=0.2, release=3.0)
    for k, n in enumerate([65, 69, 72, 77, 81, 84]):
        put(g + 0.5 + 0.11 * k, tone("harp", n, 2.0, release=2.5), 0.28)

    # Duck under the voice, fade the tail, normalise.
    v, vsr = sf.read(ROOT / "build/voice.wav", dtype="float32")
    v = np.interp(np.arange(len(mix)) * vsr / SR, np.arange(len(v)), np.abs(v), right=0)
    def smooth(x, w):                                    # moving average via running sums
        c = np.concatenate([[0], np.cumsum(x)])
        i = np.arange(len(x)); lo = np.clip(i - w // 2, 0, len(x)); hi = np.clip(i + w // 2, 0, len(x))
        return (c[hi] - c[lo]) / np.maximum(1, hi - lo)
    env = smooth(v, SR // 5)
    duck = smooth(1 - 0.6 * np.clip(env / 0.03, 0, 1), SR // 3)
    mix = mix[: int(total * SR)] * duck[: int(total * SR), None]
    fade = np.clip((total - np.arange(len(mix)) / SR) / 2.5, 0, 1)
    mix *= fade[:, None]
    mix *= 0.5 / max(1e-6, np.abs(mix).max())
    sf.write(ROOT / "build/music.wav", mix.astype("float32"), SR)
    print(f"music {total:.1f}s, {sum(len(b) for b in INST.values())} samples mapped")


if __name__ == "__main__":
    main()
