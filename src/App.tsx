import { useState, useEffect } from "react";
import { 
  Heart, 
  Wind, 
  Smile, 
  BookOpen, 
  AlertOctagon, 
  Sparkles, 
  Award, 
  Calendar,
  Layers,
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { Message, MoodLog, JournalEntry } from "./types";
import EmpathyChat from "./components/EmpathyChat";
import BreathingGuide from "./components/BreathingGuide";
import MoodSelector from "./components/MoodSelector";
import JournalSection from "./components/JournalSection";
import CrisisModal from "./components/CrisisModal";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"chat" | "breathe" | "mood" | "journal">("chat");

  // Local Persisted States
  const [messages, setMessages] = useState<Message[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [breathingMinutes, setBreathingMinutes] = useState<number>(0);

  // UI state
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isChatGenerating, setIsChatGenerating] = useState(false);
  const [recentAffirmation, setRecentAffirmation] = useState<string | null>(null);

  // Load state from LocalStorage on mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem("empathy_messages");
      if (storedMessages) setMessages(JSON.parse(storedMessages));

      const storedMoods = localStorage.getItem("empathy_moods");
      if (storedMoods) {
        const parsed = JSON.parse(storedMoods);
        setMoodLogs(parsed);
        if (parsed.length > 0) {
          // Set recent affirmation
          const lastAff = parsed[parsed.length - 1].affirmation;
          if (lastAff) setRecentAffirmation(lastAff);
        }
      }

      const storedJournals = localStorage.getItem("empathy_journals");
      if (storedJournals) setJournalEntries(JSON.parse(storedJournals));

      const storedStreak = localStorage.getItem("empathy_streak");
      if (storedStreak) setStreak(Number(storedStreak));

      const storedBreatheMinutes = localStorage.getItem("empathy_breathe_mins");
      if (storedBreatheMinutes) setBreathingMinutes(Number(storedBreatheMinutes));
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
  }, []);

  // Save states to LocalStorage
  const saveMessages = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    localStorage.setItem("empathy_messages", JSON.stringify(newMsgs));
  };

  const handleClearChat = () => {
    saveMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    saveMessages(updated);
    setIsChatGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updated }),
      });

      const data = await response.json();

      if (response.ok && data.content) {
        const replyMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          timestamp: new Date().toISOString(),
        };
        saveMessages([...updated, replyMsg]);
      } else {
        const fallbackMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm listening and I am deeply here with you. Please let me know how I can best support your reflections.",
          timestamp: new Date().toISOString(),
        };
        saveMessages([...updated, fallbackMsg]);
      }
    } catch (err) {
      console.error("Chat fetch error:", err);
      const fallbackMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm here for you. The space remains open, though I might be disconnected momentarily from my deeper network. Take a gentle breath with me.",
        timestamp: new Date().toISOString(),
      };
      saveMessages([...updated, fallbackMsg]);
    } finally {
      setIsChatGenerating(false);
      // Increment streak softly for taking time to chat
      updateStreak();
    }
  };

  // Log new Mood
  const handleLogMood = (moodData: { mood: string; intensity: number; explanation: string; affirmation?: string }) => {
    const newLog: MoodLog = {
      id: crypto.randomUUID(),
      mood: moodData.mood,
      intensity: moodData.intensity,
      explanation: moodData.explanation,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      affirmation: moodData.affirmation,
    };

    const updated = [newLog, ...moodLogs];
    setMoodLogs(updated);
    localStorage.setItem("empathy_moods", JSON.stringify(updated));

    if (moodData.affirmation) {
      setRecentAffirmation(moodData.affirmation);
    }
    updateStreak();
  };

  // Add Journal Entry
  const handleAddJournal = (entry: JournalEntry) => {
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem("empathy_journals", JSON.stringify(updated));
    updateStreak();
  };

  // Delete Journal Entry
  const handleDeleteJournal = (id: string) => {
    const updated = journalEntries.filter((j) => j.id !== id);
    setJournalEntries(updated);
    localStorage.setItem("empathy_journals", JSON.stringify(updated));
  };

  // Complete Breathing Session
  const handleCompleteBreathing = (pattern: string, durationMinutes: number) => {
    const newTotal = breathingMinutes + durationMinutes;
    setBreathingMinutes(newTotal);
    localStorage.setItem("empathy_breathe_mins", String(newTotal));
    updateStreak();
  };

  // Helper to safely bump and track streak
  const updateStreak = () => {
    // Check if streak was already bumped today
    const lastStreakUpdate = localStorage.getItem("empathy_streak_last_date");
    const todayStr = new Date().toDateString();

    if (lastStreakUpdate !== todayStr) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("empathy_streak", String(newStreak));
      localStorage.setItem("empathy_streak_last_date", todayStr);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#191c1e] flex flex-col font-sans select-none antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#eceef0] py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#134e4a] to-[#2dd4bf] flex items-center justify-center text-white shadow-md">
            <Heart className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base md:text-lg tracking-tight text-[#134e4a]">Empathy Support</h1>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium">Your safe space for emotional clarity</p>
          </div>
        </div>

        {/* Support Streaks Display */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#eceef0]/60 px-3.5 py-1.5 rounded-full border border-[#eceef0]">
            <Award className="w-4 h-4 text-[#ff725e]" />
            <span className="text-xs font-semibold text-[#134e4a]">
              Streak: <strong className="font-bold">{streak} days</strong>
            </span>
          </div>
          {breathingMinutes > 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-[#b5ede7]/20 px-3.5 py-1.5 rounded-full border border-[#9ad1cb]/30">
              <Wind className="w-4 h-4 text-[#2dd4bf]" />
              <span className="text-xs font-semibold text-[#134e4a]">
                Breathing: <strong className="font-bold">{breathingMinutes} min</strong>
              </span>
            </div>
          )}
          
          {/* Crisis Trigger button */}
          <button
            onClick={() => setIsCrisisOpen(true)}
            className="bg-[#E11D48] hover:bg-[#E11D48]/95 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-102"
          >
            <AlertOctagon className="w-4 h-4" />
            🚨 Help
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8">
        
        {/* Dynamic Affirmation Banner */}
        {recentAffirmation && (
          <div className="bg-gradient-to-r from-[#134e4a]/5 via-[#2dd4bf]/5 to-[#ff725e]/5 border border-[#9ad1cb]/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm relative overflow-hidden max-w-3xl mx-auto w-full">
            <Sparkles className="w-5 h-5 text-[#ff725e] shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="text-[10px] bg-[#ff725e]/10 text-[#700703] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Your Current Affirmation
              </span>
              <p className="text-sm italic font-medium text-[#134e4a] leading-relaxed pt-1">
                "{recentAffirmation}"
              </p>
            </div>
          </div>
        )}

        {/* Tab navigation bar */}
        <div className="flex bg-[#eceef0] p-1 rounded-2xl max-w-xl mx-auto w-full justify-around shadow-sm font-semibold text-xs md:text-sm">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all w-full justify-center cursor-pointer ${
              activeTab === "chat"
                ? "bg-white text-[#134e4a] shadow-sm font-bold"
                : "text-[#64748B] hover:text-[#191c1e]"
            }`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span>Companion</span>
          </button>

          <button
            onClick={() => setActiveTab("breathe")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all w-full justify-center cursor-pointer ${
              activeTab === "breathe"
                ? "bg-white text-[#134e4a] shadow-sm font-bold"
                : "text-[#64748B] hover:text-[#191c1e]"
            }`}
          >
            <Wind className="w-4 h-4 shrink-0" />
            <span>Breath</span>
          </button>

          <button
            onClick={() => setActiveTab("mood")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all w-full justify-center cursor-pointer ${
              activeTab === "mood"
                ? "bg-white text-[#134e4a] shadow-sm font-bold"
                : "text-[#64748B] hover:text-[#191c1e]"
            }`}
          >
            <Smile className="w-4 h-4 shrink-0" />
            <span>Check In</span>
          </button>

          <button
            onClick={() => setActiveTab("journal")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all w-full justify-center cursor-pointer ${
              activeTab === "journal"
                ? "bg-white text-[#134e4a] shadow-sm font-bold"
                : "text-[#64748B] hover:text-[#191c1e]"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Journal</span>
          </button>
        </div>

        {/* Active Tab Component Display */}
        <div className="flex-1 flex flex-col justify-center">
          {activeTab === "chat" && (
            <EmpathyChat 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isGenerating={isChatGenerating} 
              onClearHistory={handleClearChat}
            />
          )}

          {activeTab === "breathe" && (
            <BreathingGuide onCompleteSession={handleCompleteBreathing} />
          )}

          {activeTab === "mood" && (
            <div className="space-y-8">
              <MoodSelector onLogMood={handleLogMood} />
              
              {/* Mood History Grid */}
              {moodLogs.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#eceef0] p-6 shadow-sm max-w-xl mx-auto w-full">
                  <h3 className="font-display font-semibold text-sm text-[#134e4a] mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#ff725e]" />
                    Previous Check-ins
                  </h3>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {moodLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-3 rounded-xl border border-slate-50 bg-slate-50/50 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#134e4a] capitalize">{log.mood}</span>
                          <span className="text-slate-400 text-[10px]">{log.date} at {log.time}</span>
                        </div>
                        {log.explanation && (
                          <p className="text-slate-600 mt-1 italic">"{log.explanation}"</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Intensity:</span>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`h-2 w-2 rounded-full ${
                                  i < log.intensity ? "bg-[#ff725e]" : "bg-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "journal" && (
            <JournalSection 
              entries={journalEntries} 
              onAddEntry={handleAddJournal} 
              onDeleteEntry={handleDeleteJournal} 
            />
          )}
        </div>
      </main>

      {/* Persistent Bottom Wellness Tips Footer */}
      <footer className="border-t border-[#eceef0] py-6 px-4 bg-white text-center text-xs text-slate-400 mt-12 space-y-2">
        <p className="font-medium text-[#134e4a]/70">
          “You are allowed to be both a masterpiece and a work in progress, simultaneously.”
        </p>
        <p className="text-[10px]">
          Always non-clinical, supportive assistance. If you are experiencing a true emergency, please access our crisis help support.
        </p>
      </footer>

      {/* Immediate Crisis Drawer Modal */}
      <CrisisModal isOpen={isCrisisOpen} onClose={() => setIsCrisisOpen(false)} />
    </div>
  );
}
