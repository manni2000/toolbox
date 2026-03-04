const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { PDFDocument } = require('pdf-lib');
const router = express.Router();

// PDF.js for text extraction (commented out to avoid conflicts with pdftoimg-js)
// const pdfjsLib = require('pdfjs-dist');
// Set worker - use the correct build for Node.js
// const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Remove polyfills for canvas - they cause issues
// Use only essential polyfills
if (!global.URL) {
  global.URL = {
    createObjectURL: () => 'mock-object-url',
    revokeObjectURL: () => {}
  };
}

if (!global.performance) {
  global.performance = {
    now: () => Date.now()
  };
}

// Fast PDF to PNG converter using pdf-to-png-converter for in-memory conversion
const { pdfToPng } = require('pdf-to-png-converter');

// Configure pdfjs-dist for serverless environments
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Set the worker path for pdfjs-dist in serverless
  try {
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
    // In serverless, we need to use a CDN or inline worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  } catch (error) {
    console.warn('Could not configure pdfjs-dist worker:', error.message);
  }
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed.'));
    }
  }
});

// Helper functions - Define before use
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function createPlaceholderImage(width, height, text) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="white"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#ddd" stroke-width="2" stroke-dasharray="5,5"/>
    <text x="${width / 2}" y="${height / 2 - 20}" text-anchor="middle" font-size="18" font-weight="bold" fill="#666">${escapeHtml(text)}</text>
    <text x="${width / 2}" y="${height / 2 + 20}" text-anchor="middle" font-size="12" fill="#999">${width} × ${height}px</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// PDF Merge
router.post('/merge', upload.array('pdfs', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required' });
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Process each uploaded PDF
    for (const file of req.files) {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBase64 = Buffer.from(mergedPdfBytes).toString('base64');
    
    const mergedPDFInfo = {
      files: req.files.map(file => ({
        name: file.originalname,
        size: file.size
      })),
      totalPages: mergedPdf.getPageCount(),
      mergedSize: mergedPdfBytes.length
    };

    res.json({
      success: true,
      result: mergedPDFInfo,
      file: `data:application/pdf;base64,${mergedPdfBase64}`,
      filename: 'merged_document.pdf'
    });
  } catch (error) {
    console.error('PDF merge error:', error);
    res.status(500).json({ error: error.message || 'Failed to merge PDFs' });
  }
});

// PDF Split
router.post('/split', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { splitType = 'single' } = req.body;

    // Load the original PDF
    const originalPdf = await PDFDocument.load(req.file.buffer);
    const totalPages = originalPdf.getPageCount();
    
    const splitFiles = [];

    if (splitType === 'single') {
      // Split each page into separate PDF
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(originalPdf, [i]);
        newPdf.addPage(page);
        
        const pdfBytes = await newPdf.save();
        const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
        
        splitFiles.push({
          name: `page_${i + 1}.pdf`,
          pages: `${i + 1}`,
          file: `data:application/pdf;base64,${pdfBase64}`
        });
      }
    } else {
      // Split by ranges (simplified - split in half for demo)
      const midPoint = Math.ceil(totalPages / 2);
      
      // First part
      const part1 = await PDFDocument.create();
      const part1Pages = await part1.copyPages(originalPdf, Array.from({length: midPoint}, (_, i) => i));
      part1Pages.forEach(page => part1.addPage(page));
      const part1Bytes = await part1.save();
      const part1Base64 = Buffer.from(part1Bytes).toString('base64');
      
      // Second part
      const part2 = await PDFDocument.create();
      const part2Pages = await part2.copyPages(originalPdf, Array.from({length: totalPages - midPoint}, (_, i) => i + midPoint));
      part2Pages.forEach(page => part2.addPage(page));
      const part2Bytes = await part2.save();
      const part2Base64 = Buffer.from(part2Bytes).toString('base64');
      
      splitFiles.push(
        {
          name: 'part_1.pdf',
          pages: `1-${midPoint}`,
          file: `data:application/pdf;base64,${part1Base64}`
        },
        {
          name: 'part_2.pdf',
          pages: `${midPoint + 1}-${totalPages}`,
          file: `data:application/pdf;base64,${part2Base64}`
        }
      );
    }

    const splitInfo = {
      originalFile: req.file.originalname,
      splitType,
      totalPages,
      splitFiles: splitFiles.map(f => ({ name: f.name, pages: f.pages }))
    };

    res.json({
      success: true,
      result: splitInfo,
      files: splitFiles
    });
  } catch (error) {
    console.error('PDF split error:', error);
    res.status(500).json({ error: error.message || 'Failed to split PDF' });
  }
});

