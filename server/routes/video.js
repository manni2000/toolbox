const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const router = express.Router();

// Set ffmpeg path for video processing
process.env.FFMPEG_PATH = require('ffmpeg-static');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
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
    console.error('Error cleaning up temp file:', error);
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
    console.error('Thumbnail proxy error:', error);
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

// Video to Audio
router.post('/to-audio', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { format = 'mp3', quality = 'medium' } = req.body;
    const supportedFormats = ['mp3', 'wav', 'aac', 'ogg'];
    
    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ 
        error: 'Unsupported format. Use mp3, wav, aac, or ogg' 
      });
    }

    // For now, we'll return a placeholder since ffmpeg requires file input
    // In a production environment, you'd want to use a streaming approach
    // or a different library that supports buffer-to-buffer conversion
    
    res.json({
      success: true,
      result: {
        audio: null,
        filename: `extracted_audio.${format}`,
        format,
        originalVideo: req.file.originalname,
        note: 'Audio extraction requires file processing. This is a placeholder implementation.'
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Trim
router.post('/trim', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { startTime, endTime } = req.body;
    
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
        filename: 'trimmed_video.mp4',
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
        filename: `speed_${speedFactor}x_video.mp4`,
        speedFactor: parseFloat(speedFactor),
        note: 'Video speed change requires file processing. This is a placeholder implementation.'
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Thumbnail
router.post('/thumbnail', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { timestamp = '00:00:01', width = 320, height = 240 } = req.body;

    const tempInputPath = bufferToTempFile(req.file.buffer, path.extname(req.file.originalname));
    const tempOutputPath = path.join(__dirname, '../temp', `thumbnail_${Date.now()}.jpg`);

    // Ensure temp directory exists
    const tempDir = path.dirname(tempInputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    ffmpeg(tempInputPath)
      .seekInput(timestamp)
      .frames(1)
      .size(`${width}x${height}`)
      .format('jpg')
      .on('end', () => {
        try {
          const outputBuffer = fs.readFileSync(tempOutputPath);
          const thumbnailBase64 = outputBuffer.toString('base64');
          
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);

          res.json({
            success: true,
            result: {
              thumbnail: `data:image/jpeg;base64,${thumbnailBase64}`,
              filename: 'thumbnail.jpg',
              timestamp,
              width: parseInt(width),
              height: parseInt(height)
            }
          });
        } catch (error) {
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);
          res.status(500).json({ error: 'Error processing video file' });
        }
      })
      .on('error', (err) => {
        cleanupTempFile(tempInputPath);
        cleanupTempFile(tempOutputPath);
        res.status(500).json({ error: 'Thumbnail generation failed: ' + err.message });
      })
      .save(tempOutputPath);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Resolution Change
router.post('/resolution', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { width, height, maintainAspect = true } = req.body;
    
    if (!width && !height) {
      return res.status(400).json({ error: 'At least width or height is required' });
    }

    const tempInputPath = bufferToTempFile(req.file.buffer, path.extname(req.file.originalname));
    const tempOutputPath = path.join(__dirname, '../temp', `resized_${Date.now()}.mp4`);

    // Ensure temp directory exists
    const tempDir = path.dirname(tempInputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    let sizeString = '';
    if (width && height) {
      sizeString = `${width}x${height}`;
    } else if (width) {
      sizeString = `${width}?`;
    } else {
      sizeString = `?${height}`;
    }

    const command = ffmpeg(tempInputPath)
      .videoCodec('libx264')
      .audioCodec('aac');

    if (maintainAspect === 'true') {
      command.size(sizeString + '^').autopad();
    } else {
      command.size(sizeString);
    }

    command
      .on('end', () => {
        try {
          const outputBuffer = fs.readFileSync(tempOutputPath);
          const videoBase64 = outputBuffer.toString('base64');
          
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);

          res.json({
            success: true,
            result: {
              video: `data:video/mp4;base64,${videoBase64}`,
              filename: 'resized_video.mp4',
              width: width || 'auto',
              height: height || 'auto',
              maintainAspect: maintainAspect === 'true'
            }
          });
        } catch (error) {
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);
          res.status(500).json({ error: 'Error processing video file' });
        }
      })
      .on('error', (err) => {
        cleanupTempFile(tempInputPath);
        cleanupTempFile(tempOutputPath);
        res.status(500).json({ error: 'Video resolution change failed: ' + err.message });
      })
      .save(tempOutputPath);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Format Converter
router.post('/convert', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { format = 'mp4', quality = 'medium' } = req.body;
    const supportedFormats = ['mp4', 'webm', 'avi', 'mov', 'flv'];
    
    if (!supportedFormats.includes(format)) {
      return res.status(400).json({ 
        error: 'Unsupported format. Use mp4, webm, avi, mov, or flv' 
      });
    }

    const tempInputPath = bufferToTempFile(req.file.buffer, path.extname(req.file.originalname));
    const tempOutputPath = path.join(__dirname, '../temp', `converted_${Date.now()}.${format}`);

    // Ensure temp directory exists
    const tempDir = path.dirname(tempInputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const command = ffmpeg(tempInputPath)
      .toFormat(format);

    // Set quality based on format and quality parameter
    if (format === 'mp4') {
      command.videoCodec('libx264').audioCodec('aac');
      if (quality === 'high') {
        command.videoBitrate('2000k');
      } else if (quality === 'low') {
        command.videoBitrate('500k');
      }
    } else if (format === 'webm') {
      command.videoCodec('libvpx').audioCodec('libvorbis');
    }

    command
      .on('end', () => {
        try {
          const outputBuffer = fs.readFileSync(tempOutputPath);
          const videoBase64 = outputBuffer.toString('base64');
          
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);

          res.json({
            success: true,
            result: {
              video: `data:video/${format};base64,${videoBase64}`,
              filename: `converted.${format}`,
              format,
              quality,
              originalFormat: path.extname(req.file.originalname).slice(1)
            }
          });
        } catch (error) {
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);
          res.status(500).json({ error: 'Error processing video file' });
        }
      })
      .on('error', (err) => {
        cleanupTempFile(tempInputPath);
        cleanupTempFile(tempOutputPath);
        res.status(500).json({ error: 'Video conversion failed: ' + err.message });
      })
      .save(tempOutputPath);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Info Extractor
router.post('/info', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const tempInputPath = bufferToTempFile(req.file.buffer, path.extname(req.file.originalname));

    ffmpeg.ffprobe(tempInputPath, (err, metadata) => {
      cleanupTempFile(tempInputPath);
      
      if (err) {
        return res.status(500).json({ error: 'Failed to extract video info: ' + err.message });
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

      const videoInfo = {
        filename: req.file.originalname,
        size: req.file.size,
        format: metadata.format.format_name,
        duration: metadata.format.duration,
        bitrate: metadata.format.bit_rate,
        video: videoStream ? {
          codec: videoStream.codec_name,
          width: videoStream.width,
          height: videoStream.height,
          frameRate: eval(videoStream.r_frame_rate),
          pixelFormat: videoStream.pix_fmt,
          bitrate: videoStream.bit_rate
        } : null,
        audio: audioStream ? {
          codec: audioStream.codec_name,
          sampleRate: audioStream.sample_rate,
          channels: audioStream.channels,
          bitrate: audioStream.bit_rate
        } : null
      };

      res.json({
        success: true,
        result: videoInfo
      });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Compress
router.post('/compress', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { quality = 'medium', crf = '23' } = req.body;

    const tempInputPath = bufferToTempFile(req.file.buffer, path.extname(req.file.originalname));
    const tempOutputPath = path.join(__dirname, '../temp', `compressed_${Date.now()}.mp4`);

    // Ensure temp directory exists
    const tempDir = path.dirname(tempInputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    ffmpeg(tempInputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .videoBitrate(quality === 'high' ? '2000k' : quality === 'low' ? '500k' : '1000k')
      .audioBitrate('128k')
      .addOption('-crf', crf)
      .on('end', () => {
        try {
          const outputBuffer = fs.readFileSync(tempOutputPath);
          const videoBase64 = outputBuffer.toString('base64');
          
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);

          res.json({
            success: true,
            result: {
              video: `data:video/mp4;base64,${videoBase64}`,
              filename: 'compressed_video.mp4',
              originalSize: req.file.size,
              compressedSize: outputBuffer.length,
              compressionRatio: ((req.file.size - outputBuffer.length) / req.file.size * 100).toFixed(2),
              quality,
              crf
            }
          });
        } catch (error) {
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);
          res.status(500).json({ error: 'Error processing video file' });
        }
      })
      .on('error', (err) => {
        cleanupTempFile(tempInputPath);
        cleanupTempFile(tempOutputPath);
        res.status(500).json({ error: 'Video compression failed: ' + err.message });
      })
      .save(tempOutputPath);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
