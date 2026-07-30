'use client';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { confirmTransfer } from '@/lib/api';
import { ShieldAlert, X, Volume2, VolumeX, ArrowRight, CheckCircle2, Ban } from 'lucide-react';

export default function InterceptModal() {
  const {
    isInterceptOpen, closeIntercept,
    pendingTransfer, onboarding,
    vaults, executeAdjusted, executeFull, cancelTransfer,
    addTransaction, setBalance, balance,
  } = useStore();

  const [sliderVal, setSliderVal] = useState(0);
  const [confirming, setConfirming] = useState<'proceed' | 'adjust' | 'cancel' | null>(null);
  const [confirmError, setConfirmError] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') synth.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    if (pendingTransfer) setSliderVal(pendingTransfer.amount);
  }, [pendingTransfer]);

  const activeVault = vaults.find((v) => v.saved < v.target);
  const currPct = activeVault ? Math.round((activeVault.saved / activeVault.target) * 100) : 0;

  const tradeOffText = pendingTransfer?.evalResult?.tradeOffExplanation ?? '';
  const verdict = pendingTransfer?.evalResult?.verdict ?? 'intercept';
  const suggestedAmount = pendingTransfer?.evalResult?.suggestedAmount ?? 0;
  const goalDelayDays = pendingTransfer?.evalResult?.goalDelayDays ?? 0;
  const vaultImpact = pendingTransfer?.evalResult?.vaultImpact ?? { fromPercent: currPct, toPercent: currPct };
  const suggestedLabel = pendingTransfer?.evalResult?.suggestedLabel ?? `Send ₦${suggestedAmount.toLocaleString()} CNGN Instead`;

  const speak = () => {
    if (!synth.current) return;
    if (synth.current.speaking) {
      synth.current.cancel();
      setIsSpeaking(false);
      return;
    }
    const utt = new SpeechSynthesisUtterance(tradeOffText);
    utt.rate = 1;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    synth.current.speak(utt);
  };

  const handleConfirm = async (decision: 'proceed' | 'adjust' | 'cancel') => {
    if (!pendingTransfer) return;
    setConfirming(decision);
    setConfirmError('');
    try {
      const res = await confirmTransfer(onboarding.userId, {
        recipientAddress: pendingTransfer.recipientAddress,
        recipientName: pendingTransfer.recipientName,
        amount: decision === 'adjust' ? sliderVal : pendingTransfer.amount,
        category: pendingTransfer.category,
        decision,
      });

      if (res.success) {
        setConfirmSuccess(true);
        setTimeout(() => {
          if (decision === 'proceed') {
            executeFull();
          } else if (decision === 'adjust') {
            executeAdjusted();
          } else {
            cancelTransfer();
          }
          setConfirmSuccess(false);
        }, 800);
      }
    } catch (err: any) {
      setConfirmError(err.message || 'Confirmation failed');
    } finally {
      setConfirming(null);
    }
  };

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
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top accent */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${verdict === 'block' ? 'red' : verdict === 'allow' ? 'emerald' : 'amber'}-500/60 to-transparent`} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              verdict === 'block'
                ? 'bg-red-500/10 border-red-500/25'
                : verdict === 'allow'
                  ? 'bg-emerald-500/10 border-emerald-500/25'
                  : 'bg-amber-500/10 border-amber-500/25'
            }`}>
              {verdict === 'block' ? (
                <Ban size={20} className="text-red-600 dark:text-red-400" />
              ) : verdict === 'allow' ? (
                <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-slate-900 dark:text-white font-bold text-base">GoalGuard Copilot</h2>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  verdict === 'block'
                    ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25'
                    : verdict === 'allow'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25'
                }`}>
                  {verdict === 'block' ? 'Blocked' : verdict === 'allow' ? 'Approved' : 'Intercepted'}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {verdict === 'block' ? 'Transfer blocked by GoalGuard' : verdict === 'allow' ? 'Transfer approved' : 'Pause & reflect before sending'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mt-0.5 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* AI Narrative */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                AI Trade-off Explanation
              </p>
              <button
                onClick={speak}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                {isSpeaking ? 'Stop' : 'Listen'}
              </button>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{tradeOffText}</p>
            </div>
          </div>

          {/* Live Slider */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Adjust Amount Live:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">₦{sliderVal.toLocaleString()} CNGN</span>
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
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 shadow-sm">
                <p className="text-slate-500 mb-1">Goal Delay</p>
                <p className="text-amber-600 dark:text-amber-400 font-bold">{goalDelayDays > 0 ? `+${goalDelayDays} days` : 'No delay'}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 shadow-sm">
                <p className="text-slate-500 mb-1">Vault Impact</p>
                <p className="text-slate-800 dark:text-white font-bold">{vaultImpact.fromPercent}% → {vaultImpact.toPercent}%</p>
              </div>
            </div>
          </div>

          {confirmError && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2">
              {confirmError}
            </p>
          )}

          {confirmSuccess && (
            <div className="text-center py-4">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2 animate-bounce" />
              <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Transfer Confirmed!</p>
            </div>
          )}

          {/* Privacy Note */}
          <p className="text-slate-500 dark:text-slate-600 text-xs flex items-center gap-1.5">
            <ShieldAlert size={10} />
            Privacy Shield: PII stripped. AI processed transaction metadata only.
          </p>
        </div>

        {/* Action Buttons */}
        {!confirmSuccess && (
          <div className="px-5 pb-5 space-y-2.5">
            {/* Option 1: send suggested amount */}
            {verdict !== 'block' && (
              <button
                onClick={() => handleConfirm('adjust')}
                disabled={confirming !== null}
                className="w-full flex items-center justify-between bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-semibold py-3.5 px-5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 group cursor-pointer"
              >
                <div className="text-left">
                  <p className="text-sm">{suggestedLabel}</p>
                  <p className="text-emerald-200 dark:text-emerald-300/70 text-xs font-normal mt-0.5">
                    Saves ₦{(pendingTransfer.amount - suggestedAmount).toLocaleString()} → auto-added to vault
                  </p>
                </div>
                {confirming === 'adjust' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            )}

            {/* Option 2: proceed with full amount */}
            {verdict !== 'block' && (
              <button
                onClick={() => handleConfirm('proceed')}
                disabled={confirming !== null}
                className="w-full py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {confirming === 'proceed' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  `Proceed with ₦${pendingTransfer.amount.toLocaleString()} CNGN`
                )}
              </button>
            )}

            {/* Option 3: Cancel */}
            <button
              onClick={() => handleConfirm('cancel')}
              disabled={confirming !== null}
              className="w-full py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {confirming === 'cancel' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                  Cancelling...
                </span>
              ) : (
                'Cancel Transfer'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
