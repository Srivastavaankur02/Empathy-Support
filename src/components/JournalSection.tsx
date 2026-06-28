import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Calendar, HelpCircle, Loader2, Award, ChevronRight, PenTool, CheckCircle, Search, Trash2 } from "lucide-react";
import { JournalEntry } from "../types";

interface JournalSectionProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export default function JournalSection({ entries, onAddEntry, onDeleteEntry }: JournalSectionProps) {
  const [journalContent, setJournalContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "history">("write");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ journalText: journalContent }),
      });

      const analysis = await response.json();

      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        content: journalContent,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        emotionTags: analysis.emotionTags || ["Reflective"],
        reflection: analysis.reflection || "Thank you for letting your thoughts flow. Writing is a beautiful act of emotional centering.",
        gentlePrompt: analysis.gentlePrompt || "What is one small way you can bring ease to your day tomorrow?",
      };

      onAddEntry(newEntry);
      setJournalContent("");
      setActiveTab("history");
    } catch (err) {
      console.error("Failed to analyze journal:", err);
      // Fallback local entry
      const fallbackEntry: JournalEntry = {
        id: crypto.randomUUID(),
        content: journalContent,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        emotionTags: ["Expressive"],
        reflection: "Your willingness to put feelings into words is a step of genuine courage. Your emotions are valid.",
        gentlePrompt: "What does your body need most in this very moment?",
      };
      onAddEntry(fallbackEntry);
      setJournalContent("");
      setActiveTab("history");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.emotionTags && entry.emotionTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="bg-white rounded-2xl border border-[#eceef0] p-6 shadow-sm max-w-2xl mx-auto w-full">
      {/* Header Tabs */}
      <div className="flex justify-between items-center border-b border-[#eceef0] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#134e4a]" />
          <h2 className="font-display font-semibold text-xl text-[#191c1e]">Expressive Journal</h2>
        </div>
        <div className="flex bg-[#f2f4f6] p-1 rounded-full text-xs font-semibold">
          <button
            onClick={() => setActiveTab("write")}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "write" ? "bg-white text-[#134e4a] shadow-sm" : "text-[#64748B] hover:text-[#191c1e]"
            }`}
          >
            Reflect
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "history" ? "bg-white text-[#134e4a] shadow-sm" : "text-[#64748B] hover:text-[#191c1e]"
            }`}
          >
            History ({entries.length})
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "write" ? (
          <motion.form
            key="write-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <p className="text-sm text-[#404847]">
              Pour out your mind without fear of evaluation. Reflect on what is heavy, what is beautiful, or what is simple.
            </p>

            <div className="relative">
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Start writing here... 'Today felt a bit hectic but I managed to...'"
                rows={6}
                disabled={isAnalyzing}
                className="w-full text-sm rounded-2xl border border-slate-200 p-4 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/40 focus:border-[#2dd4bf] bg-[#f8fafc] placeholder:text-slate-400 transition-all resize-none leading-relaxed"
              />
              <PenTool className="absolute bottom-4 right-4 w-4 h-4 text-[#404847]/40" />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !journalContent.trim()}
              className="w-full h-11 bg-[#134e4a] hover:bg-[#134e4a]/90 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Empathic synthesis...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Reflection & Get Insight
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search Box */}
            {entries.length > 0 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search previous journals or emotion tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-100 bg-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            )}

            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-35 text-[#134e4a]" />
                <p className="text-sm font-medium">No journal entries found.</p>
                <p className="text-xs mt-1">Write your first reflection to seed your emotional landscape.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {filteredEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    className="p-4 rounded-2xl border border-[#eceef0] bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3 relative group"
                  >
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete journal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{entry.date} at {entry.time}</span>
                    </div>

                    <p className="text-sm text-[#191c1e] whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>

                    {/* Emotion tags */}
                    {entry.emotionTags && entry.emotionTags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Themes:</span>
                        {entry.emotionTags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#b5ede7]/30 border border-[#9ad1cb]/40 text-[#134e4a] text-[10px] px-2.5 py-0.5 rounded-full font-semibold capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Empathic Reflection result */}
                    {entry.reflection && (
                      <div className="bg-white rounded-xl border border-[#eceef0] p-4.5 space-y-2 mt-2 shadow-inner">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#134e4a]">
                          <Award className="w-4 h-4 text-[#ff725e]" />
                          <span>Empathic Synthesis</span>
                        </div>
                        <p className="text-xs text-[#404847] leading-relaxed italic">
                          "{entry.reflection}"
                        </p>

                        {entry.gentlePrompt && (
                          <div className="border-t border-[#eceef0] pt-2 mt-2 flex gap-2 items-start">
                            <HelpCircle className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-[#134e4a] font-medium">
                              <span className="font-bold">Mindfulness Prompt:</span> {entry.gentlePrompt}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