// PDF to Image - Fast in-memory conversion using pdftoimg-js
router.post('/to-image', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { format = 'png', quality = 85 } = req.body;
    const imageFormat = format.toLowerCase() === 'jpg' ? 'jpeg' : 'png';
    const qualityVal = Math.min(Math.max(parseInt(quality) || 85, 10), 100);

    console.log(`Converting PDF to ${imageFormat.toUpperCase()} using pdf-to-png-converter...`);
    console.time('PDF conversion');

    const baseFilename = path.parse(req.file.originalname).name;

    // Convert PDF buffer to images using pdf-to-png-converter
    const images = await pdfToPng(req.file.buffer, {
      viewportScale: 2.0 // Higher scale for better quality
    });

    console.timeEnd('PDF conversion');

    if (!images || images.length === 0) {
      return res.status(500).json({ error: 'Failed to generate page images' });
    }

    // Process images into response format
    const processedImages = images.map((page) => {
      const imgBuffer = page.content;
      const base64Image = imgBuffer.toString('base64');
      const mimeType = imageFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const ext = imageFormat === 'jpeg' ? 'jpg' : 'png';

      // Use PDF base name for page 1, add page number for others
      const name = page.pageNumber === 1 
        ? `${baseFilename}.${ext}` 
        : `${baseFilename}_page_${page.pageNumber}.${ext}`;

      return {
        page: page.pageNumber,
        image: `data:${mimeType};base64,${base64Image}`,
        name: name,
        width: page.width,
        height: page.height,
        format: imageFormat,
        size: imgBuffer.length
      };
    });

    return res.json({
      success: true,
      images: processedImages,
      totalPages: images.length,
      renderedPages: images.length,
      format: imageFormat,
      pdfName: baseFilename,
      method: 'pdf-to-png-converter',
      performance: { render: Date.now() }
    });

  } catch (error) {
    console.error('PDF conversion error:', error);

    // Fallback: return PDF as base64 if conversion fails
    try {
      const pdfBase64 = req.file.buffer.toString('base64');
      return res.json({
        success: true,
        images: [{
          page: 1,
          image: `data:application/pdf;base64,${pdfBase64}`,
          name: req.file.originalname,
          format: 'pdf',
          size: req.file.size,
          error: 'Image conversion failed, returning PDF instead'
        }],
        method: 'fallback-pdf'
      });
    } catch (fallbackError) {
      return res.status(500).json({
        error: 'Failed to convert PDF',
        details: error.message
      });
    }
  }
});

// Node.js Canvas Factory for PDF.js
class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    return {
      canvas: canvas,
      context: context,
    };
  }

  destroy(canvasAndContext) {
    // Canvas cleanup is handled by garbage collection
  }
}

// High-quality SVG generation with proper content rendering
function generateHighQualitySvg(width, height, textContent, label) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; }
        .text { fill: #1a1a1a; font-weight: 500; }
        .label { fill: #666; font-size: 11px; }
      </style>
    </defs>
    <!-- Background with subtle pattern -->
    <rect width="${width}" height="${height}" fill="white"/>
    <rect width="${width}" height="${height}" fill="url(#gridPattern)" opacity="0.02"/>
    
    <defs>
      <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e0e0e0" stroke-width="0.5"/>
      </pattern>
    </defs>
    
    <!-- Page border -->
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#d0d0d0" stroke-width="1"/>
    
    <!-- Content -->
    <g class="content">`;

  if (textContent && textContent.items && textContent.items.length > 0) {
    // Sort items by position for natural reading order
    const sortedItems = textContent.items
      .filter(item => item.str && item.str.trim())
      .sort((a, b) => {
        const yDiff = (b.transform[5] || 0) - (a.transform[5] || 0);
        return yDiff !== 0 ? yDiff : (a.transform[4] || 0) - (b.transform[4] || 0);
      });

    // Render text items with better styling
    sortedItems.slice(0, 150).forEach((item, idx) => {
      const x = Math.max(15, Math.min(width - 15, item.transform[4] || 15));
      const y = Math.max(20, Math.min(height - 20, height - (item.transform[5] || 20)));
      const fontSize = Math.max(9, Math.min(24, (item.height || 12) * 0.9));
      const isTitle = idx < 3; // First few items likely titles

      svg += `<text x="${x}" y="${y}" font-size="${fontSize}" ${isTitle ? 'font-weight="bold"' : ''} class="text" opacity="0.92">${escapeHtml(item.str)}</text>`;
    });
  }

  svg += `</g>
    
    <!-- Footer -->
    <line x1="10" y1="${height - 30}" x2="${width - 10}" y2="${height - 30}" stroke="#e0e0e0" stroke-width="0.5"/>
    <text x="${width / 2}" y="${height - 12}" text-anchor="middle" class="label">${escapeHtml(label)}</text>
  </svg>`;

  return svg;
}

function createErrorSvg(width, height, title, message) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#f8d7da"/>
    <circle cx="${width / 2}" cy="${height / 2 - 40}" r="30" fill="none" stroke="#721c24" stroke-width="3"/>
    <text x="${width / 2}" y="${height / 2 - 35}" text-anchor="middle" font-size="32" font-weight="bold" fill="#721c24" font-family="Arial">!</text>
    <text x="${width / 2}" y="${height / 2 + 10}" text-anchor="middle" font-size="22" font-weight="bold" fill="#721c24" font-family="Arial">${escapeHtml(title)}</text>
    <text x="${width / 2}" y="${height / 2 + 50}" text-anchor="middle" font-size="13" fill="#721c24" font-family="Arial">${escapeHtml(message.substring(0, 80))}</text>
  </svg>`;
}

// PDF Password Protection
router.post('/password', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { password, action = 'protect' } = req.body;

    if (!password && action === 'protect') {
      return res.status(400).json({ error: 'Password is required for protection' });
    }

    if (action === 'protect') {
      // Load the existing PDF
      const existingPdfBytes = req.file.buffer;
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Encrypt the PDF with the password
      const pdfBytes = await pdfDoc.save({
        userPassword: password,
        ownerPassword: password,
        useAES128: true
      });

      // Convert to base64 for frontend
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
      const filename = req.file.originalname.replace('.pdf', '_protected.pdf');

      res.json({
        success: true,
        result: {
          originalFile: req.file.originalname,
          outputFile: filename,
          action: 'protect',
          passwordProtected: true
        },
        file: `data:application/pdf;base64,${pdfBase64}`,
        filename: filename
      });
    } else {
      res.status(400).json({ error: 'Only password protection is supported' });
    }
  } catch (error) {
    console.error('PDF password protection error:', error);
    res.status(500).json({ error: error.message || 'Failed to process PDF' });
  }
});

