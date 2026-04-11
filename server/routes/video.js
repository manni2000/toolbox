const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv|3gp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

// Helper function to convert buffer to temporary file
const bufferToTempFile = (buffer, ext) => {
  const tempPath = path.join(__dirname, '../temp', `temp_${Date.now()}${ext}`);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
};

// Helper function to clean up temporary files
const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    // Silent cleanup failure
  }
};

// Thumbnail proxy endpoint to handle CORS issues
router.get('/thumbnail-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Thumbnail URL is required' });
    }

    const fetch = require('node-fetch');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }

    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', 
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    });
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch thumbnail' });
  }
});

// Multi-platform Video Downloader - Currently disabled due to binary dependencies
// router.post('/download', async (req, res) => {
//   try {
//     const { url } = req.body;
    
//     if (!url) {
//       return res.status(400).json({ error: 'Video URL is required' });
//     }

//     // Video downloads are not supported due to binary requirements in serverless environments
//     return res.status(503).json({ 
//       error: 'Video download is not available',
//       message: 'Video downloading requires system binaries that are not supported in serverless environments. Only video processing features are available.',
//       download_blocked: true,
//       block_reason: 'Serverless environment limitation'
//     });

//   } catch (error) {
//     console.error('Video download error:', error);
    
//     res.status(500).json({ 
//       error: 'Failed to process video: ' + error.message,
//       download_blocked: true,
//       block_reason: 'Processing error'
//     });
//   }
// });

// Video to Audio - Requires cloud service
router.post('/to-audio', upload.single('video'), async (req, res) => {
  return res.status(503).json({ 
    error: 'Video to audio conversion requires ffmpeg or cloud service',
    message: 'Video to audio extraction cannot be done without ffmpeg in serverless environments.',
    alternatives: [
      'Use CloudConvert API (https://cloudconvert.com/) - supports video to audio conversion',
      'Use AWS Elastic Transcoder',
      'Use Google Cloud Transcoder API',
      'Use Azure Media Services'
    ],
    note: 'Consider integrating a cloud service for video-to-audio conversion functionality.'
  });
});

