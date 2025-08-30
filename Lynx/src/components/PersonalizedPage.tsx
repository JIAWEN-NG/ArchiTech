import { useState, useEffect, useCallback } from '@lynx-js/react'
import type { PersonalizeResponse } from '../api/personalize.ts'
import '../PersonalizedPage.css'

interface PersonalizedPageProps {
  onRender?: () => void
  creatorId: string
}

export default function PersonalizedPage({ onRender, creatorId }: PersonalizedPageProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<
    Array<{ caption: string; hashtags: string[]; created_at: string; trendScore: number }>
  >([])

  useEffect(() => {
    console.info('Personalized Page Loaded for', creatorId)

   
    setSuggestions([
      { caption: "✨ Just vibin’ with good energy today!", hashtags: [], created_at: "", trendScore: 92 },
      { caption: "🔥 POV: You’re leveling up every day.", hashtags: [], created_at: "", trendScore: 87 },
      { caption: "🌸 Keep it simple, keep it real.", hashtags: [], created_at: "", trendScore: 76 },
      { caption: "🌞 Rise and shine! Make today amazing.", hashtags: [], created_at: "", trendScore: 82 },
      { caption: "💪 Hard work pays off, keep pushing.", hashtags: [], created_at: "", trendScore: 90 },
      { caption: "🌼 Little joys make life beautiful.", hashtags: [], created_at: "", trendScore: 78 },
    ])
  }, [creatorId])

  onRender?.()

  const onSelect = useCallback((index: number) => {
    setSelected(index)
  }, [])

  const maxTrend = Math.max(...suggestions.map(s => s.trendScore), 100)

  return (
    <view className='PageBackground' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <view className='PageHeader'>
        <text className='PageTitle'>Personalized Suggestions</text>
        <text className='PageSubtitle'>AI captions and trend insights</text>
      </view>

     
      <scroll-view
        scroll-y
        style={{ flex: 1, padding: 12 }}
      >
        {suggestions.map((s, index) => (
          <view
            key={index}
            className={`SuggestionCard ${selected === index ? 'Selected' : ''}`}
            bindtap={() => onSelect(index)}
            style={{ marginBottom: 16 }}
          >
            <text className='Caption'>{s.caption}</text>

          
            <view style={{ marginTop: 8 }}>
              <text style={{ color: '#fff', fontSize: 12 }}>Trend Comparison</text>
              <view style={{ background: '#333', borderRadius: 8, overflow: 'hidden', marginTop: 4 }}>
                <view
                  style={{
                    width: `${(s.trendScore / maxTrend) * 100}%`,
                    background: '#25D366',
                    height: 12,
                  }}
                />
              </view>
              <text style={{ color: '#fff', fontSize: 12 }}>{s.trendScore}% trending</text>
            </view>

            <view className='AnalyticsRow'>
              <text className='Analytics'>❤️ Engagement: 1.2k</text>
            </view>

            <view className='ActionBtn'>
              <text>Use this caption</text>
            </view>
          </view>
        ))}
      </scroll-view>
    </view>
  )
}