// PDF Unlock
router.post('/unlock', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to unlock PDF' });
    }

    // This is a placeholder implementation
    const unlockInfo = {
      originalFile: req.file.originalname,
      success: true,
      note: 'PDF unlocking is not implemented in this demo. Please integrate with a PDF library.'
    };

    res.json({
      success: true,
      result: unlockInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Page Remover
router.post('/remove-pages', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { pagesToRemove } = req.body;

    if (!pagesToRemove) {
      return res.status(400).json({ error: 'Pages to remove are required' });
    }

    // Parse pages to remove (support comma-separated values and ranges)
    const pagesArray = pagesToRemove.split(',').map(p => {
      const trimmed = p.trim();
      if (trimmed.includes('-')) {
        // Handle ranges like "1-3"
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      return parseInt(trimmed);
    }).flat();

    // Load the original PDF
    const originalPdf = await PDFDocument.load(req.file.buffer);
    const totalPages = originalPdf.getPageCount();
    
    // Create new PDF with remaining pages
    const newPdf = await PDFDocument.create();
    
    // Add all pages except the ones to remove
    for (let i = 0; i < totalPages; i++) {
      if (!pagesArray.includes(i + 1)) { 
        const [page] = await newPdf.copyPages(originalPdf, [i]);
        newPdf.addPage(page);
      }
    }

    // Save the modified PDF
    const pdfBytes = await newPdf.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    
    const removeInfo = {
      originalFile: req.file.originalname,
      pagesToRemove,
      totalPages,
      removedPages: pagesArray.length,
      remainingPages: totalPages - pagesArray.length
    };

    res.json({
      success: true,
      result: removeInfo,
      file: `data:application/pdf;base64,${pdfBase64}`,
      filename: req.file.originalname.replace('.pdf', '_removed_pages.pdf')
    });
  } catch (error) {
    console.error('PDF page removal error:', error);
    res.status(500).json({ error: error.message || 'Failed to remove pages' });
  }
});

// PDF Rotate
router.post('/rotate', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { angle = 90, pages = 'all' } = req.body;

    const validAngles = [90, 180, 270];
    if (!validAngles.includes(parseInt(angle))) {
      return res.status(400).json({ error: 'Rotation angle must be 90, 180, or 270 degrees' });
    }

    const originalPdf = await PDFDocument.load(req.file.buffer);
    const totalPages = originalPdf.getPageCount();
    
    const newPdf = await PDFDocument.create();
    
    let pagesToRotate = [];
    if (pages === 'all') {
      pagesToRotate = Array.from({ length: totalPages }, (_, i) => i);
    } else {
      pagesToRotate = pages.split(',').map(p => parseInt(p.trim()) - 1).filter(n => n >= 0 && n < totalPages);
    }
    
    // Copy all pages, rotating the specified ones
    for (let i = 0; i < totalPages; i++) {
      const [page] = await newPdf.copyPages(originalPdf, [i]);
      
      if (pagesToRotate.includes(i)) {
        page.setRotation(degreesToRadians(parseInt(angle)));
      }
      
      newPdf.addPage(page);
    }

    // Save the rotated PDF
    const pdfBytes = await newPdf.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    
    const rotateInfo = {
      originalFile: req.file.originalname,
      angle: parseInt(angle),
      pages,
      totalPages,
      rotatedPages: pagesToRotate.length
    };

    res.json({
      success: true,
      result: rotateInfo,
      file: `data:application/pdf;base64,${pdfBase64}`,
      filename: req.file.originalname.replace('.pdf', `_rotated_${angle}.pdf`)
    });
  } catch (error) {
    console.error('PDF rotation error:', error);
    res.status(500).json({ error: error.message || 'Failed to rotate PDF' });
  }
});

