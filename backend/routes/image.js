const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const { PDFDocument } = require('pdf-lib');
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

    const targetFormat = (req.body.format || 'png').toLowerCase();
    const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff', 'gif'];
    if (!validFormats.includes(targetFormat)) {
      return res.status(400).json({ success: false, error: `Unsupported format. Use: ${validFormats.join(', ')}` });
    }

    const outFormat = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
    const image = sharp(req.file.buffer);
    const converted = await image.toFormat(outFormat).toBuffer();

    const mimeMap = {
      jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
      avif: 'image/avif', tiff: 'image/tiff', gif: 'image/gif',
    };

    res.setHeader('Content-Type', mimeMap[outFormat] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="converted.${outFormat}"`);
    res.send(converted);
  } catch (err) {
    next(err);
  }
});

router.post('/exif-viewer', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });
    if (!validateImageFile(req.file)) return res.status(400).json({ success: false, error: 'Invalid image type' });

    const image = sharp(req.file.buffer);
    const meta = await image.metadata();

    res.json({
      success: true,
      result: {
        format: meta.format,
        width: meta.width,
        height: meta.height,
        channels: meta.channels,
        depth: meta.depth,
        density: meta.density,
        hasAlpha: meta.hasAlpha,
        hasProfile: meta.hasProfile,
        isProgressive: meta.isProgressive,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        space: meta.space,
        exif: meta.exif ? meta.exif.toString('hex').substring(0, 200) : null,
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
        widthInches: meta.width ? (meta.width / dpi).toFixed(2) : null,
        heightInches: meta.height ? (meta.height / dpi).toFixed(2) : null,
        quality: dpi >= 300 ? 'Print-ready (300+ DPI)' : dpi >= 150 ? 'Good (150-299 DPI)' : dpi >= 72 ? 'Screen (72-149 DPI)' : 'Low (<72 DPI)',
        format: meta.format,
        fileSize: req.file.size,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/favicon-generator', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });

    const targetSize = parseInt(req.body.size) || 32;
    const validSizes = [16, 32, 48, 64, 128, 256];
    const size = validSizes.includes(targetSize) ? targetSize : 32;

    const favicon = await sharp(req.file.buffer)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="favicon-${size}x${size}.png"`);
    res.send(favicon);
  } catch (err) {
    next(err);
  }
});

router.post('/background-remover', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });
    if (!validateImageFile(req.file)) return res.status(400).json({ success: false, error: 'Invalid image type' });

    const image = sharp(req.file.buffer);
    const meta = await image.metadata();

    const rgba = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { data, info } = rgba;
    const { width, height, channels } = info;

    const cornerSamples = [
      { r: data[0], g: data[1], b: data[2] },
      { r: data[(width - 1) * channels], g: data[(width - 1) * channels + 1], b: data[(width - 1) * channels + 2] },
      { r: data[(height - 1) * width * channels], g: data[(height - 1) * width * channels + 1], b: data[(height - 1) * width * channels + 2] },
    ];

    const bgR = Math.round(cornerSamples.reduce((s, c) => s + c.r, 0) / cornerSamples.length);
    const bgG = Math.round(cornerSamples.reduce((s, c) => s + c.g, 0) / cornerSamples.length);
    const bgB = Math.round(cornerSamples.reduce((s, c) => s + c.b, 0) / cornerSamples.length);

    const threshold = parseInt(req.body.threshold) || 30;

    const newData = Buffer.from(data);
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const diff = Math.sqrt(
        Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
      );
      if (diff < threshold) {
        newData[i + 3] = 0;
      }
    }

    const result = await sharp(newData, {
      raw: { width, height, channels: 4 },
    }).png().toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="background-removed.png"');
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.post('/image-to-word', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'Image file required' });

    const meta = await sharp(file.buffer).metadata();

    const { Document, Packer, Paragraph, TextRun } = require('docx');
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Image to Word Conversion',
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Image Details: ${meta.width}x${meta.height} ${meta.format} (${(file.size / 1024).toFixed(1)} KB)`,
                italics: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Note: Full OCR (Optical Character Recognition) requires Tesseract.js or a cloud OCR service. This document contains metadata only.',
                size: 18,
              }),
            ],
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="image-extracted.docx"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.post('/image-to-pdf', upload.array('images', 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one image required' });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      if (!validateImageFile(file)) continue;

      const meta = await sharp(file.buffer).metadata();
      let imgBuffer = file.buffer;

      if (meta.format !== 'jpeg' && meta.format !== 'png') {
        imgBuffer = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();
      }

      let embeddedImage;
      const finalMeta = await sharp(imgBuffer).metadata();

      if (finalMeta.format === 'jpeg') {
        embeddedImage = await pdfDoc.embedJpg(imgBuffer);
      } else {
        embeddedImage = await pdfDoc.embedPng(imgBuffer);
      }

      const { width, height } = embeddedImage.scale(1);
      const maxW = 595 - 40, maxH = 842 - 40;
      const scale = Math.min(maxW / width, maxH / height, 1);

      const page = pdfDoc.addPage([595, 842]);
      page.drawImage(embeddedImage, {
        x: (595 - width * scale) / 2,
        y: (842 - height * scale) / 2,
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

router.post('/qr-generator', async (req, res, next) => {
  try {
    const { text, size = 300, format = 'png', errorCorrectionLevel = 'M', darkColor = '#000000', lightColor = '#ffffff' } = req.body;

    if (!text) return res.status(400).json({ success: false, error: 'Text or URL is required' });

    const sizeNum = Math.min(Math.max(parseInt(size) || 300, 64), 1024);

    if (format === 'svg') {
      const svgString = await QRCode.toString(text, {
        type: 'svg',
        width: sizeNum,
        errorCorrectionLevel,
        color: { dark: darkColor, light: lightColor },
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', 'attachment; filename="qrcode.svg"');
      res.send(svgString);
    } else if (format === 'base64') {
      const dataUrl = await QRCode.toDataURL(text, {
        width: sizeNum,
        errorCorrectionLevel,
        color: { dark: darkColor, light: lightColor },
      });
      res.json({ success: true, result: { dataUrl, format: 'png', width: sizeNum, height: sizeNum } });
    } else {
      const buffer = await QRCode.toBuffer(text, {
        type: 'png',
        width: sizeNum,
        errorCorrectionLevel,
        color: { dark: darkColor, light: lightColor },
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'attachment; filename="qrcode.png"');
      res.send(buffer);
    }
  } catch (err) {
    next(err);
  }
});

router.post('/qr-scanner', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });

    const { data, info } = await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const code = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
      inversionAttempts: 'dontInvert',
    });

    if (!code) {
      const codeInvert = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
        inversionAttempts: 'onlyInvert',
      });

      if (!codeInvert) {
        return res.json({
          success: false,
          error: 'No QR code found in image. Make sure the image contains a clear, well-lit QR code.',
        });
      }

      return res.json({
        success: true,
        result: {
          text: codeInvert.data,
          location: codeInvert.location,
          version: codeInvert.version,
        },
      });
    }

    res.json({
      success: true,
      result: {
        text: code.data,
        location: code.location,
        version: code.version,
      },
    });
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

router.options('*', (req, res) => {
  res.sendStatus(204);
});

module.exports = router;
