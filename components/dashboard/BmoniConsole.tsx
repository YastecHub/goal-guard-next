'use client';
import { useStore } from '@/lib/store';
import { Wallet, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function BmoniConsole() {
  const { onboarding, setOnboarding, openOnboardingModal } = useStore();

  const currentStep = onboarding.currentStep;
  const isComplete = onboarding.generalStatus === 'Onboarded' || currentStep >= 4;

  const resetOnboarding = () => {
    setOnboarding({
      userId: '',
      walletAddress: '',
      kycVerified: false,
      railActive: false,
      generalStatus: 'Not Onboarded',
      currentStep: 0,
    });
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2 min-w-0">
          <Wallet size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">BMONI Smart Wallet</span>
        </h2>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap border ${isComplete
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800'
            : currentStep > 0
              ? 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/60 dark:border-amber-800'
              : 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700'
          }`}>
          {isComplete ? '✓ Fully Onboarded' : currentStep > 0 ? `Step ${currentStep} of 4` : 'Setup Pending'}
        </span>
      </div>

      {/* Main Content Area */}
      {!isComplete ? (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
            Provision your BMONI account, smart wallet contract, identity verification, and NGN stablecoin bridge in our interactive setup wizard.
          </p>

          {/* Setup Progress Indicators */}
          <div className="grid grid-cols-4 gap-1.5 py-1">
            {[1, 2, 3, 4].map((stepNum) => {
              const done = currentStep >= stepNum;
              return (
                <div
                  key={stepNum}
                  className={`h-2 rounded-full transition-all ${done
                      ? 'bg-emerald-500'
                      : currentStep === stepNum - 1
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                />
              );
            })}
          </div>

          <button
            onClick={openOnboardingModal}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.98] text-sm"
          >
            <Sparkles size={16} />
            {currentStep > 0 ? `Continue Setup (Step ${currentStep + 1} of 4)` : 'Start Onboarding'}
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Account Summary */}
          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Smart Wallet:</span>
              <span className="text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                {onboarding.walletAddress ? `${onboarding.walletAddress.slice(0, 10)}...${onboarding.walletAddress.slice(-4)}` : 'Active'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">KYC Verification:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck size={13} /> Verified
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Fiat Bridge Rail:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> NGN Rail Active
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={openOnboardingModal}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-xs cursor-pointer"
            >
              View Setup Details
            </button>
            <button
              onClick={resetOnboarding}
              className="flex items-center justify-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Onboarding Flow"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

