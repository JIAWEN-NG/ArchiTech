import { useState } from "@lynx-js/react";

export function ChatPanel(props: { onBack: () => void }) {
  const [messages, setMessages] = useState<{ text: string; from: "user" | "bot" }[]>([
    { text: "Hello! How can I help you today?", from: "bot" },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [suggestions] = useState<string[]>(["Hi!", "Tell me a joke", "What's the weather?"]);

  // Send message function
  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMsg = { text: inputValue, from: "user" } as const;
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate backend reply after 1s
    setTimeout(() => {
      const botMsg = { text: "Bot reply: " + userMsg.text, from: "bot" } as const;
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  const onSuggestionClick = (s: string) => {
    setInputValue(s);
  };

  return (
    <view style={{ flex: 1, background: "#fff", justifyContent: "flex-end" }}>
      {/* Messages list */}
      <scroll-view
        scroll-orientation="vertical"
        style={{ flex: 1, padding: "10px" }}
      >
        {messages.map((msg, idx) => (
          <view
            key={idx}
            style={{
              background: msg.from === "user" ? "#DCF8C6" : "#EEE",
              alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
              padding: "10px",
              borderRadius: "15px",
              marginBottom: "5px",
              maxWidth: "70%",
            }}
          >
            <text style={{ color: "#000" }}>{msg.text}</text>
          </view>
        ))}
      </scroll-view>

      {/* Suggestions */}
      <view style={{ flexDirection: "row", flexWrap: "wrap", padding: "5px", gap: "5px" }}>
        {suggestions.map((s, i) => (
          <view
            key={i}
            bindtap={() => onSuggestionClick(s)}
            style={{
              background: "#eee",
              padding: "8px 12px",
              borderRadius: "20px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <text style={{ color: "#000" }}>{s}</text>
          </view>
        ))}
      </view>

      {/* Footer: Back + Input + Send fixed bottom */}
      <view
        style={{
          flexDirection: "row",
          padding: "10px",
          background: "#fff",
          borderTopWidth: "1px",
          borderTopColor: "#ccc",
          alignItems: "center",
        }}
      >
        {/* Back Button */}
        <view
          bindtap={props.onBack}
          style={{
            background: "#ccc",
            padding: "10px 15px",
            borderRadius: "20px",
            justifyContent: "center",
            alignItems: "center",
            marginRight: "5px",
          }}
        >
          <text style={{ color: "#000", fontWeight: "bold" }}>Back</text>
        </view>

        {/* Fake Input */}
        <view
          style={{
            flex: 1,
            background: "#f0f0f0",
            padding: "10px",
            borderRadius: "20px",
            justifyContent: "center",
          }}
          bindtap={() => {
            const typed = prompt("Type your message:") || "";
            setInputValue(typed);
          }}
        >
          <text style={{ color: "#000" }}>{inputValue || "Type your message..."}</text>
        </view>

        {/* Send Button */}
        <view
          bindtap={sendMessage}
          style={{
            background: "#4CAF50",
            padding: "10px 15px",
            borderRadius: "20px",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: "5px",
          }}
        >
          <text style={{ color: "#fff", fontWeight: "bold" }}>Send</text>
        </view>
      </view>
    </view>
  );
}
