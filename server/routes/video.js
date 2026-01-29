const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { YtDlp } = require('ytdlp-nodejs');
const abDownloader = require('ab-downloader');
const router = express.Router();

// Initialize ytdlp
const ytdlp = new YtDlp();

// Set ffmpeg path for ytdlp
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
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
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

// Multi-platform Video Downloader
router.post('/download', async (req, res) => {
  try {
    const { url, quality = 'highest' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Detect platform
    let platform = 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'youtube';
    } else if (url.includes('instagram.com')) {
      platform = 'instagram';
    } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
      platform = 'facebook';
    }

    let downloadResult;

    if (platform === 'youtube') {
      // Use ytdl-core for YouTube
      downloadResult = await downloadYouTubeVideo(url, quality);
    } else if (platform === 'instagram' || platform === 'facebook') {
      // Use ab-downloader for Instagram and Facebook
      downloadResult = await downloadSocialMediaVideo(url, platform);
    } else {
      return res.status(400).json({ 
        error: 'Unsupported platform. Currently supports YouTube, Instagram, and Facebook.',
        download_blocked: true,
        block_reason: 'Unsupported platform'
      });
    }

    res.json({
      success: true,
      info: downloadResult.info,
      video: downloadResult.video,
      filename: downloadResult.filename,
      format: downloadResult.format,
      quality: downloadResult.quality,
      size: downloadResult.size,
      platform: platform
    });

  } catch (error) {
    console.error('Video download error:', error);
    
    res.status(500).json({ 
      error: 'Failed to process video: ' + error.message,
      download_blocked: true,
      block_reason: 'Processing error'
    });
  }
});

// YouTube download function using ytdlp-nodejs
async function downloadYouTubeVideo(url, quality) {
  try {
    console.log('Downloading with ytdlp-nodejs...');
    
    // Get video info first
    const info = await ytdlp.getInfoAsync(url);
    
    // Download video directly to buffer
    try {
      const result = await ytdlp
        .download(url)
        .format('best[ext=mp4]/best')
        .on('error', (error) => {
          console.error('ytdlp download error:', error);
        })
        .run();
      
      console.log('Download completed, processing buffer...');
      
      // Get the video buffer from ytdlp result
      let videoBuffer;
      if (result && result.buffer) {
        videoBuffer = result.buffer;
      } else if (result && result.filePaths && result.filePaths.length > 0) {
        // Fallback: read file if buffer not available
        const filePath = result.filePaths[0];
        if (fs.existsSync(filePath)) {
          videoBuffer = fs.readFileSync(filePath);
          // Clean up the file immediately
          fs.unlinkSync(filePath);
        } else {
          throw new Error('Video file not found after download');
        }
      } else {
        throw new Error('No video data received from ytdlp');
      }
      
      const videoBase64 = videoBuffer.toString('base64');
      
      return {
        info: {
          title: info.title || 'YouTube Video',
          duration: Math.floor(info.duration) || 0,
          uploader: info.uploader || info.channel || 'Unknown',
          thumbnail: info.thumbnail || null,
          view_count: info.view_count || info.views || null,
          upload_date: info.upload_date || null,
          description: info.description?.substring(0, 500) || '',
          download_blocked: false,
          file_size: videoBuffer.length
        },
        video: `data:video/mp4;base64,${videoBase64}`,
        filename: `${(info.title || 'youtube_video').replace(/[^\w\s-]/g, '').trim()}.mp4`,
        format: 'mp4',
        quality: quality || 'unknown',
        size: videoBuffer.length
      };
      
    } catch (downloadError) {
      console.error('Download failed:', downloadError);
      throw new Error('Failed to download video: ' + downloadError.message);
    }
    
  } catch (error) {
    console.error('YouTube download error:', error);
    
    // Provide better error messages
    if (error.message.includes('Video unavailable')) {
      throw new Error('This video is unavailable or private');
    } else if (error.message.includes('This video is private')) {
      throw new Error('This video is private');
    } else if (error.message.includes('429')) {
      throw new Error('Too many requests - please wait a moment and try again');
    } else {
      throw new Error('Failed to download video: ' + error.message);
    }
  }
}

