// Render story.html to MP4, frame by frame, with the voiceover track.
// Usage: node tools/render.cjs                 full video -> out/cb-cap-story.mp4
//        node tools/render.cjs --stills 5,30   PNG stills -> build/stills/
// Needs Playwright (NODE_PATH or local install) and ffmpeg.
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FPS = 30;
const exe = process.env.CHROMIUM || (fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined);

(async () => {
  const browser = await chromium.launch({ executablePath: exe, args: ["--allow-file-access-from-files", "--font-render-hinting=none"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("file://" + path.join(ROOT, "story.html"));
  await page.waitForFunction(() => window.READY === true);
  const duration = await page.evaluate(() => window.DURATION);

  const si = process.argv.indexOf("--stills");
  if (si > -1) {
    const dir = path.join(ROOT, "build", "stills");
    fs.mkdirSync(dir, { recursive: true });
    for (const t of process.argv[si + 1].split(",").map(Number)) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: path.join(dir, `t${String(t).padStart(5, "0")}.png`) });
    }
  } else {
    fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
    const out = path.join(ROOT, "out", "cb-cap-story.mp4");
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-i", path.join(ROOT, "build", "voice.wav"),
      "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,apad",
      "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-tune", "stillimage",
      "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-shortest", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
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
