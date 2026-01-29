const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const extractZip = require('extract-zip');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Create ZIP
router.post('/create', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { zipName = 'archive.zip', compressionLevel = 6 } = req.body;

    // Create a new archive
    const archive = archiver('zip', {
      zlib: { level: parseInt(compressionLevel) }
    });

    // Store the archive data in memory
    const buffers = [];
    archive.on('data', (data) => {
      buffers.push(data);
    });

    archive.on('end', () => {
      const zipBuffer = Buffer.concat(buffers);
      const zipBase64 = zipBuffer.toString('base64');

      res.json({
        success: true,
        result: {
          zipFile: `data:application/zip;base64,${zipBase64}`,
          filename: zipName,
          size: zipBuffer.length,
          filesCount: req.files.length,
          files: req.files.map(file => ({
            name: file.originalname,
            size: file.size,
            type: file.mimetype
          }))
        }
      });
    });

    archive.on('error', (err) => {
      res.status(500).json({ error: 'Failed to create ZIP: ' + err.message });
    });

    // Add files to the archive
    req.files.forEach(file => {
      archive.append(file.buffer, { name: file.originalname });
    });

    // Finalize the archive
    archive.finalize();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract ZIP
router.post('/extract', upload.single('zip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No ZIP file provided' });
    }

    const { extractPath = './extracted' } = req.body;

    // Create temporary directory for extraction
    const tempDir = path.join(__dirname, '../temp', `extract_${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write ZIP file to temporary location
    const tempZipPath = path.join(tempDir, 'archive.zip');
    fs.writeFileSync(tempZipPath, req.file.buffer);

    try {
      // Extract ZIP file
      await extractZip(tempZipPath, { dir: tempDir });

      // Read extracted files
      const extractedFiles = [];
      const readDir = (dir, basePath = '') => {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const relativePath = basePath ? path.join(basePath, item) : item;
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            readDir(itemPath, relativePath);
          } else {
            const fileBuffer = fs.readFileSync(itemPath);
            const fileBase64 = fileBuffer.toString('base64');
            
            extractedFiles.push({
              name: relativePath,
              path: relativePath,
              size: stats.size,
              type: path.extname(item),
              data: `data:application/octet-stream;base64,${fileBase64}`
            });
          }
        });
      };

      readDir(tempDir);

      // Clean up temporary directory
      fs.rmSync(tempDir, { recursive: true, force: true });

      res.json({
        success: true,
        result: {
          originalFile: req.file.originalname,
          extractedFiles,
          filesCount: extractedFiles.length,
          totalSize: extractedFiles.reduce((sum, file) => sum + file.size, 0)
        }
      });

    } catch (extractError) {
      // Clean up on error
      fs.rmSync(tempDir, { recursive: true, force: true });
      res.status(500).json({ error: 'Failed to extract ZIP: ' + extractError.message });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password Protect ZIP
router.post('/password', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { password, zipName = 'protected.zip' } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use a library that supports password-protected ZIP files
    // like node-7z or similar
    const passwordInfo = {
      zipName,
      password: '***',
      filesCount: req.files.length,
      files: req.files.map(file => ({
        name: file.originalname,
        size: file.size
      })),
      note: 'Password protection is not implemented in this demo. Please integrate with a ZIP library that supports encryption like node-7z.'
    };

    res.json({
      success: true,
      result: passwordInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compression Level Test
router.post('/compression-test', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const compressionLevels = [0, 1, 6, 9]; // Store, Fast, Default, Best
    const results = [];

    for (const level of compressionLevels) {
      const archive = archiver('zip', {
        zlib: { level }
      });

      const buffers = [];
      archive.on('data', (data) => {
        buffers.push(data);
      });

      await new Promise((resolve, reject) => {
        archive.on('end', resolve);
        archive.on('error', reject);
        archive.append(req.file.buffer, { name: req.file.originalname });
        archive.finalize();
      });

      const zipBuffer = Buffer.concat(buffers);
      const compressionRatio = ((req.file.size - zipBuffer.length) / req.file.size * 100).toFixed(2);

      results.push({
        level,
        compressedSize: zipBuffer.length,
        compressionRatio: parseFloat(compressionRatio),
        spaceSaved: req.file.size - zipBuffer.length
      });
    }

    res.json({
      success: true,
      result: {
        originalFile: req.file.originalname,
        originalSize: req.file.size,
        compressionResults: results,
        recommendation: getCompressionRecommendation(results)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Split ZIP
router.post('/split', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { maxFileSize = 10 * 1024 * 1024, baseName = 'archive' } = req.body; // Default 10MB

    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    const partsNeeded = Math.ceil(totalSize / maxFileSize);

    // This is a placeholder implementation
    const splitInfo = {
      baseName,
      maxFileSize,
      totalSize,
      partsNeeded,
      filesCount: req.files.length,
      parts: Array.from({ length: partsNeeded }, (_, i) => ({
        name: `${baseName}.part${i + 1}.zip`,
        estimatedSize: Math.min(maxFileSize, totalSize - (i * maxFileSize))
      })),
      note: 'ZIP splitting is not implemented in this demo. Please integrate with a ZIP library that supports splitting.'
    };

    res.json({
      success: true,
      result: splitInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Merge ZIP files
router.post('/merge', upload.array('zips', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least 2 ZIP files are required' });
    }

    const { outputName = 'merged.zip' } = req.body;

    // This is a placeholder implementation
    const mergeInfo = {
      outputName,
      inputFiles: req.files.map(file => ({
        name: file.originalname,
        size: file.size
      })),
      totalInputSize: req.files.reduce((sum, file) => sum + file.size, 0),
      note: 'ZIP merging is not implemented in this demo. Please integrate with a ZIP library that supports merging.'
    };

    res.json({
      success: true,
      result: mergeInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ZIP Info
router.post('/info', upload.single('zip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No ZIP file provided' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use a library like yauzl to read ZIP contents
    const zipInfo = {
      filename: req.file.originalname,
      size: req.file.size,
      files: [
        { name: 'file1.txt', size: 1024, compressed: 512, ratio: '50%' },
        { name: 'file2.jpg', size: 2048, compressed: 1800, ratio: '12%' },
        { name: 'folder/', size: 0, compressed: 0, ratio: '0%', isDirectory: true }
      ],
      totalFiles: 2,
      totalFolders: 1,
      totalUncompressedSize: 3072,
      totalCompressedSize: 2312,
      compressionRatio: '24.7%',
      note: 'ZIP info extraction is not implemented in this demo. Please integrate with a ZIP library like yauzl.'
    };

    res.json({
      success: true,
      result: zipInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert to 7Z (placeholder)
router.post('/to-7z', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { outputName = 'archive.7z', compressionLevel = 6 } = req.body;

    // This is a placeholder implementation
    const convertInfo = {
      outputName,
      compressionLevel,
      filesCount: req.files.length,
      files: req.files.map(file => ({
        name: file.originalname,
        size: file.size
      })),
      note: '7Z conversion is not implemented in this demo. Please integrate with a 7Z library like node-7z.'
    };

    res.json({
      success: true,
      result: convertInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert to TAR (placeholder)
router.post('/to-tar', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { outputName = 'archive.tar', compress = false } = req.body;

    // This is a placeholder implementation
    const convertInfo = {
      outputName,
      compress,
      filesCount: req.files.length,
      files: req.files.map(file => ({
        name: file.originalname,
        size: file.size
      })),
      note: 'TAR conversion is not implemented in this demo. Please integrate with a TAR library.'
    };

    res.json({
      success: true,
      result: convertInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Repair ZIP (placeholder)
router.post('/repair', upload.single('zip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No ZIP file provided' });
    }

    // This is a placeholder implementation
    const repairInfo = {
      originalFile: req.file.originalname,
      status: 'Cannot be repaired automatically',
      suggestions: [
        'Try using a different ZIP extraction tool',
        'Check if the file is completely downloaded',
        'Try to recover partial data using specialized tools'
      ],
      note: 'ZIP repair is not implemented in this demo. Please integrate with a ZIP repair library.'
    };

    res.json({
      success: true,
      result: repairInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function getCompressionRecommendation(results) {
  const bestCompression = results.reduce((best, current) => 
    current.compressionRatio > best.compressionRatio ? current : best
  );
  
  const fastest = results.reduce((fastest, current) => 
    current.level < fastest.level ? current : fastest
  );
  
  return {
    bestCompression: bestCompression.level,
    fastest: fastest.level,
    balanced: 6, // Default level
    recommendation: 'Use level 6 for balanced compression and speed'
  };
}

module.exports = router;
