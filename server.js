const express = require("express");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;
const DOWNLOADS_DIR = path.join(__dirname, "downloads");

const YTDLP = fs.existsSync(path.join(__dirname, "yt-dlp.exe"))
  ? path.join(__dirname, "yt-dlp.exe")
  : "yt-dlp";

const FFMPEG_DIR = fs.existsSync("D:\\ffmpeg\\bin\\ffmpeg.exe")
  ? "D:\\ffmpeg\\bin"
  : "ffmpeg";

const FFMPEG_EXE = FFMPEG_DIR === "ffmpeg" ? "ffmpeg" : path.join(FFMPEG_DIR, "ffmpeg.exe");

app.use(express.json());
app.use(express.static("public"));

if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR);

function timeToSeconds(t) {
  if (!t || !t.trim()) return null;
  const parts = t.trim().split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parseFloat(t);
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\nRunning: ${cmd}`);
    console.log(`Args: ${args.join(" ")}`);
    execFile(cmd, args, { maxBuffer: 200 * 1024 * 1024, ...opts }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

// Bangun ffmpeg filter untuk speed & pitch
// speed: multiplier (0.5 - 2.0), default 1.0
// pitch: semitone (-12 to +12), default 0
// atempo hanya bisa 0.5-2.0, kalau di luar range perlu chain
function buildAudioFilter(speed, pitch, isVideo) {
  const filters = [];

  // Speed filter (atempo)
  if (speed !== 1.0) {
    // atempo range: 0.5 - 2.0, chain jika perlu
    if (speed < 0.5) {
      // chain: atempo=0.5,atempo=speed/0.5
      filters.push(`atempo=0.5,atempo=${(speed / 0.5).toFixed(6)}`);
    } else if (speed > 2.0) {
      // chain: atempo=2.0,atempo=speed/2.0
      filters.push(`atempo=2.0,atempo=${(speed / 2.0).toFixed(6)}`);
    } else {
      filters.push(`atempo=${speed.toFixed(6)}`);
    }
  }

  // Pitch filter (asetrate + aresample untuk shift pitch tanpa ubah speed)
  // Cara: ubah sample rate (naik/turun), lalu resample balik ke 44100
  // 1 semitone = 2^(1/12) ratio
  if (pitch !== 0) {
    const pitchRatio = Math.pow(2, pitch / 12);
    const baseSampleRate = 44100;
    const shiftedRate = Math.round(baseSampleRate * pitchRatio);
    filters.push(`asetrate=${shiftedRate},aresample=${baseSampleRate}`);
  }

  return filters.join(",");
}

// GET /api/info
app.get("/api/info", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL diperlukan" });
  try {
    const { stdout } = await run(YTDLP, ["--dump-json", "--no-playlist", url]);
    const info = JSON.parse(stdout);
    res.json({ title: info.title, duration: info.duration, thumbnail: info.thumbnail, uploader: info.uploader });
  } catch (e) {
    console.error("info error:", e.stderr || e);
    res.status(400).json({ error: "Gagal ambil info video." });
  }
});

// POST /api/download
app.post("/api/download", async (req, res) => {
  const { url, format, startTime, endTime, speed = 1.0, pitch = 0 } = req.body;
  if (!url) return res.status(400).json({ error: "URL diperlukan" });
  if (!["mp3", "mp4"].includes(format)) return res.status(400).json({ error: "Format tidak valid" });

  const startSec = timeToSeconds(startTime);
  const endSec   = timeToSeconds(endTime);
  const spd      = parseFloat(speed) || 1.0;
  const pch      = parseFloat(pitch) || 0;

  if (startSec !== null && endSec !== null && endSec <= startSec)
    return res.status(400).json({ error: "Waktu akhir harus lebih besar dari waktu mulai" });

  const timestamp = Date.now();
  const baseName  = `video_${timestamp}`;
  const outputTemplate = path.join(DOWNLOADS_DIR, `${baseName}.%(ext)s`);

  // Step 1: Download
  let ytArgs;
  if (format === "mp3") {
    ytArgs = [url, "-x", "--audio-format", "mp3", "--audio-quality", "0",
      "-o", outputTemplate, "--no-playlist", "--ffmpeg-location", FFMPEG_DIR];
  } else {
    ytArgs = [url, "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
      "--merge-output-format", "mp4", "-o", outputTemplate, "--no-playlist",
      "--ffmpeg-location", FFMPEG_DIR];
  }

  console.log(`\n[${timestamp}] Download: ${url} | ${format} | speed:${spd} | pitch:${pch}st`);
  try {
    await run(YTDLP, ytArgs);
  } catch (e) {
    console.error("yt-dlp FAILED:", e.stderr || e.err?.message);
    return res.status(500).json({ error: "Gagal download: " + (e.stderr || "unknown") });
  }

  const files = fs.readdirSync(DOWNLOADS_DIR).filter(f => f.startsWith(baseName));
  console.log("Files found:", files);
  if (files.length === 0) return res.status(500).json({ error: "File tidak ditemukan setelah download" });

  const downloadedFile = path.join(DOWNLOADS_DIR, files[0]);
  const actualExt = path.extname(files[0]).replace(".", "");
  const stat = fs.statSync(downloadedFile);
  console.log(`File size: ${stat.size} bytes`);
  if (stat.size === 0) return res.status(500).json({ error: "File hasil download kosong (0 bytes)" });

  // Step 2: Post-process dengan ffmpeg (cut + speed/pitch)
  const needsCut        = startSec !== null || endSec !== null;
  const needsSpeedPitch = spd !== 1.0 || pch !== 0;
  const needsProcess    = needsCut || needsSpeedPitch;

  if (needsProcess) {
    const processedFile = path.join(DOWNLOADS_DIR, `${baseName}_out.${actualExt}`);
    const ffArgs = ["-y", "-i", downloadedFile];

    // Cut
    if (startSec !== null) ffArgs.push("-ss", String(startSec));
    if (endSec !== null)   ffArgs.push("-to", String(endSec));

    // Speed & Pitch filter
    const audioFilter = buildAudioFilter(spd, pch, format === "mp4");

    if (audioFilter) {
      if (format === "mp4") {
        // Video + audio: re-encode audio saja, copy video
        ffArgs.push("-vcodec", "copy");
        ffArgs.push("-af", audioFilter);
        ffArgs.push("-acodec", "aac");
      } else {
        // MP3: re-encode audio
        ffArgs.push("-af", audioFilter);
        ffArgs.push("-acodec", "libmp3lame", "-q:a", "0");
      }
    } else {
      // Tidak ada filter audio, pakai copy (lebih cepat)
      ffArgs.push("-c", "copy");
    }

    ffArgs.push(processedFile);

    console.log(`Processing: cut=${needsCut}, speed=${spd}, pitch=${pch}st`);
    try {
      await run(FFMPEG_EXE, ffArgs);
      try { fs.unlinkSync(downloadedFile); } catch {}
      return sendFile(res, processedFile, `hasil_${timestamp}.${actualExt}`);
    } catch (e) {
      console.error("ffmpeg FAILED:", e.stderr || e.err?.message);
      try { fs.unlinkSync(downloadedFile); } catch {}
      return res.status(500).json({ error: "Gagal memproses audio/video:\n" + (e.stderr || "") });
    }
  }

  return sendFile(res, downloadedFile, `hasil_${timestamp}.${actualExt}`);
});

function sendFile(res, filePath, filename) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).replace(".", "");
  console.log(`Sending: ${filePath} (${stat.size} bytes) as ${filename}`);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", ext === "mp3" ? "audio/mpeg" : "video/mp4");
  res.setHeader("Content-Length", stat.size);
  const stream = fs.createReadStream(filePath);
  stream.on("end", () => { try { fs.unlinkSync(filePath); } catch {} });
  stream.on("error", (err) => console.error("Stream error:", err));
  stream.pipe(res);
}

app.listen(PORT, () => {
  console.log(`\n✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📂 Downloads: ${DOWNLOADS_DIR}`);
  console.log(`🔧 yt-dlp: ${YTDLP}`);
  console.log(`🔧 ffmpeg: ${FFMPEG_EXE}\n`);
});