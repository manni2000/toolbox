const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const { uploadLimiter } = require('../middleware/security');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.use(uploadLimiter);

function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff'];
  return allowedTypes.includes(file.mimetype);
}

function getUploadedFile(req, fieldNames = ['image', 'file']) {
  if (req.file) return req.file;
  for (const fieldName of fieldNames) {
    const candidate = req.files?.[fieldName];
    if (Array.isArray(candidate) && candidate[0]) return candidate[0];
  }
  return null;
}

router.post('/compress', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });
    if (!validateImageFile(req.file)) return res.status(400).json({ success: false, error: 'Invalid image type' });

    const quality = Math.min(Math.max(parseInt(req.body.quality) || 80, 1), 100);
    const image = sharp(req.file.buffer);
    const meta = await image.metadata();

    let output;
    const format = meta.format;
    if (format === 'jpeg' || format === 'jpg') {
      output = await image.jpeg({ quality }).toBuffer();
    } else if (format === 'png') {
      output = await image.png({ quality: Math.round(quality / 10), compressionLevel: 9 }).toBuffer();
    } else {
      output = await image.webp({ quality }).toBuffer();
    }

    res.setHeader('Content-Type', req.file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="compressed.${format}"`);
    res.send(output);
  } catch (err) {
    next(err);
  }
});

router.post('/resize', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });
    if (!validateImageFile(req.file)) return res.status(400).json({ success: false, error: 'Invalid image type' });

    const width = req.body.width ? parseInt(req.body.width) : undefined;
    const height = req.body.height ? parseInt(req.body.height) : undefined;
    const maintainAspect = req.body.maintainAspect !== 'false';

    if (!width && !height) return res.status(400).json({ success: false, error: 'Width or height required' });

    const image = sharp(req.file.buffer);
    const meta = await image.metadata();

    const resized = await image.resize({
      width,
      height,
      fit: maintainAspect ? 'inside' : 'fill',
      withoutEnlargement: false,
    }).toBuffer();

    res.setHeader('Content-Type', req.file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="resized.${meta.format}"`);
    res.send(resized);
  } catch (err) {
    next(err);
  }
});

router.post('/crop', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });
    if (!validateImageFile(req.file)) return res.status(400).json({ success: false, error: 'Invalid image type' });

    const x = parseInt(req.body.x) || 0;
    const y = parseInt(req.body.y) || 0;
    const width = parseInt(req.body.width);
    const height = parseInt(req.body.height);

    if (!width || !height) return res.status(400).json({ success: false, error: 'Width and height required' });

    const image = sharp(req.file.buffer);
    const meta = await image.metadata();
    const cropped = await image.extract({ left: x, top: y, width, height }).toBuffer();

    res.setHeader('Content-Type', req.file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="cropped.${meta.format}"`);
    res.send(cropped);
  } catch (err) {
    next(err);
  }
});

router.post('/convert', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });
    if (!validateImageFile(req.file)) return res.status(400).json({ success: false, error: 'Invalid image type' });

    const format = (req.body.format || 'webp').toLowerCase();
    const quality = Math.min(Math.max(parseInt(req.body.quality) || 85, 1), 100);
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff'];

    if (!allowedFormats.includes(format)) {
      return res.status(400).json({ success: false, error: 'Invalid output format' });
    }

    const targetFormat = format === 'jpg' ? 'jpeg' : format;
    let image = sharp(req.file.buffer);

    if (targetFormat === 'jpeg') image = image.jpeg({ quality });
    else if (targetFormat === 'png') image = image.png({ compressionLevel: Math.round((100 - quality) / 10) });
    else if (targetFormat === 'webp') image = image.webp({ quality });
    else if (targetFormat === 'avif') image = image.avif({ quality });
    else if (targetFormat === 'tiff') image = image.tiff({ quality });

    const output = await image.toBuffer();
    const mimeTypes = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', tiff: 'image/tiff' };

    res.setHeader('Content-Type', mimeTypes[targetFormat] || 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="converted.${format}"`);
    res.send(output);
  } catch (err) {
    next(err);
  }
});

