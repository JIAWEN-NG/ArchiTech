import { useState, useEffect, useCallback } from '@lynx-js/react'
import '../PersonalizedPage.css'

export default function PersonalizedPage(props: { onRender?: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [suggestions] = useState([
    { caption: "✨ Just vibin’ with good energy today!", trendScore: 92, engagement: "1.2k" },
    { caption: "🔥 POV: You’re leveling up every day.", trendScore: 87, engagement: "980" },
    { caption: "🌸 Keep it simple, keep it real.", trendScore: 76, engagement: "1.5k" }
  ])

  useEffect(() => {
    console.info('Personalized Page Loaded')
  }, [])
  props.onRender?.()

  const onSelect = useCallback((index: number) => {
    setSelected(index)
  }, [])

  return (
    <view className='PageBackground'>
      {/* Header */}
      <view className='PageHeader'>
        <text className='PageTitle'>Personalized Suggestions</text>
        <text className='PageSubtitle'>AI captions and trend insights</text>
      </view>

      {/* Suggestions */}
      <view className='SuggestionsWrapper'>
        {suggestions.map((s, index) => (
          <view
            key={index}
            className={`SuggestionCard ${selected === index ? 'Selected' : ''}`}
            bindtap={() => onSelect(index)}
          >
            <text className='Caption'>{s.caption}</text>

            <view className='AnalyticsRow'>
              <text className='Analytics'>🔥 {s.trendScore}% trending</text>
              <text className='Analytics'>❤️ {s.engagement}</text>
            </view>

            <view className='ActionBtn'>
              <text>Use this caption</text>
            </view>
          </view>
        ))}
      </view>
    </view>
  )
}
