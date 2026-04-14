const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { uploadLimiter } = require('../middleware/security');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });
let ffmpegAvailabilityPromise;
const ffmpegCandidates = [
  process.env.FFMPEG_PATH,
  process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-8.1-full_build', 'bin', 'ffmpeg.exe')
    : null,
  process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'ffmpeg-static-nodejs', 'ffmpeg.exe')
    : null,
].filter(Boolean);
const ffmpegBinary = ffmpegCandidates.find(candidate => fs.existsSync(candidate));

if (ffmpegBinary) {
  ffmpeg.setFfmpegPath(ffmpegBinary);
}

router.use(uploadLimiter);

function validateVideoFile(file) {
  const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
  return allowed.includes(file.mimetype) || /\.(mp4|webm|ogg|avi|mov|mkv|flv)$/i.test(file.originalname);
}

function getFfmpegAvailability() {
  if (!ffmpegAvailabilityPromise) {
    ffmpegAvailabilityPromise = new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err) => {
        if (err) {
          resolve({
            available: false,
            error: err.message || 'FFmpeg is not available',
          });
          return;
        }

        resolve({ available: true, error: null });
      });
    });
  }

  return ffmpegAvailabilityPromise;
}

async function ensureFfmpegAvailable(res, capability) {
  const availability = await getFfmpegAvailability();
  if (availability.available) return true;

  res.json({
    success: false,
    error: `${capability} requires FFmpeg, but FFmpeg is not installed or not available on the server PATH.`,
    details: availability.error,
  });
  return false;
}

function bufferToDataUrl(buffer, mimeType) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

async function withTempVideo(file, outputExt, fn) {
  const inputExt = file.originalname.split('.').pop() || 'mp4';
  const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = path.join(os.tmpdir(), `vid-in-${ts}.${inputExt}`);
  const outputPath = path.join(os.tmpdir(), `vid-out-${ts}.${outputExt}`);
  try {
    fs.writeFileSync(inputPath, file.buffer);
    return await fn(inputPath, outputPath);
  } finally {
    try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
  }
}

