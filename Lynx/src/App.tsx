import { useState, useCallback } from '@lynx-js/react'
import './App.css'

// Import pages
import PersonalizedPage from './components/PersonalizedPage.tsx'
import { ChatPanel } from './components/ChatPanel.js'
import { SuggestionsDevPanel } from './components/SuggestionsDevPanel.tsx'

export function App(props: { onRender?: () => void }) {
  const [page, setPage] = useState<'home' | 'aiChat' | 'personalized' | 'dev'>('home')

  props.onRender?.()

  const goToAIChat = useCallback(() => setPage('aiChat'), [])
  const goToPersonalized = useCallback(() => setPage('personalized'), [])
  const goToDev = useCallback(() => setPage('dev'), [])
  const goBack = useCallback(() => setPage('home'), [])

  // --- AI Chat Page ---
  if (page === 'aiChat') {
    return (
      <view className='Background'>
        <view className='PageContainer'>
          <view bindtap={goBack} className='BackButton'>
            <text>Back</text>
          </view>
          <ChatPanel />
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
          <PersonalizedPage />
        </view>
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

            {/* AI Chat Button */}
            <view className='Button' bindtap={goToAIChat}>
              <text>Go to AI Chat</text>
            </view>

            {/* Personalized Suggestions Button */}
            <view className='Button' bindtap={goToPersonalized}>
              <text>Go to Personalized Suggestions</text>
            </view>

            {/* Developer Tools Button */}
            <view className='Button' style={{ backgroundColor: '#6c757d' }} bindtap={goToDev}>
              <text>Developer Tools</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  )
}
