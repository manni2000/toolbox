const express = require('express');

const multer = require('multer');

const fs = require('fs');

const { Readable } = require('stream');

const {

  PDFDocument, degrees, StandardFonts, rgb,

} = require('pdf-lib');

const PDFParser = require('pdf2json');

const {

  PDFServices,

  ServicePrincipalCredentials,

  MimeType,

  ExportPDFParams,

  ExportPDFTargetFormat,

  ExportPDFJob,

  ExportPDFResult,

} = require('@adobe/pdfservices-node-sdk');

const { uploadLimiter } = require('../middleware/security');



const router = express.Router();

const upload = multer({

  storage: multer.memoryStorage(),

  limits: { fileSize: 50 * 1024 * 1024 },

});

router.use(uploadLimiter);



// ─────────────────────────────────────────────

//  HELPERS

// ─────────────────────────────────────────────



function safeDecodeURIComponent(str) {

  if (!str) return '';

  try { return decodeURIComponent(str); } catch { return str; }

}



function getUploadedFile(req, fieldNames = ['file', 'pdf']) {

  if (req.file) return req.file;

  for (const fn of fieldNames) {

    const c = req.files?.[fn];

    if (Array.isArray(c) && c[0]) return c[0];

  }

  return null;

}



function getUploadedFiles(req, fieldNames = ['files', 'pdfs']) {

  if (Array.isArray(req.files)) return req.files;

  const files = [];

  for (const fn of fieldNames) {

    const c = req.files?.[fn];

    if (Array.isArray(c)) files.push(...c);

  }

  return files;

}



async function extractTextFromPDF(buffer) {

  return new Promise((resolve) => {

    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', () => resolve({ text: '', numpages: 0 }));

    pdfParser.on('pdfParser_dataReady', (pdfData) => {

      try {

        let fullText = '';

        if (pdfData?.Pages) {

          pdfData.Pages.forEach(page => {

            if (page.Texts) {

              page.Texts.forEach(text => {

                if (text.R) text.R.forEach(r => { fullText += safeDecodeURIComponent(r.T) + ' '; });

              });

              fullText += '\n';

            }

          });

        }

        resolve({ text: fullText.trim(), numpages: pdfData.Pages?.length ?? 0 });

      } catch { resolve({ text: '', numpages: 0 }); }

    });

    pdfParser.parseBuffer(buffer);

  });

}



router.post('/to-word', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {

  try {

    const file = getUploadedFile(req);

    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });



    // Credentials

    const credentials = new ServicePrincipalCredentials({

      clientId: process.env.PDF_SERVICES_CLIENT_ID,

      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET,

    });



    const pdfServices = new PDFServices({ credentials });



    // Upload PDF

    const inputAsset = await pdfServices.upload({

      readStream: Readable.from(file.buffer),

      mimeType: MimeType.PDF,

    });



    // Export to DOCX

    const params = new ExportPDFParams({

      targetFormat: ExportPDFTargetFormat.DOCX,

    });



    const job = new ExportPDFJob({

      inputAsset,

      params,

    });



    const pollingURL = await pdfServices.submit({ job });

    const pdfServicesResponse = await pdfServices.getJobResult({

      pollingURL,

      resultType: ExportPDFResult,

    });



    const resultAsset = pdfServicesResponse.result.asset;

    const streamAsset = await pdfServices.getContent({

      asset: resultAsset,

    });



    const chunks = [];

    for await (const chunk of streamAsset.readStream) {

      chunks.push(chunk);

    }



    const docxBuffer = Buffer.concat(chunks);

    const base64 = docxBuffer.toString('base64');

    const originalName = file.originalname || 'document.pdf';

    const outName = originalName.replace(/\.pdf$/i, '.docx');



    let numpages = 0;

    try {

      const pdfDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });

      numpages = pdfDoc.getPageCount();

    } catch (e) {

    }



    res.json({

      success: true,

      file: base64,

      filename: outName,

      pages: numpages,

      message: 'PDF converted to Word using Adobe PDF Services',

    });

  } catch (err) {

    res.status(500).json({ 

      success: false, 

      error: 'Failed to convert PDF to Word. Please check Adobe PDF Services credentials.' 

    });

  }

});



