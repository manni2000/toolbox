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

router.post('/password', upload.array('files', 20), async (req, res) => {
  try {
    const { password } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one file required' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long' });
    }

    const path = require('path');
    const fs = require('fs');
    const os = require('os');
    const { exec } = require('child_process');

    // Create temporary directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zip-'));

    try {
      // Prepare file paths for 7zip
      const filePaths = files.map(file => file.buffer);
      const outputPath = path.join(tempDir, 'protected.zip');

      // Write files to temporary directory
      const fileNames = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${i}_${file.originalname}`;
        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        fileNames.push(filePath);
      }

      // Try using node-7zip first
      try {
        const sevenZip = require('node-7zip');

        // Create a zip file with password protection
        const result = await sevenZip.add(outputPath, fileNames, {
          password: password,
          method: 'AES256', // Strong encryption
          level: 9 // Maximum compression
        });

        if (result && result.error) {
          throw new Error(result.error);
        }

      } catch (zipError) {
        // Fallback to system 7zip if available
        // console.log('node-7zip failed, trying system 7zip:', zipError.message);

        await new Promise((resolve, reject) => {
          const cmd = `7z a -p${password} -mem=AES256 -mx9 "${outputPath}" ${fileNames.map(f => `"${f}"`).join(' ')}`;
          exec(cmd, { cwd: tempDir }, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(`7z command failed: ${error.message}`));
            } else {
              resolve();
            }
          });
        });
      }

      // Read the protected zip file
      const zipBuffer = fs.readFileSync(outputPath);
      const base64 = zipBuffer.toString('base64');

      // Clean up temporary files
      fs.rmSync(tempDir, { recursive: true, force: true });

      res.json({
        success: true,
        file: base64,
        filename: 'protected.zip',
        filesCount: files.length,
        message: 'ZIP file created with password protection',
        encryption: 'AES256',
        note: 'This ZIP file is password-protected. Use the provided password to extract.'
      });

    } catch (error) {
      // Clean up on error
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      throw error;
    }

  } catch (error) {
    // console.error('ZIP password protection error:', error);

    // Provide helpful error message with alternatives
    res.status(500).json({
      success: false,
      error: 'Failed to create password-protected ZIP',
      details: error.message,
      alternatives: [
        'Ensure 7-Zip is installed and in system PATH',
        'Try using shorter file names',
        'Check that password doesn\'t contain special characters'
      ]
    });
  }
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});

module.exports = router;
