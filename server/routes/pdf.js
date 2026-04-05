const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { PDFDocument, StandardFonts } = require('pdf-lib');

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  console.log('Configuring pdf-lib for serverless environment...');
  
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('Unable to load font data') || 
         args[0].includes('fetchStandardFontData'))) {
      return;
    }
    originalWarn.apply(console, args);
  };
}
const router = express.Router();

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

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 
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

async function convertPdfWithPngConverter(pdfBuffer, baseFilename, format = 'png') {
  console.log('Attempting PDF conversion with pdf-to-png-converter...');

  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.VERCEL === '1' || 
                       process.env.VERCEL_ENV === 'production';

  try {
    if (isProduction) {
      return await convertPdfWithPdfjsDirect(pdfBuffer, baseFilename, format);
    }

    const pdfToPng = require('pdf-to-png-converter');
    const results = await pdfToPng.pdfToPng(pdfBuffer, {
      viewportScale: 2.0,            
      returnPageContent: true       
    });

    if (!results || results.length === 0) {
      throw new Error('pdf-to-png-converter returned no results');
    }

    const processedImages = results.map((result, index) => {
      const base64 = result.content ? result.content.toString('base64') : '';
      const pageNum = result.pageNumber || (index + 1);
      const name = pageNum === 1 ? `${baseFilename}.png` : `${baseFilename}_${pageNum}.png`;
      return {
        page: pageNum,
        image: `data:image/png;base64,${base64}`,
        name: name,
        width: result.width || 2000,
        height: result.height || 2000,
        format: 'png',
        size: result.content ? result.content.length : 0
      };
    });

    return processedImages;
  } catch (error) {
    console.error('pdf-to-png-converter conversion failed:', error);
    throw error;
  }
}

async function convertPdfWithPdfjsDirect(pdfBuffer, baseFilename, format = 'png') {
  console.log('Using direct pdfjs-dist conversion (serverless mode)...');
  
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    const workerPath = path.resolve(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
    const standardFontDataPath = path.resolve(__dirname, '..', 'node_modules', 'pdfjs-dist', 'standard_fonts') + '/';
    const cMapPath = path.resolve(__dirname, '..', 'node_modules', 'pdfjs-dist', 'cmaps') + '/';
    
    const { pathToFileURL } = require('url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
    
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      disableFontFace: true,
      useSystemFonts: false,
      isEvalSupported: false,
      disableAutoFetch: true,
      disableStream: true,
      disableRange: true,      
      disableCreateObjectURL: true, 
      standardFontDataUrl: pathToFileURL(standardFontDataPath).href,
      cMapUrl: pathToFileURL(cMapPath).href,
      cMapPacked: true,
    });
    
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    
    const maxPages = Math.min(numPages, 20);
    console.log(`PDF has ${numPages} pages, converting first ${maxPages} for speed...`);
    
    const processedImages = [];
    
    const { createCanvas } = require('@napi-rs/canvas');
    
    const scale = 2.0;
    
    const BATCH_SIZE = 6; 
    
    for (let i = 0; i < maxPages; i += BATCH_SIZE) {
      const batch = [];
      for (let j = 0; j < BATCH_SIZE && (i + j) < maxPages; j++) {
        const pageNum = i + j + 1;
        batch.push(
          pdfDocument.getPage(pageNum).then(async (page) => {
            const viewport = page.getViewport({ scale });
            
            const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
            const context = canvas.getContext('2d');
            
            const renderPromise = page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Page render timeout')), 3000)
            );
            
            try {
              await Promise.race([renderPromise, timeoutPromise]);
            } catch (error) {
              console.warn(`Page ${pageNum} render failed, using placeholder:`, error.message);
              context.fillStyle = '#f0f0f0';
              context.fillRect(0, 0, viewport.width, viewport.height);
              context.fillStyle = '#666';
              context.font = '20px Arial';
              context.textAlign = 'center';
              context.fillText(`Page ${pageNum}`, viewport.width/2, viewport.height/2);
            }
            
            const imageBuffer = canvas.toBuffer('image/png');
            const base64 = imageBuffer.toString('base64');
            
            const name = pageNum === 1 ? `${baseFilename}.png` : `${baseFilename}_${pageNum}.png`;
            
            const result = {
              page: pageNum,
              image: `data:image/png;base64,${base64}`,
              name: name,
              width: Math.floor(viewport.width),
              height: Math.floor(viewport.height),
              format: 'png',
              size: imageBuffer.length
            };
            
            page.cleanup();
            return result;
          })
        );
      }
      
      const batchResults = await Promise.all(batch);
      processedImages.push(...batchResults);
    }
    
    processedImages.sort((a, b) => a.page - b.page);
    
    await pdfDocument.cleanup();
    
    console.log(`Successfully converted ${processedImages.length} pages`);
    return processedImages;
    
  } catch (error) {
    console.error('Direct pdfjs-dist conversion failed:', error);
    throw error;
  }
}

