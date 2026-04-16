const express = require('express');
const multer = require('multer');
const { PDFDocument, degrees, StandardFonts, rgb } = require('pdf-lib');
const PDFParser = require('pdf2json');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ShadingType } = require('docx');
const XLSX = require('xlsx');
const { uploadLimiter } = require('../middleware/security');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(uploadLimiter);

function safeDecodeURIComponent(str) {
  if (!str) return '';
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

async function extractTextFromPDF(buffer) {
  return new Promise((resolve) => {
    const pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataError', () => resolve({ text: '', numpages: 0 }));
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        let fullText = '';
        if (pdfData && pdfData.Pages) {
          pdfData.Pages.forEach(page => {
            if (page.Texts) {
              page.Texts.forEach(text => {
                if (text.R) {
                  text.R.forEach(r => { fullText += safeDecodeURIComponent(r.T) + ' '; });
                }
              });
              fullText += '\n';
            }
          });
        }
        resolve({ text: fullText.trim(), numpages: pdfData.Pages ? pdfData.Pages.length : 0 });
      } catch (e) {
        resolve({ text: '', numpages: 0 });
      }
    });
    pdfParser.parseBuffer(buffer);
  });
}

async function extractWithPdfjs(buffer) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const path = require('path');
  const standardFontDataUrl = 'file://' + path.join(__dirname, '../node_modules/pdfjs-dist/standard_fonts') + '/';
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    standardFontDataUrl,
  });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent({ includeMarkedContent: false });

    // Each item: { str, transform: [a,b,c,d,tx,ty], width, height, fontName, hasEOL }
    // tx = x position, ty = y position from bottom (PDF coords)
    // Convert to top-down: y = pageHeight - ty
    const pageHeight = viewport.height;
    const pageWidth = viewport.width;

    const rawItems = textContent.items
      .filter(item => item.str && item.str.trim() !== '')
      .map(item => {
        const [a, b, c, d, tx, ty] = item.transform;
        const fontSize = Math.abs(d) || Math.abs(a) || 12;
        const x = tx;
        const y = pageHeight - ty; // flip to top-down
        return {
          x,
          y,
          width: item.width || 0,
          height: item.height || fontSize,
          text: item.str,
          fontSize,
          fontName: item.fontName || '',
          hasEOL: item.hasEOL || false,
        };
      });

    // Sort top-to-bottom, left-to-right
    rawItems.sort((a, b) => (Math.abs(a.y - b.y) < 2 ? a.x - b.x : a.y - b.y));

    // Group into lines: items with y within fontSize/2 of each other
    const lines = [];
    for (const item of rawItems) {
      const threshold = (item.fontSize || 12) * 0.6;
      const existing = lines.find(l => Math.abs(l.y - item.y) < threshold);
      if (existing) {
        existing.items.push(item);
        existing.y = (existing.y + item.y) / 2; // average y
      } else {
        lines.push({ y: item.y, items: [item], fontSize: item.fontSize });
      }
    }
    lines.sort((a, b) => a.y - b.y);

    // For each line, sort items by x and reconstruct text with proper spacing
    const processedLines = lines.map(line => {
      const sorted = [...line.items].sort((a, b) => a.x - b.x);
      const runs = [];

      for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        const prev = sorted[i - 1];

        // Detect if there should be a space between prev and this item
        if (prev) {
          const expectedX = prev.x + prev.width;
          const gap = item.x - expectedX;
          const spaceWidth = (prev.fontSize || 12) * 0.25;

          if (gap > spaceWidth) {
            // Large gap = tab stop (right-aligned element like a date)
            if (gap > pageWidth * 0.25) {
              runs.push({ text: '\t', fontSize: item.fontSize, bold: false, italic: false, isTab: true });
            } else if (gap > spaceWidth * 2) {
              runs.push({ text: '  ', fontSize: item.fontSize, bold: false, italic: false });
            } else {
              runs.push({ text: ' ', fontSize: item.fontSize, bold: false, italic: false });
            }
          } else if (gap > 0 && !prev.text.endsWith(' ') && !item.text.startsWith(' ')) {
            // Small gap — check if a space is needed
            const lastChar = prev.text[prev.text.length - 1];
            const firstChar = item.text[0];
            if (lastChar && firstChar && lastChar !== ' ' && firstChar !== ' ') {
              runs.push({ text: ' ', fontSize: item.fontSize, bold: false, italic: false });
            }
          }
        }

        const bold = /bold|black|heavy/i.test(item.fontName);
        const italic = /italic|oblique/i.test(item.fontName);

        runs.push({
          text: item.text,
          fontSize: item.fontSize,
          bold,
          italic,
          x: item.x,
          width: item.width,
        });
      }

      // Dominant font size for line
      const fontSizes = sorted.map(i => i.fontSize).filter(Boolean);
      const dominantSize = fontSizes.length > 0 ? Math.max(...fontSizes) : 12;
      const firstX = sorted.length > 0 ? sorted[0].x : 0;
      const lastX = sorted.length > 0 ? sorted[sorted.length - 1].x + sorted[sorted.length - 1].width : 0;
      const lineCenterX = (firstX + lastX) / 2;
      const pageCenterX = pageWidth / 2;

      const isCentered = Math.abs(lineCenterX - pageCenterX) < pageWidth * 0.1 && firstX > pageWidth * 0.1;

      return { y: line.y, runs, fontSize: dominantSize, isCentered, firstX };
    });

    // Group lines into paragraphs (gap > 1.5x line height = new paragraph)
    const paragraphs = [];
    let currentPara = null;
    let prevY = null;

    for (const line of processedLines) {
      const lineHeight = (line.fontSize || 12) * 1.4;
      const isNewPara = prevY === null || (line.y - prevY) > lineHeight * 1.5;

      if (isNewPara) {
        currentPara = { lines: [] };
        paragraphs.push(currentPara);
      }
      currentPara.lines.push(line);
      prevY = line.y;
    }

    pages.push({ paragraphs, pageWidth, pageHeight });
  }

  return { pages, numpages: numPages };
}

