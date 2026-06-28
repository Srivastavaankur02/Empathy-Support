import React, { useState, useRef, useEffect, FormEvent } from "react";
import { Send, Heart, Sparkles, RefreshCw, Smile, AlertCircle, HelpCircle } from "lucide-react";
import { Message } from "../types";

const SUGGESTED_PROMPTS = [
  "I'm feeling really stressed about my workload.",
  "How can I practice self-compassion today?",
  "I just need someone to listen without judging.",
  "I feel stuck and overwhelmed by my thoughts.",
];

interface EmpathyChatProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isGenerating: boolean;
  onClearHistory: () => void;
}

export default function EmpathyChat({ messages, onSendMessage, isGenerating, onClearHistory }: EmpathyChatProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleSuggestedClick = (text: string) => {
    if (isGenerating) return;
    onSendMessage(text);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eceef0] shadow-sm flex flex-col h-[550px] max-w-2xl mx-auto w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#134e4a] to-[#2dd4bf] p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center border border-white/20 shadow-sm animate-pulse">
            <Heart className="w-5 h-5 text-amber-200 fill-amber-200" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm sm:text-base">Empathy Companion</h2>
            <p className="text-[10px] sm:text-xs text-teal-50 font-medium">Warm, safe, non-judgmental active listener</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[11px] font-bold tracking-wide flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Space
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4 py-8">
            <div className="h-12 w-12 bg-[#b5ede7]/20 border border-[#2dd4bf]/20 rounded-full flex items-center justify-center text-[#134e4a]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-display font-semibold text-slate-700 text-sm">Welcome to a space of quiet care</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Share anything that's on your mind. You will be heard, validated, and supported without any expectation.
            </p>

            <div className="w-full pt-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left mb-1">
                Tap to start a reflection
              </span>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestedClick(prompt)}
                  className="w-full text-left text-xs p-3 rounded-xl border border-slate-100 bg-white hover:bg-[#b5ede7]/10 hover:border-[#9ad1cb]/40 text-slate-600 transition-all shadow-sm cursor-pointer hover:translate-y-[-1px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => {
              const isAssistant = m.role === "assistant";
              return (
                <div
                  key={m.id}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"} items-end gap-2`}
                >
                  {isAssistant && (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#134e4a] to-[#2dd4bf] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                      EC
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                      isAssistant
                        ? "bg-white border border-[#eceef0] text-[#191c1e] rounded-bl-none"
                        : "bg-[#134e4a] text-white rounded-br-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isAssistant ? "text-slate-400" : "text-teal-200"
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex justify-start items-end gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#134e4a] to-[#2dd4bf] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                  EC
                </div>
                <div className="bg-white border border-[#eceef0] rounded-2xl rounded-bl-none p-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="h-2 w-2 rounded-full bg-[#ff725e] animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-2 w-2 rounded-full bg-[#2dd4bf] animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-2 w-2 rounded-full bg-[#134e4a] animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input panel */}
      <form onSubmit={handleSubmit} className="border-t border-[#eceef0] p-4 bg-white flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Write your response... 'I feel a bit better after breathing...'"
          disabled={isGenerating}
          className="flex-1 text-sm rounded-full border border-slate-200 px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/40 focus:border-[#2dd4bf] transition-all"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isGenerating}
          className="h-10 w-10 rounded-full bg-[#ff725e] hover:bg-[#ff725e]/90 text-white flex items-center justify-center transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
