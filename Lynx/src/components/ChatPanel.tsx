import { useState } from "@lynx-js/react";

export function ChatPanel(props: { onBack: () => void }) {
  const [messages, setMessages] = useState<{ text: string; from: "user" | "bot" }[]>([
    { text: "Hello! How can I help you today?", from: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    const userMsg = { text, from: "user" } as const;
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    setTimeout(() => {
      const botMsg = { text: "Bot reply: " + userMsg.text, from: "bot" } as const;
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <page>
      <view style={{ flex: 1}}>
        {/* Messages list */}
        <scroll-view
          scroll-orientation="vertical"
          style={{
            flex: 1,
            padding: "12px",
            paddingBottom: "80px" /* keep space for composer */,
          }}
        >
          {messages.map((msg, idx) => (
            <view
              key={idx}
              style={{
                background: msg.from === "user" ? "#DCF8C6" : "#FFFFFF",
                alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                padding: "10px 14px",
                borderRadius: "20px",
                marginBottom: "8px",
                maxWidth: "75%",
                boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
              }}
            >
              <text style={{ color: "#000", fontSize: "15px" }}>{msg.text}</text>
            </view>
          ))}

          {/* Suggestions */}
          <view
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "10px",
              justifyContent: "center",
            }}
          >
          </view>
        </scroll-view>

        {/* Composer */}
        <view
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "8px 10px",
            background: "#fff",
            borderTopWidth: "1px",
            borderTopColor: "#ddd",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* Back button */}
          <view
            bindtap={props.onBack}
            style={{
              background: "#eee",
              padding: "8px 12px",
              borderRadius: "50px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <text style={{ color: "#000", fontWeight: "bold" }}>←</text>
          </view>

          {/* Input */}
          <input
            type="text"
            value={inputValue}
            placeholder="Message"
            bindinput={(e) => setInputValue(e.detail.value)}
            style={{
              flex: 1,
              background: "#f0f0f0",
              padding: "10px 14px",
              borderRadius: "25px",
              fontSize: "15px",
            }}
            // bindconfirm={sendMessage}
          />

          {/* Send button */}
          <view
            bindtap={sendMessage}
            style={{
              background: "#25D366" /* WhatsApp green */,
              padding: "10px 14px",
              borderRadius: "50px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <text style={{ color: "#fff", fontWeight: "bold" }}>➤</text>
          </view>
        </view>
      </view>
    </page>
  );
}