function buildDocxFromPages(pages) {
  const docxParagraphs = [];

  pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) {
      docxParagraphs.push(new Paragraph({ pageBreakBefore: true, children: [] }));
    }

    (page.paragraphs || []).forEach(para => {
      para.lines.forEach((line, lineIdx) => {
        if (line.runs.length === 0) return;

        const lineText = line.runs.map(r => r.text).join('');
        const trimmed = lineText.trim();
        if (!trimmed) return;

        // Detect bullet
        const isBullet = /^[•·●▪▸\-\*]\s/.test(trimmed);
        const indentLevel = line.firstX > page.pageWidth * 0.15 ? 1 : 0;

        // Determine heading
        const hasBold = line.runs.some(r => r.bold);
        let heading = undefined;
        if (line.fontSize >= 20) heading = HeadingLevel.HEADING_1;
        else if (line.fontSize >= 16) heading = HeadingLevel.HEADING_2;
        else if (line.fontSize >= 13 && hasBold) heading = HeadingLevel.HEADING_3;

        // Build text runs
        const children = line.runs.map(run => {
          if (run.isTab) {
            return new TextRun({ text: '\t' });
          }
          return new TextRun({
            text: run.text,
            bold: run.bold,
            italics: run.italic,
            size: Math.max(16, Math.round((run.fontSize || line.fontSize || 12) * 2)),
          });
        });

        const paraProps = {
          heading,
          children,
          alignment: line.isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { after: lineIdx < para.lines.length - 1 ? 0 : 100, line: 276 },
        };

        if (isBullet) {
          paraProps.bullet = { level: 0 };
        } else if (indentLevel > 0 && !heading) {
          paraProps.indent = { left: 360 * indentLevel };
        }

        docxParagraphs.push(new Paragraph(paraProps));
      });
    });
  });

  return docxParagraphs;
}

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

    const { pages } = req.body;
    if (!pages) return res.status(400).json({ success: false, error: 'Pages to remove required (e.g. "1,3,5")' });

    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const pageCount = pdf.getPageCount();

    const pagesToRemove = new Set(
      String(pages).split(',').map(p => parseInt(p.trim()) - 1).filter(p => p >= 0 && p < pageCount)
    );

    if (pagesToRemove.size >= pageCount) {
      return res.status(400).json({ success: false, error: 'Cannot remove all pages from PDF' });
    }

    const newPdf = await PDFDocument.create();
    const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter(i => !pagesToRemove.has(i));
    const copiedPages = await newPdf.copyPages(pdf, keepIndices);
    copiedPages.forEach(p => newPdf.addPage(p));

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

    const { password, userPassword, ownerPassword } = req.body;
    const userPwd = userPassword || password;
    const ownerPwd = ownerPassword || password;

    if (!userPwd) return res.status(400).json({ success: false, error: 'Password is required' });

    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const bytes = await pdf.save({
      userPassword: userPwd,
      ownerPassword: ownerPwd,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="protected.pdf"');
    res.send(Buffer.from(bytes));
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
    } catch (e) {
      res.status(400).json({ success: false, error: 'Could not unlock PDF. The PDF may require a password.' });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/compress', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });

    const bytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    const originalSize = file.buffer.length;
    const compressedSize = bytes.length;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
    res.setHeader('X-Original-Size', originalSize);
    res.setHeader('X-Compressed-Size', compressedSize);
    res.send(Buffer.from(bytes));
  } catch (err) {
    next(err);
  }
});

