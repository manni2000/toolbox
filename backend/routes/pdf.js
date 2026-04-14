const express = require('express');
const multer = require('multer');
const { PDFDocument, degrees } = require('pdf-lib');
const { uploadLimiter } = require('../middleware/security');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(uploadLimiter);

function getUploadedFile(req, fieldNames = ['file', 'pdf']) {
  if (req.file) return req.file;
  for (const fieldName of fieldNames) {
    const candidate = req.files?.[fieldName];
    if (Array.isArray(candidate) && candidate[0]) return candidate[0];
  }
  return null;
}

function getUploadedFiles(req, fieldNames = ['files', 'pdfs']) {
  if (Array.isArray(req.files)) return req.files;

  const files = [];
  for (const fieldName of fieldNames) {
    const candidate = req.files?.[fieldName];
    if (Array.isArray(candidate)) files.push(...candidate);
  }

  return files;
}

router.post('/merge', upload.fields([{ name: 'files', maxCount: 20 }, { name: 'pdfs', maxCount: 20 }]), async (req, res, next) => {
  try {
    const files = getUploadedFiles(req);
    if (!files || files.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 PDF files required' });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      if (file.mimetype !== 'application/pdf') continue;
      const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    const bytes = await mergedPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    next(err);
  }
});

router.post('/split', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const { fromPage = 1, toPage } = req.body;
    const srcPdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const pageCount = srcPdf.getPageCount();

    const from = Math.max(1, parseInt(fromPage)) - 1;
    const to = Math.min(pageCount, parseInt(toPage) || pageCount) - 1;

    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(srcPdf, Array.from({ length: to - from + 1 }, (_, i) => from + i));
    pages.forEach(p => newPdf.addPage(p));

    const bytes = await newPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="split.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    next(err);
  }
});

router.post('/rotate', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const rotation = req.body.rotation ?? req.body.angle ?? 90;
    const pagesParam = req.body.pages;
    const rotDeg = parseInt(rotation) || 90;
    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const allPages = pdf.getPages();

    let targetPages;
    if (pagesParam && pagesParam !== 'all') {
      targetPages = String(pagesParam).split(',').map(p => parseInt(p.trim()) - 1).filter(p => p >= 0 && p < allPages.length);
    } else {
      targetPages = allPages.map((_, i) => i);
    }

    for (const idx of targetPages) {
      const page = allPages[idx];
      page.setRotation(degrees((page.getRotation().angle + rotDeg) % 360));
    }

    const bytes = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    next(err);
  }
});

router.post('/remove-pages', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const pagesParam = req.body.pages ?? req.body.pagesToRemove;
    if (!pagesParam) return res.status(400).json({ success: false, error: 'Pages to remove are required' });

    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const total = pdf.getPageCount();

    const toRemove = new Set(
      String(pagesParam).split(',').map(p => parseInt(p.trim()) - 1).filter(p => p >= 0 && p < total)
    );

    const newPdf = await PDFDocument.create();
    const keepIndices = Array.from({ length: total }, (_, i) => i).filter(i => !toRemove.has(i));

    if (keepIndices.length === 0) {
      return res.status(400).json({ success: false, error: 'Cannot remove all pages' });
    }

    const pages = await newPdf.copyPages(pdf, keepIndices);
    pages.forEach(p => newPdf.addPage(p));

    const bytes = await newPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="pages-removed.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    next(err);
  }
});

router.post('/password', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, error: 'Password is required' });

    res.json({
      success: false,
      error: 'PDF password protection requires a native library. Please use a client-side solution like pdf-lib with password encryption support.',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/unlock', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    try {
      const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      const bytes = await pdf.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="unlocked.pdf"');
      res.send(Buffer.from(bytes));
    } catch {
      res.status(400).json({ success: false, error: 'Could not unlock PDF. The PDF may require a password.' });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/html-to-pdf', async (req, res, next) => {
  res.json({
    success: false,
    error: 'HTML to PDF conversion requires a headless browser (Puppeteer). Use the browser print dialog (Ctrl+P → Save as PDF) for best results.',
  });
});

router.post('/to-word', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  res.json({
    success: false,
    error: 'PDF to Word conversion requires specialized conversion libraries. This feature is not available in the current server configuration.',
  });
});

router.post('/to-excel', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  res.json({
    success: false,
    error: 'PDF to Excel conversion requires specialized conversion libraries. This feature is not available in the current server configuration.',
  });
});

router.post('/to-powerpoint', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  res.json({
    success: false,
    error: 'PDF to PowerPoint conversion requires specialized conversion libraries.',
  });
});

router.post('/word-to-pdf', upload.single('file'), async (req, res, next) => {
  res.json({
    success: false,
    error: 'Word to PDF conversion requires LibreOffice. This feature is not available in the current server configuration.',
  });
});

router.post('/powerpoint-to-pdf', upload.single('file'), async (req, res, next) => {
  res.json({
    success: false,
    error: 'PowerPoint to PDF conversion requires LibreOffice. This feature is not available in the current server configuration.',
  });
});

router.post('/to-image', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  res.json({
    success: false,
    error: 'PDF to Image conversion requires pdf-poppler or similar library. This feature requires additional setup.',
  });
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
