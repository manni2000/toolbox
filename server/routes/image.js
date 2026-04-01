const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Jimp = require('jimp');
const QRCode = require('qrcode');
const exifr = require('exifr');
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
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

    const { quality = 95, format = 'jpeg' } = req.body;

    let compressedImage;
    if (format === 'jpeg') {
      compressedImage = await sharp(req.file.buffer)
        .jpeg({ quality: parseInt(quality), chromaSubsampling: '4:4:4' })
        .toBuffer();
    } else if (format === 'png') {
      compressedImage = await sharp(req.file.buffer)
        .png({ compressionLevel: 6, quality: 100 })
        .toBuffer();
    } else if (format === 'webp') {
      compressedImage = await sharp(req.file.buffer)
        .webp({ quality: parseInt(quality), lossless: false })
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

    const { format = 'jpeg', quality = 95 } = req.body;
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
        convertedImage = await image.jpeg({ quality: parseInt(quality), chromaSubsampling: '4:4:4' }).toBuffer();
        break;
      case 'png':
        convertedImage = await image.png({ compressionLevel: 6, quality: 100 }).toBuffer();
        break;
      case 'webp':
        convertedImage = await image.webp({ quality: parseInt(quality), lossless: false }).toBuffer();
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

    const { width, height, maintainAspect = true, quality = 95 } = req.body;

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
      .jpeg({ quality: parseInt(quality), chromaSubsampling: '4:4:4' })
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

    const { x, y, width, height, quality = 95 } = req.body;

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
      .jpeg({ quality: parseInt(quality), chromaSubsampling: '4:4:4' })
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

// Image to PDF
router.post('/image-to-pdf', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { pageSize = 'a4', orientation = 'portrait', quality = 'high' } = req.body;

    // Load the image using sharp to get metadata and buffer
    const imageBuffer = req.file.buffer;
    const metadata = await sharp(imageBuffer).metadata();

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Define page sizes (in points)
    const pageSizes = {
      'a4': { width: 595, height: 842 },
      'letter': { width: 612, height: 792 },
      'a3': { width: 842, height: 1191 }
    };
    
    const selectedSize = pageSizes[pageSize] || pageSizes['a4'];
    
    // Calculate image dimensions to fit the page
    let imgWidth, imgHeight;
    const aspectRatio = metadata.width / metadata.height;
    
    if (orientation === 'landscape') {
      imgWidth = selectedSize.height;
      imgHeight = selectedSize.height / aspectRatio;
    } else {
      imgWidth = selectedSize.width;
      imgHeight = selectedSize.width / aspectRatio;
    }
    
    // Center the image on the page
    const x = (selectedSize.width - imgWidth) / 2;
    const y = (selectedSize.height - imgHeight) / 2;

    // Add the image to the PDF
    const image = await pdfDoc.embedJpg(imageBuffer); // Try JPG first
    const page = pdfDoc.addPage([selectedSize.width, selectedSize.height]);
    page.drawImage(image, {
      x: x,
      y: y,
      width: imgWidth,
      height: imgHeight
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    const conversionInfo = {
      originalFile: req.file.originalname,
      format: metadata.format,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      pageSize: pageSize.toUpperCase(),
      orientation,
      pdfSize: pdfBytes.length
    };

    res.json({
      success: true,
      result: conversionInfo,
      file: `data:application/pdf;base64,${pdfBase64}`,
      filename: req.file.originalname.replace(/\.[^/.]+$/, '.pdf')
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to convert image to PDF' });
  }
});

// QR Code Scanner
router.post('/qr-scanner', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Load the image using Jimp
    const image = await Jimp.read(req.file.buffer);
    
    // For demo purposes, we'll return a placeholder result
    // In a real implementation, you would use a QR code scanning library like jsQR or qrcode-reader
    const scanResult = {
      originalFile: req.file.originalname,
      imageSize: {
        width: image.getWidth(),
        height: image.getHeight()
      },
      qrCodeFound: true,
      data: 'https://example.com/sample-qr-data',
      format: 'QR_CODE',
      note: 'QR code scanning is simulated in this demo. Please integrate with a QR scanning library like jsQR.'
    };

    res.json({
      success: true,
      result: scanResult,
      imageData: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to scan QR code' });
  }
});

// Image DPI Checker
router.post('/dpi-checker', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Load the image using sharp to get metadata
    const metadata = await sharp(req.file.buffer).metadata();
    
    // Calculate DPI if available, otherwise estimate
    let dpi = metadata.dpi || 72; // Default to 72 DPI if not specified
    
    // Calculate print sizes at different DPI values
    const printSizes = {
      '72 DPI (Screen)': {
        width: `${(metadata.width / dpi).toFixed(2)} inches`,
        height: `${(metadata.height / dpi).toFixed(2)} inches`
      },
      '150 DPI (Low Print)': {
        width: `${(metadata.width / 150).toFixed(2)} inches`,
        height: `${(metadata.height / 150).toFixed(2)} inches`
      },
      '300 DPI (High Print)': {
        width: `${(metadata.width / 300).toFixed(2)} inches`,
        height: `${(metadata.height / 300).toFixed(2)} inches`
      }
    };

    const dpiInfo = {
      originalFile: req.file.originalname,
      format: metadata.format,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      dpi: dpi,
      printSizes: printSizes,
      fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`
    };

    res.json({
      success: true,
      result: dpiInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to check image DPI' });
  }
});

// Image to Word (OCR placeholder)
router.post('/image-to-word', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Load the image using Jimp
    const image = await Jimp.read(req.file.buffer);
    
    // This is a placeholder implementation
    // In a real implementation, you would use an OCR library like Tesseract.js
    const ocrResult = {
      originalFile: req.file.originalname,
      imageSize: {
        width: image.getWidth(),
        height: image.getHeight()
      },
      extractedText: 'This is placeholder text extracted from the image. In a real implementation, this would contain the actual text extracted using OCR.',
      confidence: 0.95,
      language: 'eng',
      note: 'OCR is simulated in this demo. Please integrate with an OCR library like Tesseract.js for actual text extraction.'
    };

    // Create a simple Word document content (as base64)
    const wordContent = `Extracted Text from ${req.file.originalname}\n\n${ocrResult.extractedText}`;
    const wordBase64 = Buffer.from(wordContent).toString('base64');

    res.json({
      success: true,
      result: ocrResult,
      file: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${wordBase64}`,
      filename: req.file.originalname.replace(/\.[^/.]+$/, '.docx')
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to convert image to Word' });
  }
});

module.exports = router;
