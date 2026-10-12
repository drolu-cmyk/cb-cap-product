// Render story.html to MP4, frame by frame, with the voiceover track.
// Usage: node tools/render.cjs                 full video -> out/cb-cap-story.mp4
//        node tools/render.cjs --stills 5,30   PNG stills -> build/stills/
//        add --vertical for the 1080x1920 cut (-> out/cb-cap-story-vertical.mp4)
// Needs Playwright (NODE_PATH or local install) and ffmpeg.
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FPS = 30;
const VERT = process.argv.includes("--vertical");
const [W, H] = VERT ? [1080, 1920] : [1920, 1080];
const NAME = VERT ? "cb-cap-story-vertical" : "cb-cap-story";
const exe = process.env.CHROMIUM || (fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined);

// Voice plus sound effects, each placed at its cue, then loudness-normalized.
function mixAudio(cues, duration) {
  const out = path.join(ROOT, "build", "mix.wav");
  const args = ["-v", "error", "-y", "-i", path.join(ROOT, "build", "voice.wav")];
  const chains = [];
  cues.forEach((c, i) => {
    args.push("-i", path.join(ROOT, c.file));
    let f = `[${i + 1}:a]aformat=sample_rates=48000:channel_layouts=mono`;
    if (c.dur) f += `,atrim=0:${c.dur},afade=t=out:st=${Math.max(0, c.dur - 0.8)}:d=0.8`;
    f += `,volume=${c.gain || 0}dB,adelay=${Math.max(0, Math.round(c.t * 1000))}:all=1[s${i}]`;
    chains.push(f);
  });
  const mixIn = "[0:a]" + cues.map((_, i) => `[s${i}]`).join("");
  chains.push(`${mixIn}amix=inputs=${cues.length + 1}:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11,apad,atrim=0:${duration}[m]`);
  args.push("-filter_complex", chains.join(";"), "-map", "[m]", "-ar", "48000", "-ac", "2", out);
  require("child_process").execFileSync("ffmpeg", args, { stdio: "inherit" });
  return out;
}

(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ["--allow-file-access-from-files", "--font-render-hinting=none"] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("file://" + path.join(ROOT, "story.html") + (VERT ? "?format=vertical" : ""));
  await page.waitForFunction(() => window.READY === true);
  const duration = await page.evaluate(() => window.DURATION);

  const si = process.argv.indexOf("--stills");
  if (si > -1) {
    const dir = path.join(ROOT, "build", "stills", VERT ? "v" : "h");
    fs.mkdirSync(dir, { recursive: true });
    for (const t of process.argv[si + 1].split(",").map(Number)) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: path.join(dir, `t${String(t).padStart(5, "0")}.png`) });
    }
  } else {
    fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
    const out = path.join(ROOT, "out", NAME + ".mp4");
    const cues = await page.evaluate(() => window.sfxCues());
    if (fs.existsSync(path.join(ROOT, "build", "music.wav"))) cues.push({ file: "build/music.wav", t: 0, gain: 0 });
    const mix = mixAudio(cues, duration);
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-i", mix,
      "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-maxrate", "6M", "-bufsize", "12M", "-tune", "film", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-shortest", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
    const frames = Math.ceil(duration * FPS);
    for (let i = 0; i < frames; i++) {
      await page.evaluate(t => window.render(t), i / FPS);
      const buf = await page.screenshot({ type: "jpeg", quality: 94 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      if (i % 300 === 0) process.stdout.write(`frame ${i}/${frames}\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on("close", r));
    console.log("wrote", out);
  }
  await browser.close();
  if (errors.length) { console.error("Page errors:\n" + errors.join("\n")); process.exit(1); }
})();
