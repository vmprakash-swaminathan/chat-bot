"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Zap, Sparkles, Code, PenTool } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function NexusAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const userMessage = customInput || input.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.reply || "Failed to fetch response");
      }

      setMessages(prev => [...prev, { role: "bot", content: data.reply }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: "bot", content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Main Area */}
      <main className="main-area">

        {/* Chat Section */}
        <div className="chat-section">
          {messages.length === 0 ? (
            <div className="chat-content-max">
              <h1 className="hero-title">How can I help you today?</h1>
              <div className="bento-grid">
                <div className="action-card" onClick={() => handleSubmit(undefined, "Help me brainstorm some creative ideas for my new project.")}>
                  <div className="card-icon"><Sparkles size={20} /></div>
                  <div className="card-title">Brainstorm</div>
                  <div className="card-desc">Generate creative ideas, outlines, and unique concepts.</div>
                </div>
                <div className="action-card" onClick={() => handleSubmit(undefined, "Can you help me write a Python script for data analysis?")}>
                  <div className="card-icon"><Code size={20} /></div>
                  <div className="card-title">Write Code</div>
                  <div className="card-desc">Get assistance with programming, debugging, and scripts.</div>
                </div>
                <div className="action-card" onClick={() => handleSubmit(undefined, "Write a professional email to my boss asking for feedback.")}>
                  <div className="card-icon"><PenTool size={20} /></div>
                  <div className="card-title">Draft Content</div>
                  <div className="card-desc">Create professional emails, essays, or blog posts.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-content-max">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role} ${msg.role === 'bot' ? 'markdown-body' : ''}`}>
                  {msg.role === "bot" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  Typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="input-footer">
          <form className="input-container" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
            />
            <div className="action-group">

              <button type="submit" className="send-btn" disabled={!input.trim() || isLoading}>
                <Send size={18} />
              </button>
            </div>
          </form>
          <div className="disclaimer">
            Nexus AI can make mistakes. Please verify important information.
          </div>
        </div>
      </main>
    </div>
  );
}