router.post('/merge', upload.array('pdfs', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required' });
    }

    const baseFilename = req.files[0].originalname.replace(/\.pdf$/i, '');

    const mergedPdf = await PDFDocument.create();
    
    for (const file of req.files) {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }

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
      filename: `${baseFilename}.pdf`
    });
  } catch (error) {
    console.error('PDF merge error:', error);
    res.status(500).json({ error: error.message || 'Failed to merge PDFs' });
  }
});

router.post('/split', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { splitType = 'single' } = req.body;
    const baseFilename = req.file.originalname.replace(/\.pdf$/i, '');

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
        
        // Use clean filename: baseFilename.pdf for page 1, baseFilename_2.pdf for others
        const name = i === 0 ? `${baseFilename}.pdf` : `${baseFilename}_${i + 1}.pdf`;
        
        splitFiles.push({
          name: name,
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
          name: `${baseFilename}.pdf`,
          pages: `1-${midPoint}`,
          file: `data:application/pdf;base64,${part1Base64}`
        },
        {
          name: `${baseFilename}_2.pdf`,
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

    // Check if we're in production/serverless - pdf-to-png-converter doesn't work due to pdfjs-dist worker issues
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.VERCEL === '1' || 
                        process.env.VERCEL_ENV === 'production' ||
                        !process.env.NODE_ENV; // Default to production if not set
    
    const baseFilename = path.parse(req.file.originalname).name;
    
    console.log('Environment check:', { 
      NODE_ENV: process.env.NODE_ENV, 
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      isProduction 
    });

    // Try PDF conversion even in production to get detailed error info
    let conversionAttempted = false;
    let conversionError = null;
    let conversionResult = null;

    if (isProduction) {
      console.log('Attempting PDF conversion in production environment for debugging...');
      
      // Try pdf-to-png-converter first (serverless-friendly with @napi-rs/canvas)
      try {
        console.log('Trying pdf-to-png-converter...');
        
        const images = await convertPdfWithPngConverter(req.file.buffer, baseFilename, 'png');
        
        if (images && images.length > 0) {
          console.log('PDF conversion succeeded with pdf-to-png-converter!');
          
          // Images are already processed by convertPdfWithPngConverter
          conversionResult = images;
          
          conversionAttempted = true;
        } else {
          throw new Error('pdf-to-png-converter returned empty result');
        }
      } catch (error) {
        conversionError = error;
        console.error('pdf-to-png-converter failed:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          code: error.code
        });
        
        // Continue with fallback
      }
    }

    if (isProduction && !conversionAttempted) {
      console.log('PDF conversion disabled in production - using fallback due to known issues');
      
      // Return PDF as base64 in production since image conversion has worker issues
      const pdfBase64 = req.file.buffer.toString('base64');
      return res.json({
        success: true,
        images: [{
          page: 1,
          image: `data:application/pdf;base64,${pdfBase64}`,
          name: req.file.originalname,
          format: 'pdf',
          size: req.file.size,
          error: `PDF to image conversion not available in production environment. Error: ${conversionError?.message || 'Cloudinary failed'}`
        }],
        totalPages: 1,
        renderedPages: 1,
        format: 'pdf',
        pdfName: path.parse(req.file.originalname).name,
        method: 'production-fallback',
        debug: {
          attempted: conversionAttempted,
          error: conversionError ? {
            message: conversionError.message,
            code: conversionError.code,
            name: conversionError.name
          } : null,
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            VERCEL_ENV: process.env.VERCEL_ENV
          }
        },
        performance: { render: Date.now() }
      });
    }

    // Check if we already have processed images from production conversion
    let images;
    if (conversionResult) {
      images = conversionResult;
    } else {
      // Convert PDF buffer to images using pdf-to-png-converter (serverless-friendly with @napi-rs/canvas)
      images = await convertPdfWithPngConverter(req.file.buffer, baseFilename, 'png');
    }

    if (!images || images.length === 0) {
      return res.status(500).json({ error: 'Failed to generate page images' });
    }

    // Process images into response format
    const processedImages = images.map((page, index) => {
      // Handle both pdf-to-img buffer format and our processed format
      const imgBuffer = page.content || page;

      const base64Image = imgBuffer.toString('base64');
      const mimeType = imageFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const ext = imageFormat === 'jpeg' ? 'jpg' : 'png';
      const pageNum = page.pageNumber || (index + 1);

      // Use clean filename: baseFilename.ext for page 1, baseFilename_2.ext for others
      const name = pageNum === 1 ? `${baseFilename}.${ext}` : `${baseFilename}_${pageNum}.${ext}`;

      return {
        page: pageNum,
        image: page.image || `data:${mimeType};base64,${base64Image}`, // Use existing image if URL
        name: name,
        width: page.width || 2000,
        height: page.height || 2000,
        format: imageFormat,
        size: page.size || imgBuffer.length
      };
    });

    return res.json({
      success: true,
      images: processedImages,
      totalPages: processedImages.length,
      renderedPages: processedImages.length,
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
      filename: req.file.originalname
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
      filename: req.file.originalname
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

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 48;
    const lineHeight = 16;
    const fontSize = 11;
    const maxLineWidth = pageWidth - margin * 2;

    // Convert HTML into readable plain text for a reliable fallback PDF output.
    const sourceText = html
      ? String(html)
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<\s*br\s*\/?>/gi, '\n')
          .replace(/<\s*\/p\s*>/gi, '\n\n')
          .replace(/<\s*\/div\s*>/gi, '\n')
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
      : `Source URL: ${String(url)}`;

    const normalizedText = sourceText
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const lines = [];
    normalizedText.split('\n').forEach((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) {
        lines.push('');
        return;
      }

      const words = trimmed.split(' ');
      let currentLine = '';

      words.forEach((word) => {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(nextLine, fontSize);

        if (width <= maxLineWidth) {
          currentLine = nextLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) lines.push(currentLine);
    });

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let cursorY = pageHeight - margin;

    page.drawText('HTML to PDF Conversion', {
      x: margin,
      y: cursorY,
      size: 14,
      font,
    });
    cursorY -= lineHeight * 1.8;

    const printableLines = lines.length > 0 ? lines : ['(No readable text extracted from HTML)'];

    printableLines.forEach((line) => {
      if (cursorY < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        cursorY = pageHeight - margin;
      }

      page.drawText(line, {
        x: margin,
        y: cursorY,
        size: fontSize,
        font,
      });

      cursorY -= lineHeight;
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const filename = 'converted.pdf';

    res.json({
      success: true,
      result: {
        input: html ? 'HTML content' : url,
        outputFile: filename,
        options: {
          format: options.format || 'A4',
          orientation: options.orientation || 'portrait',
          margin: options.margin || '1cm'
        },
        pages: pdfDoc.getPageCount()
      },
      file: `data:application/pdf;base64,${pdfBase64}`,
      filename
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
