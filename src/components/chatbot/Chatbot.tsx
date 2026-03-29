import React, { useState, useEffect, useRef } from "react";
import {
  PaperAirplaneIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon, // << REPLACED
} from "@heroicons/react/24/solid";
import {
  isChatbotEnabled,
  sendMessageToChat,
} from "../../services/geminiService.ts";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const theme = {
  bg: "#F5F7FB",
  user: "#3D83F7",
  bot: "#E9EEF8",
  text: "#0E1528",
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatbotEnabled, setChatbotEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isChatbotEnabled()
      .then((enabled) => {
        setChatbotEnabled(enabled);
        if (enabled) {
          setMessages([
            {
              sender: "bot",
              text: "Hi! I'm your Gemini powered assistant — how can I help you today?",
              timestamp: new Date(),
            },
          ]);
        }
      })
      .catch(() => setError("Could not verify AI Assistant status."));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const currentHistory = [...messages, userMessage];

    try {
      const stream = await sendMessageToChat(userMessage.text, currentHistory);
      if (!stream) throw new Error("Could not get stream");

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let botText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botText += decoder.decode(value, { stream: true });
      }

      if (botText.trim()) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: botText.trim(), timestamp: new Date() },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry — Gemini is unreachable now.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!chatbotEnabled) {
    return (
      <div
        className="flex items-center justify-center h-full p-4"
        style={{ color: theme.text }}
      >
        <p>{error || "AI Assistant disabled."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <div className="flex-1 p-5 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 mb-4 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <ChatBubbleLeftRightIcon
                className="h-7 w-7"
                style={{
                  background: "linear-gradient(180deg,#6AA5E8,#4F8BCB)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              />
            )}

            <div
              style={{
                background: msg.sender === "user" ? theme.user : theme.bot,
                color: msg.sender === "user" ? "#fff" : theme.text,
                padding: "12px 16px",
                borderRadius: "16px",
                maxWidth: "70%",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                fontSize: "14px",
              }}
            >
              {msg.text}
            </div>

            {msg.sender === "user" && (
              <UserCircleIcon className="h-7 w-7 text-blue-500" />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start mb-4">
            <ChatBubbleLeftRightIcon
              className="h-7 w-7"
              style={{
                background: "linear-gradient(180deg,#6AA5E8,#4F8BCB)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            />
            <div
              style={{
                background: theme.bot,
                padding: "12px 16px",
                borderRadius: "16px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="relative p-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Message Gemini..."
          style={{
            width: "100%",
            background: "#EAF2FF",
            borderRadius: "18px",
            padding: "14px 18px",
            border: "1.5px solid #B8CCF7",
            outline: "none",
            fontSize: "15px",
            color: theme.text,
          }}
        />

        <button
          onClick={handleSend}
          disabled={isLoading}
          style={{
            position: "absolute",
            right: "32px",
            top: "50%",
            transform: "translateY(-50%)",
            background: theme.user,
            borderRadius: "18px",
            padding: "0 18px",
            height: "42px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 10px rgba(61,131,247,0.28)",
          }}
        >
          <PaperAirplaneIcon className="h-5 w-5 text-white" />
          <span style={{ color: "white", fontSize: "13px", fontWeight: 500 }}>
            Send
          </span>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
