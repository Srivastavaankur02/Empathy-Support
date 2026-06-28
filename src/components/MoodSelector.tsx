import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smile, Frown, Activity, CloudRain, Sun, Flame, Sparkles, Loader2, Heart, Check } from "lucide-react";

interface MoodSelectorProps {
  onLogMood: (moodData: { mood: string; intensity: number; explanation: string; affirmation?: string }) => void;
}

const MOOD_OPTIONS = [
  { name: "Peaceful", icon: Sun, color: "bg-emerald-50 border-emerald-200 text-emerald-700 active:bg-emerald-100", accent: "#10B981" },
  { name: "Anxious", icon: Activity, color: "bg-teal-50 border-teal-200 text-teal-700 active:bg-teal-100", accent: "#134E4A" },
  { name: "Overwhelmed", icon: Flame, color: "bg-orange-50 border-orange-200 text-orange-700 active:bg-orange-100", accent: "#FF725E" },
  { name: "Sad", icon: CloudRain, color: "bg-sky-50 border-sky-200 text-sky-700 active:bg-sky-100", accent: "#38BDF8" },
  { name: "Hopeful", icon: Smile, color: "bg-amber-50 border-amber-200 text-amber-700 active:bg-amber-100", accent: "#F59E0B" },
  { name: "Frustrated", icon: Frown, color: "bg-rose-50 border-rose-200 text-rose-700 active:bg-rose-100", accent: "#E11D48" },
];

export default function MoodSelector({ onLogMood }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const [explanation, setExplanation] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAffirmation, setGeneratedAffirmation] = useState<string | null>(null);
  const [justLogged, setJustLogged] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setIsGenerating(true);
    setGeneratedAffirmation(null);

    try {
      const response = await fetch("/api/affirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: selectedMood,
          explanation: explanation,
        }),
      });

      const data = await response.json();
      if (response.ok && data.affirmation) {
        setGeneratedAffirmation(data.affirmation);
        // Dispatch mood logging with affirmation
        onLogMood({
          mood: selectedMood,
          intensity,
          explanation,
          affirmation: data.affirmation,
        });
      } else {
        // Fallback response
        const fallback = "You are worthy of care, patience, and warmth. Breathe deeply through this moment.";
        setGeneratedAffirmation(fallback);
        onLogMood({
          mood: selectedMood,
          intensity,
          explanation,
          affirmation: fallback,
        });
      }
    } catch (err) {
      console.error(err);
      const fallback = "Your feelings are valid and normal. Give yourself the space to breathe and just be.";
      setGeneratedAffirmation(fallback);
      onLogMood({
        mood: selectedMood,
        intensity,
        explanation,
        affirmation: fallback,
      });
    } finally {
      setIsGenerating(false);
      setJustLogged(true);
      // Clean form fields
      setExplanation("");
    }
  };

  const handleReset = () => {
    setSelectedMood(null);
    setIntensity(3);
    setGeneratedAffirmation(null);
    setJustLogged(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eceef0] p-6 shadow-sm max-w-xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-5 h-5 text-[#ff725e]" />
        <h2 className="font-display font-semibold text-xl text-[#191c1e]">How are you feeling right now?</h2>
      </div>
      <p className="text-sm text-[#64748B] mb-6">
        Tune in to your current mental and emotional wavelength. We will offer a personalized affirmation.
      </p>

      <AnimatePresence mode="wait">
        {!justLogged ? (
          <motion.form
            key="mood-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Mood selector grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOOD_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedMood === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setSelectedMood(opt.name)}
                    style={{ borderColor: isSelected ? opt.accent : undefined }}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center gap-2 cursor-pointer ${
                      isSelected
                        ? `${opt.color} shadow-sm scale-[1.03]`
                        : "border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50/50"
                    }`}
                  >
                    <Icon className="w-6 h-6" style={{ color: opt.accent }} />
                    <span className="text-xs font-semibold tracking-wide">{opt.name}</span>
                  </button>
                );
              })}
            </div>

            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 pt-2"
              >
                {/* Intensity selector */}
                <div>
                  <label className="flex justify-between items-center text-xs font-semibold text-[#404847] mb-2">
                    <span>Intensity Level: {intensity} / 5</span>
                    <span className="font-medium text-slate-400">
                      {intensity <= 2 ? "Mild" : intensity <= 4 ? "Moderate" : "Intense"}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-[#f2f4f6] rounded-lg appearance-none cursor-pointer accent-[#ff725e]"
                  />
                </div>

                {/* Explanation text */}
                <div>
                  <label className="block text-xs font-semibold text-[#404847] mb-2">
                    Add a brief thought (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="E.g., feeling stressed about upcoming work, or just taking a deep breath after a long day..."
                    className="w-full text-sm rounded-xl border border-slate-200 bg-[#f8fafc] p-3 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/40 focus:border-[#2dd4bf] placeholder:text-slate-400 transition-all"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full h-11 bg-[#ff725e] hover:bg-[#ff725e]/90 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Affirmation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current text-amber-200" />
                      Log Mood & Generate Affirmation
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.form>
        ) : (
          <motion.div
            key="affirmation-result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center py-4 space-y-6"
          >
            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200 text-emerald-600">
              <Check className="w-6 h-6" />
            </div>

            <div className="text-center">
              <span className="text-xs bg-[#b5ede7] text-[#00201e] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Daily Log Recorded
              </span>
              <p className="text-sm text-slate-500 mt-2">Here is your customized support statement:</p>
            </div>

            {/* Generated Affirmation Card */}
            <div className="bg-gradient-to-tr from-[#134e4a]/5 via-[#2dd4bf]/5 to-[#ff725e]/5 border border-[#9ad1cb]/30 rounded-2xl p-6 text-center max-w-md w-full relative overflow-hidden shadow-inner">
              <Sparkles className="absolute top-3 left-3 w-4 h-4 text-[#2dd4bf]/60" />
              <Sparkles className="absolute bottom-3 right-3 w-4 h-4 text-[#ff725e]/60" />
              <p className="font-display font-medium text-lg leading-relaxed text-[#134e4a] italic">
                "{generatedAffirmation}"
              </p>
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-semibold text-[#134e4a] hover:text-[#2dd4bf] border-b border-[#134e4a]/30 hover:border-[#2dd4bf] transition-all pb-0.5 cursor-pointer"
            >
              Log another feeling or check in again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
