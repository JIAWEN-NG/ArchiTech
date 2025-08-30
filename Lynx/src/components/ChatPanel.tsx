import { useState, useRef, useEffect, useCallback } from "@lynx-js/react";

export function ChatPanel(props: { onBack: () => void }) {
  const [messages, setMessages] = useState<{ text: string; from: "user" | "bot" }[]>([
    { text: "Hello! How can I help you today?", from: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg = { text, from: "user" } as const;
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate Bot Response for Backend Integration AI API Call
    setTimeout(() => {
      const botMsg = { text: "Bot reply: " + userMsg.text, from: "bot" } as const;
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  }, [inputValue]);

  return (
    <page>
      <view className="PageBackground"> {/* Dark background */}
        {/* Header */}
        <view
          style={{
            padding: "12px 16px",
            background: "#eee", // same as Back button
            flexDirection: "column",
          }}
        >
          <text style={{ color: "#000", fontSize: "18px", fontWeight: "bold" }}>AI Chat</text>
          <text style={{ color: "#000", fontSize: "14px" }}>Chat with your AI assistant</text>
        </view>

        {/* Messages list */}
        <scroll-view
          ref={scrollRef}
          scroll-orientation="vertical"
          style={{ flex: 1, padding: "12px", paddingBottom: "80px" }}
        >
          {messages.map((msg, idx) => (
            <view
              key={idx}
              style={{
                background: msg.from === "user" ? "#25D366" : "#1E1E1E",
                color: msg.from === "user" ? "#fff" : "#fff",
                alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                padding: "10px 14px",
                borderRadius: "20px",
                marginBottom: "8px",
                maxWidth: "75%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              <text style={{ fontSize: "15px", color: msg.from === "user" ? "#fff" : "#fff" }}>
                {msg.text}
              </text>
            </view>
          ))}
        </scroll-view>

        {/* Composer row */}
        <view
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 12,
            background: "#1F1F1F",
            borderTopWidth: 1,
            borderTopColor: "#333",

            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Typing input */}
          <input
            type="text"
            value={inputValue}
            placeholder="Type a message..."
            bindinput={(e) => setInputValue(e.detail.value)}
            style={{
              flex: 1,               // take remaining space
              background: "#2C2C2C",
              padding: "14px 18px",
              borderRadius: 30,
              fontSize: 30,
              color: "#fff",
              marginRight: 10,
              minHeight: 50,         // taller input
            }}
            bindconfirm={sendMessage}
          />

          {/* Send button */}
          <view
            bindtap={sendMessage}
            style={{
              width: 60,             // bigger button
              height: 60,
              background: "#25D366",
              borderRadius: 30,      // perfect circle
              justifyContent: "center",
              alignItems: "center",
              minWidth: 60,
              minHeight: 60,
            }}
          >
            <text style={{ color: "#fff", fontWeight: "bold", fontSize: 24 }}>➤</text>
          </view>
        </view>


      </view>
    </page>
  );
}
