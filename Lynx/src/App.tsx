import { useState, useCallback } from '@lynx-js/react'
import './App.css'

// Pages
import PersonalizedPage from './components/PersonalizedPage.tsx'
import { ChatPanel } from './components/ChatPanel.js'
import { SuggestionsDevPanel } from './components/SuggestionsDevPanel.tsx'
import { CaptionPreview } from './components/CaptionPreview.tsx' 

export function App(props: { onRender?: () => void }) {
  const [page, setPage] = useState<'home' | 'aiChat' | 'personalized' | 'dev' | 'captionPreview'>('home')

  props.onRender?.()

  const goToAIChat = useCallback(() => setPage('aiChat'), [])
  const goToPersonalized = useCallback(() => setPage('personalized'), [])
  const goToDev = useCallback(() => setPage('dev'), [])
  const goToCaptionPreview = useCallback(() => setPage('captionPreview'), []) 
  const goBack = useCallback(() => setPage('home'), [])

  // --- AI Chat Page ---
  if (page === 'aiChat') {
    return (
      <view className='Background'>
        <view className='PageContainer'>
          <view bindtap={goBack} className='BackButton'>
            <text>Back</text>
          </view>
          <ChatPanel onBack={goBack} />
        </view>
      </view>
    )
  }

  // --- Personalized Suggestions Page ---
  if (page === 'personalized') {
    return (
      <view className='Background'>
        <view className='PageContainer'>
          <view bindtap={goBack} className='BackButton'>
            <text>Back</text>
          </view>
          <PersonalizedPage creatorId="creator_001" />
        </view>
      </view>
    )
  }

  if (page === 'captionPreview') {
    return (
      <view className='Background'>
        <view bindtap={goBack} className='BackButton' style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          zIndex: 1000,
          background: 'rgba(0,0,0,0.5)',
          padding: '10px 15px',
          borderRadius: '20px'
        }}>
          <text style={{ color: 'white' }}>← Back</text>
        </view>
        <CaptionPreview />
      </view>
    )
  }

  // --- Developer Tools Page ---
  if (page === 'dev') {
    return (
      <view className='Background'>
        <view className='PageContainer'>
          <view bindtap={goBack} className='BackButton'>
            <text>Back</text>
          </view>
          <SuggestionsDevPanel />
        </view>
      </view>
    )
  }

  // --- Home Page ---
  return (
    <view className='Background'>
      <view className='PageContainer'>
        <view className='App'>
          <view className='Content'>
            <text className='Title'>TikTok AI Copilot</text>
            <text className='Description'>
              Generate captions and trend insights instantly!
            </text>

            {/* TikTok-style Caption Preview button */}
            <view className='Button' style={{ backgroundColor: '#ff6b6b' }} bindtap={goToCaptionPreview}>
              <text>Caption Preview</text>
            </view>

            <view className='Button' bindtap={goToAIChat}>
              <text>Go to AI Chat</text>
            </view>

            <view className='Button' bindtap={goToPersonalized}>
              <text>Go to Personalized Suggestions</text>
            </view>

            <view className='Button' style={{ backgroundColor: '#6c757d' }} bindtap={goToDev}>
              <text>Developer Tools</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  )
}