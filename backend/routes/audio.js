const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { uploadLimiter } = require('../middleware/security');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(uploadLimiter);

const MIME_TYPES = { mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac', aac: 'audio/aac', m4a: 'audio/mp4', opus: 'audio/ogg' };
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

function validateAudioFile(file) {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/m4a', 'audio/x-m4a', 'audio/mp4'];
  return allowedTypes.includes(file.mimetype) || /\.(mp3|wav|ogg|flac|aac|m4a|opus)$/i.test(file.originalname);
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

async function withTempFiles(ext1, ext2, fn) {
  const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = path.join(os.tmpdir(), `audio-in-${ts}.${ext1}`);
  const outputPath = path.join(os.tmpdir(), `audio-out-${ts}.${ext2}`);
  try {
    return await fn(inputPath, outputPath);
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
}

function bufferToDataUrl(buffer, mimeType) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

router.post('/convert', upload.single('audio'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Audio file required' });
  if (!validateAudioFile(req.file)) return res.status(400).json({ success: false, error: 'Invalid audio file type' });
  if (!(await ensureFfmpegAvailable(res, 'Audio conversion'))) return;

  const { format = 'mp3', bitrate = '128k' } = req.body;
  const allowedFormats = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
  if (!allowedFormats.includes(format)) return res.status(400).json({ success: false, error: 'Invalid output format' });

  const inputExt = req.file.originalname.split('.').pop() || 'mp3';
  const mimeType = MIME_TYPES[format] || 'audio/mpeg';

  try {
    const result = await withTempFiles(inputExt, format, async (inputPath, outputPath) => {
      fs.writeFileSync(inputPath, req.file.buffer);
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath).toFormat(format).audioBitrate(bitrate).on('end', resolve).on('error', reject).save(outputPath);
      });
      return fs.readFileSync(outputPath);
    });

    res.json({
      success: true,
      audio: bufferToDataUrl(result, mimeType),
      filename: `converted.${format}`,
      format,
      size: result.length,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/trim', upload.single('audio'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Audio file required' });
  if (!(await ensureFfmpegAvailable(res, 'Audio trimming'))) return;

  const { startTime = 0, endTime, duration } = req.body;
  const inputExt = req.file.originalname.split('.').pop() || 'mp3';
  const mimeType = MIME_TYPES[inputExt] || 'audio/mpeg';

  try {
    const result = await withTempFiles(inputExt, inputExt, async (inputPath, outputPath) => {
      fs.writeFileSync(inputPath, req.file.buffer);
      const dur = duration ? parseFloat(duration) : (endTime ? parseFloat(endTime) - parseFloat(startTime) : undefined);
      await new Promise((resolve, reject) => {
        let cmd = ffmpeg(inputPath).seekInput(parseFloat(startTime));
        if (dur) cmd = cmd.duration(dur);
        cmd.on('end', resolve).on('error', reject).save(outputPath);
      });
      return fs.readFileSync(outputPath);
    });

    res.json({
      success: true,
      audio: bufferToDataUrl(result, mimeType),
      filename: `trimmed.${inputExt}`,
      size: result.length,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/speed', upload.single('audio'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Audio file required' });
  if (!(await ensureFfmpegAvailable(res, 'Audio speed adjustment'))) return;

  const speed = Math.min(Math.max(parseFloat(req.body.speed) || 1.0, 0.5), 4.0);
  const inputExt = req.file.originalname.split('.').pop() || 'mp3';
  const mimeType = MIME_TYPES[inputExt] || 'audio/mpeg';

  try {
    const result = await withTempFiles(inputExt, inputExt, async (inputPath, outputPath) => {
      fs.writeFileSync(inputPath, req.file.buffer);
      const tempoFactor = Math.min(Math.max(speed, 0.5), 2.0);
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath).audioFilters(`atempo=${tempoFactor}`).on('end', resolve).on('error', reject).save(outputPath);
      });
      return fs.readFileSync(outputPath);
    });

    res.json({
      success: true,
      audio: bufferToDataUrl(result, mimeType),
      filename: `speed-${speed}x.${inputExt}`,
      size: result.length,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/merge', upload.array('audio', 10), async (req, res, next) => {
  if (!req.files || req.files.length < 2) {
    return res.status(400).json({ success: false, error: 'At least 2 audio files required' });
  }
  if (!(await ensureFfmpegAvailable(res, 'Audio merging'))) return;

  const tmpDir = os.tmpdir();
  const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPaths = [];
  const outputPath = path.join(tmpDir, `merged-${ts}.mp3`);
  const listFile = path.join(tmpDir, `list-${ts}.txt`);

  try {
    for (let i = 0; i < req.files.length; i++) {
      const ext = req.files[i].originalname.split('.').pop() || 'mp3';
      const p = path.join(tmpDir, `audio-${ts}-${i}.${ext}`);
      fs.writeFileSync(p, req.files[i].buffer);
      inputPaths.push(p);
    }

    const listContent = inputPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(listFile, listContent);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    const result = fs.readFileSync(outputPath);
    res.json({
      success: true,
      audio: bufferToDataUrl(result, 'audio/mpeg'),
      filename: 'merged.mp3',
      size: result.length,
    });
  } catch (err) {
    next(err);
  } finally {
    [...inputPaths, outputPath, listFile].forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch {} });
  }
});

router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  res.json({
    success: false,
    error: 'Speech-to-text requires a cloud AI service (OpenAI Whisper, Google Speech-to-Text, etc.). The browser Web Speech API is available for real-time recognition.',
  });
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
