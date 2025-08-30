import { useState, useEffect, useCallback } from '@lynx-js/react';
import '../PersonalizedPage.css';
import { getSuggestions } from '../api/personalize.ts';

interface Suggestion {
  caption: string;
  hashtags: string[];
  created_at: string;
  trendScore: number;
}

interface PersonalizedPageProps {
  onRender?: () => void;
  creatorId: string;
  approvedCaptions?: { text: string }[]; // From ChatPanel
}
interface BackendExample {
  caption: string;
  hashtags: string[];
  created_at: string;
}

export default function PersonalizedPage({
  onRender,
  creatorId,
  approvedCaptions = []
}: PersonalizedPageProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Helper function to calculate trend score based on actual data
  const calculateTrendScore = (example: BackendExample): number => {
    // Handle empty or invalid dates
    if (!example.created_at) return 50; // Default score for missing dates
    
    try {
      const daysSinceCreated = Math.floor((Date.now() - new Date(example.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(50, 100 - daysSinceCreated * 2); // Decays by 2 points per day
      
      return Math.min(100, Math.max(0, recencyScore));
    } catch {
      return 50; // Fallback for invalid dates
    }
  };

  useEffect(() => {
    console.info('Personalized Page Loaded for', creatorId);

    if (!creatorId) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Call your backend API
        const response = await getSuggestions(creatorId);
        
        // Transform the backend response to match your frontend format
        const transformedSuggestions = response.examples.map((example) => ({
          caption: example.caption,
          hashtags: example.hashtags,
          created_at: example.created_at,
          trendScore: calculateTrendScore(example)
        }));

        setSuggestions(transformedSuggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setError('Failed to load personalized suggestions');
        
        // Fallback to static data if API fails
        setSuggestions([
          { caption: "✨ Just vibin' with good energy today!", hashtags: [], created_at: "", trendScore: 92 },
          { caption: "🔥 POV: You're leveling up every day.", hashtags: [], created_at: "", trendScore: 87 },
          { caption: "🌸 Keep it simple, keep it real.", hashtags: [], created_at: "", trendScore: 76 },
          { caption: "🌞 Rise and shine! Make today amazing.", hashtags: [], created_at: "", trendScore: 82 },
          { caption: "💪 Hard work pays off, keep pushing.", hashtags: [], created_at: "", trendScore: 90 },
          { caption: "🌼 Little joys make life beautiful.", hashtags: [], created_at: "", trendScore: 78 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [creatorId]);


  // Merge approved captions dynamically (from ChatPanel)
  useEffect(() => {
    if (approvedCaptions.length > 0) {
      const newCaptions = approvedCaptions.map(c => ({
        caption: c.text,
        hashtags: [],
        created_at: "",
        trendScore: 100 // Approved captions get max trendScore
      }));
      setSuggestions(prev => [...newCaptions, ...prev]);
    }
  }, [approvedCaptions]);

  onRender?.();

  const onSelect = useCallback((index: number) => setSelected(index), []);
  const maxTrend = Math.max(...suggestions.map(s => s.trendScore), 100);

  return (
    <view className="PageBackground" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <view className="PageHeader">
        <text className="PageTitle">Personalized Suggestions</text>
        <text className="PageSubtitle">AI captions and trend insights</text>
      </view>

      <scroll-view scroll-y style={{ flex: 1, padding: 12 }}>
        {suggestions.map((s, index) => (
          <view
            key={index}
            className={`SuggestionCard ${selected === index ? 'Selected' : ''}`}
            bindtap={() => onSelect(index)}
            style={{ marginBottom: 16 }}
          >
            <text className="Caption">{s.caption}</text>

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

            <view className="AnalyticsRow">
              <text className="Analytics">❤️ Engagement: 1.2k</text>
            </view>

            <view className="ActionBtn">
              <text>Use this caption</text>
            </view>
          </view>
        ))}
      </scroll-view>
    </view>
  );
}
