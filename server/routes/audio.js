const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { pipeline } = require('@xenova/transformers');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /audio|mpeg|wav|aac|ogg|flac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
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

// Convert audio to different format
router.post('/convert', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const targetFormat = req.body.format || 'mp3';
    const supportedFormats = ['mp3', 'wav', 'aac', 'ogg', 'flac'];
    
    if (!supportedFormats.includes(targetFormat.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Unsupported format. Use mp3, wav, aac, ogg, or flac' 
      });
    }

    const tempInputPath = bufferToTempFile(req.file.buffer, path.extname(req.file.originalname));
    const tempOutputPath = path.join(__dirname, '../temp', `output_${Date.now()}.${targetFormat}`);

    // Ensure temp directory exists
    const tempDir = path.dirname(tempInputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    ffmpeg(tempInputPath)
      .toFormat(targetFormat)
      .on('end', () => {
        try {
          const outputBuffer = fs.readFileSync(tempOutputPath);
          const audioBase64 = outputBuffer.toString('base64');
          
          const mimeTypes = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'aac': 'audio/aac',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac'
          };
          
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);

          res.json({
            success: true,
            audio: `data:${mimeTypes[targetFormat]};base64,${audioBase64}`,
            filename: `converted.${targetFormat}`,
            original_format: path.extname(req.file.originalname).slice(1)
          });
        } catch (error) {
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);
          res.status(500).json({ error: 'Error processing audio file' });
        }
      })
      .on('error', (err) => {
        cleanupTempFile(tempInputPath);
        cleanupTempFile(tempOutputPath);
        res.status(500).json({ error: 'Audio conversion failed: ' + err.message });
      })
      .save(tempOutputPath);

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

    const tempInputPath = bufferToTempFile(req.file.buffer, path.extname(req.file.originalname));
    const tempOutputPath = path.join(__dirname, '../temp', `trimmed_${Date.now()}.mp3`);

    // Ensure temp directory exists
    const tempDir = path.dirname(tempInputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    ffmpeg(tempInputPath)
      .seekInput(startTime)
      .duration(endTime - startTime)
      .toFormat('mp3')
      .on('end', () => {
        try {
          const outputBuffer = fs.readFileSync(tempOutputPath);
          const audioBase64 = outputBuffer.toString('base64');
          
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);

          res.json({
            success: true,
            audio: `data:audio/mpeg;base64,${audioBase64}`,
            filename: 'trimmed_audio.mp3',
            duration: endTime - startTime
          });
        } catch (error) {
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);
          res.status(500).json({ error: 'Error processing audio file' });
        }
      })
      .on('error', (err) => {
        cleanupTempFile(tempInputPath);
        cleanupTempFile(tempOutputPath);
        res.status(500).json({ error: 'Audio trimming failed: ' + err.message });
      })
      .save(tempOutputPath);

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

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFiles = [];
    const tempOutputPath = path.join(tempDir, `merged_${Date.now()}.mp3`);

    // Save all files to temp directory
    for (const file of req.files) {
      const tempPath = path.join(tempDir, `temp_${Date.now()}_${Math.random()}${path.extname(file.originalname)}`);
      fs.writeFileSync(tempPath, file.buffer);
      tempFiles.push(tempPath);
    }

    // Create ffmpeg command
    let command = ffmpeg();
    tempFiles.forEach(file => {
      command = command.input(file);
    });

    command
      .on('end', () => {
        try {
          const outputBuffer = fs.readFileSync(tempOutputPath);
          const audioBase64 = outputBuffer.toString('base64');
          
          // Clean up all temp files
          tempFiles.forEach(cleanupTempFile);
          cleanupTempFile(tempOutputPath);

          res.json({
            success: true,
            audio: `data:audio/mpeg;base64,${audioBase64}`,
            filename: 'merged_audio.mp3',
            files_merged: req.files.length
          });
        } catch (error) {
          tempFiles.forEach(cleanupTempFile);
          cleanupTempFile(tempOutputPath);
          res.status(500).json({ error: 'Error processing audio files' });
        }
      })
      .on('error', (err) => {
        tempFiles.forEach(cleanupTempFile);
        cleanupTempFile(tempOutputPath);
        res.status(500).json({ error: 'Audio merging failed: ' + err.message });
      })
      .mergeToFile(tempOutputPath);

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
    
    if (speedFactor <= 0 || speedFactor > 4) {
      return res.status(400).json({ error: 'Speed factor must be between 0.1 and 4.0' });
    }

    const tempInputPath = bufferToTempFile(req.file.buffer, path.extname(req.file.originalname));
    const tempOutputPath = path.join(__dirname, '../temp', `speed_${Date.now()}.mp3`);

    // Ensure temp directory exists
    const tempDir = path.dirname(tempInputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    ffmpeg(tempInputPath)
      .audioFilters(`atempo=${speedFactor}`)
      .toFormat('mp3')
      .on('end', () => {
        try {
          const outputBuffer = fs.readFileSync(tempOutputPath);
          const audioBase64 = outputBuffer.toString('base64');
          
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);

          res.json({
            success: true,
            audio: `data:audio/mpeg;base64,${audioBase64}`,
            filename: `speed_${speedFactor}x_audio.mp3`,
            speed_factor: speedFactor
          });
        } catch (error) {
          cleanupTempFile(tempInputPath);
          cleanupTempFile(tempOutputPath);
          res.status(500).json({ error: 'Error processing audio file' });
        }
      })
      .on('error', (err) => {
        cleanupTempFile(tempInputPath);
        cleanupTempFile(tempOutputPath);
        res.status(500).json({ error: 'Audio speed change failed: ' + err.message });
      })
      .save(tempOutputPath);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Speech to text using Transformers
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const language = req.body.language || 'en-US';
    
    // Save audio file temporarily
    const tempInputPath = bufferToTempFile(req.file.buffer, path.extname(req.file.originalname));
    
    try {
      // Convert audio to WAV format for speech recognition
      const wavPath = path.join(__dirname, '../temp', `speech_${Date.now()}.wav`);
      
      await new Promise((resolve, reject) => {
        ffmpeg(tempInputPath)
          .toFormat('wav')
          .audioFrequency(16000)
          .audioChannels(1)
          .on('end', resolve)
          .on('error', reject)
          .save(wavPath);
      });

      // Read the WAV file
      const audioBuffer = fs.readFileSync(wavPath);
      
      // Create speech recognition pipeline
      const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
      
      // Transcribe the audio
      const result = await transcriber(audioBuffer, {
        language: language.split('-')[0], // Extract language code (en-US -> en)
        return_timestamps: false
      });

      cleanupTempFile(tempInputPath);
      cleanupTempFile(wavPath);

      res.json({
        success: true,
        text: result.text || 'No speech detected',
        language: language,
        confidence: result.confidence || 0.8,
        duration: result.duration || 0
      });

    } catch (error) {
      cleanupTempFile(tempInputPath);
      console.error('Speech recognition error:', error);
      
      // Fallback to placeholder if speech recognition fails
      res.json({
        success: true,
        text: 'Speech recognition temporarily unavailable. Please try again.',
        language: language,
        confidence: 0.0,
        error: 'Speech recognition service temporarily unavailable'
      });
    }

  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: error.message || 'Failed to process speech-to-text' });
  }
});

module.exports = router;
