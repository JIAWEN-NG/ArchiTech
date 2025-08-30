import { useState, useRef, useEffect, useCallback } from "@lynx-js/react";

interface Msg {
  text: string;
  from: "user" | "bot";
  id?: number;
}

// API Configuration
const API_CONFIG = {
  baseUrl: "http://localhost:3001", // Your backend URL
  endpoints: {
    chat: "/api/chat",
    generateCaption: "/api/captions/generate",
    getTrends: "/api/trends"
  }
};

export default function ChatPanel(props: {
  onNewBotMessage?: (msg: Msg) => void;
  onBack?: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { text: "Hello! I'm your AI TikTok assistant. I can help you create viral captions, suggest trending topics, and boost your content engagement. What would you like to work on?", from: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const scrollRef = useRef<any>(null);
  const suggestionIdRef = useRef(0);

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingSuggestion]);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.warn('Backend not connected, using fallback mode');
      setConnectionStatus('disconnected');
    }
  };

  const fetchBotReply = useCallback(async (userText: string) => {
    setIsLoading(true);
    
    try {
      if (connectionStatus === 'connected') {
        // Real backend integration
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.chat}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: userText,
            context: "tiktok_caption_generation",
            previousMessages: messages.slice(-4) // Send recent context
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        setPendingSuggestion(data.reply || "Sorry, I couldn't generate a response right now.");
        
      } else {
        // Fallback mode with intelligent responses
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        const fallbackResponses = getFallbackResponse(userText);
        setPendingSuggestion(fallbackResponses);
      }
      
    } catch (error) {
      console.error('AI API Error:', error);
      
      // Graceful fallback
      const fallbackResponse = `I'm having trouble connecting right now, but here's a suggestion for "${userText}": Try adding a hook like "Wait for it..." or "You won't believe what happens next!" to grab attention in the first 3 seconds! 🎬`;
      setPendingSuggestion(fallbackResponse);
    } finally {
      setIsLoading(false);
    }
  }, [messages, connectionStatus]);

  const getFallbackResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();
    
    // Smart fallback responses based on keywords
    if (lowerText.includes('caption') || lowerText.includes('viral')) {
      return `🔥 For viral captions about "${userText}", try this formula: Hook + Story + Call-to-Action! Start with "POV:" or "Wait for it..." then ask your audience a question. Don't forget trending hashtags like #fyp #viral #foryou!`;
    }
    
    if (lowerText.includes('hashtag')) {
      return `📈 Great hashtag strategy for "${userText}": Mix 2-3 trending tags (#fyp #viral #trending) with 3-4 niche tags specific to your content. This gives you both reach AND targeted engagement!`;
    }
    
    if (lowerText.includes('trend')) {
      return `📊 Current trending ideas for "${userText}": Behind-the-scenes content, day-in-my-life videos, quick tutorials, and reaction content are performing well! Try the "Get Ready With Me" or "Things I wish I knew" formats.`;
    }
    
    // Default response
    return `✨ Here's a content strategy for "${userText}": Create curiosity in your first 3 seconds, tell a mini-story, and end with a question to boost engagement. Try formats like "POV:", "Tell me why...", or "Rating [topic] until..." #content #creator #fyp`;
  };

  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { text, from: "user", id: suggestionIdRef.current++ };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    fetchBotReply(text);
  }, [inputValue, fetchBotReply, isLoading]);

  const approveSuggestion = () => {
    if (!pendingSuggestion) return;

    const botMsg: Msg = { text: pendingSuggestion, from: "bot", id: suggestionIdRef.current++ };
    setMessages(prev => [...prev, botMsg]);

    setPendingSuggestion(null);
    props.onNewBotMessage?.(botMsg);
  };

  const editSuggestion = () => {
    if (!pendingSuggestion) return;
    setInputValue(pendingSuggestion);
    setPendingSuggestion(null);
  };

  const rejectSuggestion = () => {
    setPendingSuggestion(null);
  };

  // Quick action buttons for common requests
  const quickActions = [
    "Generate a viral caption",
    "What's trending now?", 
    "Add engaging hashtags",
    "Make it more funny"
  ];

  const handleQuickAction = (action: string) => {
    if (isLoading) return;
    
    const userMsg: Msg = { text: action, from: "user", id: suggestionIdRef.current++ };
    setMessages(prev => [...prev, userMsg]);
    fetchBotReply(action);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#25D366';
      case 'disconnected': return '#FF6B6B';
      case 'checking': return '#FFA726';
      default: return '#cccccc';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'AI Connected';
      case 'disconnected': return 'Offline Mode';
      case 'checking': return 'Connecting...';
      default: return 'Unknown';
    }
  };

  return (
    <page>
      <view className="PageBackground">
        
        {/* Header */}
        <view style={{ padding: "16px 20px", background: "#eeeeee", flexDirection: "column" }}>
          <view style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <view style={{ flexDirection: "column" }}>
              <text style={{ color: "#000000", fontSize: "16px", fontWeight: "bold" }}>TikTok AI Assistant</text>
              <text style={{ color: "#000000", fontSize: "14px" }}>
                {isLoading ? "AI is thinking..." : "Create viral content with AI"}
              </text>
            </view>
            
            {/* Connection Status */}
            <view style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <view style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "4px", 
                background: getStatusColor(),
                marginRight: "6px" 
              }} />
              <text style={{ fontSize: "12px", color: "#666666" }}>
                {getStatusText()}
              </text>
            </view>
          </view>
        </view>

        {/* Messages */}
        <scroll-view ref={scrollRef} scroll-y style={{ flex: "1", padding: "12px", paddingBottom: "120px" }}>
          {messages.map((msg, idx) => (
            <view
              key={idx}
              style={{
                background: msg.from === "user" ? "#DCF8C6" : "#FFFFFF",
                alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                padding: "12px 16px",
                borderRadius: "20px",
                marginBottom: "8px",
                maxWidth: "75%",
                boxShadow: "0px 1px 1px rgba(0,0,0,0.1)",
              }}
            >
              <text style={{ fontSize: "16px", color: "#000000" }}>{msg.text}</text>
            </view>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <view
              style={{
                background: "#F5F5F5",
                padding: "12px 16px",
                borderRadius: "20px",
                marginBottom: "8px",
                maxWidth: "75%",
                alignSelf: "flex-start",
              }}
            >
              <text style={{ fontSize: "16px", color: "#666666" }}>🤖 AI is crafting your response...</text>
            </view>
          )}

          {/* Pending suggestion */}
          {pendingSuggestion && (
            <view
              style={{
                background: "#E1F5FE",
                padding: "12px 16px",
                borderRadius: "20px",
                marginBottom: "8px",
                maxWidth: "75%",
                alignSelf: "flex-start",
                border: "2px solid #2196F3",
              }}
            >
              <text style={{ fontSize: "12px", color: "#1976D2", fontWeight: "bold", marginBottom: "6px" }}>
                ✨ AI Suggestion
              </text>
              <text style={{ fontSize: "16px", color: "#000000" }}>
                {pendingSuggestion}
              </text>

              {/* Button row */}
              <view
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginTop: "12px",
                }}
              >
                <view
                  bindtap={approveSuggestion}
                  style={{
                    background: "#25D366",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    marginRight: "8px",
                  }}
                >
                  <text style={{ fontSize: "14px", fontWeight: "bold", color: "#ffffff" }}>
                    ✓ Accept
                  </text>
                </view>

                <view
                  bindtap={editSuggestion}
                  style={{
                    background: "#FF9800",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    marginRight: "8px",
                  }}
                >
                  <text style={{ fontSize: "14px", fontWeight: "bold", color: "#ffffff" }}>
                    ✏ Edit
                  </text>
                </view>

                <view
                  bindtap={rejectSuggestion}
                  style={{
                    background: "#F44336",
                    padding: "8px 16px",
                    borderRadius: "20px",
                  }}
                >
                  <text style={{ fontSize: "14px", fontWeight: "bold", color: "#ffffff" }}>
                    ✗ Reject
                  </text>
                </view>
              </view>
            </view>
          )}

          {/* Quick Actions */}
          {!isLoading && !pendingSuggestion && messages.length <= 2 && (
            <view style={{ marginTop: "16px" }}>
              <text style={{ fontSize: "14px", color: "#666666", marginBottom: "12px", textAlign: "center" }}>
                💡 Quick Actions:
              </text>
              <view style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
                {quickActions.map((action, idx) => (
                  <view
                    key={idx}
                    bindtap={() => handleQuickAction(action)}
                    style={{
                      background: "#E3F2FD",
                      padding: "8px 12px",
                      borderRadius: "16px",
                      border: "1px solid #2196F3",
                      marginRight: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <text style={{ fontSize: "14px", color: "#1976D2" }}>{action}</text>
                  </view>
                ))}
              </view>
            </view>
          )}
        </scroll-view>

        {/* Composer row */}
        <view style={{
          position: "fixed", 
          left: "0px", 
          right: "0px", 
          bottom: "0px", 
          padding: "16px",
          background: "#F0F0F0", 
          borderTopWidth: "1px", 
          borderTopColor: "#cccccc",
          display: "flex", 
          flexDirection: "row", 
          alignItems: "center"
        }}>
          <input
            type="text"
            value={inputValue}
            placeholder={
              isLoading 
                ? "AI is thinking..." 
                : "Ask for captions, hashtags, trends, or content ideas..."
            }
            bindinput={(e) => setInputValue(e.detail.value)}
            bindconfirm={sendMessage}
            disabled={isLoading}
            style={{
              flex: "1",
              background: isLoading ? "#f5f5f5" : "#ffffff",
              padding: "10px",
              borderRadius: "20px",
              color: "#000000",
              marginRight: "12px",
              minHeight: "60px",
              border: "1px solid #cccccc",
              opacity: isLoading ? 0.6 : 1,
            }}
          />

          <view
            bindtap={sendMessage}
            style={{
              width: "70px", 
              height: "70px", 
              background: isLoading || !inputValue.trim() ? "#cccccc" : "#25D366", 
              borderRadius: "35px",
              justifyContent: "center", 
              alignItems: "center",
              minWidth: "70px", 
              minHeight: "70px",
              opacity: isLoading || !inputValue.trim() ? 0.6 : 1,
            }}
          >
            <text style={{ color: "#ffffff", fontWeight: "bold", fontSize: "16px" }}>
              {isLoading ? "⏳" : "➤"}
            </text>
          </view>
        </view>
      </view>
    </page>
  );
}