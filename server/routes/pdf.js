const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const router = express.Router();

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

// PDF to Image
router.post('/to-image', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const { format = 'png', quality = 'medium', pages = 'all' } = req.body;

    // For now, create a simple implementation that returns the PDF as images
    // In a real implementation, you would use pdf-poppler or pdf2pic
    const pdfBase64 = req.file.buffer.toString('base64');
    
    // Get actual page count from PDF
    let totalPages = 1;
    try {
      const pdfDoc = await PDFDocument.load(req.file.buffer);
      totalPages = pdfDoc.getPageCount();
      
      // Limit to reasonable number of pages for demo purposes
      if (totalPages > 10) {
        totalPages = 10;
      }
    } catch (error) {
      console.error('Error reading PDF page count:', error);
      totalPages = 1; // Default to 1 if we can't read the PDF
    }
    
    // Create placeholder images (in production, use actual PDF conversion)
    const images = [];
    
    // Get base filename without extension
    const baseFilename = req.file.originalname.replace(/\.[^/.]+$/, '');
    
    for (let i = 1; i <= totalPages; i++) {
      // If single page, use base filename, otherwise add page number
      const outputFilename = totalPages === 1 
        ? `${baseFilename}.${format}`
        : `${baseFilename}_page_${i}.${format}`;
      
      images.push({
        page: i,
        name: outputFilename,
        image: `data:image/${format};base64,${pdfBase64}` // Placeholder - using PDF data
      });
    }

    res.json({
      success: true,
      result: {
        originalFile: req.file.originalname,
        format,
        quality,
        pages,
        totalPages,
        note: totalPages >= 10 ? 'Large PDFs are limited to 10 pages in this demo.' : null
      },
      images: images
    });
  } catch (error) {
    console.error('PDF to image conversion error:', error);
    res.status(500).json({ error: error.message || 'Failed to convert PDF to images' });
  }
});

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
      if (!pagesArray.includes(i + 1)) { // Pages are 1-indexed in UI
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

    // Load the original PDF
    const originalPdf = await PDFDocument.load(req.file.buffer);
    const totalPages = originalPdf.getPageCount();
    
    // Create new PDF with rotated pages
    const newPdf = await PDFDocument.create();
    
    // Determine which pages to rotate
    let pagesToRotate = [];
    if (pages === 'all') {
      pagesToRotate = Array.from({ length: totalPages }, (_, i) => i);
    } else {
      // Parse specific pages (comma-separated)
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

// Helper function to convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// PDF to Word
router.post('/to-word', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // Convert PDF buffer to base64 for download
    const pdfBuffer = req.file.buffer;
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // For now, we'll return the original PDF as a placeholder for Word conversion
    // In a real implementation, you would use a library like pdf2docx or a conversion service
    const conversionInfo = {
      originalFile: req.file.originalname,
      outputFile: req.file.originalname.replace('.pdf', '.docx'),
      download_blocked: false,
      note: 'PDF to Word conversion placeholder. The original PDF is provided for download.'
    };

    res.json({
      success: true,
      result: conversionInfo,
      // Return the file data for download
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
