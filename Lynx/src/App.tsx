import { useState, useCallback } from '@lynx-js/react';
import './App.css';

// Pages
import PersonalizedPage from './components/PersonalizedPage.tsx';
import ChatPanel from './components/ChatPanel.js'; // default export
import { SuggestionsDevPanel } from './components/SuggestionsDevPanel.tsx';

export function App(props: { onRender?: () => void }) {
  // Current page state
  const [page, setPage] = useState<'home' | 'aiChat' | 'personalized' | 'dev'>('home');

  // Store approved captions from ChatPanel
  const [approvedCaptions, setApprovedCaptions] = useState<{ text: string }[]>([]);

  props.onRender?.();

  // Navigation callbacks
  const goToAIChat = useCallback(() => setPage('aiChat'), []);
  const goToPersonalized = useCallback(() => setPage('personalized'), []);
  const goToDev = useCallback(() => setPage('dev'), []);
  const goBack = useCallback(() => setPage('home'), []);

  // --- AI Chat Page ---
  if (page === 'aiChat') {
    return (
      <view className='Background'>
        <view className='PageContainer'>
          {/* Back button */}
          <view bindtap={goBack} className='BackButton'>
            <text>Back</text>
          </view>

          {/* ChatPanel */}
          <ChatPanel
            onBack={goBack}
            // Send approved messages to App state and navigate to Personalized Page
            onNewBotMessage={(msg) => {
              setApprovedCaptions(prev => [...prev, msg]);
              setPage('personalized'); // <- automatic navigation after approve
            }}
          />
        </view>
      </view>
    );
  }

  // --- Personalized Suggestions Page ---
  if (page === 'personalized') {
    return (
      <view className='Background'>
        <view className='PageContainer'>
          <view bindtap={goBack} className='BackButton'>
            <text>Back</text>
          </view>

          {/* Pass approved captions to display on PersonalizedPage */}
          <PersonalizedPage
            creatorId="creator_001"
            approvedCaptions={approvedCaptions}
          />
        </view>
      </view>
    );
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
    );
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
  );
}