router.post('/merge', upload.fields([{ name: 'files', maxCount: 20 }, { name: 'pdfs', maxCount: 20 }]), async (req, res, next) => {

  try {

    const files = getUploadedFiles(req);

    if (!files || files.length < 2) return res.status(400).json({ success: false, error: 'At least 2 PDF files required' });

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

  } catch (err) { next(err); }

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

  } catch (err) { next(err); }

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

    const targetPages = (pagesParam && pagesParam !== 'all')

      ? String(pagesParam).split(',').map(p => parseInt(p.trim()) - 1).filter(p => p >= 0 && p < allPages.length)

      : allPages.map((_, i) => i);

    for (const idx of targetPages) {

      const page = allPages[idx];

      page.setRotation(degrees((page.getRotation().angle + rotDeg) % 360));

    }

    const bytes = await pdf.save();

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');

    res.send(Buffer.from(bytes));

  } catch (err) { next(err); }

});



router.post('/remove-pages', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {

  try {

    const file = getUploadedFile(req);

    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const { pages } = req.body;

    if (!pages) return res.status(400).json({ success: false, error: 'Pages to remove required' });

    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });

    const pageCount = pdf.getPageCount();

    const pagesToRemove = new Set(

      String(pages).split(',').map(p => parseInt(p.trim()) - 1).filter(p => p >= 0 && p < pageCount)

    );

    if (pagesToRemove.size >= pageCount) return res.status(400).json({ success: false, error: 'Cannot remove all pages from PDF' });

    const newPdf = await PDFDocument.create();

    const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter(i => !pagesToRemove.has(i));

    const copiedPages = await newPdf.copyPages(pdf, keepIndices);

    copiedPages.forEach(p => newPdf.addPage(p));

    const bytes = await newPdf.save();

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader('Content-Disposition', 'attachment; filename="pages-removed.pdf"');

    res.send(Buffer.from(bytes));

  } catch (err) { next(err); }

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

    const bytes = await pdf.save({ userPassword: userPwd, ownerPassword: ownerPwd });

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader('Content-Disposition', 'attachment; filename="protected.pdf"');

    res.send(Buffer.from(bytes));

  } catch (err) { next(err); }

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

  } catch (err) { next(err); }

});



router.post('/compress', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {

  try {

    const file = getUploadedFile(req);

    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });

    const bytes = await pdf.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 50 });

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');

    res.setHeader('X-Original-Size', file.buffer.length);

    res.setHeader('X-Compressed-Size', bytes.length);

    res.send(Buffer.from(bytes));

  } catch (err) { next(err); }

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

    } catch { /* optional */ }

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

        creationDate: pdf.getCreationDate()?.toISOString() ?? null,

        modificationDate: pdf.getModificationDate()?.toISOString() ?? null,

        fileSizeBytes: file.buffer.length,

        fileSizeKB: (file.buffer.length / 1024).toFixed(2),

        firstPageWidth: Math.round(width),

        firstPageHeight: Math.round(height),

        ...textInfo,

      },

    });

  } catch (err) { next(err); }

});



router.post('/html-to-pdf', async (req, res, next) => {

  try {

    const { html, title = 'Document' } = req.body;

    if (!html) return res.status(400).json({ success: false, error: 'HTML content is required' });

    

    const html_to_pdf = require('html-pdf-node');

    const fs = require('fs');

    

    let file = { content: html };

    let options = {

      format: 'A4',

      printBackground: true,

      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },

    };

    

    const pdfBuffer = await html_to_pdf.generatePdf(file, options);

    

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);

    res.send(pdfBuffer);

  } catch (err) { next(err); }

});



