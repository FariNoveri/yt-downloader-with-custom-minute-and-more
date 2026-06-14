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

// Path ffmpeg - sesuaikan jika berbeda
const FFMPEG_DIR = fs.existsSync("D:\\ffmpeg\\bin\\ffmpeg.exe")
  ? "D:\\ffmpeg\\bin"
  : "ffmpeg";

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
    console.log(`Running: ${cmd} ${args.join(" ")}`);
    execFile(cmd, args, { maxBuffer: 200 * 1024 * 1024, ...opts }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

// GET /api/info
app.get("/api/info", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL diperlukan" });
  try {
    const { stdout } = await run(YTDLP, ["--dump-json", "--no-playlist", url]);
    const info = JSON.parse(stdout);
    res.json({
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      uploader: info.uploader,
    });
  } catch (e) {
    console.error("info error:", e.stderr || e);
    res.status(400).json({ error: "Gagal ambil info video." });
  }
});

// POST /api/download
app.post("/api/download", async (req, res) => {
  const { url, format, startTime, endTime } = req.body;
  if (!url) return res.status(400).json({ error: "URL diperlukan" });
  if (!["mp3", "mp4"].includes(format)) return res.status(400).json({ error: "Format tidak valid" });

  const startSec = timeToSeconds(startTime);
  const endSec = timeToSeconds(endTime);

  if (startSec !== null && endSec !== null && endSec <= startSec) {
    return res.status(400).json({ error: "Waktu akhir harus lebih besar dari waktu mulai" });
  }

  const timestamp = Date.now();
  const baseName = `video_${timestamp}`;
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

  console.log(`\n[${timestamp}] Download: ${url} | ${format}`);
  try {
    const result = await run(YTDLP, ytArgs);
    console.log("yt-dlp stdout:", result.stdout);
    console.log("yt-dlp stderr:", result.stderr);
  } catch (e) {
    console.error("yt-dlp FAILED:", e.stderr || e.err?.message);
    return res.status(500).json({ error: "Gagal download: " + (e.stderr || "unknown") });
  }

  // Cari file hasil
  const files = fs.readdirSync(DOWNLOADS_DIR).filter(f => f.startsWith(baseName));
  console.log("Files found:", files);

  if (files.length === 0) {
    return res.status(500).json({ error: "File tidak ditemukan setelah download" });
  }

  const downloadedFile = path.join(DOWNLOADS_DIR, files[0]);
  const actualExt = path.extname(files[0]).replace(".", "");
  const stat = fs.statSync(downloadedFile);
  console.log(`File size: ${stat.size} bytes`);

  if (stat.size === 0) {
    return res.status(500).json({ error: "File hasil download kosong (0 bytes)" });
  }

  // Step 2: Potong jika ada time range
  let finalFile = downloadedFile;
  if (startSec !== null || endSec !== null) {
    const cutFile = path.join(DOWNLOADS_DIR, `${baseName}_cut.${actualExt}`);
    const ffArgs = ["-y", "-i", downloadedFile];
    if (startSec !== null) ffArgs.push("-ss", String(startSec));
    if (endSec !== null) ffArgs.push("-to", String(endSec));
    ffArgs.push("-c", "copy", cutFile);

    console.log(`Cutting: ${startSec}s to ${endSec}s`);
    try {
      await run("ffmpeg", ffArgs);
      try { fs.unlinkSync(downloadedFile); } catch {}
      finalFile = cutFile;
    } catch (e) {
      console.error("ffmpeg FAILED:", e.stderr || e.err?.message);
      try { fs.unlinkSync(downloadedFile); } catch {}
      return res.status(500).json({ error: "Gagal memotong video" });
    }
  }

  // Step 3: Stream file ke browser
  const finalStat = fs.statSync(finalFile);
  const finalName = `hasil_${timestamp}.${actualExt}`;
  console.log(`Sending: ${finalFile} (${finalStat.size} bytes) as ${finalName}`);

  res.setHeader("Content-Disposition", `attachment; filename="${finalName}"`);
  res.setHeader("Content-Type", actualExt === "mp3" ? "audio/mpeg" : "video/mp4");
  res.setHeader("Content-Length", finalStat.size);

  const stream = fs.createReadStream(finalFile);
  stream.on("error", (err) => {
    console.error("Stream error:", err);
  });
  stream.on("end", () => {
    console.log("Stream selesai, hapus file...");
    try { fs.unlinkSync(finalFile); } catch {}
  });
  stream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`\n✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📂 Downloads: ${DOWNLOADS_DIR}`);
  console.log(`🔧 yt-dlp: ${YTDLP}\n`);
});