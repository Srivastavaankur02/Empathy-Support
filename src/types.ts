export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO string
}

export interface MoodLog {
  id: string;
  mood: string; // "peaceful" | "anxious" | "sad" | "overwhelmed" | "hopeful" | "frustrated" | "neutral"
  intensity: number; // 1 to 5
  explanation: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  affirmation?: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  emotionTags?: string[];
  reflection?: string;
  gentlePrompt?: string;
  isAnalyzing?: boolean;
}

export interface BreathingSession {
  pattern: "calm" | "energy" | "balanced";
  durationSeconds: number; // e.g. 120 (2 mins)
  completedAt: string; // ISO string
}
