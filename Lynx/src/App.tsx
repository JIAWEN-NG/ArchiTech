import { useState, useCallback } from '@lynx-js/react'
import './App.css'
import arrow from './assets/arrow.png'
import lynxLogo from './assets/lynx-logo.png'
import reactLynxLogo from './assets/react-logo.png'

import { ChatPanel } from './components/ChatPanel.js' // import your chat panel

export function App(props: { onRender?: () => void }) {
  const [alterLogo, setAlterLogo] = useState(false)
  const [page, setPage] = useState<'home' | 'aiChat'>('home')

  const onTapLogo = useCallback(() => {
    setAlterLogo((prev) => !prev)
  }, [])

  const goToAIChat = useCallback(() => {
    setPage('aiChat')
  }, [])

  if (page === 'aiChat') {
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

        {/* Your ChatPanel component */}
        <ChatPanel onBack={function (): void {
          throw new Error('Function not implemented.')
        } } />
      </view>
    )
  }

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

        <view style={{ flex: 1 }} />
      </view>
    </view>
  )
}
