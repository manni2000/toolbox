const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const Jimp    = require('jimp');
const QRCode  = require('qrcode');
const jsQR    = require('jsqr');          // real QR scanning
const exifr   = require('exifr');
const { PDFDocument } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun, ImageRun } = require('docx');
const Tesseract = require('tesseract.js');
const { removeBackground } = require('@imgly/background-removal-node');
const NodeCache = require('node-cache');
const path = require('path');
const router = express.Router();

// ── Cache (shared across routes) ─────────────────────────────────────────────
const imageCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// ── Multer ────────────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|bmp|webp|tiff/;
    const ok =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Invalid file type. Only image files are allowed.'));
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Scale pixel dimensions so the image fits within the Word page's printable
 * width (~6 inches = 576px at 96 dpi).
 * docx ImageRun.transformation takes PIXELS, not EMUs — the library converts internally.
 */
function fitPixels(pixelW, pixelH, maxPx = 576) {
  if (pixelW <= maxPx) return { width: pixelW, height: pixelH };
  const scale = maxPx / pixelW;
  return { width: maxPx, height: Math.round(pixelH * scale) };
}

/**
 * Embed an image into a pdf-lib PDFDocument page, handling both JPEG and PNG.
 * Returns the embedded image object.
 */
async function embedImage(pdfDoc, imageBuffer, mimeType) {
  // pdf-lib requires knowing the type up front
  const isPng =
    mimeType === 'image/png' ||
    (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50); // PNG magic bytes

  if (isPng) {
    const pngBuf = await sharp(imageBuffer).png().toBuffer();
    return pdfDoc.embedPng(pngBuf);
  }
  // Convert everything else to JPEG for reliable embedding
  const jpgBuf = await sharp(imageBuffer).jpeg({ quality: 92 }).toBuffer();
  return pdfDoc.embedJpg(jpgBuf);
}

