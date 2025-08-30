// components/CaptionPreview.tsx
import { useState, useCallback } from '@lynx-js/react'
import './CaptionPreview.css'

interface CaptionData {
  id: string
  videoThumbnail: string
  caption: string
  trend: string
  engagement: string
}

// Mock data - replace with real data from your backend team
const mockCaptions: CaptionData[] = [
  {
    id: '1',
    videoThumbnail: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Video+1',
    caption: '✨ Just discovered this amazing trend! Who else is obsessed? #viral #fyp',
    trend: '#viral trending +234%',
    engagement: '12.3K likes • 89% engagement'
  },
  {
    id: '2', 
    videoThumbnail: 'https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Video+2',
    caption: '🔥 This AI-generated caption hits different! What do you think? #AI #content',
    trend: '#AI trending +156%',
    engagement: '8.7K likes • 76% engagement'
  },
  {
    id: '3',
    videoThumbnail: 'https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=Video+3',
    caption: '💫 When the algorithm knows you better than you know yourself #algorithm #foryou',
    trend: '#algorithm trending +89%', 
    engagement: '15.1K likes • 92% engagement'
  }
]

export function CaptionPreview() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(0)

  const handleTouchStart = useCallback((e: any) => {
    setTouchStartX(e.touches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback((e: any) => {
    const touchEndX = e.changedTouches[0].clientX
    const diffX = touchStartX - touchEndX

    // Swipe threshold of 50px
    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && currentIndex < mockCaptions.length - 1) {
        // Swipe left - next card
        setCurrentIndex(currentIndex + 1)
      } else if (diffX < 0 && currentIndex > 0) {
        // Swipe right - previous card
        setCurrentIndex(currentIndex - 1)
      }
    }
  }, [currentIndex, touchStartX])

  const goToNext = useCallback(() => {
    if (currentIndex < mockCaptions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const currentCaption = mockCaptions[currentIndex]

  return (
    <view className='CaptionPreview'>
      <view className='PreviewHeader'>
        <text className='PreviewTitle'>📱 Caption Preview</text>
        <text className='PreviewSubtitle'>Swipe to see AI suggestions</text>
      </view>

      <view 
        className='CardContainer'
        bindtouchstart={handleTouchStart}
        bindtouchend={handleTouchEnd}
      >
        <view className='CaptionCard'>
          <view className='VideoThumbnail'>
            <image 
              src={currentCaption.videoThumbnail} 
              className='ThumbnailImage'
              mode='aspectFill'
            />
            <view className='PlayButton'>
              <text>▶</text>
            </view>
          </view>
          
          <view className='CaptionOverlay'>
            <view className='CaptionContent'>
              <text className='CaptionText'>{currentCaption.caption}</text>
              
              <view className='TrendInfo'>
                <text className='TrendTag'>{currentCaption.trend}</text>
                <text className='EngagementStats'>{currentCaption.engagement}</text>
              </view>
            </view>

            <view className='ActionButtons'>
              <view className='ActionButton'>
                <text>❤️</text>
              </view>
              <view className='ActionButton'>
                <text>💬</text>
              </view>
              <view className='ActionButton'>
                <text>🔗</text>
              </view>
            </view>
          </view>
        </view>

        {/* Navigation Controls */}
        <view className='NavigationControls'>
          <view 
            className={`NavButton ${currentIndex === 0 ? 'NavButtonDisabled' : ''}`}
            bindtap={goToPrev}
          >
            <text></text>
          </view>
          
          <view className='PageIndicator'>
            <text>{currentIndex + 1} / {mockCaptions.length}</text>
          </view>
          
          <view 
            className={`NavButton ${currentIndex === mockCaptions.length - 1 ? 'NavButtonDisabled' : ''}`}
            bindtap={goToNext}
          >
            <text></text>
          </view>
        </view>

        {/* Dot Indicators */}
        <view className='DotIndicators'>
          {mockCaptions.map((_, index) => (
            <view 
              key={index}
              className={`Dot ${index === currentIndex ? 'DotActive' : ''}`}
            />
          ))}
        </view>
      </view>

      <view className='PreviewActions'>
        <view className='PreviewActionButton'>
          <text>✏️ Edit Caption</text>
        </view>
        <view className='PreviewActionButton Primary'>
          <text>✅ Use This Caption</text>
        </view>
      </view>
    </view>
  )
}