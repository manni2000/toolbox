const express = require('express');
const multer = require('multer');
const { PDFDocument, degrees, StandardFonts, rgb } = require('pdf-lib');
const PDFParser = require('pdf2json');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');
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

    // Map common icon font PUA codepoints to readable Unicode equivalents (FontAwesome 4 + others)
    const PUA_MAP = {
      // FontAwesome 4 common icons
      0xF000: '\u2022', 0xF001: '\u266A', 0xF002: '\uD83D\uDD0D', 0xF003: '\u2709',
      0xF004: '\u2665', 0xF005: '\u2605', 0xF006: '\u2606', 0xF007: '\u25CF',
      0xF008: '\uD83C\uDFAC', 0xF009: '\uD83C\uDFB5', 0xF00A: '\u22EE',
      0xF00B: '\u22EF', 0xF00C: '\u2713', 0xF00D: '\u2715', 0xF00E: '\u2315',
      0xF010: '\u2212', 0xF011: '\u23FB', 0xF012: '\u25AA',
      0xF013: '\u2699', 0xF014: '\uD83D\uDDD1', 0xF015: '\u2302',
      0xF016: '\uD83D\uDCC4', 0xF017: '\u23F0', 0xF018: '\uD83D\uDEE3',
      0xF019: '\u2B07', 0xF01A: '\u2B06', 0xF01B: '\uD83D\uDCE5',
      0xF01C: '\uD83D\uDCE5', 0xF01D: '\u25B6', 0xF01E: '\u21BA',
      0xF021: '\u21BA', 0xF022: '\uD83D\uDCCB', 0xF023: '\uD83D\uDD12',
      0xF024: '\uD83D\uDEA9', 0xF025: '\uD83C\uDFA7', 0xF026: '\uD83D\uDD07',
      0xF027: '\uD83D\uDD08', 0xF028: '\uD83D\uDD0A', 0xF029: '\u29C9',
      0xF02A: '\u2261', 0xF02B: '\uD83C\uDFF7', 0xF02C: '\uD83C\uDFF7',
      0xF02D: '\uD83D\uDCDA', 0xF02E: '\uD83D\uDD16', 0xF02F: '\u25A3',
      0xF030: '\uD83D\uDCF7', 0xF031: '\u24B6', 0xF032: '\uD83C\uDDE7',
      0xF033: '\uD83C\uDDEE', 0xF034: '\uD83D\uDCCA', 0xF035: '\u25C4',
      0xF036: '\u2248', 0xF037: '\u2248', 0xF038: '\u2248',
      0xF039: '\u2248', 0xF03A: '\u2261', 0xF03B: '\u2261',
      0xF03C: '\u2261', 0xF03D: '\u2261', 0xF03E: '\uD83D\uDDBC',
      0xF040: '\u270F', 0xF041: '\uD83D\uDCCD', 0xF042: '\u25D0',
      0xF043: '\uD83D\uDCA7', 0xF044: '\uD83D\uDCDD', 0xF045: '\u270A',
      0xF046: '\u2611', 0xF047: '\u2194', 0xF048: '\u23EE',
      0xF049: '\u23ED', 0xF04A: '\u23EA', 0xF04B: '\u25B6',
      0xF04C: '\u23F8', 0xF04D: '\u23F9', 0xF04E: '\u23ED',
      0xF050: '\u23ED', 0xF051: '\u23EE', 0xF052: '\u23EB',
      0xF053: '\u276E', 0xF054: '\u276F', 0xF055: '\u2295',
      0xF056: '\u2296', 0xF057: '\u2297', 0xF058: '\u2299',
      0xF059: '\u2753', 0xF05A: '\u2139', 0xF05B: '\u2316',
      0xF05C: '\u2296', 0xF05D: '\u2295', 0xF05E: '\u20E0',
      0xF060: '\u2190', 0xF061: '\u2192', 0xF062: '\u2191',
      0xF063: '\u2193', 0xF064: '\u21A9', 0xF065: '\u2922',
      0xF066: '\u2921', 0xF067: '\u002B', 0xF068: '\u2212',
      0xF069: '\u2731', 0xF06A: '\u2757', 0xF06B: '\uD83C\uDF81',
      0xF06C: '\uD83C\uDF43', 0xF06D: '\uD83D\uDD25', 0xF06E: '\uD83D\uDC41',
      0xF070: '\uD83D\uDEAB', 0xF071: '\u26A0', 0xF072: '\u2708',
      0xF073: '\uD83D\uDCC5', 0xF074: '\u21C4', 0xF075: '\uD83D\uDCAC',
      0xF076: '\u20D7', 0xF077: '\u2303', 0xF078: '\u2304',
      0xF079: '\u21BA', 0xF07A: '\uD83D\uDECD', 0xF07B: '\uD83D\uDCC1',
      0xF07C: '\uD83D\uDCC2', 0xF080: '\uD83D\uDCCA', 0xF081: '\uD83D\uDC26',
      0xF082: '\uD83D\uDC24', 0xF083: '\uD83D\uDCF7', 0xF084: '\uD83D\uDD11',
      0xF085: '\u2699', 0xF086: '\uD83D\uDCAC', 0xF087: '\uD83D\uDC4D',
      0xF088: '\uD83D\uDC4E', 0xF089: '\u2605', 0xF08A: '\u2665',
      0xF08B: '\uD83D\uDCCC', 0xF08C: '\uD83D\uDCBC', // LinkedIn
      0xF08D: '\uD83D\uDCCC', 0xF08E: '\u21AA',
      0xF090: '\u21AA', 0xF091: '\uD83C\uDFC6', 0xF092: '\uD83D\uDCBB',
      0xF093: '\u2B06', 0xF094: '\uD83D\uDCCB', 0xF095: '\u260E', // phone
      0xF096: '\u2610', 0xF097: '\uD83D\uDD16', 0xF098: '\uD83D\uDCDE',
      0xF099: '\uD83D\uDC26', // Twitter bird
      0xF09A: '\u0066', // Facebook f
      0xF09B: '\uD83D\uDCBB', // GitHub
      0xF09C: '\uD83D\uDD13', 0xF09D: '\uD83D\uDCB3', 0xF09E: '\uD83D\uDCE1',
      0xF0A0: '\uD83D\uDCBF', 0xF0A1: '\uD83D\uDCE2', 0xF0A2: '\uD83D\uDD14',
      0xF0A3: '\uD83C\uDF96', 0xF0A4: '\u261E', 0xF0A5: '\u261C',
      0xF0A6: '\u261D', 0xF0A7: '\u261F', 0xF0A8: '\u27A4',
      0xF0A9: '\u27A1', 0xF0AA: '\u2B05', 0xF0AB: '\u2B06',
      0xF0AC: '\uD83C\uDF10', // globe
      0xF0AD: '\uD83D\uDD27', 0xF0AE: '\uD83D\uDCCA',
      0xF0B0: '\uD83D\uDD28', 0xF0B1: '\uD83D\uDCBC', 0xF0B2: '\u2922',
      0xF0C0: '\uD83D\uDC65', // users/group
      0xF0C1: '\uD83D\uDD17', 0xF0C2: '\u2601', 0xF0C3: '\uD83D\uDEC1',
      0xF0C4: '\u2702', 0xF0C5: '\uD83D\uDCC4', 0xF0C6: '\uD83D\uDCCE',
      0xF0C7: '\uD83D\uDCBE', 0xF0C8: '\u25A1', 0xF0C9: '\u2630',
      0xF0CA: '\u2630', 0xF0CB: '\u2630', 0xF0CC: '\u2630',
      0xF0CD: '\u2014', 0xF0CE: '\uD83D\uDCCB',
      0xF0D0: '\u2604', 0xF0D1: '\uD83D\uDE9A', 0xF0D2: '\uD83D\uDCCC',
      0xF0D3: '\uD83D\uDCCC', 0xF0D4: '\u26BD', 0xF0D5: '\uD83D\uDC07',
      0xF0D6: '\uD83D\uDCB0', 0xF0D7: '\u25BC', 0xF0D8: '\u25B2',
      0xF0D9: '\u25C4', 0xF0DA: '\u25BA', 0xF0DB: '\uD83C\uDFDB',
      0xF0DC: '\u2195', 0xF0DD: '\u2193', 0xF0DE: '\u2191',
      0xF0E0: '\u2709', // envelope/email
      0xF0E1: '\uD83D\uDCCB', 0xF0E2: '\u21B6', 0xF0E3: '\u2696',
      0xF0E4: '\u2388', 0xF0E5: '\uD83D\uDCAC', 0xF0E6: '\uD83D\uDCAC',
      0xF0E7: '\u26A1', 0xF0E8: '\uD83D\uDD03', 0xF0E9: '\u2602',
      0xF0EA: '\uD83D\uDCCB', 0xF0EB: '\uD83D\uDCA1', 0xF0EC: '\u21C6',
      0xF0ED: '\uD83D\uDCE5', 0xF0EE: '\uD83D\uDCE4',
      0xF0F0: '\uD83D\uDC8A', 0xF0F1: '\u2695', 0xF0F2: '\uD83D\uDCBC',
      0xF0F3: '\uD83D\uDD14', 0xF0F4: '\u2615', 0xF0F5: '\uD83C\uDF74',
      0xF0F6: '\uD83D\uDCC4', 0xF0F7: '\uD83C\uDFE5', 0xF0F8: '\uD83C\uDFE5',
      0xF0F9: '\uD83D\uDE91', 0xF0FA: '\u2697', 0xF0FB: '\uD83C\uDF32',
      0xF0FC: '\uD83C\uDF7A', 0xF0FD: '\uD83D\uDD2E', 0xF0FE: '\u2611',
    };

    function normalizeIconGlyph(str, fontName) {
      const isIconFont = /icon|symbol|awesome|wingding|zapf|webding|fontello|material|glyph|pictograph|emoji/i.test(fontName);
      let result = '';
      for (const ch of str) {
        const cp = ch.codePointAt(0);
        const isPUA = (cp >= 0xE000 && cp <= 0xF8FF) || (cp >= 0xF0000 && cp <= 0xFFFFF);
        if (isPUA) {
          if (PUA_MAP[cp]) {
            result += PUA_MAP[cp];
          } else if (isIconFont) {
            // Unknown icon in a known icon font: skip to avoid rendering as box
          } else {
            result += ch;
          }
        } else {
          result += ch;
        }
      }
      return result;
    }

    // Get link annotations to mark underlines
    let linkRects = [];
    try {
      const annotations = await page.getAnnotations();
      linkRects = annotations
        .filter(a => a.subtype === 'Link')
        .map(a => {
          const [x1, y1, x2, y2] = a.rect;
          return {
            x1: Math.min(x1, x2),
            y1: pageHeight - Math.max(y1, y2),
            x2: Math.max(x1, x2),
            y2: pageHeight - Math.min(y1, y2),
          };
        });
    } catch (e) { /* annotations optional */ }

    function isUnderlined(x, y, width) {
      return linkRects.some(r =>
        x >= r.x1 - 4 && (x + width) <= r.x2 + 4 &&
        y >= r.y1 - 4 && y <= r.y2 + 4
      );
    }

    // Compute per-font character-width-to-fontSize ratio for bold detection heuristic
    // Bold fonts have consistently wider characters relative to their declared size
    const fontWidthStats = {};
    for (const item of textContent.items) {
      if (!item.str || !item.str.trim() || !item.fontName) continue;
      const [a,, , d] = item.transform;
      const fs = Math.abs(d) || Math.abs(a) || 12;
      if (fs < 1) continue;
      const ratio = item.str.length > 0 ? (item.width / item.str.length) / fs : 0;
      if (ratio <= 0 || ratio > 2) continue;
      if (!fontWidthStats[item.fontName]) fontWidthStats[item.fontName] = [];
      fontWidthStats[item.fontName].push(ratio);
    }
    // Compute median width-ratio per font
    const fontMedianRatio = {};
    for (const [fn, ratios] of Object.entries(fontWidthStats)) {
      const sorted = [...ratios].sort((a, b) => a - b);
      fontMedianRatio[fn] = sorted[Math.floor(sorted.length / 2)];
    }
    // Find the overall page median to compare against
    const allRatios = Object.values(fontMedianRatio);
    const sortedAll = [...allRatios].sort((a, b) => a - b);
    const pageMedianRatio = sortedAll.length > 0 ? sortedAll[Math.floor(sortedAll.length / 2)] : 0.55;

    function isBoldByWidth(fontName) {
      const r = fontMedianRatio[fontName];
      if (!r) return false;
      // A font whose chars are >13% wider than the page median is likely bold
      return r > pageMedianRatio * 1.13;
    }

    const rawItems = textContent.items
      .filter(item => item.str && item.str.trim() !== '')
      .map(item => ({ ...item, str: normalizeIconGlyph(item.str, item.fontName || '') }))
      .filter(item => item.str.trim() !== '')
      .map(item => {
        const [a, b, c, d, tx, ty] = item.transform;
        const fontSize = Math.abs(d) || Math.abs(a) || 12;
        const x = tx;
        const y = pageHeight - ty; // flip to top-down
        const boldByName = /bold|black|heavy|demi|semibold/i.test(item.fontName || '');
        const boldByW = isBoldByWidth(item.fontName || '');
        return {
          x,
          y,
          width: item.width || 0,
          height: item.height || fontSize,
          text: item.str,
          fontSize,
          fontName: item.fontName || '',
          hasEOL: item.hasEOL || false,
          bold: boldByName || boldByW,
          italic: /italic|oblique/i.test(item.fontName || ''),
          underline: isUnderlined(x, y, item.width || 0),
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
            if (gap > pageWidth * 0.15) {
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

        runs.push({
          text: item.text,
          fontSize: item.fontSize,
          bold: item.bold || false,
          italic: item.italic || false,
          underline: item.underline || false,
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

// Matches a line that STARTS with a bullet char (with or without trailing space)
const BULLET_CHARS = '•·●▪▸◆►▶\u2022\u2023\u25AA\u25AB\u25CF\u25CB';
const BULLET_PATTERN = new RegExp(`^[${BULLET_CHARS}\\-]([\\s\u00A0]|$)`);

function stripLeadingBullet(runs) {
  const cloned = runs.map(r => ({ ...r }));
  for (let i = 0; i < cloned.length; i++) {
    const r = cloned[i];
    if (r.isTab) continue;
    // Strip bullet char at start, with or without trailing space
    const stripped = r.text.replace(new RegExp(`^[${BULLET_CHARS}\\-][\\s\u00A0]?\\s*`), '');
    if (stripped !== r.text) {
      cloned[i] = { ...r, text: stripped };
      break;
    }
    // Also handle the case where the entire run is just a bullet char
    if (new RegExp(`^[${BULLET_CHARS}]$`).test(r.text.trim())) {
      cloned[i] = { ...r, text: '' };
      break;
    }
  }
  // Also strip a leading space from the next run after stripping bullet
  const result = cloned.filter(r => r.text !== '');
  if (result.length > 0 && result[0].text.startsWith(' ')) {
    result[0] = { ...result[0], text: result[0].text.trimStart() };
  }
  return result;
}

// No-border table borders (invisible grid)
const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

function runsToChildren(runs, defaultSize) {
  return runs
    .filter(r => r.text !== undefined && r.text !== '')
    .map(run => {
      if (run.isTab) return new TextRun({ text: '\t' });
      const props = {
        text: run.text,
        bold: run.bold || false,
        italics: run.italic || false,
        size: Math.max(16, Math.round((run.fontSize || defaultSize || 11) * 2)),
      };
      if (run.underline) props.underline = {};
      return new TextRun(props);
    });
}

function makeTwoColumnTable(leftRuns, rightRuns, fontSize) {
  const leftChildren = runsToChildren(leftRuns, fontSize);
  const rightChildren = runsToChildren(rightRuns, fontSize);

  return new Table({
    borders: NO_BORDER,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: NO_BORDER,
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph({
              children: leftChildren,
              spacing: { after: 0, line: 276 },
            })],
          }),
          new TableCell({
            borders: NO_BORDER,
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({
              children: rightChildren,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 0, line: 276 },
            })],
          }),
        ],
      }),
    ],
  });
}

