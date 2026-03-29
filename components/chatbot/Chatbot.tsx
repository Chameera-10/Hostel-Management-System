import React, { useEffect, useRef, useState } from "react";
import {
  PaperAirplaneIcon,
  UserCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon, // NEW ICON
} from "@heroicons/react/24/solid";

/* ================== THEME (soft light) ================== */
const THEME = {
  bg: "#FFFFFF",
  card: "#FFFFFF",
  ring: "#BBD8FF",
  primary: "#4F8BCB",
  primarySoft: "#E9F3FF",
  textDark: "#1A2B3C",
  textMuted: "#7A8FA8",
  shadowSoft:
    "4px 4px 14px rgba(0,0,0,0.05), -4px -4px 12px rgba(255,255,255,0.9)",
  insetSoft:
    "inset 3px 3px 6px rgba(0,0,0,0.04), inset -3px -3px 6px rgba(255,255,255,0.95)",
};

type Sender = "user" | "bot";

interface Message {
  sender: Sender;
  text: string;
  timestamp: Date;
}

const SUGGESTIONS: string[] = [
  "When is the next hostel fee deadline?",
  "How do I submit a maintenance request?",
  "What are the quiet hours and rules?",
];

const Chatbot: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);

  /* ---------------- Status check ---------------- */
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/chat/status", {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.enabled) {
          setEnabled(true);
          setMessages([
            {
              sender: "bot",
              text: "Hi! I'm your Gemini powered assistant — how can I help you today?",
              timestamp: new Date(),
            },
          ]);
        } else {
          setEnabled(false);
        }
      } catch {
        setErr("Could not verify AI Assistant status.");
        setEnabled(false);
      }
    };
    run();
  }, []);

  /* ---------------- Auto scroll ---------------- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* ---------------- Send message ---------------- */
  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/chat/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("bad");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botText += decoder.decode(value, { stream: true });
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botText.trim(), timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Connection error. Try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!enabled) {
    return (
      <div
        className="h-full flex items-center justify-center text-sm"
        style={{ background: THEME.bg, color: THEME.textMuted }}
      >
        {err || "AI Assistant unavailable"}
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "#FFFFFF", color: THEME.textDark }}
    >
      {/* ---------- Header ---------- */}
      <div
        className="px-5 py-4 flex items-center justify-between backdrop-blur-md"
        style={{
          background: "rgba(255,255,255,0.82)",
          borderBottom: "1px solid " + THEME.primarySoft,
          boxShadow: "0 4px 18px rgba(79,139,203,0.10)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{
              background: THEME.primarySoft,
              boxShadow: THEME.insetSoft,
            }}
          >
            <SparklesIcon
              className="h-5 w-5"
              style={{ color: THEME.primary }}
            />
          </div>
          <div>
            <div className="text-[15px] font-semibold">G-M Assistant</div>
            <div className="text-xs" style={{ color: THEME.textMuted }}>
              Gemini-like responses for hostel help
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Suggestions ---------- */}
      <div className="px-5 pt-4">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="px-3 py-2 text-xs rounded-xl"
              style={{
                background: "#FFFFFF",
                color: THEME.textDark,
                boxShadow: THEME.shadowSoft,
                border: "1px solid " + THEME.primarySoft,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Messages ---------- */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4"
        style={{ background: "#FFFFFF" }}
      >
        <div className="space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "#FFFFFF",
                      boxShadow: THEME.shadowSoft,
                      border: "1px solid " + THEME.primarySoft,
                    }}
                  >
                    <ChatBubbleLeftRightIcon
                      className="h-5 w-5"
                      style={{
                        background: "linear-gradient(180deg, #6AA5E8, #4F8BCB)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    />
                  </div>
                )}

                <div
                  className="max-w-[72ch] px-4 py-3 rounded-2xl text-[14px] leading-6"
                  style={{
                    background: isUser ? "#F8FBFF" : "#FFFFFF",
                    boxShadow: THEME.shadowSoft,
                    border: "1px solid " + THEME.primarySoft,
                    color: THEME.textDark,
                  }}
                >
                  {m.text}
                </div>

                {isUser && (
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "#FFFFFF",
                      boxShadow: THEME.shadowSoft,
                      border: "1px solid " + THEME.primarySoft,
                      color: THEME.primary,
                    }}
                  >
                    <UserCircleIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
            );
          })}

          <div ref={endRef} />
        </div>
      </div>

      {/* ---------- Composer ---------- */}
      <div className="px-5 pb-5">
        <div
          className="w-full rounded-2xl flex items-center gap-2 px-3 py-2"
          style={{
            background: "#FFFFFF",
            border: "1px solid " + THEME.primarySoft,
            boxShadow: THEME.shadowSoft,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Message Gemini..."
            className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-[14px] px-2 py-2"
            style={{ color: THEME.textDark }}
          />

          <button
            onClick={() => send(input)}
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium active:scale-95 disabled:opacity-60"
            style={{
              background: "linear-gradient(180deg, #6AA5E8, #4F8BCB)",
              color: "#ffffff",
              boxShadow:
                "0 8px 22px rgba(79,139,203,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            <PaperAirplaneIcon className="h-5 w-5 -rotate-12" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
