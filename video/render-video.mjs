import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const root = new URL("..", import.meta.url);
const manifestPath = new URL("slides.json", import.meta.url);
const frameDir = new URL("build/frames", import.meta.url);
const outputDir = new URL("output", import.meta.url);
const outputPath = new URL("output/playdoom-setup.mp4", import.meta.url);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const width = manifest.width || 1920;
const height = manifest.height || 1080;
const fps = manifest.fps || 30;
const includeMusic = process.env.VIDEO_MUSIC !== "0";

await mkdir(frameDir, { recursive: true });
await mkdir(outputDir, { recursive: true });

const frameFiles = [];

for (let index = 0; index < manifest.slides.length; index += 1) {
  const slide = manifest.slides[index];
  const framePath = new URL(`build/frames/slide-${String(index + 1).padStart(2, "0")}.png`, import.meta.url);
  await renderSlide(slide, index, framePath);
  frameFiles.push({ framePath, duration: slide.duration || 5 });
}

const concatPath = new URL("build/concat.txt", import.meta.url);
await writeFile(concatPath, concatFile(frameFiles));

const totalDuration = frameFiles.reduce((sum, frame) => sum + frame.duration, 0);
const musicPath = new URL("build/music.wav", import.meta.url);
if (includeMusic) {
  await writeFile(musicPath, createMusicWav(totalDuration));
}

const ffmpegArgs = [
  "-y",
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  filePath(concatPath)
];

if (includeMusic) {
  ffmpegArgs.push("-i", filePath(musicPath));
}

ffmpegArgs.push(
  "-vf",
  `fps=${fps},format=yuv420p`,
  "-movflags",
  "+faststart"
);

if (includeMusic) {
  ffmpegArgs.push("-c:a", "aac", "-b:a", "128k", "-shortest");
}

ffmpegArgs.push(
  filePath(outputPath)
);

await run("ffmpeg", ffmpegArgs);

console.log(`Rendered ${filePath(outputPath)}`);

async function renderSlide(slide, index, framePath) {
  const screenshot = await loadScreenshot(slide);
  const base = sharp(Buffer.from(slideSvg(slide, index, Boolean(screenshot))), {
    density: 144
  }).resize(width, height);

  const composites = [];
  if (screenshot) {
    composites.push({
      input: screenshot,
      left: 1030,
      top: 170
    });
  }

  await base.composite(composites).png().toFile(filePath(framePath));
}

async function loadScreenshot(slide) {
  if (!slide.screenshot) {
    return null;
  }

  const screenshotPath = resolve(filePath(root), slide.screenshot);
  if (!existsSync(screenshotPath)) {
    return null;
  }

  return sharp(screenshotPath)
    .resize({
      width: 720,
      height: 500,
      fit: "inside",
      withoutEnlargement: true,
      background: "#f7f5f0"
    })
    .png()
    .toBuffer();
}