// Social media download function (Instagram, Facebook)
async function downloadSocialMediaVideo(url, platform) {
  try {
    let result;
    
    if (platform === 'instagram') {
      result = await abDownloader.igdl(url);
      console.log('Instagram result:', JSON.stringify(result, null, 2));
    } else if (platform === 'facebook') {
      result = await abDownloader.fbdown(url);
      console.log('Facebook result:', JSON.stringify(result, null, 2));
    } else {
      throw new Error('Unsupported platform: ' + platform);
    }
    
    if (!result) {
      throw new Error('No result returned from ' + platform);
    }

    // Check different possible response structures
    let videoUrl = result.url || result.download_url || result.media_url || result.video_url;
    let thumbnailUrl = result.thumbnail || result.preview || result.display_url || result.thumbnail_url || result.image || null;
    
    if (!videoUrl) {
      // Handle Facebook specific response structure
      if (platform === 'facebook') {
        videoUrl = result.Normal_video || result.HD || result.hd || result.sd;
        // Facebook might not provide thumbnails in all cases
        thumbnailUrl = thumbnailUrl || result.thumbnail || result.preview || result.display_url || result.image || null;
      }
      
      // If result is an array, take the first item
      if (Array.isArray(result) && result.length > 0) {
        videoUrl = result[0].url || result[0].download_url || result[0].media_url || result[0].video_url ||
                  result[0].Normal_video || result[0].HD || result[0].hd || result[0].sd;
        thumbnailUrl = thumbnailUrl || result[0].thumbnail || result[0].preview || result[0].display_url || 
                     result[0].thumbnail_url || result[0].image || null;
      }
    }

    if (!videoUrl) {
      throw new Error('No video URL found in response from ' + platform);
    }

    console.log('Found video URL:', videoUrl);
    console.log('Found thumbnail URL:', thumbnailUrl);
    console.log('Returning video info with thumbnail:', thumbnailUrl);

    // Download the video from the URL
    const fetch = require('node-fetch');
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      throw new Error('Failed to download video file: ' + response.statusText);
    }

    const buffer = await response.buffer();
    const videoBase64 = buffer.toString('base64');
    
    // Skip thumbnail generation for Facebook videos to avoid storing files
    // Facebook API typically doesn't provide thumbnails anyway
    let finalThumbnailUrl = thumbnailUrl;
    
    const filename = result.filename?.replace(/\.mp4$/, '')?.replace(/[^\w\s-]/g, '') || 
                    result.title?.replace(/[^\w\s-]/g, '') || 
                    result.caption?.replace(/[^\w\s-]/g, '') || 
                    `${platform}_video`;
    const safeFilename = `${filename}.mp4`;

    const returnObject = {
      info: {
        title: result.filename?.replace(/\.mp4$/, '') || result.title || result.caption || `${platform} video`,
        duration: result.duration || 0,
        uploader: result.author || result.owner || result.username || platform,
        thumbnail: finalThumbnailUrl,
        view_count: result.view_count || result.views || null,
        upload_date: result.upload_date || result.taken_at || null,
        description: result.description || result.caption || '',
        download_blocked: false,
        file_size: buffer.length
      },
      video: `data:video/mp4;base64,${videoBase64}`,
      filename: safeFilename,
      format: 'mp4',
      quality: 'standard',
      size: buffer.length
    };

    console.log('Final response object thumbnail:', returnObject.info.thumbnail);
    console.log('Full response keys:', Object.keys(returnObject.info));
    
    return returnObject;

  } catch (error) {
    console.error(`${platform} download error:`, error);
    throw new Error(`Failed to download ${platform} video: ${error.message}`);
  }
}

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
