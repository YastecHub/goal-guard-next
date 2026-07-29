'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore, Persona } from '@/lib/store';
import { ShieldAlert, X, Volume2, VolumeX, ArrowRight } from 'lucide-react';

function buildPersonaText(
  personas: Record<Persona, string>,
  persona: Persona,
  amount: number,
  currentAmount: number,
  originalAmount: number
): string {
  const base = personas[persona] || personas.english;
  if (currentAmount === originalAmount) return base;
  // Re-interpolate for slider value
  const ratio = currentAmount / originalAmount;
  return base.replace(
    /₦[\d,]+ CNGN/g,
    (match) => {
      const raw = parseInt(match.replace(/[₦,\sCGN]/g, ''));
      return `₦${Math.round(raw * ratio).toLocaleString()} CNGN`;
    }
  );
}

export default function InterceptModal() {
  const {
    isInterceptOpen, closeIntercept,
    pendingTransfer, persona,
    vaults, executeAdjusted, executeFull, cancelTransfer,
  } = useStore();

  const [sliderVal, setSliderVal] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') synth.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    if (pendingTransfer) setSliderVal(pendingTransfer.amount);
  }, [pendingTransfer]);

  // Compute live metrics from slider
  const activeVault = vaults.find((v) => v.saved < v.target);
  const dailyRate = activeVault
    ? Math.ceil((activeVault.target - activeVault.saved) / activeVault.days)
    : 1000;
  const liveDelayDays = Math.max(1, Math.ceil(sliderVal / (dailyRate || 1000)));
  const liveSuggested = Math.max(500, Math.round((sliderVal * 0.48) / 100) * 100);
  const currPct = activeVault ? Math.round((activeVault.saved / activeVault.target) * 100) : 0;
  const projPct = activeVault
    ? Math.max(0, Math.round(((activeVault.saved - sliderVal * 0.25) / activeVault.target) * 100))
    : 0;

  const narrativeText = pendingTransfer?.evalResult?.personas
    ? buildPersonaText(
        pendingTransfer.evalResult.personas,
        persona,
        pendingTransfer.amount,
        sliderVal,
        pendingTransfer.amount
      )
    : pendingTransfer?.evalResult?.tradeOffText ?? '';

  const speak = useCallback(() => {
    if (!synth.current) return;
    if (synth.current.speaking) {
      synth.current.cancel();
      setIsSpeaking(false);
      return;
    }
    const utt = new SpeechSynthesisUtterance(narrativeText);
    utt.rate = 1;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    synth.current.speak(utt);
  }, [narrativeText]);

  const handleClose = () => {
    synth.current?.cancel();
    setIsSpeaking(false);
    closeIntercept();
  };

  if (!isInterceptOpen || !pendingTransfer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Amber glow accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
              <ShieldAlert size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-white font-bold text-base">GoalGuard Copilot Alert</h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full">
                  AI Intercept
                </span>
              </div>
              <p className="text-slate-500 text-xs">Pause & reflect before sending</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* AI Narrative */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                AI Trade-off Explanation
              </p>
              <button
                onClick={speak}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  isSpeaking
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'
                }`}
              >
                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                {isSpeaking ? 'Stop' : 'Listen'}
              </button>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <p className="text-slate-200 text-sm leading-relaxed">{narrativeText}</p>
            </div>
          </div>

          {/* Live Slider */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold">Adjust Amount Live:</span>
              <span className="text-emerald-400 font-bold text-sm">₦{sliderVal.toLocaleString()} CNGN</span>
            </div>

            <input
              type="range"
              min={1000}
              max={Math.max(50000, pendingTransfer.amount * 2)}
              step={500}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 rounded-lg p-2.5">
                <p className="text-slate-500 mb-1">Goal Delay</p>
                <p className="text-amber-400 font-bold">+{liveDelayDays} days</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-2.5">
                <p className="text-slate-500 mb-1">Vault Impact</p>
                <p className="text-white font-bold">{currPct}% → {projPct}%</p>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-slate-600 text-xs flex items-center gap-1.5">
            <ShieldAlert size={10} />
            Privacy Shield: PII stripped. AI processed transaction metadata only.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-5 space-y-2.5">
          {/* Option 1: Recommended — send suggested amount */}
          <button
            onClick={executeAdjusted}
            className="w-full flex items-center justify-between bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 group"
          >
            <div>
              <p className="text-sm">Send ₦{(pendingTransfer.evalResult?.suggestedAmount ?? liveSuggested).toLocaleString()} CNGN Instead</p>
              <p className="text-emerald-300/70 text-xs font-normal mt-0.5">
                Saves ₦{((pendingTransfer.amount) - (pendingTransfer.evalResult?.suggestedAmount ?? liveSuggested)).toLocaleString()} → auto-added to vault
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Option 2: Proceed with full amount */}
          <button
            onClick={executeFull}
            className="w-full py-3 px-5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold text-sm transition-all"
          >
            Proceed with ₦{pendingTransfer.amount.toLocaleString()} CNGN
          </button>

          {/* Option 3: Cancel */}
          <button
            onClick={cancelTransfer}
            className="w-full py-2.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Cancel Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