router.post('/exif-viewer', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });

    const image = sharp(req.file.buffer);
    const meta = await image.metadata();

    res.json({
      success: true,
      result: {
        format: meta.format,
        width: meta.width,
        height: meta.height,
        channels: meta.channels,
        density: meta.density,
        depth: meta.depth,
        space: meta.space,
        hasAlpha: meta.hasAlpha,
        orientation: meta.orientation,
        fileSize: req.file.size,
        fileName: req.file.originalname,
        note: 'Full EXIF data extraction requires exif-parser library',
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/dpi-checker', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });

    const image = sharp(req.file.buffer);
    const meta = await image.metadata();
    const dpi = meta.density || 72;

    res.json({
      success: true,
      result: {
        dpi,
        width: meta.width,
        height: meta.height,
        format: meta.format,
        widthInches: meta.width ? (meta.width / dpi).toFixed(2) : null,
        heightInches: meta.height ? (meta.height / dpi).toFixed(2) : null,
        quality: dpi >= 300 ? 'Print-ready (300+ DPI)' : dpi >= 150 ? 'Good (150-299 DPI)' : dpi >= 72 ? 'Screen (72-149 DPI)' : 'Low (<72 DPI)',
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/favicon-generator', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });

    const size = parseInt(req.body.size) || 32;
    const allowedSizes = [16, 32, 48, 64, 128, 256];
    const targetSize = allowedSizes.includes(size) ? size : 32;

    const output = await sharp(req.file.buffer)
      .resize(targetSize, targetSize, { fit: 'cover' })
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="favicon-${targetSize}x${targetSize}.png"`);
    res.send(output);
  } catch (err) {
    next(err);
  }
});

router.post('/background-remover', upload.single('image'), async (req, res, next) => {
  res.json({
    success: false,
    error: 'Background removal requires AI/ML processing. Please use remove.bg API or similar service for accurate results.',
  });
});

router.post('/image-to-word', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res, next) => {
  const file = getUploadedFile(req);
  if (!file) return res.status(400).json({ success: false, error: 'Image file required' });

  res.json({
    success: false,
    error: 'Image to Word (OCR) conversion requires Tesseract.js or similar OCR library.',
  });
});

router.post('/image-to-pdf', upload.array('images', 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Image files required' });
    }

    const { PDFDocument } = require('pdf-lib');
    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      if (!validateImageFile(file)) continue;

      const resized = await sharp(file.buffer).resize({ width: 595, height: 842, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer();
      const jpgImage = await pdfDoc.embedJpg(resized);
      const { width, height } = jpgImage.scale(1);
      const page = pdfDoc.addPage([Math.min(width, 595), Math.min(height, 842)]);

      const scale = Math.min(page.getWidth() / width, page.getHeight() / height);
      page.drawImage(jpgImage, {
        x: (page.getWidth() - width * scale) / 2,
        y: (page.getHeight() - height * scale) / 2,
        width: width * scale,
        height: height * scale,
      });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="images.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
});

router.post('/base64', upload.single('image'), async (req, res, next) => {
  try {
    const { action = 'encode', data: base64Data } = req.body;

    if (action === 'encode') {
      if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });
      const b64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${b64}`;
      res.json({ success: true, result: { base64: b64, dataUrl, mimeType: req.file.mimetype, size: req.file.size } });
    } else {
      if (!base64Data) return res.status(400).json({ success: false, error: 'Base64 data required' });
      const cleanData = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanData, 'base64');
      const meta = await sharp(buffer).metadata();
      res.setHeader('Content-Type', `image/${meta.format}`);
      res.setHeader('Content-Disposition', `attachment; filename="decoded.${meta.format}"`);
      res.send(buffer);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