router.post('/to-audio', upload.single('video'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Video file required' });
  if (!validateVideoFile(req.file)) return res.status(400).json({ success: false, error: 'Invalid video file' });
  if (!(await ensureFfmpegAvailable(res, 'Video to audio conversion'))) return;

  const { format = 'mp3', bitrate = '192k' } = req.body;
  const allowedFormats = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
  if (!allowedFormats.includes(format)) return res.status(400).json({ success: false, error: 'Invalid audio format' });

  const AUDIO_MIMES = { mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', aac: 'audio/aac', flac: 'audio/flac' };

  try {
    const result = await withTempVideo(req.file, format, async (inputPath, outputPath) => {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .noVideo()
          .audioCodec(format === 'mp3' ? 'libmp3lame' : format === 'aac' ? 'aac' : 'copy')
          .audioBitrate(bitrate)
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });
      return fs.readFileSync(outputPath);
    });

    const mimeType = AUDIO_MIMES[format] || 'audio/mpeg';
    res.json({
      success: true,
      result: {
        audio: bufferToDataUrl(result, mimeType),
        filename: `audio.${format}`,
        format,
        size: result.length,
      },
      audio: bufferToDataUrl(result, mimeType),
      filename: `audio.${format}`,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/trim', upload.single('video'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Video file required' });
  if (!(await ensureFfmpegAvailable(res, 'Video trimming'))) return;

  const startTime = req.body.startTime ?? req.body.start_time ?? 0;
  const endTime = req.body.endTime ?? req.body.end_time;
  const inputExt = req.file.originalname.split('.').pop() || 'mp4';

  try {
    const result = await withTempVideo(req.file, 'mp4', async (inputPath, outputPath) => {
      await new Promise((resolve, reject) => {
        let cmd = ffmpeg(inputPath).seekInput(parseFloat(startTime));
        if (endTime) cmd = cmd.duration(parseFloat(endTime) - parseFloat(startTime));
        cmd.videoCodec('copy').audioCodec('copy').on('end', resolve).on('error', reject).save(outputPath);
      });
      return fs.readFileSync(outputPath);
    });

    res.json({
      success: true,
      result: { video: bufferToDataUrl(result, 'video/mp4'), filename: 'trimmed.mp4' },
      video: bufferToDataUrl(result, 'video/mp4'),
      filename: 'trimmed.mp4',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/speed', upload.single('video'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Video file required' });
  if (!(await ensureFfmpegAvailable(res, 'Video speed adjustment'))) return;

  const speed = Math.min(Math.max(parseFloat(req.body.speed ?? req.body.speedFactor ?? req.body.speed_factor) || 1.0, 0.25), 4.0);

  try {
    const result = await withTempVideo(req.file, 'mp4', async (inputPath, outputPath) => {
      await new Promise((resolve, reject) => {
        const videoFactor = 1 / speed;
        const audioSpeed = Math.min(Math.max(speed, 0.5), 2.0);
        ffmpeg(inputPath)
          .videoFilters(`setpts=${videoFactor.toFixed(4)}*PTS`)
          .audioFilters(`atempo=${audioSpeed}`)
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });
      return fs.readFileSync(outputPath);
    });

    res.json({
      success: true,
      result: { video: bufferToDataUrl(result, 'video/mp4'), filename: `speed-${speed}x.mp4` },
      video: bufferToDataUrl(result, 'video/mp4'),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/thumbnail', upload.single('video'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Video file required' });
  if (!(await ensureFfmpegAvailable(res, 'Video thumbnail extraction'))) return;

  const timestamp = req.body.timestamp ?? req.body.timeOffset;
  const normalizedTimestamp = timestamp === undefined || timestamp === null || timestamp === ''
    ? '00:00:01'
    : /^\d+(\.\d+)?$/.test(String(timestamp))
      ? `00:00:${String(Math.max(0, Math.floor(parseFloat(String(timestamp))))).padStart(2, '0')}`
      : String(timestamp);
  const width = parseInt(req.body.width);
  const height = parseInt(req.body.height);
  const size = width && height ? `${width}x${height}` : req.body.size || '640x360';
  const inputExt = req.file.originalname.split('.').pop() || 'mp4';
  const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = path.join(os.tmpdir(), `vid-thumb-${ts}.${inputExt}`);
  const outputPath = path.join(os.tmpdir(), `thumb-${ts}.jpg`);

  try {
    fs.writeFileSync(inputPath, req.file.buffer);
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .seekInput(normalizedTimestamp)
        .frames(1)
        .size(size)
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    const thumbnail = fs.readFileSync(outputPath);
    res.json({
      success: true,
      result: { thumbnail: bufferToDataUrl(thumbnail, 'image/jpeg'), filename: 'thumbnail.jpg' },
      thumbnail: bufferToDataUrl(thumbnail, 'image/jpeg'),
    });
  } catch (err) {
    next(err);
  } finally {
    try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
  }
});

router.post('/resolution', upload.single('video'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Video file required' });
  if (!(await ensureFfmpegAvailable(res, 'Video resolution conversion'))) return;

  const width = parseInt(req.body.width);
  const height = parseInt(req.body.height);
  const resolution = width && height ? `${width}x${height}` : (req.body.resolution || '1280x720');
  const bitrate = req.body.bitrate || '1500k';
  const allowedResolutions = ['3840x2160', '2560x1440', '1920x1080', '1280x720', '854x480', '640x360', '426x240'];
  if (!allowedResolutions.includes(resolution)) return res.status(400).json({ success: false, error: 'Invalid resolution' });

  try {
    const result = await withTempVideo(req.file, 'mp4', async (inputPath, outputPath) => {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath).size(resolution).videoBitrate(bitrate).on('end', resolve).on('error', reject).save(outputPath);
      });
      return fs.readFileSync(outputPath);
    });

    res.json({
      success: true,
      result: { video: bufferToDataUrl(result, 'video/mp4'), filename: `resized-${resolution}.mp4` },
      video: bufferToDataUrl(result, 'video/mp4'),
    });
  } catch (err) {
    next(err);
  }
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
