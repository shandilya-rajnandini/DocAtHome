import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Heart,
} from "lucide-react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! I'm your Doc@Home medical assistant. How can I help you with your healthcare needs today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const toggleChat = () => {
    if (open) {
      setIsAnimating(true);
      setTimeout(() => {
        setOpen(false);
        setIsAnimating(false);
      }, 250);
    } else {
      setOpen(true);
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || trimmedInput.length > 1000) return;

    const userMessage = {
      from: "user",
      text: trimmedInput,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview",
      });
      const result = await model.generateContent(trimmedInput);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0)
        throw new Error("Empty response from AI");

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: text.trim(),
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: err.message?.includes("API key")
            ? "Configuration error. Please contact support."
            : "I’m having trouble responding right now. Please try again shortly.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={toggleChat}
          className="group bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-full text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out animate-pulse hover:animate-none"
          aria-label="Open medical chat"
        >
          <Heart className="w-6 h-6" />
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-400 rounded-full"></div>
        </button>
      )}

      {(open || isAnimating) && (
        <div
          className={`w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 ease-out transform origin-bottom-right ${
            open && !isAnimating
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-2"
          }`}
          onWheel={(e) => {
            e.stopPropagation();
            const messagesContainer = e.currentTarget.querySelector(
              "[data-messages-container]",
            );
            if (messagesContainer && messagesContainer.contains(e.target)) {
              return;
            }
            e.preventDefault();
          }}
        >
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-lg">
                  Doc@Home Assistant
                </span>
                <div className="text-xs opacity-90 flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  <span>Healthcare Support Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            data-messages-container
            className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96 min-h-80 bg-gradient-to-b from-gray-50 to-white scrollbar-thin scrollbar-thumb-gray-300"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  msg.from === "user" ? "flex-row-reverse space-x-reverse" : ""
                } animate-in slide-in-from-bottom-3 fade-in duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.from === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  }`}
                >
                  {msg.from === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`flex flex-col max-w-xs ${
                    msg.from === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed transition-all duration-200 hover:shadow-md border ${
                      msg.from === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-md"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm border-emerald-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3 animate-in slide-in-from-bottom-3 fade-in duration-300">
                <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-2xl rounded-bl-md animate-pulse shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-emerald-600">
                      Analyzing your query...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your healthcare concern..."
                  className="w-full text-gray-800 placeholder-gray-500 p-3 pr-12 text-sm bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all max-h-32 min-h-[44px]"
                  rows="2"
                  style={{
                    height: "auto",
                    minHeight: "44px",
                    maxHeight: "128px",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 128) + "px";
                  }}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line •{" "}
              <span className="text-emerald-600">Confidential & Secure</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
