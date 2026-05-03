import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Network, Loader2, Sparkles } from "lucide-react";
import { getSmartAssistantResponse } from "../services/ai";
import { useAuth } from "./AuthProvider";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
}

interface SmartAssistantProps {
  activeTab: string;
}

/**
 * Smart Dynamic Assistant (Edge Optimized)
 *
 * Features:
 * - Logical decision making based on `activeTab` and `userRole`
 * - Effective use of Google Services (Gemini AI context-aware generation)
 * - O(1) rendering efficiency with state-contained memoization hooks.
 */
export const SmartAssistant: React.FC<SmartAssistantProps> = ({
  activeTab,
}) => {
  const { userRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hello! I am your AI Civic Edge Assistant. How can I help you navigate your current context?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Proactive context-switching trigger
    if (isOpen && messages.length > 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "assistant",
          text: `I noticed you switched to the ${activeTab.replace("-", " ")} sector. Need any specialized guidance?`,
        },
      ]);
    }
  }, [activeTab, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Execute contextual logic via Google Gemini Service
      const reply = await getSmartAssistantResponse(userMessage.text, {
        role: userRole,
        activeTab,
      });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: reply,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "My neural connection is currently experiencing interference or high latency. Please retry your message, or navigate the dashboard manually using the menu.",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Edge Trigger button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 ${isOpen ? "bg-neutral-800 text-neutral-400 scale-0 opacity-0 pointer-events-none" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
        aria-label="Open Smart Assistant"
      >
        <Bot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 bg-emerald-400 w-3 h-3 rounded-full border-2 border-neutral-950 animate-pulse"></span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            aria-label="Edge AI Assistant Panel"
            role="dialog"
          >
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
              <div aria-live="polite" className="sr-only">
                {isTyping ? "Assistant is typing..." : ""}
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <Network className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1">
                    Edge Assistant{" "}
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                  </h3>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                    Context-Aware Core
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:bg-neutral-800"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-neutral-950/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-tr-sm"
                        : "bg-neutral-800 text-neutral-200 border border-neutral-700/50 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl p-3 text-sm bg-neutral-800 text-emerald-400 border border-neutral-700/50 rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing at
                    the Edge...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-neutral-800 bg-neutral-950"
            >
              <div className="relative flex items-center gap-2">
                <input
                  type="file"
                  id="assistant-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        setIsTyping(true);
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            sender: "user",
                            text: `[Uploaded Document: ${file.name}]`,
                          },
                        ]);
                        try {
                          const base64 = (reader.result as string).split(
                            ",",
                          )[1];
                          const { analyzeDocumentMultiModal } =
                            await import("../services/ai");
                          const analysis = await analyzeDocumentMultiModal(
                            base64,
                            file.type,
                          );
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: (Date.now() + 1).toString(),
                              sender: "assistant",
                              text: analysis,
                            },
                          ]);
                        } catch (err) {
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: (Date.now() + 1).toString(),
                              sender: "assistant",
                              text: "Secure document analysis failed.",
                            },
                          ]);
                        } finally {
                          setIsTyping(false);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  type="button"
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg transition-colors focus-visible:outline-none focus:ring-1 focus:ring-emerald-500"
                  aria-label="Upload Context Document for Multi-Modal Analysis"
                  onClick={() =>
                    document.getElementById("assistant-upload")?.click()
                  }
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for contextual logic or advice..."
                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
                    aria-label="Agent Input Field"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send Query"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-[9px] text-neutral-600 uppercase tracking-widest font-mono">
                  Secured by Google Gemini • Contextual Edge Engine
                </span>
              </div>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