function isAllCaps(text) {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  return letters.length >= 3 && letters === letters.toUpperCase();
}

function buildDocxFromPages(pages) {
  const docxChildren = [];

  pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) {
      docxChildren.push(new Paragraph({ pageBreakBefore: true, children: [] }));
    }

    const pageWidth = page.pageWidth;
    const bulletIndentMin = pageWidth * 0.12;

    // Flatten all lines across paragraphs on this page
    const allLines = [];
    for (const para of page.paragraphs || []) {
      for (const line of para.lines || []) {
        if (line.runs.length > 0) allLines.push(line);
      }
    }

    // Merge bullet continuation lines (wrapped bullet text)
    const mergedLines = [];
    for (const line of allLines) {
      const lineText = line.runs.map(r => r.text).join('');
      const trimmed = lineText.trim();
      if (!trimmed) continue;

      // Check if this line has a tab (= two-column)
      const hasTwoCol = line.runs.some(r => r.isTab);
      const isBulletLine = BULLET_PATTERN.test(trimmed);
      const isIndented = line.firstX > bulletIndentMin;

      const prev = mergedLines[mergedLines.length - 1];
      // Continuation: non-bullet indented line following a bullet at similar indent
      if (
        prev &&
        !isBulletLine &&
        !hasTwoCol &&
        isIndented &&
        prev.isBullet &&
        !prev.hasTwoCol &&
        Math.abs(line.firstX - prev.firstX) < pageWidth * 0.15
      ) {
        prev.runs.push({ text: ' ', fontSize: line.fontSize });
        prev.runs.push(...line.runs);
      } else {
        mergedLines.push({
          runs: [...line.runs],
          fontSize: line.fontSize,
          isCentered: line.isCentered,
          firstX: line.firstX,
          isBullet: isBulletLine,
          isIndented,
          hasTwoCol,
        });
      }
    }

    for (const line of mergedLines) {
      const lineText = line.runs.map(r => r.text).join('');
      const trimmed = lineText.trim();
      if (!trimmed) continue;

      const hasBold = line.runs.some(r => r.bold);
      const allCaps = isAllCaps(trimmed);

      // --- Two-column line: split at tab and render as table ---
      if (line.hasTwoCol) {
        const tabIdx = line.runs.findIndex(r => r.isTab);
        const leftRuns = line.runs.slice(0, tabIdx).filter(r => !r.isTab && r.text);
        const rightRuns = line.runs.slice(tabIdx + 1).filter(r => !r.isTab && r.text);

        if (leftRuns.length > 0 && rightRuns.length > 0) {
          docxChildren.push(makeTwoColumnTable(leftRuns, rightRuns, line.fontSize));
          continue;
        }
        // Fallback: just drop the tab and render as one line
        const allRuns = [...leftRuns, ...rightRuns];
        const children = runsToChildren(allRuns, line.fontSize);
        if (children.length > 0) {
          docxChildren.push(new Paragraph({ children, spacing: { after: 60, line: 276 } }));
        }
        continue;
      }

      // --- Heading detection ---
      let heading = undefined;
      let isSectionHeader = false;
      if (line.fontSize >= 20) {
        heading = HeadingLevel.HEADING_1;
      } else if (line.fontSize >= 16) {
        heading = HeadingLevel.HEADING_2;
        isSectionHeader = true;
      } else if (allCaps && hasBold) {
        heading = HeadingLevel.HEADING_2;
        isSectionHeader = true;
      } else if (allCaps && line.fontSize >= 12) {
        heading = HeadingLevel.HEADING_2;
        isSectionHeader = true;
      } else if (line.fontSize >= 13 && hasBold && !line.isBullet) {
        heading = HeadingLevel.HEADING_3;
      }

      const isBullet = line.isBullet && !heading;
      let runs = line.runs;

      if (isBullet) {
        runs = stripLeadingBullet(runs);
      }

      const children = runsToChildren(runs, line.fontSize);
      if (children.length === 0) continue;

      const paraProps = {
        heading,
        children,
        alignment: line.isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: {
          after: isSectionHeader ? 40 : isBullet ? 20 : 60,
          before: isSectionHeader ? 100 : 0,
          line: 276,
        },
      };

      // Section headers get a bottom border (horizontal rule like ilovepdf)
      if (isSectionHeader) {
        paraProps.border = {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 },
        };
      }

      // Bullets: use dash prefix + hanging indent (avoids Word native bullet doubling)
      if (isBullet) {
        paraProps.indent = { left: 440, hanging: 220 };
        // Prepend "–  " dash as the bullet marker
        paraProps.children = [
          new TextRun({
            text: '\u2013  ',
            size: Math.max(16, Math.round((line.fontSize || 11) * 2)),
          }),
          ...children,
        ];
      } else if (line.isIndented && !heading) {
        paraProps.indent = { left: 360 };
      }

      docxChildren.push(new Paragraph(paraProps));
    }
  });

  return docxChildren;
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
          document: { run: { font: 'Calibri', size: 22 } },
          heading1: { run: { bold: true, size: 40, font: 'Calibri' } },
          heading2: { run: { bold: true, size: 24, font: 'Calibri', allCaps: true } },
          heading3: { run: { bold: true, size: 22, font: 'Calibri' } },
        },
      },
      sections: [{
        properties: {
          page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } },
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
