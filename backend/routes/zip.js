const express = require('express');
const multer = require('multer');
const JSZip = require('jszip');
const { uploadLimiter } = require('../middleware/security');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
router.use(uploadLimiter);

router.post('/create', upload.array('files', 50), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, error: 'Files required' });

    const zip = new JSZip();
    for (const file of req.files) {
      zip.file(file.originalname, file.buffer);
    }

    const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="archive.zip"');
    res.send(content);
  } catch (err) {
    next(err);
  }
});

router.post('/extract', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'ZIP file required' });

    const zip = await JSZip.loadAsync(req.file.buffer);
    const files = [];

    for (const [name, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        files.push({
          name,
          size: (await file.async('uint8array')).length,
          compressedSize: file._data?.compressedSize || 0,
          date: file.date,
        });
      }
    }

    res.json({ success: true, result: { files, totalFiles: files.length, totalSize: files.reduce((a, f) => a + f.size, 0) } });
  } catch (err) {
    if (err.message.includes('password')) {
      return res.status(400).json({ success: false, error: 'ZIP is password protected' });
    }
    next(err);
  }
});

router.post('/compression-test', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'File required' });

    const levels = [1, 3, 6, 9];
    const results = [];

    for (const level of levels) {
      const zip = new JSZip();
      zip.file(req.file.originalname, req.file.buffer);
      const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level } });
      results.push({ level, size: content.length, ratio: Math.round((1 - content.length / req.file.size) * 100) });
    }

    res.json({
      success: true,
      result: {
        originalSize: req.file.size,
        results,
        bestCompression: results.reduce((a, b) => a.size < b.size ? a : b),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/password', upload.array('files', 20), async (req, res, next) => {
  res.json({
    success: false,
    error: 'Password-protected ZIP creation requires additional native libraries. Use 7-Zip or similar tools for password protection.',
  });
});

module.exports = router;