function slideSvg(slide, index, hasScreenshot) {
  const wantsScreenshot = Boolean(slide.screenshot);
  const titleLines = wrap(slide.title, wantsScreenshot ? 22 : 32);
  const bodyLines = wrap(slide.body || "", wantsScreenshot ? 54 : 76);
  const bulletLines = (slide.bullets || []).map((bullet) => wrap(bullet, wantsScreenshot ? 42 : 62));
  const placeholder = slide.screenshot || "";

  let y = 166;
  const title = titleLines
    .map((line, i) => `<text x="110" y="${y + i * 76}" class="title">${escapeXml(line)}</text>`)
    .join("");
  y += titleLines.length * 76 + 34;

  const body = bodyLines
    .map((line, i) => `<text x="110" y="${y + i * 38}" class="body">${escapeXml(line)}</text>`)
    .join("");
  y += bodyLines.length * 38 + 34;

  const bullets = bulletLines
    .map((lines) => {
      const bulletY = y;
      const text = lines
        .map((line, i) => `<text x="148" y="${bulletY + i * 32}" class="bullet">${escapeXml(line)}</text>`)
        .join("");
      y += Math.max(1, lines.length) * 32 + 18;
      return `<circle cx="120" cy="${bulletY - 8}" r="7" fill="#9d2f24"/>${text}`;
    })
    .join("");

  const media = hasScreenshot
    ? `<rect x="990" y="130" width="820" height="600" rx="22" fill="#ffffff" stroke="#d8d2c6"/>`
    : placeholder
      ? placeholderCard(placeholder)
      : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .kicker { font: 800 28px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #9d2f24; letter-spacing: 0; text-transform: uppercase; }
    .title { font: 850 70px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #171717; letter-spacing: 0; }
    .body { font: 400 31px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #5f6468; letter-spacing: 0; }
    .bullet { font: 700 28px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #171717; letter-spacing: 0; }
    .small { font: 650 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #5f6468; letter-spacing: 0; }
    .mono { font: 650 24px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: #6f261f; letter-spacing: 0; }
  </style>
  <rect width="100%" height="100%" fill="#f7f5f0"/>
  <text x="110" y="92" class="kicker">${escapeXml(slide.kicker || `Step ${index + 1}`)}</text>
  ${title}
  ${body}
  ${bullets}
  ${media}
  <text x="110" y="1010" class="small">playdoom.ossy.dev</text>
</svg>`;
}

function placeholderCard(path) {
  const lines = path ? wrap(path, 34) : ["Text-only slide"];
  const filename = lines
    .map((line, i) => `<text x="1080" y="${460 + i * 34}" class="mono">${escapeXml(line)}</text>`)
    .join("");

  return `
    <rect x="990" y="130" width="820" height="600" rx="22" fill="#ffffff" stroke="#d8d2c6"/>
    <text x="1080" y="370" class="small">Drop screenshot here:</text>
    ${filename}
  `;
}

function wrap(text, maxChars) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    if (!line) {
      line = word;
    } else if (`${line} ${word}`.length <= maxChars) {
      line = `${line} ${word}`;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines.length ? lines : [""];
}

function concatFile(files) {
  const lines = [];
  for (const item of files) {
    lines.push(`file '${filePath(item.framePath).replaceAll("'", "'\\''")}'`);
    lines.push(`duration ${item.duration}`);
  }
  const last = files.at(-1);
  lines.push(`file '${filePath(last.framePath).replaceAll("'", "'\\''")}'`);
  return `${lines.join("\n")}\n`;
}

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      cwd: filePath(root)
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${command} exited with code ${code}`));
    });
  });
}

function createMusicWav(durationSeconds) {
  const sampleRate = 44100;
  const channels = 2;
  const totalSamples = Math.ceil(durationSeconds * sampleRate);
  const bytesPerSample = 2;
  const dataSize = totalSamples * channels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
  buffer.writeUInt16LE(channels * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  const bpm = 96;
  const beat = 60 / bpm;
  const chords = [
    [220.0, 261.63, 329.63],
    [196.0, 246.94, 293.66],
    [174.61, 220.0, 261.63],
    [196.0, 246.94, 329.63]
  ];

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const chord = chords[Math.floor(t / (beat * 4)) % chords.length];
    const arp = chord[Math.floor(t / (beat / 2)) % chord.length];
    const noteTime = t % (beat / 2);
    const envelope = Math.min(1, noteTime / 0.03) * Math.exp(-noteTime * 4.5);
    const fadeIn = Math.min(1, t / 2);
    const fadeOut = Math.min(1, Math.max(0, durationSeconds - t) / 3);
    const fade = fadeIn * fadeOut;

    const pad =
      0.045 * Math.sin(2 * Math.PI * (chord[0] / 2) * t) +
      0.025 * Math.sin(2 * Math.PI * (chord[1] / 2) * t) +
      0.018 * Math.sin(2 * Math.PI * (chord[2] / 2) * t);
    const lead = 0.025 * Math.sin(2 * Math.PI * arp * t) * envelope;
    const pulse = 0.012 * Math.sign(Math.sin(2 * Math.PI * (arp * 2) * t)) * envelope;
    const sample = clamp((pad + lead + pulse) * fade, -0.18, 0.18);
    const value = Math.round(sample * 32767);
    const offset = 44 + i * channels * bytesPerSample;

    buffer.writeInt16LE(value, offset);
    buffer.writeInt16LE(value, offset + 2);
  }

  return buffer;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function filePath(url) {
  return decodeURIComponent(url.pathname);
}