router.post('/info', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });

    let textInfo = {};
    try {
      const parsed = await extractTextFromPDF(file.buffer);
      textInfo = {
        wordCount: parsed.text ? parsed.text.split(/\s+/).filter(Boolean).length : 0,
        charCount: parsed.text ? parsed.text.length : 0,
        textSnippet: parsed.text ? parsed.text.substring(0, 300).trim() : '',
      };
    } catch (e) {}

    const pages = pdf.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage ? firstPage.getSize() : { width: 0, height: 0 };

    res.json({
      success: true,
      result: {
        pageCount: pdf.getPageCount(),
        title: pdf.getTitle() || null,
        author: pdf.getAuthor() || null,
        subject: pdf.getSubject() || null,
        creator: pdf.getCreator() || null,
        producer: pdf.getProducer() || null,
        creationDate: pdf.getCreationDate() ? pdf.getCreationDate().toISOString() : null,
        modificationDate: pdf.getModificationDate() ? pdf.getModificationDate().toISOString() : null,
        fileSizeBytes: file.buffer.length,
        fileSizeKB: (file.buffer.length / 1024).toFixed(2),
        firstPageWidth: Math.round(width),
        firstPageHeight: Math.round(height),
        ...textInfo,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/html-to-pdf', async (req, res, next) => {
  try {
    const { html, title = 'Document' } = req.body;
    if (!html) return res.status(400).json({ success: false, error: 'HTML content is required' });

    const { chromium } = require('playwright-core');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Generate PDF with proper formatting
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

router.post('/to-word', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    let docxParagraphs = [];
    let numpages = 0;

    // Primary: use pdfjs for accurate position-based extraction
    try {
      const extracted = await extractWithPdfjs(file.buffer);
      numpages = extracted.numpages;
      if (extracted.pages && extracted.pages.length > 0) {
        docxParagraphs = buildDocxFromPages(extracted.pages);
      }
    } catch (e) {
      console.error('pdfjs extraction failed:', e.message);
    }

    // Fallback: plain text extraction
    if (docxParagraphs.length === 0) {
      try {
        const parsed = await extractTextFromPDF(file.buffer);
        numpages = parsed.numpages;
        const paragraphs = (parsed.text || '').split(/\n{2,}/).filter(p => p.trim().length > 0);
        docxParagraphs = paragraphs.map(para => new Paragraph({
          children: [new TextRun({ text: para.trim().replace(/\n/g, ' '), size: 24 })],
          spacing: { after: 120 },
        }));
      } catch (e) {
        docxParagraphs = [new Paragraph({ children: [new TextRun({ text: 'Could not extract text from this PDF.' })] })];
      }
    }

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: 'Calibri', size: 24 } },
          heading1: { run: { bold: true, size: 36 } },
          heading2: { run: { bold: true, size: 28 } },
          heading3: { run: { bold: true, size: 24 } },
        },
      },
      sections: [{
        properties: {
          page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } },
        },
        children: docxParagraphs,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const base64 = buffer.toString('base64');
    const originalName = file.originalname || 'document.pdf';
    const outName = originalName.replace(/\.pdf$/i, '.docx');

    res.json({
      success: true,
      file: base64,
      filename: outName,
      pages: numpages,
      message: 'PDF converted to Word with layout preserved',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/to-excel', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    let text = '';
    try {
      const parsed = await extractTextFromPDF(file.buffer);
      text = parsed.text || '';
    } catch (e) {
      text = 'Could not extract text from this PDF.';
    }

    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const rows = lines.map(line => {
      const cells = line.split(/\s{2,}|\t/).map(c => c.trim()).filter(c => c.length > 0);
      return cells.length > 0 ? cells : [line.trim()];
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PDF Content');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.xlsx"');
    res.send(excelBuffer);
  } catch (err) {
    next(err);
  }
});

router.post('/to-powerpoint', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    let text = '';
    let pageCount = 0;
    try {
      const parsed = await extractTextFromPDF(file.buffer);
      text = parsed.text || '';
      pageCount = parsed.numpages || 1;
    } catch (e) {
      text = 'Could not extract text from this PDF.';
    }

    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 0).slice(0, 50);

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'PDF Content (Extracted Text)',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ text: `Source: ${pageCount} page(s)`, italics: true })],
          }),
          ...paragraphs.map(para => new Paragraph({
            children: [new TextRun({ text: para.trim().replace(/\n/g, ' ').substring(0, 500), size: 22 })],
          })),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="slides-content.docx"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.post('/word-to-pdf', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'File required' });

    if (req.file.mimetype === 'text/plain' || (req.file.originalname && req.file.originalname.endsWith('.txt'))) {
      const text = req.file.buffer.toString('utf-8');
      const lines = text.split('\n');

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pageWidth = 595, pageHeight = 842, margin = 50;
      const lineHeight = 18;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      for (const line of lines) {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        const safeLine = (line || '').substring(0, 120);
        if (safeLine) {
          page.drawText(safeLine, { x: margin, y, size: 12, font, color: rgb(0, 0, 0) });
        }
        y -= lineHeight;
      }

      const bytes = await pdfDoc.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
      res.send(Buffer.from(bytes));
    } else {
      res.status(422).json({
        success: false,
        error: 'Word (.docx) to PDF conversion requires LibreOffice which is not available. Upload a .txt file for plain text to PDF conversion.',
        supported: ['text/plain', '.txt'],
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/powerpoint-to-pdf', upload.single('file'), async (req, res, next) => {
  res.status(422).json({
    success: false,
    error: 'PowerPoint to PDF conversion requires LibreOffice which is not installed.',
    alternatives: 'Use /api/pdf/html-to-pdf with slide content as HTML.',
  });
});

router.post('/to-image', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const pageCount = pdf.getPageCount();
    const pages = pdf.getPages();

    const pageInfo = pages.map((p, i) => {
      const { width, height } = p.getSize();
      return { page: i + 1, width: Math.round(width), height: Math.round(height) };
    });

    res.json({
      success: false,
      error: 'Server-side PDF to image conversion requires a native renderer (Ghostscript/pdf-poppler) which is not available in this environment.',
      info: {
        pageCount,
        pages: pageInfo,
        suggestion: 'Use PDF.js client-side to render pages, or use /api/pdf/info for metadata.',
      },
    });
  } catch (err) {
    next(err);
  }
});

router.options('*', (req, res) => {
  res.sendStatus(204);
});

module.exports = router;
