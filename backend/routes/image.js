const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const { PDFDocument } = require('pdf-lib');
const { uploadLimiter } = require('../middleware/security');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

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

    let exifData = {};
    try {
      const exifr = require('exifr');
      
      if (req.file.mimetype === 'image/png') {
        exifData = {};
      } else {
        const parsedData = await exifr.parse(req.file.buffer, {
          pick: ['Make', 'Model', 'Software', 'DateTime', 'DateTimeOriginal', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO', 'ISOSpeedRatings', 'latitude', 'longitude', 'Orientation'],
          translateKeys: true,
          reviveValues: true
        });
        
        exifData = parsedData || {};
        
        if (exifData && Object.keys(exifData).length === 0) {
          const allExif = await exifr.parse(req.file.buffer);
          exifData = allExif || {};
        }
      }
    } catch (exifError) {
      exifData = {};
    }

    const responseData = {
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
        make: (exifData && exifData.Make) || null,
        model: (exifData && exifData.Model) || null,
        software: (exifData && exifData.Software) || meta.software || null,
        dateTime: (exifData && (exifData.DateTime || exifData.DateTimeOriginal)) || null,
        lensModel: (exifData && exifData.LensModel) || null,
        focalLength: (exifData && exifData.FocalLength) ? `${exifData.FocalLength}mm` : null,
        aperture: (exifData && exifData.FNumber) ? `f/${exifData.FNumber}` : null,
        shutterSpeed: (exifData && exifData.ExposureTime) ? `1/${Math.round(1/exifData.ExposureTime)}s` : null,
        iso: (exifData && (exifData.ISO || exifData.ISOSpeedRatings)) || null,
        gps: (exifData && exifData.latitude && exifData.longitude) ? {
          lat: exifData.latitude,
          lng: exifData.longitude
        } : null,
        orientation: (exifData && exifData.Orientation) || meta.orientation || null,
      },
    };
    
    res.json(responseData);
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

    const threshold = parseInt(req.body.threshold) || 30;
    const image = sharp(req.file.buffer);
    const meta = await image.metadata();

    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    const samplePoints = [];
    const margin = 5;
    
    for (let x = margin; x < width - margin; x += Math.max(1, Math.floor(width / 10))) {
      samplePoints.push({ x, y: margin });
    }
    for (let x = margin; x < width - margin; x += Math.max(1, Math.floor(width / 10))) {
      samplePoints.push({ x, y: height - margin - 1 });
    }
    for (let y = margin; y < height - margin; y += Math.max(1, Math.floor(height / 10))) {
      samplePoints.push({ x: margin, y });
    }
    for (let y = margin; y < height - margin; y += Math.max(1, Math.floor(height / 10))) {
      samplePoints.push({ x: width - margin - 1, y });
    }

    const sampleColors = samplePoints.map(({ x, y }) => {
      const idx = (y * width + x) * channels;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
    });

    const sortedR = [...sampleColors].sort((a, b) => a.r - b.r);
    const sortedG = [...sampleColors].sort((a, b) => a.g - b.g);
    const sortedB = [...sampleColors].sort((a, b) => a.b - b.b);
    const mid = Math.floor(sampleColors.length / 2);
    
    const bgR = sortedR[mid].r;
    const bgG = sortedG[mid].g;
    const bgB = sortedB[mid].b;

    const newData = Buffer.from(data);
    
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const distance = Math.sqrt(
        Math.pow(r - bgR, 2) * 0.299 +
        Math.pow(g - bgG, 2) * 0.587 +
        Math.pow(b - bgB, 2) * 0.114
      );

      if (distance < threshold) {
        newData[i + 3] = 0; 
      }
    }

    const result = await sharp(newData, {
      raw: { width, height, channels: 4 },
    }).png().toBuffer();

    const base64 = result.toString('base64');    
    res.json({
      success: true,
      result: {
        image: base64,
        format: 'png',
        width,
        height
      }
    });
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

    // Validate image file type
    if (!validateImageFile(req.file)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid image type. Please upload a valid image file (JPEG, PNG, WebP, GIF, AVIF, or TIFF).' 
      });
    }

    let data, info;
    try {
      const result = await sharp(req.file.buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      data = result.data;
      info = result.info;
      console.log('[QR Scanner] Image processed successfully:', { width: info.width, height: info.height, dataLength: data.length });
    } catch (sharpError) {
      console.error('[QR Scanner] Sharp Error:', sharpError);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid image file or corrupted image data.' 
      });
    }

    // Validate image data before passing to jsQR
    if (!data || data.length === 0 || !info.width || !info.height) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image data for QR code scanning.'
      });
    }

    // Ensure data length matches expected dimensions
    const expectedLength = info.width * info.height * 4; // RGBA
    if (data.length !== expectedLength) {
      console.log('[QR Scanner] Data length mismatch:', { expected: expectedLength, actual: data.length });
      // Try to handle the mismatch
      if (data.length < expectedLength) {
        return res.status(400).json({
          success: false,
          error: 'Image too small for QR code scanning.'
        });
      }
    }

    let code;
    try {
      const clampedArray = new Uint8ClampedArray(data);
      code = jsQR(clampedArray, info.width, info.height, {
        inversionAttempts: 'dontInvert',
      });
      console.log('[QR Scanner] First scan attempt:', code ? 'QR found' : 'No QR found');
    } catch (jsqrError) {
      console.error('[QR Scanner] jsQR Error (dontInvert):', jsqrError);
      // Don't return error here, try the inverted version
      code = null;
    }

    if (!code) {
      let codeInvert;
      try {
        const clampedArray = new Uint8ClampedArray(data);
        codeInvert = jsQR(clampedArray, info.width, info.height, {
          inversionAttempts: 'onlyInvert',
        });
        console.log('[QR Scanner] Second scan attempt (inverted):', codeInvert ? 'QR found' : 'No QR found');
      } catch (jsqrError) {
        console.error('[QR Scanner] jsQR Error (onlyInvert):', jsqrError);
        // Don't return error here, just return no QR found
        codeInvert = null;
      }

      if (!codeInvert) {
        return res.json({
          success: false,
          error: 'No QR code detected in the uploaded image. Please ensure the image contains a clear, well-lit QR code.',
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
    console.error('[QR Scanner Error]', err);
    // Don't pass to generic error handler - return specific error
    return res.status(500).json({ 
      success: false, 
      error: 'QR code scanning service is temporarily unavailable. Please try again later.' 
    });
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