// Video Trim
router.post('/trim', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { startTime, endTime } = req.body;
    const baseFilename = req.file.originalname.replace(/\.[^/.]+$/, '');
    
    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'Start time and end time are required' });
    }

    // For now, we'll return a placeholder since ffmpeg requires file input
    // In a production environment, you'd want to use a streaming approach
    // or a different library that supports buffer-to-buffer conversion
    
    res.json({
      success: true,
      result: {
        video: null,
        filename: `${baseFilename}.mp4`,
        startTime,
        endTime,
        duration: parseFloat(endTime) - parseFloat(startTime),
        note: 'Video trimming requires file processing. This is a placeholder implementation.'
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Speed
router.post('/speed', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { speedFactor = 1.0 } = req.body;
    const baseFilename = req.file.originalname.replace(/\.[^/.]+$/, '');
    
    if (speedFactor <= 0 || speedFactor > 4) {
      return res.status(400).json({ error: 'Speed factor must be between 0.1 and 4.0' });
    }

    // For now, we'll return a placeholder since ffmpeg requires file input
    // In a production environment, you'd want to use a streaming approach
    // or a different library that supports buffer-to-buffer conversion
    
    res.json({
      success: true,
      result: {
        video: null,
        filename: `${baseFilename}.mp4`,
        speedFactor: parseFloat(speedFactor),
        note: 'Video speed change requires file processing. This is a placeholder implementation.'
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Thumbnail - Requires cloud service
router.post('/thumbnail', upload.single('video'), async (req, res) => {
  return res.status(503).json({ 
    error: 'Video thumbnail generation requires ffmpeg or cloud service',
    message: 'Thumbnail extraction from video cannot be done without ffmpeg in serverless environments.',
    alternatives: [
      'Use CloudConvert API (https://cloudconvert.com/) - supports thumbnail extraction',
      'Use AWS Elastic Transcoder',
      'Use Google Cloud Video Intelligence API',
      'Use Azure Media Services'
    ],
    note: 'Consider integrating a cloud service for video thumbnail generation.'
  });
});

// Video Resolution Change - Requires cloud service
router.post('/resolution', upload.single('video'), async (req, res) => {
  return res.status(503).json({ 
    error: 'Video resolution change requires ffmpeg or cloud service',
    message: 'Video resolution modification cannot be done without ffmpeg in serverless environments.',
    alternatives: [
      'Use CloudConvert API (https://cloudconvert.com/) - supports video resizing',
      'Use AWS Elastic Transcoder',
      'Use Google Cloud Transcoder API',
      'Use Azure Media Services'
    ],
    note: 'Consider integrating a cloud service for video resolution changes.'
  });
});

// Video Format Converter - Requires cloud service
router.post('/convert', upload.single('video'), async (req, res) => {
  return res.status(503).json({ 
    error: 'Video format conversion requires ffmpeg or cloud service',
    message: 'Video format conversion cannot be done without ffmpeg in serverless environments.',
    alternatives: [
      'Use CloudConvert API (https://cloudconvert.com/) - supports all video formats',
      'Use AWS Elastic Transcoder',
      'Use Google Cloud Transcoder API',
      'Use Azure Media Services',
      'Use Mux.com API'
    ],
    note: 'Consider integrating a cloud service for video format conversion.'
  });
});

// Video Info Extractor - Basic implementation
router.post('/info', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const baseFilename = req.file.originalname.replace(/\.[^/.]+$/, '');
    
    // Basic info we can extract without ffmpeg
    const basicInfo = {
      filename: req.file.originalname,
      size: req.file.size,
      size_mb: (req.file.size / (1024 * 1024)).toFixed(2),
      format: ext.slice(1),
      mimetype: req.file.mimetype
    };

    // Try to extract some metadata from file headers for common formats
    try {
      const buffer = req.file.buffer;
      
      // MP4 detection (ftyp box)
      if (ext === '.mp4' || ext === '.mov' || ext === '.m4v') {
        if (buffer.length > 4) {
          const ftyp = buffer.slice(4, 8).toString('ascii');
          basicInfo.container_type = ftyp;
          basicInfo.format_detected = 'MP4/MOV container';
        }
      }
      
      // AVI detection (RIFF header)
      else if (ext === '.avi') {
        if (buffer.length > 12) {
          const riff = buffer.slice(0, 4).toString('ascii');
          const avi = buffer.slice(8, 12).toString('ascii');
          if (riff === 'RIFF' && avi === 'AVI ') {
            basicInfo.format_detected = 'AVI container';
          }
        }
      }
      
      // WebM detection (EBML header)
      else if (ext === '.webm' || ext === '.mkv') {
        if (buffer.length > 4) {
          const ebml = buffer.readUInt32LE(0);
          if (ebml === 0x1A45DFA3) {
            basicInfo.format_detected = 'WebM/Matroska container';
          }
        }
      }

      res.json({
        success: true,
        result: basicInfo,
        note: 'Basic file information extracted. For detailed video metadata (duration, codec, resolution, bitrate), ffmpeg or a cloud service is required.'
      });
    } catch (metadataError) {
      // Return basic info even if metadata extraction fails
      res.json({
        success: true,
        result: basicInfo,
        note: 'Basic file information extracted. Could not extract format-specific metadata.'
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Compress - Requires cloud service
router.post('/compress', upload.single('video'), async (req, res) => {
  return res.status(503).json({ 
    error: 'Video compression requires ffmpeg or cloud service',
    message: 'Video compression cannot be done without ffmpeg in serverless environments.',
    alternatives: [
      'Use CloudConvert API (https://cloudconvert.com/) - supports video compression',
      'Use AWS Elastic Transcoder',
      'Use Google Cloud Transcoder API',
      'Use Azure Media Services',
      'Use Mux.com API - optimized for web video'
    ],
    note: 'Consider integrating a cloud service for video compression.'
  });
});

module.exports = router;
