const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Jimp = require('jimp');
const QRCode = require('qrcode');
const exifr = require('exifr');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

// QR Code Generator
router.post('/qr-generator', async (req, res) => {
  try {
    const { text, size = 200, errorCorrectionLevel = 'M' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: size,
      errorCorrectionLevel: errorCorrectionLevel,
      margin: 1
    });

    res.json({
      success: true,
      result: {
        qrCode: qrCodeDataUrl,
        text,
        size,
        errorCorrectionLevel
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image Compressor
router.post('/compress', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { quality = 80, format = 'jpeg' } = req.body;

    let compressedImage;
    if (format === 'jpeg') {
      compressedImage = await sharp(req.file.buffer)
        .jpeg({ quality: parseInt(quality) })
        .toBuffer();
    } else if (format === 'png') {
      compressedImage = await sharp(req.file.buffer)
        .png({ quality: parseInt(quality) })
        .toBuffer();
    } else if (format === 'webp') {
      compressedImage = await sharp(req.file.buffer)
        .webp({ quality: parseInt(quality) })
        .toBuffer();
    }

    const compressedBase64 = compressedImage.toString('base64');
    const mimeType = `image/${format}`;

    res.json({
      success: true,
      result: {
        compressedImage: `data:${mimeType};base64,${compressedBase64}`,
        originalSize: req.file.size,
        compressedSize: compressedImage.length,
        compressionRatio: ((req.file.size - compressedImage.length) / req.file.size * 100).toFixed(2),
        format
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image Converter
router.post('/convert', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { format = 'jpeg', quality = 80 } = req.body;
    const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
    
    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ 
        error: 'Unsupported format. Use jpeg, png, webp, gif, bmp, or tiff' 
      });
    }

    let convertedImage;
    const image = sharp(req.file.buffer);

    switch (format) {
      case 'jpeg':
        convertedImage = await image.jpeg({ quality: parseInt(quality) }).toBuffer();
        break;
      case 'png':
        convertedImage = await image.png().toBuffer();
        break;
      case 'webp':
        convertedImage = await image.webp({ quality: parseInt(quality) }).toBuffer();
        break;
      case 'gif':
        convertedImage = await image.gif().toBuffer();
        break;
      case 'bmp':
        convertedImage = await image.bmp().toBuffer();
        break;
      case 'tiff':
        convertedImage = await image.tiff().toBuffer();
        break;
    }

    const convertedBase64 = convertedImage.toString('base64');
    const mimeType = `image/${format}`;

    res.json({
      success: true,
      result: {
        convertedImage: `data:${mimeType};base64,${convertedBase64}`,
        originalFormat: req.file.mimetype,
        newFormat: format,
        originalSize: req.file.size,
        convertedSize: convertedImage.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image Resize
router.post('/resize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { width, height, maintainAspect = true } = req.body;

    if (!width && !height) {
      return res.status(400).json({ error: 'At least width or height is required' });
    }

    let resizeOptions = {};
    if (width) resizeOptions.width = parseInt(width);
    if (height) resizeOptions.height = parseInt(height);
    
    if (maintainAspect === 'true') {
      resizeOptions.fit = 'inside';
    }

    const resizedImage = await sharp(req.file.buffer)
      .resize(resizeOptions)
      .toBuffer();

    const resizedBase64 = resizedImage.toString('base64');
    const metadata = await sharp(resizedImage).metadata();

    res.json({
      success: true,
      result: {
        resizedImage: `data:image/jpeg;base64,${resizedBase64}`,
        originalSize: { width: null, height: null },
        newSize: { width: metadata.width, height: metadata.height },
        originalFileSize: req.file.size,
        resizedFileSize: resizedImage.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image Crop
router.post('/crop', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { x, y, width, height } = req.body;

    if (x === undefined || y === undefined || !width || !height) {
      return res.status(400).json({ error: 'X, Y, width, and height are required' });
    }

    const croppedImage = await sharp(req.file.buffer)
      .extract({
        left: parseInt(x),
        top: parseInt(y),
        width: parseInt(width),
        height: parseInt(height)
      })
      .toBuffer();

    const croppedBase64 = croppedImage.toString('base64');
    const metadata = await sharp(croppedImage).metadata();

    res.json({
      success: true,
      result: {
        croppedImage: `data:image/jpeg;base64,${croppedBase64}`,
        cropArea: { x: parseInt(x), y: parseInt(y), width: parseInt(width), height: parseInt(height) },
        newSize: { width: metadata.width, height: metadata.height },
        originalFileSize: req.file.size,
        croppedFileSize: croppedImage.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Background Remover (basic implementation)
router.post('/background-remover', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Load the image using Jimp
    const image = await Jimp.read(req.file.buffer);
    
    // Get image dimensions
    const width = image.getWidth();
    const height = image.getHeight();
    
    // Simple background removal: make corners/edges transparent
    // This is a basic implementation - in production, use a proper AI service
    image.scan(0, 0, width, height, (x, y, idx) => {
      const red = image.bitmap.data[idx];
      const green = image.bitmap.data[idx + 1];
      const blue = image.bitmap.data[idx + 2];
      
      // Simple edge detection - if pixel is on the border, make it transparent
      const isEdge = x < 10 || x > width - 10 || y < 10 || y > height - 10;
      
      // Also make white/light backgrounds transparent
      const isLightBackground = (red > 200 && green > 200 && blue > 200);
      
      if (isEdge || isLightBackground) {
        // Set alpha channel to 0 (transparent)
        image.bitmap.data[idx + 3] = 0;
      }
    });
    
    // Convert to PNG with transparency
    const processedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const processedBase64 = processedBuffer.toString('base64');
    
    res.json({
      success: true,
      image: `data:image/png;base64,${processedBase64}`,
      result: {
        note: 'Basic background removal applied. For best results, use images with clear subjects and plain backgrounds.',
        originalSize: req.file.size,
        processedSize: processedBuffer.length
      }
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({ error: error.message || 'Failed to remove background' });
  }
});

// Image to Base64
router.post('/base64', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.json({
      success: true,
      result: {
        base64,
        dataUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EXIF Viewer
router.post('/exif-viewer', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const exifData = await exifr.parse(req.file.buffer);
    const metadata = await sharp(req.file.buffer).metadata();

    res.json({
      success: true,
      result: {
        exif: exifData || {},
        metadata: {
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          size: metadata.size,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha,
          orientation: metadata.orientation
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Favicon Generator
router.post('/favicon-generator', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const sizes = [16, 32, 48, 64, 128, 256];
    const favicons = {};

    for (const size of sizes) {
      const favicon = await sharp(req.file.buffer)
        .resize(size, size)
        .png()
        .toBuffer();
      
      favicons[`${size}x${size}`] = `data:image/png;base64,${favicon.toString('base64')}`;
    }

    // Generate ICO file (32x32)
    const icoBuffer = await sharp(req.file.buffer)
      .resize(32, 32)
      .png()
      .toBuffer();

    res.json({
      success: true,
      result: {
        favicons,
        ico: `data:image/x-icon;base64,${icoBuffer.toString('base64')}`,
        htmlTags: {
          favicon32x32: `<link rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,${favicons['32x32'].split(',')[1]}">`,
          favicon16x16: `<link rel="icon" type="image/png" sizes="16x16" href="data:image/png;base64,${favicons['16x16'].split(',')[1]}">`,
          appleTouchIcon: `<link rel="apple-touch-icon" sizes="180x180" href="data:image/png;base64,${favicons['128x128'].split(',')[1]}">`
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image to PDF (placeholder)
router.post('/image-to-pdf', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use a PDF library like jsPDF or pdfkit
    res.json({
      success: true,
      result: {
        note: 'Image to PDF conversion is not implemented in this demo. Please integrate with a PDF library.',
        originalImage: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
