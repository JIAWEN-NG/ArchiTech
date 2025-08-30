import { useState, useCallback } from '@lynx-js/react'
import './App.css'
import arrow from './assets/arrow.png'
import lynxLogo from './assets/lynx-logo.png'
import reactLynxLogo from './assets/react-logo.png'

import { ChatPanel } from './components/ChatPanel.js'
import { SuggestionsDevPanel } from './components/SuggestionsDevPanel.tsx'

export function App() {
  const [alterLogo, setAlterLogo] = useState(false)
  const [page, setPage] = useState<'home' | 'aiChat' | 'dev'>('home')

  const onTapLogo = useCallback(() => {
    setAlterLogo((prev) => !prev)
  }, [])

  const goToAIChat = useCallback(() => {
    setPage('aiChat')
  }, [])

  const goToDev = useCallback(() => {
    setPage('dev')
  }, [])

  if (page === 'aiChat') {
    return (
<<<<<<< Updated upstream
      <view style={{ flex: 1 }}>
        {/* Back button */}
        <view
          bindtap={() => setPage('home')}
          style={{
            padding: 12,
            background: '#007bff',
            borderRadius: 8,
            margin: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            Back
          </text>
=======
      <view className='Background'>
        <view className='PageContainer'>
          <view bindtap={goBack} className='BackButton'>
            <text>Back</text>
          </view>
          <ChatPanel onBack={function (): void {
            throw new Error('Function not implemented.')
          } } />
>>>>>>> Stashed changes
        </view>

        {/* Your ChatPanel component */}
        <ChatPanel onBack={function (): void {
          throw new Error('Function not implemented.')
        }} />
      </view>

    )
  }
  // --- Developer Tools page (NEW) ---
  if (page === 'dev') {
    return (
      <view style={{ flex: 1 }}>
        {/* Back button */}
        <view
          bindtap={() => setPage('home')}
          style={{
            padding: 12,
            background: '#007bff',
            borderRadius: 8,
            margin: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            Back
          </text>
        </view>

        {/* Dev/Test UI that calls your backend */}
        <SuggestionsDevPanel />
      </view>
    )
  }

  //homepage 

  return (
    <view style={{ flex: 1 }}>
      <view className="Background" />
      <view className="App">
        <view className="Banner">
          <view bindtap={onTapLogo} className="Logo">
            <image src={alterLogo ? reactLynxLogo : lynxLogo} className="Logo--lynx" />
          </view>
          <text className="Title">React</text>
          <text className="Subtitle">on Lynx</text>
        </view>

        <view className="Content">
          <image src={arrow} className="Arrow" />
          <text className="Description">Tap the logo and have fun!</text>

          {/* AI Chat Button */}
          <view
            bindtap={goToAIChat}
            style={{
              marginTop: 20,
              padding: 12,
              background: '#28a745',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              Go to AI Chat
            </text>
          </view>
        </view>
        
         {/* Developer Tools Button (NEW) */}
          <view
            bindtap={goToDev}
            style={{
              marginTop: 12,
              padding: 12,
              background: '#6c757d',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              Developer Tools
            </text>
          </view>
        

        <view style={{ flex: 1 }} />
      </view>
    </view>
  )
}
