import { useState, useCallback, useEffect } from "@lynx-js/react";
import "../PersonalizedPage.css"; // Reuse dark mobile theme styles

export function ChatPanel() {
  const [messages, setMessages] = useState<{ text: string; from: "user" | "bot" }[]>([
    { text: "Hello! How can I help you today?", from: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions] = useState(["Hi!", "Tell me a joke", "What's the weather?"]);

  useEffect(() => {
    console.info("AI Chat Loaded");
  }, []);

  const sendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    const userMsg = { text: inputValue, from: "user" } as const;
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate bot reply
    setTimeout(() => {
      const botMsg = { text: "Bot reply: " + userMsg.text, from: "bot" } as const;
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  }, [inputValue]);

  const onSuggestionClick = useCallback((s: string) => setInputValue(s), []);

  return (
    <view className="PageBackground">
      {/* Header */}
      <view className="PageHeader">
        <text className="PageTitle">AI Chat</text>
        <text className="PageSubtitle">Chat with your AI assistant</text>
      </view>

      {/* Messages List */}
      <scroll-view
        scroll-orientation="vertical"
        className="SuggestionsWrapper"
        style={{ padding: "6px" }}
      >
        {messages.map((msg, idx) => (
          <view
            key={idx}
            className="MessageBubble"
            style={{
              background: msg.from === "user" ? "#d4f1c5" : "#f0f0f0",
              color: "#000",
              padding: "10px 14px",
              borderRadius: "16px",
              marginBottom: "6px",
              maxWidth: "70%",
              marginLeft: msg.from === "user" ? "auto" : "0",
              marginRight: msg.from === "user" ? "0" : "auto",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
          >
            <text>{msg.text}</text>
          </view>
        ))}
      </scroll-view>

      {/* Suggestions Chips */}
      <view
        className="SuggestionsWrapper"
        style={{ flexDirection: "row", flexWrap: "wrap", gap: "4px", padding: "4px" }}
      >
        {suggestions.map((s, i) => (
          <view
            key={i}
            className="ActionBtn"
            style={{
              background: "#e0e0e0",
              padding: "6px 10px",
              borderRadius: "20px",
            }}
            bindtap={() => onSuggestionClick(s)}
          >
            <text style={{ color: "#000" }}>{s}</text>
          </view>
        ))}
      </view>

      {/* Input + Send */}
      <view
        className="ActionBtn"
        style={{ flexDirection: "row", gap: "4px", marginTop: "8px" }}
      >
        <view
          className="SuggestionsWrapper"
          style={{
            flex: 1,
            background: "#f0f0f0",
            padding: "8px",
            borderRadius: "20px",
          }}
          bindtap={() => setInputValue(prompt("Type your message:") || "")}
        >
          <text style={{ color: "#000" }}>{inputValue || "Type your message..."}</text>
        </view>
        <view
          className="ActionBtn"
          style={{
            background: "#4CAF50",
            padding: "8px 16px",
            borderRadius: "20px",
            justifyContent: "center",
            alignItems: "center",
          }}
          bindtap={sendMessage}
        >
          <text style={{ color: "#fff", fontWeight: "bold" }}>Send</text>
        </view>
      </view>
    </view>
  );
}