router.post('/to-excel', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {

  try {

    const file = getUploadedFile(req);

    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    let text = '', numpages = 0;

    try {

      const parsed = await extractTextFromPDF(file.buffer);

      text = parsed.text || '';

      numpages = parsed.numpages || 0;

    } catch (e) { text = 'Could not extract text from this PDF.'; }

    if (!text?.trim()) return res.status(400).json({ success: false, error: 'No text could be extracted from the PDF' });

    const lines = text.split('\n').filter(l => l.trim().length > 0);

    const rows = lines.map(line => {

      const cells = line.split(/\s{2,}|\t/).map(c => c.trim()).filter(c => c.length > 0);

      return cells.length > 0 ? cells : [line.trim()];

    });

    if (!rows.length) return res.status(400).json({ success: false, error: 'No content found to convert to Excel' });

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('PDF Content');

    worksheet.addRows(rows);

    const buffer = await workbook.xlsx.writeBuffer();

    const base64 = buffer.toString('base64');

    const originalName = file.originalname || 'document.pdf';

    res.json({ success: true, file: base64, filename: originalName.replace(/\.pdf$/i, '.xlsx'), pages: numpages, message: 'PDF converted to Excel successfully' });

  } catch (err) { next(err); }

});



router.post('/to-powerpoint', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {

  try {

    const file = getUploadedFile(req);

    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    let text = '', pageCount = 0;

    try {

      const parsed = await extractTextFromPDF(file.buffer);

      text = parsed.text || '';

      pageCount = parsed.numpages || 1;

    } catch { text = 'Could not extract text from this PDF.'; }

    const PptxGenJS = require('pptxgenjs');

    const prs = new PptxGenJS();

    prs.layout = 'LAYOUT_WIDE';

    const allLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const LINES_PER_SLIDE = 18;

    const slideGroups = [];

    for (let i = 0; i < allLines.length; i += LINES_PER_SLIDE) slideGroups.push(allLines.slice(i, i + LINES_PER_SLIDE));

    if (!slideGroups.length) slideGroups.push(['(No content extracted)']);

    slideGroups.forEach((group, idx) => {

      const slide = prs.addSlide();

      slide.addText(`Page ${idx + 1} of ${slideGroups.length}`, { x: 0.3, y: 0.1, w: '90%', h: 0.4, fontSize: 10, color: '888888', italic: true });

      slide.addText(group.map(line => ({ text: line + '\n', options: { fontSize: 14, color: '333333' } })), { x: 0.5, y: 0.6, w: '92%', h: '85%', valign: 'top', wrap: true });

    });

    const pptxBuffer = await prs.write({ outputType: 'nodebuffer' });

    const base64 = pptxBuffer.toString('base64');

    const originalName = file.originalname || 'document.pdf';

    res.json({ success: true, file: base64, filename: originalName.replace(/\.pdf$/i, '.pptx'), pages: pageCount, slides: slideGroups.length, message: 'PDF converted to PowerPoint successfully' });

  } catch (err) { next(err); }

});