// ── QR Code Generator ─────────────────────────────────────────────────────────
router.post('/qr-generator', async (req, res) => {
  try {
    const { text, size = 200, errorCorrectionLevel = 'M' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const qrCode = await QRCode.toDataURL(text, {
      width: parseInt(size),
      errorCorrectionLevel,
      margin: 1,
    });

    res.json({ success: true, result: { qrCode, text, size, errorCorrectionLevel } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Image Compressor ──────────────────────────────────────────────────────────
router.post('/compress', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const { quality = 85, format = 'jpeg' } = req.body;
    const q = Math.min(100, Math.max(1, parseInt(quality)));

    const pipeline = sharp(req.file.buffer);
    let compressed;

    switch (format) {
      case 'jpeg': compressed = await pipeline.jpeg({ quality: q, chromaSubsampling: '4:4:4' }).toBuffer(); break;
      case 'png':  compressed = await pipeline.png({ compressionLevel: 6 }).toBuffer(); break;
      case 'webp': compressed = await pipeline.webp({ quality: q }).toBuffer(); break;
      default:     return res.status(400).json({ error: 'Unsupported format' });
    }

    res.json({
      success: true,
      result: {
        compressedImage: `data:image/${format};base64,${compressed.toString('base64')}`,
        originalSize: req.file.size,
        compressedSize: compressed.length,
        compressionRatio: (((req.file.size - compressed.length) / req.file.size) * 100).toFixed(2),
        format,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Image Converter ───────────────────────────────────────────────────────────
router.post('/convert', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const { format = 'jpeg', quality = 92 } = req.body;
    const supported = ['jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
    if (!supported.includes(format))
      return res.status(400).json({ error: `Unsupported format. Use: ${supported.join(', ')}` });

    const q = Math.min(100, Math.max(1, parseInt(quality)));
    const pipeline = sharp(req.file.buffer);

    const converted = await {
      jpeg: () => pipeline.jpeg({ quality: q, chromaSubsampling: '4:4:4' }).toBuffer(),
      png:  () => pipeline.png({ compressionLevel: 6 }).toBuffer(),
      webp: () => pipeline.webp({ quality: q }).toBuffer(),
      gif:  () => pipeline.gif().toBuffer(),
      bmp:  () => pipeline.bmp().toBuffer(),
      tiff: () => pipeline.tiff().toBuffer(),
    }[format]();

    res.json({
      success: true,
      result: {
        convertedImage: `data:image/${format};base64,${converted.toString('base64')}`,
        originalFormat: req.file.mimetype,
        newFormat: format,
        originalSize: req.file.size,
        convertedSize: converted.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Image Resize ──────────────────────────────────────────────────────────────
router.post('/resize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const { width, height, maintainAspect = 'true', quality = 92 } = req.body;
    if (!width && !height)
      return res.status(400).json({ error: 'At least width or height is required' });

    // Capture original dimensions BEFORE resizing
    const origMeta = await sharp(req.file.buffer).metadata();

    const resizeOpts = {};
    if (width)  resizeOpts.width  = parseInt(width);
    if (height) resizeOpts.height = parseInt(height);
    if (maintainAspect === 'true') resizeOpts.fit = 'inside';

    const resized = await sharp(req.file.buffer)
      .resize(resizeOpts)
      .jpeg({ quality: parseInt(quality), chromaSubsampling: '4:4:4' })
      .toBuffer();

    const newMeta = await sharp(resized).metadata();

    res.json({
      success: true,
      result: {
        resizedImage: `data:image/jpeg;base64,${resized.toString('base64')}`,
        originalSize: { width: origMeta.width, height: origMeta.height },
        newSize:      { width: newMeta.width,  height: newMeta.height  },
        originalFileSize: req.file.size,
        resizedFileSize:  resized.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Image Crop ────────────────────────────────────────────────────────────────
router.post('/crop', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const { x, y, width, height, quality = 92 } = req.body;
    if (x === undefined || y === undefined || !width || !height)
      return res.status(400).json({ error: 'x, y, width, and height are all required' });

    const cropped = await sharp(req.file.buffer)
      .extract({ left: parseInt(x), top: parseInt(y), width: parseInt(width), height: parseInt(height) })
      .jpeg({ quality: parseInt(quality), chromaSubsampling: '4:4:4' })
      .toBuffer();

    const meta = await sharp(cropped).metadata();

    res.json({
      success: true,
      result: {
        croppedImage: `data:image/jpeg;base64,${cropped.toString('base64')}`,
        cropArea: { x: parseInt(x), y: parseInt(y), width: parseInt(width), height: parseInt(height) },
        newSize: { width: meta.width, height: meta.height },
        originalFileSize: req.file.size,
        croppedFileSize:  cropped.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Background Remover ────────────────────────────────────────────────────────
router.post('/background-remover', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    if (req.file.size > 20 * 1024 * 1024)
      return res.status(400).json({ error: 'File too large. Maximum size is 20 MB.' });

    // Use first 32 bytes of the file buffer as cache key (fast, no full base64)
    const cacheKey = req.file.buffer.slice(0, 32).toString('hex');
    const cached   = imageCache.get(cacheKey);
    if (cached) return res.json({ success: true, ...cached, cached: true });

    const pngBuffer  = await sharp(req.file.buffer).png().toBuffer();
    const blob       = new Blob([pngBuffer], { type: 'image/png' });
    const resultBlob = await removeBackground(blob);
    const resultBuf  = Buffer.from(await resultBlob.arrayBuffer());
    const base64     = resultBuf.toString('base64');

    const payload = {
      image:  `data:image/png;base64,${base64}`,
      result: { originalSize: req.file.size, processedSize: resultBuf.length },
    };
    imageCache.set(cacheKey, payload);

    res.json({ success: true, ...payload });
  } catch (err) {
    console.error('Background removal error:', err);
    res.status(500).json({ error: err.message || 'Failed to remove background' });
  }
});

// ── Base64 Encoder ────────────────────────────────────────────────────────────
router.post('/base64', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const base64  = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.json({
      success: true,
      result: { base64, dataUrl, filename: req.file.originalname, size: req.file.size, mimeType: req.file.mimetype },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── EXIF Viewer ───────────────────────────────────────────────────────────────
router.post('/exif-viewer', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const [exifData, metadata] = await Promise.all([
      exifr.parse(req.file.buffer),
      sharp(req.file.buffer).metadata(),
    ]);

    res.json({
      success: true,
      result: {
        exif: exifData || {},
        metadata: {
          format:      metadata.format,
          width:       metadata.width,
          height:      metadata.height,
          size:        metadata.size,
          density:     metadata.density,
          hasAlpha:    metadata.hasAlpha,
          orientation: metadata.orientation,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Favicon Generator ─────────────────────────────────────────────────────────
router.post('/favicon-generator', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const sizes    = [16, 32, 48, 64, 128, 256];
    const favicons = {};

    await Promise.all(
      sizes.map(async (size) => {
        const buf = await sharp(req.file.buffer)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        favicons[`${size}x${size}`] = `data:image/png;base64,${buf.toString('base64')}`;
      })
    );

    const ico32 = favicons['32x32'].split(',')[1];
    const ico16 = favicons['16x16'].split(',')[1];

    res.json({
      success: true,
      result: {
        favicons,
        ico: `data:image/x-icon;base64,${ico32}`,
        htmlTags: {
          favicon32x32:  `<link rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,${ico32}">`,
          favicon16x16:  `<link rel="icon" type="image/png" sizes="16x16" href="data:image/png;base64,${ico16}">`,
          appleTouchIcon:`<link rel="apple-touch-icon" sizes="180x180" href="${favicons['128x128']}">`,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Image to PDF ──────────────────────────────────────────────────────────────
router.post('/image-to-pdf', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const { pageSize = 'a4', orientation = 'portrait' } = req.body;

    const PAGE_SIZES = {
      a4:     { width: 595.28, height: 841.89 },
      letter: { width: 612,    height: 792    },
      a3:     { width: 841.89, height: 1190.55},
    };
    const base = PAGE_SIZES[pageSize] ?? PAGE_SIZES.a4;

    // Swap dimensions for landscape
    const pageW = orientation === 'landscape' ? base.height : base.width;
    const pageH = orientation === 'landscape' ? base.width  : base.height;

    const MARGIN = 36; // 0.5 inch
    const maxW   = pageW - MARGIN * 2;
    const maxH   = pageH - MARGIN * 2;

    const meta   = await sharp(req.file.buffer).metadata();
    const aspect = meta.width / meta.height;

    // Fit image within margins, preserving aspect ratio
    let imgW = maxW;
    let imgH = imgW / aspect;
    if (imgH > maxH) { imgH = maxH; imgW = imgH * aspect; }

    const x = MARGIN + (maxW - imgW) / 2;
    const y = MARGIN + (maxH - imgH) / 2;

    const pdfDoc = await PDFDocument.create();
    const page   = pdfDoc.addPage([pageW, pageH]);

    // Handles both JPEG and PNG (and converts anything else to JPEG)
    const embeddedImg = await embedImage(pdfDoc, req.file.buffer, req.file.mimetype);

    page.drawImage(embeddedImg, { x, y, width: imgW, height: imgH });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    res.json({
      success:  true,
      result:   { originalFile: req.file.originalname, format: meta.format, dimensions: { width: meta.width, height: meta.height }, pageSize: pageSize.toUpperCase(), orientation, pdfSize: pdfBytes.length },
      file:     `data:application/pdf;base64,${pdfBase64}`,
      filename: req.file.originalname.replace(/\.[^/.]+$/, '.pdf'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to convert image to PDF' });
  }
});

// ── QR Code Scanner ───────────────────────────────────────────────────────────
// Uses jsQR for real decoding (add `jsqr` to package.json)
router.post('/qr-scanner', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    // Convert to raw RGBA via sharp so jsQR can read it
    const { data, info } = await sharp(req.file.buffer)
      .ensureAlpha()          // add alpha channel if missing
      .raw()
      .toBuffer({ resolveWithObject: true });

    const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);

    if (!code) {
      return res.json({
        success:      true,
        result:       { qrCodeFound: false, message: 'No QR code detected in the image.' },
        imageData:    `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      });
    }

    res.json({
      success: true,
      result: {
        qrCodeFound: true,
        data:        code.data,
        format:      'QR_CODE',
        location:    code.location,
        imageSize:   { width: info.width, height: info.height },
      },
      imageData: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to scan QR code' });
  }
});

// ── Image DPI Checker ─────────────────────────────────────────────────────────
router.post('/dpi-checker', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const metadata = await sharp(req.file.buffer).metadata();

    // sharp returns `density` in pixels-per-inch for JPEG/TIFF; PNG stores pixels-per-metre
    // Normalise to DPI
    let dpi = 72; // safe screen default
    if (metadata.density) {
      dpi = metadata.densityUnit === 'pixelsPerCentimeter'
        ? Math.round(metadata.density * 2.54)
        : Math.round(metadata.density);  // already PPI / DPI
    }

    const inch = (px) => (px / dpi).toFixed(2);

    res.json({
      success: true,
      result: {
        originalFile: req.file.originalname,
        format:       metadata.format,
        dimensions:   { width: metadata.width, height: metadata.height },
        dpi,
        densitySource: metadata.density ? 'embedded' : 'default (72)',
        printSizes: {
          [`${dpi} DPI (current)`]: { width: `${inch(metadata.width)} in`, height: `${inch(metadata.height)} in` },
          '150 DPI (low print)':   { width: `${(metadata.width  / 150).toFixed(2)} in`, height: `${(metadata.height / 150).toFixed(2)} in` },
          '300 DPI (high print)':  { width: `${(metadata.width  / 300).toFixed(2)} in`, height: `${(metadata.height / 300).toFixed(2)} in` },
        },
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to check DPI' });
  }
});

// ── Image to Word ─────────────────────────────────────────────────────────────
// Smart detection: photos → embedded image, text scans → OCR
router.post('/image-to-word', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    if (req.file.size > 10 * 1024 * 1024)
      return res.status(400).json({ error: 'File too large. Maximum size is 10 MB.' });

    const metadata = await sharp(req.file.buffer).metadata();

    // ── OCR ──────────────────────────────────────────────────────────────────
    // Pre-process: normalise size + contrast for best Tesseract results
    const ocrBuffer = await sharp(req.file.buffer)
      .resize(null, 1200, { fit: 'inside', withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
      .grayscale()
      .normalise()
      .sharpen({ sigma: 1, flat: 1, jagged: 2 })
      .toBuffer();

    const { data: ocrData } = await Tesseract.recognize(ocrBuffer, 'eng', {
      logger: () => {},                       // suppress progress logs
      config: {
        tessedit_ocr_engine_mode: '1',        // LSTM engine
        tessedit_pageseg_mode:    '3',        // fully automatic page seg
        preserve_interword_spaces: '1',
      },
    });

    const words         = ocrData.words ?? [];
    const rawText       = ocrData.text  ?? '';
    const avgConfidence = words.length
      ? words.reduce((s, w) => s + w.confidence, 0) / words.length
      : 0;

    // Treat as photo only when OCR found nothing meaningful
    const alphaNums = (rawText.match(/[A-Za-z0-9]/g) ?? []).length;
    const isPhoto   = alphaNums < 20 || avgConfidence < 15;

    // ── Build Word document ───────────────────────────────────────────────────
    let doc;
    let conversionType;

    if (isPhoto) {
      // PHOTO MODE – embed the original image, scaled to fit the page
      conversionType = 'image_embed';

      // Always convert to PNG for embedding — universally supported by docx library
      const embBuf  = await sharp(req.file.buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .png()                   // PNG required: jpeg can cause corrupt docx on some builds
        .toBuffer();

      const embMeta = await sharp(embBuf).metadata();
      // fitPixels returns pixel dimensions — docx ImageRun.transformation takes PIXELS
      const { width: pxW, height: pxH } = fitPixels(embMeta.width, embMeta.height);

      doc = new Document({
        sections: [{
          properties: {
            page: {
              size: { width: 12240, height: 15840 },           // US Letter in DXA
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  type:           'png',                        // REQUIRED – omitting corrupts the docx
                  data:           embBuf,                       // Pass Buffer directly, not ArrayBuffer slice
                  transformation: { width: pxW, height: pxH }, // pixels, not EMUs
                  altText: { title: 'Image', description: req.file.originalname, name: 'embedded-image' },
                }),
              ],
            }),
          ],
        }],
      });

    } else {
      // TEXT MODE – clean up OCR output and write as paragraphs
      conversionType = 'ocr_text';

      // Strip non-printable ASCII; keep newlines for paragraph splitting
      const cleanText = rawText
        .replace(/[^\x20-\x7E\n\r]/g, '')
        .replace(/\r\n?/g, '\n')
        .trim() || 'No readable text detected.';

      const paragraphs = cleanText
        .split(/\n{2,}/)                   // split on blank lines
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) =>
          new Paragraph({
            children: block
              .split('\n')
              .flatMap((line, i, arr) =>
                i < arr.length - 1
                  ? [new TextRun({ text: line }), new TextRun({ break: 1 })]
                  : [new TextRun({ text: line })]
              ),
          })
        );

      if (paragraphs.length === 0) {
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: 'No readable text detected.' })] }));
      }

      doc = new Document({ sections: [{ children: paragraphs }] });
    }

    // ── Pack and send ─────────────────────────────────────────────────────────
    const wordBuffer = await Packer.toBuffer(doc);

    res.json({
      success:  true,
      mode:     isPhoto ? 'image' : 'text',
      result: {
        originalFile:   req.file.originalname,
        imageSize:      { width: metadata.width, height: metadata.height },
        conversionType,
        confidence:     Math.round(avgConfidence),
        wordCount:      words.length,
        isPhoto,
      },
      file:     `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${wordBuffer.toString('base64')}`,
      filename: req.file.originalname.replace(/\.[^/.]+$/, '.docx'),
    });

  } catch (err) {
    console.error('Image to Word error:', err);
    res.status(500).json({ error: err.message || 'Failed to convert image to Word' });
  }
});

module.exports = router;