<<<<<<< Updated upstream
import { useState } from "@lynx-js/react";
=======
import { useState, useRef, useEffect, useCallback } from "@lynx-js/react";
>>>>>>> Stashed changes

export function ChatPanel(props: { onBack: () => void }) {
  const [messages, setMessages] = useState<{ text: string; from: "user" | "bot" }[]>([
    { text: "Hello! How can I help you today?", from: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
<<<<<<< Updated upstream

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
=======

  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

>>>>>>> Stashed changes
    const userMsg = { text, from: "user" } as const;
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    setTimeout(() => {
      const botMsg = { text: "Bot reply: " + userMsg.text, from: "bot" } as const;
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
          {messages.map((msg, idx) => (
            <view
              key={idx}
              style={{
<<<<<<< Updated upstream
                background: msg.from === "user" ? "#DCF8C6" : "#FFFFFF",
=======
                background: msg.from === "user" ? "#25D366" : "#1E1E1E",
                color: msg.from === "user" ? "#fff" : "#fff",
>>>>>>> Stashed changes
                alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                padding: "10px 14px",
                borderRadius: "20px",
                marginBottom: "8px",
                maxWidth: "75%",
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
        <view
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
<<<<<<< Updated upstream
            padding: "8px 10px",
            background: "#fff",
            borderTopWidth: "1px",
            borderTopColor: "#ddd",
=======
            padding: 12,
            background: "#1F1F1F",
            borderTopWidth: 1,
            borderTopColor: "#333",

            display: "flex",
>>>>>>> Stashed changes
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
          }}
        >
<<<<<<< Updated upstream
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
=======
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
              borderRadius: 20,
              fontSize: 30,
              color: "#fff",
              marginRight: 10,
            }}
            bindconfirm={sendMessage}
>>>>>>> Stashed changes
          />

          {/* Send button */}
          <view
            bindtap={sendMessage}
            style={{
<<<<<<< Updated upstream
              background: "#25D366" /* WhatsApp green */,
              padding: "10px 14px",
              borderRadius: "50px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <text style={{ color: "#fff", fontWeight: "bold" }}>➤</text>
=======
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
>>>>>>> Stashed changes
          </view>
        </view>


      </view>
    </page>
  );
}
