import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Wind, Sparkles, Award } from "lucide-react";

interface BreathingGuideProps {
  onCompleteSession: (pattern: string, durationMinutes: number) => void;
}

type Mode = "idle" | "inhale" | "hold" | "exhale" | "holdPost";

export default function BreathingGuide({ onCompleteSession }: BreathingGuideProps) {
  const [pattern, setPattern] = useState<"calm" | "energy" | "balanced">("calm");
  const [isActive, setIsActive] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>("idle");
  const [cycleTime, setCycleTime] = useState(0); // time in current state
  const [totalSeconds, setTotalSeconds] = useState(0); // overall session length
  const [completedCycles, setCompletedCycles] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pattern parameters in seconds: [inhale, hold, exhale, holdPost]
  const patterns = {
    calm: {
      name: "4-7-8 Deep Calm",
      description: "Restores tranquility and helps soothe nervous anxiety.",
      timings: { inhale: 4, hold: 7, exhale: 8, holdPost: 0 },
      color: "from-teal-500/30 to-emerald-500/30",
      accent: "#2DD4BF"
    },
    balanced: {
      name: "Coherent Flow (5-5)",
      description: "Brings body and mind into positive resonance.",
      timings: { inhale: 5, hold: 0, exhale: 5, holdPost: 0 },
      color: "from-sky-500/30 to-teal-500/30",
      accent: "#38BDF8"
    },
    energy: {
      name: "Energizing Lift (2-2)",
      description: "A fast, clarifying cycle to clear sluggishness and restore focus.",
      timings: { inhale: 2, hold: 0, exhale: 2, holdPost: 0 },
      color: "from-amber-500/30 to-coral-500/30",
      accent: "#FF725E"
    }
  };

  const activePattern = patterns[pattern];

  // Transition engine
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Set initial phase if we just started
    if (currentMode === "idle") {
      setCurrentMode("inhale");
      setCycleTime(activePattern.timings.inhale);
    }

    timerRef.current = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
      setCycleTime((prevTime) => {
        if (prevTime <= 1) {
          // Transition to the next phase
          let nextMode: Mode = "inhale";
          let nextDuration = 0;

          if (currentMode === "inhale") {
            if (activePattern.timings.hold > 0) {
              nextMode = "hold";
              nextDuration = activePattern.timings.hold;
            } else {
              nextMode = "exhale";
              nextDuration = activePattern.timings.exhale;
            }
          } else if (currentMode === "hold") {
            nextMode = "exhale";
            nextDuration = activePattern.timings.exhale;
          } else if (currentMode === "exhale") {
            if (activePattern.timings.holdPost > 0) {
              nextMode = "holdPost";
              nextDuration = activePattern.timings.holdPost;
            } else {
              nextMode = "inhale";
              nextDuration = activePattern.timings.inhale;
              setCompletedCycles((c) => c + 1);
            }
          } else if (currentMode === "holdPost") {
            nextMode = "inhale";
            nextDuration = activePattern.timings.inhale;
            setCompletedCycles((c) => c + 1);
          }

          setCurrentMode(nextMode);
          return nextDuration;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, currentMode, pattern]);

  const toggleSession = () => {
    setIsActive(!isActive);
  };

  const resetSession = () => {
    setIsActive(false);
    setCurrentMode("idle");
    setCycleTime(0);
    if (totalSeconds >= 10) {
      // Reward completed minutes
      onCompleteSession(pattern, Math.round(totalSeconds / 60) || 1);
    }
    setTotalSeconds(0);
    setCompletedCycles(0);
  };

  // Determine scaling multiplier for visual circle
  let scaleValue = 1.0;
  if (isActive) {
    if (currentMode === "inhale") {
      const elapsed = activePattern.timings.inhale - cycleTime;
      scaleValue = 1.0 + (elapsed / activePattern.timings.inhale) * 0.7; // expand to 1.7
    } else if (currentMode === "hold") {
      scaleValue = 1.7; // keep expanded
    } else if (currentMode === "exhale") {
      scaleValue = 1.7 - ((activePattern.timings.exhale - cycleTime) / activePattern.timings.exhale) * 0.7; // shrink back to 1.0
    } else if (currentMode === "holdPost") {
      scaleValue = 1.0; // keep small
    }
  }

  // Text status helper
  const getActionText = () => {
    switch (currentMode) {
      case "inhale":
        return "Breathe In deeply...";
      case "hold":
        return "Gentle hold...";
      case "exhale":
        return "Exhale slowly...";
      case "holdPost":
        return "Hold empty...";
      default:
        return "Ready to begin";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eceef0] p-6 shadow-sm flex flex-col items-center max-w-xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-2">
        <Wind className="w-5 h-5 text-[#2dd4bf]" />
        <h2 className="font-display font-semibold text-xl text-[#191c1e]">Guided Breathing</h2>
      </div>
      <p className="text-sm text-[#404847] text-center mb-6">
        Sync your breath to calm the nervous system or restore vital focus.
      </p>

      {/* Select Pattern Pills */}
      {!isActive && (
        <div className="flex bg-[#f2f4f6] p-1.5 rounded-full mb-6 w-full max-w-sm justify-around">
          {(["calm", "balanced", "energy"] as const).map((pat) => (
            <button
              key={pat}
              onClick={() => setPattern(pat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                pattern === pat
                  ? "bg-[#134e4a] text-white shadow-sm"
                  : "text-[#404847] hover:text-[#191c1e]"
              }`}
            >
              {pat.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Pattern details */}
      <div className="text-center h-12 mb-4">
        <h3 className="font-display font-semibold text-[#134e4a] text-base">{activePattern.name}</h3>
        <p className="text-xs text-[#64748B] max-w-xs mx-auto">{activePattern.description}</p>
      </div>

      {/* Visual Breathing Ring */}
      <div className="relative h-64 w-64 flex items-center justify-center my-6">
        {/* Glowing backdrop layer */}
        <motion.div
          animate={{
            scale: scaleValue,
            opacity: isActive ? [0.4, 0.6, 0.4] : 0.2,
          }}
          transition={{
            scale: { duration: isActive ? 1.1 : 0.5, ease: "easeInOut" },
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className={`absolute inset-4 rounded-full bg-gradient-to-br ${activePattern.color} blur-2xl`}
        />

        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border border-[#eceef0]/60 flex items-center justify-center" />

        {/* Breathing Orb */}
        <motion.div
          animate={{ scale: scaleValue }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ borderColor: activePattern.accent }}
          className="absolute h-40 w-40 rounded-full bg-gradient-to-tr from-[#134e4a]/10 via-white to-[#2dd4bf]/20 border-2 shadow-inner flex flex-col items-center justify-center text-center p-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode + cycleTime}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <span className="text-2xl font-display font-bold text-[#134e4a]">
                {isActive ? `${cycleTime}s` : "•"}
              </span>
              <span className="text-xs font-medium text-[#404847] mt-1">
                {getActionText()}
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Session Tracker */}
      <div className="flex gap-8 justify-center w-full mb-6 text-center text-sm">
        <div>
          <span className="block text-xs text-[#64748B]">Duration</span>
          <span className="font-mono font-bold text-[#134e4a]">
            {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <div>
          <span className="block text-xs text-[#64748B]">Cycles</span>
          <span className="font-mono font-bold text-[#134e4a]">{completedCycles}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 justify-center">
        <button
          onClick={toggleSession}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
            isActive
              ? "bg-[#eceef0] text-[#191c1e] hover:bg-[#e0e3e5]"
              : "bg-[#ff725e] text-white hover:bg-[#ff725e]/90 shadow-md hover:shadow-lg hover:scale-105"
          }`}
        >
          {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {(isActive || totalSeconds > 0) && (
          <button
            onClick={resetSession}
            title="Complete & reset session"
            className="h-10 w-10 rounded-full border border-[#eceef0] flex items-center justify-center text-[#404847] hover:bg-[#f2f4f6] hover:text-[#191c1e] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Completion Reward Chip */}
      {totalSeconds > 10 && !isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 flex items-center gap-2 bg-[#b5ede7]/30 border border-[#9ad1cb] px-4 py-2 rounded-xl text-xs font-semibold text-[#00201e]"
        >
          <Award className="w-4 h-4 text-[#134e4a]" />
          <span>Complete session to log {Math.round(totalSeconds / 60) || 1} min to your daily streak!</span>
        </motion.div>
      )}
    </div>
  );
}
