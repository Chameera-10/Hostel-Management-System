import React from "react";
import Chatbot from "../../components/chatbot/Chatbot";

const ChatbotPage: React.FC = () => {
  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col"
      style={{
        height: "calc(100vh - 9rem)",
        background: "#FFFFFF", // PURE WHITE now
        border: "1px solid #E4EBF6",
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="p-4 border-b"
        style={{
          background: "#FFFFFF", // match body
          borderColor: "#E4EBF6",
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: "#4F8BCB" }}>
          G-M Assistant
        </h1>

        <p className="mt-1 text-sm" style={{ color: "#7A8FA8" }}>
          Ask about hostel fees, maintenance, clearance or rules.
        </p>
      </div>

      <div className="flex-grow min-h-0" style={{ background: "#FFFFFF" }}>
        <Chatbot />
      </div>
    </div>
  );
};

export default ChatbotPage;
