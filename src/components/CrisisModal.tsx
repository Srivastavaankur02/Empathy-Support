import { AlertTriangle, Phone, Globe, ShieldAlert, Heart, X, Check } from "lucide-react";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESOURCES = [
  {
    title: "National Suicide Prevention Lifeline (US)",
    desc: "Free, confidential, 24/7 support for anyone in distress.",
    number: "988",
    action: "Call 988",
    link: "tel:988"
  },
  {
    title: "The Crisis Text Line",
    desc: "Text 24/7 with a trained volunteer crisis counselor.",
    number: "741741",
    action: "Text HOME to 741741",
    link: "sms:741741"
  },
  {
    title: "International Resources Finder",
    desc: "Locate professional support services in your country.",
    number: "Befrienders Worldwide",
    action: "Find resources",
    link: "https://www.befrienders.org/"
  },
  {
    title: "The Trevor Project (LGBTQ+)",
    desc: "Support and advice specifically for LGBTQ+ young people.",
    number: "1-866-488-7386",
    action: "Call Counselor",
    link: "tel:1-866-488-7386"
  }
];

export default function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-white rounded-2xl border-2 border-rose-100 shadow-2xl relative max-w-lg w-full z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Urgent Header Banner */}
        <div className="bg-[#E11D48] text-white p-5 flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-full">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg">Immediate Crisis Support</h3>
            <p className="text-xs text-rose-100 font-medium">Please connect with professional support if you feel unsafe.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            You are not alone. There are compassionate professionals and active listeners standing by right now, entirely free of charge and completely confidential.
          </p>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {RESOURCES.map((r, i) => (
              <div 
                key={i}
                className="p-4 rounded-xl border border-rose-50 bg-rose-50/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-rose-50/40 transition-all"
              >
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 tracking-wide">{r.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{r.desc}</p>
                </div>
                <a 
                  href={r.link}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white text-[11px] font-bold px-4 py-2 rounded-full text-center transition-all shadow-sm"
                >
                  {r.action}
                </a>
              </div>
            ))}
          </div>

          {/* Quick Grounding Exercise */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex gap-3">
            <Heart className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-slate-800">Quick Breathing Grounding</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Try sitting comfortably, placing one hand on your belly. Inhale slowly for 4 seconds, hold for 4 seconds, and exhale completely for 6 seconds. Repeat three times.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer px-4 py-2 rounded-full border border-slate-200 bg-white"
          >
            Close Support Resources
          </button>
        </div>
      </div>
    </div>
  );
}
