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

async function extractStructuredFromPDF(buffer) {
  return new Promise((resolve) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on('pdfParser_dataError', () => resolve({ pages: [], numpages: 0 }));
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
      if (!pdfData || !pdfData.Pages) return resolve({ pages: [], numpages: 0 });

      const pages = pdfData.Pages.map((page) => {
        const items = [];
        if (!page.Texts) return { items: [] };

        page.Texts.forEach(textBlock => {
          const x = textBlock.x || 0;
          const y = textBlock.y || 0;
          if (!textBlock.R) return;
          textBlock.R.forEach(run => {
            const text = safeDecodeURIComponent(run.T || '');
            if (!text.trim()) return;
            const ts = run.TS || [0, 12, 0, 0];
            const fontSize = ts[1] || 12;
            const bold = ts[2] === 1;
            const italic = ts[3] === 1;
            // Color comes as hex string or integer
            let color = '000000';
            if (run.clr !== undefined && run.clr !== -1) {
              color = run.clr.toString(16).padStart(6, '0');
            }
            items.push({ x, y, text, fontSize, bold, italic, color });
          });
        });

        // Sort items top-to-bottom, then left-to-right
        items.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);

        // Group items into lines by y-position (within threshold)
        const lines = [];
        let currentLine = null;
        const Y_THRESHOLD = 0.5;

        for (const item of items) {
          if (!currentLine || Math.abs(item.y - currentLine.y) > Y_THRESHOLD) {
            currentLine = { y: item.y, runs: [] };
            lines.push(currentLine);
          }
          currentLine.runs.push(item);
        }

        // Group lines into paragraphs by gap between lines
        const paragraphs = [];
        let prevY = null;
        let currentPara = null;
        const LINE_GAP_THRESHOLD = 2;

        for (const line of lines) {
          const isNewPara = prevY === null || (line.y - prevY) > LINE_GAP_THRESHOLD;
          if (isNewPara) {
            currentPara = { lines: [] };
            paragraphs.push(currentPara);
          }
          currentPara.lines.push(line);
          prevY = line.y;
        }

        return { paragraphs };
      });

      resolve({ pages, numpages: pages.length });
      } catch (e) {
        resolve({ pages: [], numpages: 0 });
      }
    });
    pdfParser.parseBuffer(buffer);
  });
}

function hexToDocxColor(hex) {
  if (!hex || hex === '000000') return undefined;
  return hex.replace('#', '').toUpperCase();
}

function buildDocxParagraphs(pages) {
  const docxParagraphs = [];

  pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) {
      // Page break between pages
      docxParagraphs.push(new Paragraph({
        children: [new TextRun({ text: '', break: 1 })],
        pageBreakBefore: true,
      }));
    }

    (page.paragraphs || []).forEach(para => {
      // Collect all runs in this paragraph across its lines
      const allRuns = [];
      para.lines.forEach((line, lineIdx) => {
        line.runs.forEach(run => {
          allRuns.push(run);
        });
        // Add line break between lines within a paragraph (except last)
        if (lineIdx < para.lines.length - 1) {
          allRuns.push({ _lineBreak: true });
        }
      });

      if (allRuns.length === 0) return;

      // Determine dominant font size for heading detection
      const fontSizes = allRuns.filter(r => !r._lineBreak).map(r => r.fontSize);
      const maxFontSize = Math.max(...fontSizes);
      const hasBold = allRuns.some(r => !r._lineBreak && r.bold);

      let heading = null;
      if (maxFontSize >= 24) heading = HeadingLevel.HEADING_1;
      else if (maxFontSize >= 18) heading = HeadingLevel.HEADING_2;
      else if (maxFontSize >= 14 && hasBold) heading = HeadingLevel.HEADING_3;

      const children = allRuns.map(run => {
        if (run._lineBreak) return new TextRun({ break: 1 });
        const color = hexToDocxColor(run.color);
        return new TextRun({
          text: run.text,
          bold: run.bold,
          italics: run.italic,
          size: Math.round(run.fontSize * 2), // half-points in docx
          color: color,
        });
      });

      docxParagraphs.push(new Paragraph({
        heading: heading || undefined,
        children,
        spacing: { after: 120 },
      }));
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

    try {
      const structured = await extractStructuredFromPDF(file.buffer);
      numpages = structured.numpages;
      if (structured.pages && structured.pages.length > 0) {
        docxParagraphs = buildDocxParagraphs(structured.pages);
      }
    } catch (e) {
      // ignore and fall through
    }

    // Fallback: if structured extraction yielded nothing, use plain text
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
          document: {
            run: { font: 'Arial', size: 24 },
          },
        },
      },
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
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
      message: 'PDF converted to Word with formatting preserved',
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