// PDF to Word
router.post('/to-word', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // Convert PDF buffer to base64 for download
    const pdfBuffer = req.file.buffer;
    const pdfBase64 = pdfBuffer.toString('base64');
    
    const conversionInfo = {
      originalFile: req.file.originalname,
      outputFile: req.file.originalname.replace('.pdf', '.docx'),
      download_blocked: false,
      note: 'PDF to Word conversion placeholder. The original PDF is provided for download.'
    };

    res.json({
      success: true,
      result: conversionInfo,
      file: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${pdfBase64}`,
      filename: req.file.originalname.replace('.pdf', '.docx')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF to PowerPoint
router.post('/to-powerpoint', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // This is a placeholder implementation
    const conversionInfo = {
      originalFile: req.file.originalname,
      outputFile: 'converted.pptx',
      note: 'PDF to PowerPoint conversion is not implemented in this demo. Please integrate with a conversion service.'
    };

    res.json({
      success: true,
      result: conversionInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF to Excel
router.post('/to-excel', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // This is a placeholder implementation
    const conversionInfo = {
      originalFile: req.file.originalname,
      outputFile: 'converted.xlsx',
      note: 'PDF to Excel conversion is not implemented in this demo. Please integrate with a conversion service.'
    };

    res.json({
      success: true,
      result: conversionInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Word to PDF
router.post('/word-to-pdf', upload.single('doc'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Word file provided' });
    }

    // This is a placeholder implementation
    const conversionInfo = {
      originalFile: req.file.originalname,
      outputFile: 'converted.pdf',
      note: 'Word to PDF conversion is not implemented in this demo. Please integrate with a conversion service or library like libreoffice.'
    };

    res.json({
      success: true,
      result: conversionInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PowerPoint to PDF
router.post('/powerpoint-to-pdf', upload.single('ppt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PowerPoint file provided' });
    }

    // This is a placeholder implementation
    const conversionInfo = {
      originalFile: req.file.originalname,
      outputFile: 'converted.pdf',
      note: 'PowerPoint to PDF conversion is not implemented in this demo. Please integrate with a conversion service.'
    };

    res.json({
      success: true,
      result: conversionInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HTML to PDF
router.post('/html-to-pdf', async (req, res) => {
  try {
    const { html, url, options = {} } = req.body;

    if (!html && !url) {
      return res.status(400).json({ error: 'HTML content or URL is required' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use puppeteer or similar
    const conversionInfo = {
      input: html ? 'HTML content' : url,
      outputFile: 'converted.pdf',
      options: {
        format: options.format || 'A4',
        orientation: options.orientation || 'portrait',
        margin: options.margin || '1cm'
      },
      note: 'HTML to PDF conversion is not implemented in this demo. Please integrate with puppeteer or similar.'
    };

    res.json({
      success: true,
      result: conversionInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Info Extractor
router.post('/info', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use pdf-parse or similar
    const pdfInfo = {
      filename: req.file.originalname,
      size: req.file.size,
      pages: 10, // Placeholder
      title: 'Sample PDF Document',
      author: 'Unknown',
      subject: 'Document',
      creator: 'Unknown',
      producer: 'Unknown',
      creationDate: new Date().toISOString(),
      modificationDate: new Date().toISOString(),
      isEncrypted: false,
      isPasswordProtected: false,
      note: 'PDF info extraction is not implemented in this demo. Please integrate with pdf-parse or similar.'
    };

    res.json({
      success: true,
      result: pdfInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Compress
router.post('/compress', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { quality = 'medium' } = req.body;

    // This is a placeholder implementation
    const compressInfo = {
      originalFile: req.file.originalname,
      originalSize: req.file.size,
      quality,
      compressedSize: Math.floor(req.file.size * 0.7), // Placeholder
      compressionRatio: '30%',
      note: 'PDF compression is not implemented in this demo. Please integrate with a PDF compression library.'
    };

    res.json({
      success: true,
      result: compressInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