router.post('/word-to-pdf', upload.single('file'), async (req, res, next) => {

  try {

    if (!req.file) return res.status(400).json({ success: false, error: 'File required' });

    const isDocx = req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.originalname?.toLowerCase().endsWith('.docx');

    const isTxt = req.file.mimetype === 'text/plain' || req.file.originalname?.toLowerCase().endsWith('.txt');

    let paragraphLines = [];

    if (isDocx) {

      try {

        const JSZip = require('jszip');

        const zip = await JSZip.loadAsync(req.file.buffer);

        const docXmlFile = zip.file('word/document.xml');

        if (!docXmlFile) throw new Error('Invalid docx');

        const docXml = await docXmlFile.async('string');

        const paraRegex = /<w:p[ >]([\s\S]*?)<\/w:p>/g;

        let paraMatch;

        while ((paraMatch = paraRegex.exec(docXml)) !== null) {

          const paraXml = paraMatch[1];

          const isBoldPara = /<w:b\/>|<w:b w:val="true"/i.test(paraXml);

          const isHeading = /<w:pStyle w:val="[Hh]eading/i.test(paraXml);

          const textParts = [];

          const runRegex = /<w:r[ >]([\s\S]*?)<\/w:r>/g;

          let runMatch;

          while ((runMatch = runRegex.exec(paraXml)) !== null) {

            const tMatches = [...runMatch[1].matchAll(/<w:t(?:[^>]*)>([\s\S]*?)<\/w:t>/g)];

            for (const tm of tMatches) textParts.push(tm[1]);

          }

          const lineText = textParts.join('');

          paragraphLines.push({ text: lineText, bold: isBoldPara || isHeading, heading: isHeading });

        }

      } catch { paragraphLines = [{ text: 'Could not parse Word document content.', bold: false, heading: false }]; }

    } else if (isTxt) {

      const raw = req.file.buffer.toString('utf-8');

      paragraphLines = raw.split('\n').map(line => ({ text: line, bold: false, heading: false }));

    } else {

      return res.status(422).json({ success: false, error: 'Unsupported file type. Please upload a .docx or .txt file.' });

    }

    const pdfDoc = await PDFDocument.create();

    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595, pageHeight = 842, margin = 50;

    const maxWidth = pageWidth - margin * 2;

    function wrapText(text, font, fontSize, maxW) {

      const words = text.split(' ');

      const wrappedLines = [];

      let current = '';

      for (const word of words) {

        const test = current ? current + ' ' + word : word;

        if (font.widthOfTextAtSize(test, fontSize) > maxW && current) { wrappedLines.push(current); current = word; }

        else current = test;

      }

      if (current) wrappedLines.push(current);

      return wrappedLines.length ? wrappedLines : [''];

    }

    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    let y = pageHeight - margin;

    for (const para of paragraphLines) {

      const fontSize = para.heading ? 15 : 12;

      const font = (para.bold || para.heading) ? boldFont : regularFont;

      const lineHeight = fontSize * 1.5;

      if (!para.text.trim()) { y -= lineHeight * 0.5; if (y < margin) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - margin; } continue; }

      const wrapped = wrapText(para.text.substring(0, 500), font, fontSize, maxWidth);

      for (const wLine of wrapped) {

        if (y < margin + lineHeight) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }

        page.drawText(wLine, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });

        y -= lineHeight;

      }

      y -= para.heading ? 8 : 4;

    }

    const bytes = await pdfDoc.save();

    const originalName = req.file.originalname || 'document.docx';

    res.json({ success: true, file: Buffer.from(bytes).toString('base64'), filename: originalName.replace(/\.(docx|txt)$/i, '.pdf'), message: 'Word converted to PDF successfully' });

  } catch (err) { next(err); }

});



router.post('/powerpoint-to-pdf', async (req, res) => {

  res.status(422).json({ success: false, error: 'PowerPoint to PDF conversion requires LibreOffice which is not installed.', alternatives: 'Use /api/pdf/html-to-pdf with slide content as HTML.' });

});



router.post('/to-image', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res, next) => {

  try {

    const file = getUploadedFile(req);

    if (!file) return res.status(400).json({ success: false, error: 'PDF file required' });

    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });

    const pages = pdf.getPages();

    res.json({

      success: false,

      error: 'Server-side PDF to image conversion requires a native renderer (Ghostscript/pdf-poppler) which is not available in this environment.',

      info: { pageCount: pdf.getPageCount(), pages: pages.map((p, i) => { const { width, height } = p.getSize(); return { page: i + 1, width: Math.round(width), height: Math.round(height) }; }), suggestion: 'Use PDF.js client-side to render pages, or use /api/pdf/info for metadata.' },

    });

  } catch (err) { next(err); }

});



router.options('*', (req, res) => res.sendStatus(204));



module.exports = router;