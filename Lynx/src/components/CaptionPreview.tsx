// components/CaptionPreview.tsx
import { useState, useCallback } from '@lynx-js/react'
import './CaptionPreview.css'

const API_BASE = 'http://localhost:3001'

interface CaptionSuggestion {
  id: string
  caption: string
  trend: string
  engagement: string
  confidence: number
}

type FlowStep = 'upload' | 'processing' | 'preview' | 'download'

export function CaptionPreview() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload')
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [captions, setCaptions] = useState<CaptionSuggestion[]>([])
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0)
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Helper function to get error message from unknown error
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unknown error occurred'
  }

  // Step 1: Upload Video using standard web file input
  const handleVideoUpload = useCallback(async () => {
    console.log('Starting file upload...')
    
    // For now, just go straight to mock upload to avoid any API issues
    console.log('Using mock upload to avoid Lynx compatibility issues...')
    await handleMockUpload()
  }, [])

  // Alternative: Use web media capture for video recording  
  const handleVideoPickerUpload = useCallback(async () => {
    console.log('Using mock video capture...')
    
    // Also use mock for this to avoid errors
    await handleMockUpload()
  }, [])

  // For testing - simulate upload without file picker
  const handleMockUpload = useCallback(async () => {
    console.log('Mock upload started')
    setSelectedVideo('test-video.mp4')
    setIsProcessing(true)
    setCurrentStep('processing')
    
    // Simulate upload
    setTimeout(async () => {
      const mockVideoId = Date.now().toString()
      setVideoId(mockVideoId)
      setVideoUrl(`http://localhost:3001/mock-video-${mockVideoId}`)
      
      // Generate captions
      await generateMockCaptions(mockVideoId)
    }, 2000)
  }, [])

  // Upload the selected file using standard web APIs
  const uploadVideoFile = useCallback(async (fileResult: { file: File; fileName: string }) => {
    const { file, fileName } = fileResult
    setSelectedVideo(fileName)
    setIsProcessing(true)
    setCurrentStep('processing')
    
    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('video', file, fileName)
      
      console.log('Uploading to:', `${API_BASE}/api/upload-video`)
      
      const uploadResponse = await fetch(`${API_BASE}/api/upload-video`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type - let browser set it with boundary
        }
      })
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`)
      }
      
      const result = await uploadResponse.json()
      console.log('Upload successful:', result)
      
      setVideoId(result.videoId)
      setVideoUrl(result.videoUrl)
      
      // Generate captions
      await generateMockCaptions(result.videoId)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${getErrorMessage(error)}`)
      setCurrentStep('upload')
      setIsProcessing(false)
    }
  }, [])

  // Generate mock captions for testing
  const generateMockCaptions = useCallback(async (videoId: string) => {
    console.log('Generating mock captions for:', videoId)
    
    const mockCaptions: CaptionSuggestion[] = [
      {
        id: '1',
        caption: '🔥 This is absolutely incredible! Can\'t stop watching this amazing moment #viral #amazing #fyp #trending',
        trend: '#viral trending +234%',
        engagement: '12.3K likes • 89% engagement',
        confidence: 95
      },
      {
        id: '2',
        caption: '✨ POV: When everything goes perfectly and you can\'t believe your eyes #pov #perfect #satisfying #viral',
        trend: '#pov trending +156%',
        engagement: '8.7K likes • 76% engagement',
        confidence: 88
      },
      {
        id: '3',
        caption: '💫 The way this turned out is just *chef\'s kiss* - who else is obsessed? #obsessed #perfect #viral #fyp',
        trend: '#obsessed trending +89%',
        engagement: '15.1K likes • 92% engagement',
        confidence: 82
      }
    ]
    
    setCaptions(mockCaptions)
    setIsProcessing(false)
    setCurrentStep('preview')
  }, [])

  // Navigation methods remain the same
  const goToNextCaption = useCallback(() => {
    if (currentCaptionIndex < captions.length - 1) {
      setCurrentCaptionIndex(currentCaptionIndex + 1)
    }
  }, [currentCaptionIndex, captions.length])

  const goToPrevCaption = useCallback(() => {
    if (currentCaptionIndex > 0) {
      setCurrentCaptionIndex(currentCaptionIndex - 1)
    }
  }, [currentCaptionIndex])

  const useThisCaption = useCallback(() => {
    const selectedCaptionData = captions[currentCaptionIndex]
    setSelectedCaption(selectedCaptionData.caption)
    setCurrentStep('download')
  }, [currentCaptionIndex, captions])

  // Add back button handler
  const goBackToUpload = useCallback(() => {
    restartFlow()
  }, [])

  // Download placeholder - no actual download, just UI flow
  const downloadVideo = useCallback(async () => {
    if (!videoId) return
    
    // Simple placeholder - just show success and restart
    const fileName = `video-with-captions-${videoId}.mp4`
    alert(`✅ Video ready! 🎉\n\nFilename: ${fileName}\n\n(Download functionality will be implemented with proper Lynx APIs)`)
    restartFlow()
  }, [videoId])

  const restartFlow = useCallback(() => {
    setCurrentStep('upload')
    setSelectedVideo(null)
    setVideoId(null)
    setVideoUrl(null)
    setCaptions([])
    setSelectedCaption(null)
    setCurrentCaptionIndex(0)
    setIsProcessing(false)
  }, [])

  // Step 1: Upload Video UI (Updated with native buttons)
  if (currentStep === 'upload') {
    return (
      <view className='CaptionPreview'>
        <view className='FlowHeader'>
          <text className='FlowTitle'>📹 Upload Your Video</text>
          <text className='FlowSubtitle'>Let AI create the perfect caption</text>
        </view>

        <view className='UploadSection'>
          <view className='UploadBox' bindtap={handleVideoUpload}>
            <text className='UploadIcon'>📱</text>
            <text className='UploadText'>Tap to select video</text>
            <text className='UploadHint'>MP4, MOV, AVI, WebM up to 100MB</text>
          </view>
          
          <view className='UploadButton' bindtap={handleVideoUpload}>
            <text>📹 Choose Video from Gallery</text>
          </view>

          <view className='UploadButton' bindtap={handleVideoPickerUpload}>
            <text>🎥 Record Video (Camera)</text>
          </view>
          
          <view className='TestButton' bindtap={handleMockUpload}>
            <text>🧪 Test with Mock Upload</text>
          </view>
        </view>

        <view className='FeaturesList'>
          <view className='FeatureItem'>
            <text className='FeatureIcon'>🤖</text>
            <text className='FeatureText'>AI analyzes your video content</text>
          </view>
          <view className='FeatureItem'>
            <text className='FeatureIcon'>📝</text>
            <text className='FeatureText'>Generates multiple caption options</text>
          </view>
          <view className='FeatureItem'>
            <text className='FeatureIcon'>📊</text>
            <text className='FeatureText'>Shows trending hashtags & engagement</text>
          </view>
        </view>
      </view>
    )
  }

  // Rest of the UI components remain the same...
  if (currentStep === 'processing') {
    return (
      <view className='CaptionPreview'>
        <view className='FlowHeader'>
          <text className='FlowTitle'>🤖 AI is Analyzing...</text>
          <text className='FlowSubtitle'>Creating perfect captions for your video</text>
        </view>

        <view className='ProcessingSection'>
          <view className='ProcessingSpinner'>
            <text>🔄</text>
          </view>
          
          <view className='ProcessingSteps'>
            <view className='ProcessingStep'>
              <text className='StepIcon'>✅</text>
              <text className='StepText'>Video uploaded: {selectedVideo}</text>
            </view>
            <view className='ProcessingStep'>
              <text className='StepIcon'>🔄</text>
              <text className='StepText'>Analyzing content...</text>
            </view>
            <view className='ProcessingStep'>
              <text className='StepIcon'>⏳</text>
              <text className='StepText'>Generating captions</text>
            </view>
          </view>
        </view>
      </view>
    )
  }

  if (currentStep === 'preview' && captions.length > 0) {
    const currentCaption = captions[currentCaptionIndex]
    
    return (
      <view className='CaptionPreview'>
        <view className='FlowHeader'>
          <text className='FlowTitle'>✨ Caption Suggestions</text>
          <text className='FlowSubtitle'>Swipe to see all AI-generated options</text>
        </view>

        <view className='PreviewContainer'>
          <view className='VideoPreview'>
            <view className='VideoContainer'>
              <text className='PlayIcon'>▶️</text>
              <text className='VideoLabel'>Your Video: {selectedVideo}</text>
              <text className='VideoStatus'>Video uploaded successfully!</text>
            </view>
            
            <view className='CaptionOverlay'>
              <text className='PreviewCaption'>{currentCaption.caption}</text>
              <view className='CaptionMeta'>
                <text className='TrendInfo'>{currentCaption.trend}</text>
                <text className='EngagementInfo'>{currentCaption.engagement}</text>
                <text className='ConfidenceScore'>AI Confidence: {currentCaption.confidence}%</text>
              </view>
            </view>
          </view>

          <view className='CaptionNavigation'>
            <view 
              className={`NavBtn ${currentCaptionIndex === 0 ? 'NavBtnDisabled' : ''}`}
              bindtap={goToPrevCaption}
            >
              <text>Previous</text>
            </view>
            
            <view className='CaptionCounter'>
              <text>{currentCaptionIndex + 1} / {captions.length}</text>
            </view>
            
            <view 
              className={`NavBtn ${currentCaptionIndex === captions.length - 1 ? 'NavBtnDisabled' : ''}`}
              bindtap={goToNextCaption}
            >
              <text>Next</text>
            </view>
          </view>
        </view>

        <view className='PreviewActions'>
          <view className='ActionButton Secondary' bindtap={goBackToUpload}>
            <text>🔄 Try Another Video</text>
          </view>
          <view className='ActionButton Primary' bindtap={useThisCaption}>
            <text>✅ Use This Caption</text>
          </view>
        </view>
      </view>
    )
  }

  if (currentStep === 'download') {
    return (
      <view className='CaptionPreview'>
        <view className='FlowHeader'>
          <text className='FlowTitle'>🎉 Caption Applied!</text>
          <text className='FlowSubtitle'>Ready to download your enhanced video</text>
        </view>

        <view className='DownloadSection'>
          <view className='FinalPreview'>
            <view className='FinalVideo'>
              <text className='PlayIcon'>▶️</text>
              <text className='FinalLabel'>Final Video: {selectedVideo}</text>
              <text className='ReadyStatus'>Ready for download!</text>
            </view>
            
            <view className='AppliedCaption'>
              <text className='FinalCaptionText'>{selectedCaption}</text>
            </view>
          </view>

          <view className='DownloadOptions'>
            <view className='DownloadButton' bindtap={downloadVideo}>
              <text>⬇️ Download Video with Captions</text>
            </view>
            
            <view className='ShareOptions'>
              <view className='ShareButton'>
                <text>📤 Share to TikTok</text>
              </view>
              <view className='ShareButton'>
                <text>📸 Share to Instagram</text>
              </view>
            </view>
          </view>
        </view>

        <view className='SuccessActions'>
          <view className='ActionButton Secondary' bindtap={restartFlow}>
            <text>🎬 Create Another</text>
          </view>
        </view>
      </view>
    )
  }

  return null
}