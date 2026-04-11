const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const wav = require('node-wav');
const AudioBuffer = require('audio-buffer');
// const ffmpeg = require('fluent-ffmpeg'); // Removed - fluent-ffmpeg uninstalled
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
      'audio/aac', 'audio/mp4', 'audio/ogg', 'audio/flac',
      'audio/x-wav', 'audio/x-flac', 'audio/x-aac'
    ];
    const allowedExtensions = ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a'];
    
    const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Helper function to convert buffer to temporary file
const bufferToTempFile = (buffer, ext) => {
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempPath = path.join(tempDir, `temp_${Date.now()}${ext}`);
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

// Convert audio to different format
router.post('/convert', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const targetFormat = req.body.format || 'wav';
    const supportedFormats = ['wav']; // Currently only WAV is supported without ffmpeg
    const baseFilename = req.file.originalname.replace(/\.[^/.]+$/, '');
    
    if (!supportedFormats.includes(targetFormat.toLowerCase())) {
      return res.status(400).json({ 
        error: `Unsupported format. Currently only WAV is supported. Requested: ${targetFormat}`,
        note: 'For MP3, AAC, OGG, FLAC conversion, ffmpeg is required which is not available in serverless environments.'
      });
    }

    // If already WAV, return as-is
    if (path.extname(req.file.originalname).toLowerCase() === '.wav') {
      const audioBase64 = req.file.buffer.toString('base64');
      return res.json({
        success: true,
        audio: `data:audio/wav;base64,${audioBase64}`,
        filename: `${baseFilename}.wav`,
        original_format: 'wav',
        converted: false,
        note: 'File was already in WAV format'
      });
    }

    // For non-WAV files, we can't convert without ffmpeg
    return res.status(503).json({ 
      error: 'Audio format conversion is limited',
      message: `Conversion from ${path.extname(req.file.originalname).slice(1)} to WAV requires ffmpeg which is not available.`,
      supported_formats: ['wav'],
      note: 'For full format conversion support, consider using a cloud service like CloudConvert or AWS Elastic Transcoder.'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trim audio
router.post('/trim', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const startTime = parseFloat(req.body.start_time) || 0;
    const endTime = parseFloat(req.body.end_time) || 10;
    const baseFilename = req.file.originalname.replace(/\.[^/.]+$/, '');

    // Only support WAV files for trimming
    if (path.extname(req.file.originalname).toLowerCase() !== '.wav') {
      return res.status(503).json({ 
        error: 'Audio trimming is limited to WAV files',
        message: 'Trimming non-WAV files requires ffmpeg which is not available.',
        note: 'Convert your file to WAV first, or use a cloud service for trimming other formats.'
      });
    }

    try {
      // Decode WAV file
      const decoded = wav.decode(req.file.buffer);
      
      if (!decoded || !decoded.channelData) {
        return res.status(500).json({ error: 'Failed to decode WAV file' });
      }

      const sampleRate = decoded.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const totalSamples = decoded.channelData[0].length;

      // Validate time range
      if (startSample >= totalSamples || endSample > totalSamples || startSample >= endSample) {
        return res.status(400).json({ 
          error: 'Invalid time range',
          message: `Start time (${startTime}s) or end time (${endTime}s) is out of bounds for ${totalSamples/sampleRate}s audio.`
        });
      }

      // Trim each channel
      const trimmedChannels = decoded.channelData.map(channel => {
        return channel.slice(startSample, endSample);
      });

      // Encode back to WAV
      const audioBuffer = new AudioBuffer(trimmedChannels.length, endSample - startSample, sampleRate);
      for (let i = 0; i < trimmedChannels.length; i++) {
        audioBuffer.getChannelData(i).set(trimmedChannels[i]);
      }

      const wavBuffer = wav.encode(audioBuffer);
      const audioBase64 = Buffer.from(wavBuffer).toString('base64');

      res.json({
        success: true,
        audio: `data:audio/wav;base64,${audioBase64}`,
        filename: `${baseFilename}.wav`,
        original_duration: totalSamples / sampleRate,
        trimmed_duration: (endSample - startSample) / sampleRate,
        start_time: startTime,
        end_time: endTime
      });

    } catch (decodeError) {
      return res.status(500).json({ 
        error: 'Failed to process WAV file',
        message: decodeError.message,
        note: 'The WAV file may be corrupted or use an unsupported format.'
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Merge audio files
router.post('/merge', upload.array('audios', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least 2 audio files are required' });
    }

    // Check if all files are WAV
    const nonWavFiles = req.files.filter(file => path.extname(file.originalname).toLowerCase() !== '.wav');
    if (nonWavFiles.length > 0) {
      return res.status(503).json({ 
        error: 'Audio merging is limited to WAV files',
        message: 'Merging non-WAV files requires ffmpeg which is not available.',
        note: 'Convert all files to WAV first, or use a cloud service for merging other formats.'
      });
    }

    try {
      const baseFilename = req.files[0].originalname.replace(/\.[^/.]+$/, '');
      const decodedFiles = [];
      let maxSampleRate = 0;
      let maxChannels = 0;
      let totalSamples = 0;

      // Decode all files
      for (const file of req.files) {
        const decoded = wav.decode(file.buffer);
        if (!decoded || !decoded.channelData) {
          return res.status(500).json({ error: `Failed to decode ${file.originalname}` });
        }
        decodedFiles.push(decoded);
        maxSampleRate = Math.max(maxSampleRate, decoded.sampleRate);
        maxChannels = Math.max(maxChannels, decoded.channelData.length);
        totalSamples += decoded.channelData[0].length;
      }

      // Normalize all files to same sample rate and channels
      const mergedChannels = Array(maxChannels).fill(null).map(() => new Float32Array(totalSamples));
      let currentOffset = 0;

      for (const decoded of decodedFiles) {
        const channels = decoded.channelData;
        const fileSampleRate = decoded.sampleRate;
        const samplesPerChannel = channels[0].length;

        // Resample if needed (simple linear interpolation)
        for (let ch = 0; ch < maxChannels; ch++) {
          const sourceChannel = channels[ch] || channels[0]; // Use first channel if not enough channels
          for (let i = 0; i < samplesPerChannel; i++) {
            const srcSample = sourceChannel[i];
            if (fileSampleRate === maxSampleRate) {
              mergedChannels[ch][currentOffset + i] = srcSample;
            } else {
              // Simple resampling - just skip or duplicate samples
              const ratio = fileSampleRate / maxSampleRate;
              const targetIndex = Math.floor(i * ratio);
              if (targetIndex < samplesPerChannel) {
                mergedChannels[ch][currentOffset + targetIndex] = srcSample;
              }
            }
          }
        }
        currentOffset += samplesPerChannel;
      }

      // Create output buffer
      const actualSamples = currentOffset;
      const audioBuffer = new AudioBuffer(maxChannels, actualSamples, maxSampleRate);
      for (let i = 0; i < maxChannels; i++) {
        audioBuffer.getChannelData(i).set(mergedChannels[i].slice(0, actualSamples));
      }

      const wavBuffer = wav.encode(audioBuffer);
      const audioBase64 = Buffer.from(wavBuffer).toString('base64');

      res.json({
        success: true,
        audio: `data:audio/wav;base64,${audioBase64}`,
        filename: `${baseFilename}_merged.wav`,
        files_merged: req.files.length,
        duration: actualSamples / maxSampleRate,
        channels: maxChannels,
        sample_rate: maxSampleRate
      });

    } catch (error) {
      return res.status(500).json({ 
        error: 'Failed to merge audio files',
        message: error.message,
        note: 'The files may have incompatible formats or be corrupted.'
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change audio speed
router.post('/speed', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const speedFactor = parseFloat(req.body.speed_factor) || 1.0;
    const baseFilename = req.file.originalname.replace(/\.[^/.]+$/, '');
    
    if (speedFactor <= 0 || speedFactor > 4) {
      return res.status(400).json({ error: 'Speed factor must be between 0.1 and 4.0' });
    }

    // Only support WAV files
    if (path.extname(req.file.originalname).toLowerCase() !== '.wav') {
      return res.status(503).json({ 
        error: 'Audio speed change is limited to WAV files',
        message: 'Speed change for non-WAV files requires ffmpeg which is not available.',
        note: 'Convert your file to WAV first, or use a cloud service for other formats.'
      });
    }

    try {
      const decoded = wav.decode(req.file.buffer);
      
      if (!decoded || !decoded.channelData) {
        return res.status(500).json({ error: 'Failed to decode WAV file' });
      }

      const sampleRate = decoded.sampleRate;
      const channels = decoded.channelData;
      const originalSamples = channels[0].length;
      const newSamples = Math.floor(originalSamples / speedFactor);
      const newSampleRate = Math.floor(sampleRate / speedFactor);

      // Resample by skipping or duplicating samples
      const resampledChannels = channels.map(channel => {
        const resampled = new Float32Array(newSamples);
        for (let i = 0; i < newSamples; i++) {
          const srcIndex = Math.floor(i * speedFactor);
          resampled[i] = channel[srcIndex] || 0;
        }
        return resampled;
      });

      // Create output buffer
      const audioBuffer = new AudioBuffer(resampledChannels.length, newSamples, newSampleRate);
      for (let i = 0; i < resampledChannels.length; i++) {
        audioBuffer.getChannelData(i).set(resampledChannels[i]);
      }

      const wavBuffer = wav.encode(audioBuffer);
      const audioBase64 = Buffer.from(wavBuffer).toString('base64');

      res.json({
        success: true,
        audio: `data:audio/wav;base64,${audioBase64}`,
        filename: `${baseFilename}_speed_${speedFactor}.wav`,
        speed_factor: speedFactor,
        original_duration: originalSamples / sampleRate,
        new_duration: newSamples / newSampleRate,
        note: 'Speed change affects both playback speed and pitch (resampling method)'
      });

    } catch (error) {
      return res.status(500).json({ 
        error: 'Failed to change audio speed',
        message: error.message
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract audio from video - Requires cloud service
router.post('/video-to-audio', upload.single('video'), async (req, res) => {
  return res.status(503).json({ 
    error: 'Audio extraction from video requires ffmpeg or cloud service',
    message: 'Video to audio extraction cannot be done without ffmpeg in serverless environments.',
    alternatives: [
      'Use CloudConvert API (https://cloudconvert.com/)',
      'Use AWS Elastic Transcoder',
      'Use Google Cloud Transcoder API',
      'Use Azure Media Services'
    ],
    note: 'Consider integrating a cloud service for video-to-audio extraction functionality.'
  });
});

// Speech to text - Requires cloud service
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  return res.status(503).json({ 
    error: 'Speech to text requires ML models or cloud service',
    message: 'Speech recognition cannot be done without ML models or cloud APIs in serverless environments.',
    alternatives: [
      'Use Google Cloud Speech-to-Text API',
      'Use AWS Transcribe',
      'Use Azure Speech Services',
      'Use OpenAI Whisper API'
    ],
    note: 'Consider integrating a cloud speech recognition service for full functionality.'
  });
});

module.exports = router;
