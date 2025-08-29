import { useState } from '@lynx-js/react'
import { getSuggestions } from '../api/personalize.ts'

export function SuggestionsDevPanel() {
  const [out, setOut] = useState('Tap to test API')

  async function handleTap() {
    setOut('Loading…')
    try {
      const data = await getSuggestions('creator_001')
      setOut(JSON.stringify(data, null, 2))
    } catch (e) {
      setOut(`Error: ${String(e)}`)
    }
  }

  return (
    <view style="padding:12px">
      {/* “Button” */}
      <view
        bindtap={handleTap}
        style="padding:12px;background:#28a745;border-radius:8px;align-items:center;justify-content:center;"
      >
        <text style="color:#fff;font-weight:bold;">Fetch Suggestions</text>
      </view>

      {/* Scrollable output */}
      <scroll-view
        scroll-y
        style="max-height:200px;margin-top:8px;background:#111;border-radius:8px;padding:12px;"
      >
        <text style="color:#0f0;white-space:pre-wrap;">{out}</text>
      </scroll-view>
    </view>
  )
}
