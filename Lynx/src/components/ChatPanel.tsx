import { useState, useRef, useEffect, useCallback } from "@lynx-js/react";

interface Msg {
  text: string;
  from: "user" | "bot";
  id?: number;
}

export default function ChatPanel(props: {
  onNewBotMessage?: (msg: Msg) => void;
  onBack?: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { text: "Hello! How can I help you today?", from: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const scrollRef = useRef<any>(null);
  const suggestionIdRef = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingSuggestion]);

  const fetchBotReply = useCallback(async (userText: string) => {
    // -------------------------------
    // 🔹 BACKEND 4 INTEGRATION POINT
    // Replace this setTimeout with a real API call to your backend service.
    // Example:
    // const response = await fetch("http://your-backend-4/api/reply", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ message: userText }),
    // });
    // const data = await response.json();
    // setPendingSuggestion(data.reply);
    // -------------------------------

    // Temporary simulated reply (delete when backend is ready)
    setTimeout(() => {
      const simulatedReply = `AI suggestion based on: "${userText}"`;
      setPendingSuggestion(simulatedReply);
    }, 1000);
  }, []);

  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: Msg = { text, from: "user", id: suggestionIdRef.current++ };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    fetchBotReply(text);
  }, [inputValue, fetchBotReply]);

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

  return (
    <page>
      <view className="PageBackground">
        
        {/* Header */}
        <view style={{ padding: "16px 20px", background: "#eee", flexDirection: "column" }}>
          <text style={{ color: "#000", fontSize: "16px", fontWeight: "bold" }}>AI Chat</text>
          <text style={{ color: "#000", fontSize: "16px" }}>Chat with your AI assistant</text>
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
                boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
              }}
            >
              <text style={{ fontSize: "16px", color: "#000" }}>{msg.text}</text>
            </view>
          ))}

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
              }}
            >
              <text style={{ fontSize: "16px", color: "#000" }}>
                {pendingSuggestion} (AI suggestion)
              </text>

              {/* Button row */}
              <view
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <view
                  bindtap={approveSuggestion}
                  style={{
                    background: "#25D366",
                    padding: "10px 16px",
                    borderRadius: "20px",
                    marginRight: "12px",
                  }}
                >
                  <text style={{ fontSize: "16px", fontWeight: "bold", color: "#fff" }}>
                    Approve
                  </text>
                </view>

                <view
                  bindtap={editSuggestion}
                  style={{
                    background: "#ff2d55",
                    padding: "10px 16px",
                    borderRadius: "20px",
                  }}
                >
                  <text style={{ fontSize: "16px", fontWeight: "bold", color: "#fff" }}>
                    Edit
                  </text>
                </view>
              </view>
            </view>
          )}
        </scroll-view>

        {/* Composer row */}
        <view style={{
          position: "fixed", left: "0px", right: "0px", bottom: "0px", padding: "16px",
          background: "#F0F0F0", borderTopWidth: "1px", borderTopColor: "#ccc",
          display: "flex", flexDirection: "row", alignItems: "center"
        }}>
          <input
            type="text"
            value={inputValue}
            placeholder="Type a message..."
            bindinput={(e) => setInputValue(e.detail.value)}
            bindconfirm={sendMessage}
            style={{
              flex: "1",
              background: "#fff",
              padding: "10px",
              borderRadius: "20px",
              color: "#000",
              marginRight: "12px",
              minHeight: "60px",
              border: "1px solid #ccc",
            }}
          />

          <view
            bindtap={sendMessage}
            style={{
              width: "70px", height: "70px", background: "#25D366", borderRadius: "35px",
              justifyContent: "center", alignItems: "center",
              minWidth: "70px", minHeight: "70px",
            }}
          >
            <text style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}>➤</text>
          </view>
        </view>
      </view>
    </page>
  );
}
