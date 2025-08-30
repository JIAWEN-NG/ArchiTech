const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads')) // Serve uploaded files

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname
    cb(null, uniqueName)
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only video files are allowed!'), false)
    }
  }
})

// Store uploaded videos and their captions
const videoDatabase = {}

// API Routes

// 1. Upload video file
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' })
    }

    const videoId = Date.now().toString()
    const videoPath = req.file.path
    const videoUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`
    
    // Store video info
    videoDatabase[videoId] = {
      id: videoId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: videoPath,
      url: videoUrl,
      size: req.file.size,
      uploadTime: new Date(),
      captions: null
    }

    console.log(`✅ Video uploaded successfully:`)
    console.log(`   - File: ${req.file.originalname}`)
    console.log(`   - Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   - Video ID: ${videoId}`)
    console.log(`   - URL: ${videoUrl}`)
    
    res.json({
      success: true,
      videoId: videoId,
      filename: req.file.filename,
      videoUrl: videoUrl,
      message: 'Video uploaded successfully'
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// 2. Generate captions using enhanced AI simulation
app.post('/api/generate-captions', async (req, res) => {
  try {
    const { videoId } = req.body
    
    if (!videoDatabase[videoId]) {
      return res.status(404).json({ error: 'Video not found' })
    }

    console.log(`🤖 Generating captions for video: ${videoId}`)
    
    const video = videoDatabase[videoId]
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const generatedCaptions = await generateAICaptions(video.originalName)
    
    // Store captions
    videoDatabase[videoId].captions = generatedCaptions
    
    console.log(`✅ Generated ${generatedCaptions.length} caption options`)
    
    res.json({
      success: true,
      videoId: videoId,
      captions: generatedCaptions,
      videoUrl: video.url
    })
  } catch (error) {
    console.error('❌ Caption generation error:', error)
    res.status(500).json({ error: 'Failed to generate captions' })
  }
})

// 3. Get video info
app.get('/api/video/:videoId', (req, res) => {
  try {
    const { videoId } = req.params
    const video = videoDatabase[videoId]
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    console.log(`📹 Retrieving video info for: ${videoId}`)

    res.json({
      success: true,
      video: video
    })
  } catch (error) {
    console.error('❌ Get video error:', error)
    res.status(500).json({ error: 'Failed to get video info' })
  }
})

// 4. Download video (for now, just return original video)
app.get('/api/download-video/:videoId', (req, res) => {
  try {
    const { videoId } = req.params
    const video = videoDatabase[videoId]
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    console.log(`⬇️ Downloading video: ${videoId}`)

    // For now, just send the original video file
    // TODO: Add caption overlay processing with ffmpeg
    const videoPath = path.resolve(video.path)
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found' })
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${video.originalName}"`)
    res.setHeader('Content-Type', 'video/mp4')
    
    const videoStream = fs.createReadStream(videoPath)
    videoStream.pipe(res)
  } catch (error) {
    console.error('❌ Download error:', error)
    res.status(500).json({ error: 'Download failed' })
  }
})

// 5. Debug endpoint to see all videos
app.get('/api/debug/videos', (req, res) => {
  console.log('📊 Debug: Current video database:')
  console.log(JSON.stringify(videoDatabase, null, 2))
  
  res.json({
    success: true,
    videos: videoDatabase,
    count: Object.keys(videoDatabase).length
  })
})

// Enhanced AI caption generation (sophisticated mock for now)
async function generateAICaptions(filename) {
  console.log(`🔍 Analyzing video: ${filename}`)
  
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // TODO: Replace with actual Hugging Face API call
  /*
  const fetch = require('node-fetch')
  
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/git-base-coco', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_FREE_HF_TOKEN',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: "base64_encoded_video_frame_or_description"
      })
    })
    const result = await response.json()
    // Process result into caption format
  } catch (error) {
    console.error('HF API error:', error)
    // Fall back to mock captions
  }
  */
  
  // Enhanced mock captions with more variety and intelligence
  const captionTemplates = [
    {
      base: "🔥 This is absolutely incredible! Can't stop watching this amazing moment",
      hashtags: ["#viral", "#amazing", "#fyp", "#trending", "#wow"],
      style: "excitement"
    },
    {
      base: "✨ POV: When everything goes perfectly and you can't believe your eyes",
      hashtags: ["#pov", "#perfect", "#satisfying", "#viral", "#mindblown"],
      style: "pov"
    },
    {
      base: "💫 The way this turned out is just *chef's kiss* - who else is obsessed?",
      hashtags: ["#obsessed", "#perfect", "#viral", "#fyp", "#amazing"],
      style: "aesthetic"
    },
    {
      base: "🎉 This made my entire day! Share if it made yours too",
      hashtags: ["#wholesome", "#viral", "#happy", "#share", "#positivity"],
      style: "wholesome"
    },
    {
      base: "🤯 Wait for it... the ending will blow your mind! Trust me on this one",
      hashtags: ["#waitforit", "#mindblowing", "#plottwist", "#viral", "#epic"],
      style: "suspense"
    },
    {
      base: "😍 This is giving me all the feels! Anyone else crying happy tears?",
      hashtags: ["#feels", "#emotional", "#beautiful", "#viral", "#tears"],
      style: "emotional"
    }
  ]
  
  // Randomly select 3 different templates
  const shuffled = captionTemplates.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, 3)
  
  return selected.map((template, index) => ({
    id: (index + 1).toString(),
    caption: `${template.base} ${template.hashtags.slice(0, 4).join(' ')}`,
    trend: `${template.hashtags[0]} trending +${Math.floor(Math.random() * 300) + 50}%`,
    engagement: `${(Math.random() * 20 + 5).toFixed(1)}K likes • ${Math.floor(Math.random() * 30 + 70)}% engagement`,
    confidence: Math.floor(Math.random() * 20 + 80),
    style: template.style,
    hashtags: template.hashtags
  }))
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error)
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' })
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message })
  }
  
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 TikTok Caption Generator Backend`)
  console.log(`📍 Server running on http://localhost:${PORT}`)
  console.log(`\n📋 Available endpoints:`)
  console.log(`   POST /api/upload-video        - Upload video file`)
  console.log(`   POST /api/generate-captions   - Generate AI captions`)
  console.log(`   GET  /api/video/:videoId      - Get video info`)
  console.log(`   GET  /api/download-video/:id  - Download processed video`)
  console.log(`   GET  /api/debug/videos        - Debug: See all videos`)
  console.log(`\n💡 Test the server:`)
  console.log(`   curl http://localhost:${PORT}/api/debug/videos`)
  console.log(`\n🎬 Ready to process videos!\n`)
})

module.exports = app