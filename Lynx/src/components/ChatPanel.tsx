import { useState, useRef, useEffect, useCallback } from "@lynx-js/react";

interface Msg {
  text: string;
  from: "user" | "bot";
  id?: number;
}

interface ChatResponse {
  reply: string;
  captions?: string[];
  hashtags?: string[];
  trends?: string[];
}

interface CaptionResponse {
  captions: string[];
}

interface TrendsResponse {
  trends: string[];
}

const API_CONFIG = {
  baseUrl: "http://127.0.0.1:3002",
  endpoints: {
    health: "/health",
    chat: "/api/chat",
    generateCaption: "/api/captions/generate",
    getTrends: "/api/trends",
  },
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${txt}`);
  }
  return res.json() as Promise<T>;
}

export default function ChatPanel(props: {
  onNewBotMessage?: (msg: Msg) => void;
  onBack?: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      text:
        "Hello! I’m your AI TikTok assistant. I can help with catchy captions, hashtags, and trend ideas to boost engagement. What would you like to work on?",
      from: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");

  const [captionSuggestions, setCaptionSuggestions] = useState<string[] | null>(
    null
  );
  const [trendSuggestions, setTrendSuggestions] = useState<string[] | null>(
    null
  );

  const scrollRef = useRef<any>(null);
  const msgIdRef = useRef(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setConnectionStatus("checking");
        await apiFetch(API_CONFIG.endpoints.health);
        if (!cancelled) setConnectionStatus("connected");
      } catch {
        if (!cancelled) setConnectionStatus("disconnected");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      if (scrollRef.current && typeof scrollRef.current.scrollTo === "function") {
        scrollRef.current.scrollTo({ top: 999999, behavior: "smooth" });
      }
    } catch {}
  }, [messages, captionSuggestions, trendSuggestions]);

  const pushUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { text, from: "user", id: msgIdRef.current++ },
    ]);
  };

  const pushBotMessage = (text: string) => {
    const msg = { text, from: "bot" as const, id: msgIdRef.current++ };
    setMessages((prev) => [...prev, msg]);
    props.onNewBotMessage?.(msg);
  };

  const setRichResults = (resp: ChatResponse | null) => {
    setCaptionSuggestions(resp?.captions?.length ? resp.captions : null);
    setTrendSuggestions(resp?.trends?.length ? resp.trends : null);
  };

  const sendToChat = useCallback(
    async (userText: string) => {
      setIsLoading(true);
      setRichResults(null);

      try {
        const payload = {
          message: userText,
          context: "tiktok_caption_generation",
          previousMessages: messages.slice(-6).map((m) => ({
            text: m.text,
            from: m.from,
          })),
        };

        const data = await apiFetch<ChatResponse>(API_CONFIG.endpoints.chat, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const reply = (data.reply || "").trim();
        if (reply) pushBotMessage(reply);
        setRichResults(data);
      } catch {
        pushBotMessage(
          "Hmm, I couldn’t reach the AI service. I’ll try a smart fallback.\n\n" +
            fallbackResponse(userText)
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const requestCaptions = useCallback(async (topic: string) => {
    setIsLoading(true);
    setRichResults(null);

    try {
      const body = { topic, count: 5, tone: "engaging", niche: "TikTok" };
      const data = await apiFetch<CaptionResponse>(
        API_CONFIG.endpoints.generateCaption,
        { method: "POST", body: JSON.stringify(body) }
      );

      if (data.captions?.length) {
        pushBotMessage("Here are some caption options 👇");
        setCaptionSuggestions(data.captions);
      } else {
        pushBotMessage("I couldn’t generate captions right now.");
      }
    } catch {
      pushBotMessage(
        "The caption endpoint isn’t reachable, so here’s a quick fallback:"
      );
      setCaptionSuggestions(fallbackCaptions(topic));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestTrends = useCallback(async (niche?: string) => {
    setIsLoading(true);
    setRichResults(null);

    try {
      const qs = niche ? `?niche=${encodeURIComponent(niche)}` : "";
      const data = await apiFetch<TrendsResponse>(
        `${API_CONFIG.endpoints.getTrends}${qs}`
      );

      if (data.trends?.length) {
        pushBotMessage("Here are some trend ideas 👇");
        setTrendSuggestions(data.trends);
      } else {
        pushBotMessage("I couldn’t fetch trends right now.");
      }
    } catch {
      pushBotMessage(
        "The trends endpoint isn’t reachable, so here are some quick ideas:"
      );
      setTrendSuggestions(fallbackTrends());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fallbackResponse = (userText: string): string => {
    const lower = userText.toLowerCase();
    if (lower.includes("trend")) {
      return [
        "• Behind-the-scenes quick cut — try #BTS",
        "• I tried X so you don’t have to — #HonestReview",
        "• 3 fast tips with text — #ProTips",
        "• Day in the life montage — #DayInMyLife",
        "• Before/After with beat drop — #GlowUp",
      ].join("\n");
    }
    return [
      "1) Stop scrolling! You won’t believe this… 🔥",
      "2) POV: You finally try the hack everyone’s talking about 👀",
      "3) This changed my results in 7 days. Here’s how ⬇️",
      "Hashtags: #viral #howto #creator",
    ].join("\n");
  };

  const fallbackCaptions = (topic: string): string[] => [
    `This ${topic} tip changed everything 🔥 #creator`,
    `Tried it so you don’t have to 👀 #ProTips`,
    `Quick win for ${topic} you can copy ⬇️ #howto`,
    `The secret I wish I knew earlier #learnontiktok`,
    `Do this before you start — thank me later 🙌`,
  ];

  const fallbackTrends = (): string[] => [
    "30-sec micro-storytime",
    "Before/After quick cuts",
    "First-person POV reactions",
    "Daily mini-vlog routines",
    "Duet challenge spin-offs",
    "Superfast recipe edits",
    "Mini explainers with captions",
  ];

  const onSend = async () => {
    const userText = inputValue.trim();
    if (!userText || isLoading) return;

    setCaptionSuggestions(null);
    setTrendSuggestions(null);

    pushUserMessage(userText);
    setInputValue("");

    if (connectionStatus !== "connected") {
      pushBotMessage(fallbackResponse(userText));
      return;
    }

    await sendToChat(userText);
  };

  const useChip = (text: string) => setInputValue(text);

  return (
    <page style={{ background: "#f8f8f8", width: "100%", height: "100%" }}>
      {/* Header */}
      <view
        style={{
          padding: "12px 16px",
          background: "#111827",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <text style={{ fontWeight: "700" }}>AI Creator Assistant</text>
        <text
          style={{
            fontSize: "12px",
            opacity: 0.8,
            color:
              connectionStatus === "connected"
                ? "#34D399"
                : connectionStatus === "checking"
                ? "#FBBF24"
                : "#EF4444",
          }}
        >
          {connectionStatus === "connected"
            ? "Connected"
            : connectionStatus === "checking"
            ? "Checking…"
            : "Offline"}
        </text>
      </view>

      {/* Messages */}
      <view
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "#ffffff",
        }}
      >
        {messages.map((m) => (
          <view
            key={m.id ?? `${m.from}-${m.text.slice(0, 8)}`}
            style={{
              alignSelf: m.from === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.from === "user" ? "#2563EB" : "#F3F4F6",
              color: m.from === "user" ? "#FFFFFF" : "#111827",
              borderRadius: "14px",
              padding: "10px 12px",
              boxShadow:
                m.from === "user"
                  ? "none"
                  : "0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)",
              // Lynx doesn't support whiteSpace: 'pre-wrap'
              lineHeight: "1.35",
            }}
          >
            <text>{m.text}</text>
          </view>
        ))}

        {/* Caption chips */}
        {captionSuggestions && captionSuggestions.length > 0 && (
          <view
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {captionSuggestions.map((c, i) => (
              <view
                key={`cap-${i}`}
                style={{
                  background: "#FEF3C7",
                  color: "#92400E",
                  border: "1px solid #F59E0B",
                  padding: "8px 10px",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
                bindtap={() => useChip(c)}
              >
                <text>{c}</text>
              </view>
            ))}
          </view>
        )}

        {/* Trend chips */}
        {trendSuggestions && trendSuggestions.length > 0 && (
          <view
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {trendSuggestions.map((t, i) => (
              <view
                key={`trend-${i}`}
                style={{
                  background: "#DBEAFE",
                  color: "#1E40AF",
                  border: "1px solid #60A5FA",
                  padding: "8px 10px",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
                bindtap={() => useChip(t)}
              >
                <text>{t}</text>
              </view>
            ))}
          </view>
        )}
      </view>

      {/* Composer */}
      <view
        style={{
          padding: "10px 12px",
          borderTop: "1px solid #E5E7EB",
          background: "#F9FAFB",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder={
            isLoading
              ? "AI is thinking…"
              : "Ask for captions, hashtags, trends, or content ideas..."
          }
          value={inputValue}
          bindinput={(e: any) =>
            setInputValue(e?.detail?.value ?? e?.target?.value ?? "")
          }
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid #D1D5DB",
            outline: "none",
            background: "#fff",
          }}
        />
        <view
          bindtap={onSend}
          style={{
            background: isLoading || !inputValue.trim() ? "#9CA3AF" : "#2563EB",
            color: "#fff",
            borderRadius: "12px",
            padding: "12px 16px",
            cursor: isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            minWidth: "70px",
            minHeight: "42px",
            justifyContent: "center",
            opacity: isLoading || !inputValue.trim() ? 0.7 : 1,
          }}
        >
          <text style={{ fontWeight: "bold", fontSize: "16px" }}>
            {isLoading ? "⏳" : "➤"}
          </text>
        </view>
      </view>

      {/* Quick actions */}
      <view
        style={{
          display: "flex",
          gap: "8px",
          padding: "8px 12px",
          background: "#F3F4F6",
          borderTop: "1px solid #E5E7EB",
        }}
      >
        <view style={quickBtn} bindtap={() => requestCaptions("a cozy cafe vlog")}>
          <text>✨ Captions (Cafe Vlog)</text>
        </view>
        <view style={quickBtn} bindtap={() => requestTrends("fitness")}>
          <text>🔥 Trends (Fitness)</text>
        </view>
      </view>
    </page>
  );
}

const quickBtn: any = {
  padding: "8px 10px",
  borderRadius: "10px",
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  cursor: "pointer",
};
