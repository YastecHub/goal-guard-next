'use client';
import { useStore } from '@/lib/store';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function OnboardingHeroBanner() {
  const { onboarding, openOnboardingModal } = useStore();
  const isComplete = onboarding.generalStatus === 'Onboarded' || onboarding.currentStep >= 4;

  if (isComplete) return null;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 lg:p-6 shadow-md shadow-emerald-900/20 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Action Required
            </span>
            <span className="text-emerald-100 text-xs font-semibold">
              Step {onboarding.currentStep + 1} of 4
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Complete BMONI Wallet Onboarding
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm font-medium max-w-xl">
            Set up your identity, deploy your non-custodial smart wallet contract, verify KYC, and connect your NGN rail to unlock AI transfer intercept protection.
          </p>
        </div>

        <button
          onClick={openOnboardingModal}
          className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer active:scale-[0.98] flex items-center gap-2"
        >
          <Sparkles size={16} className="text-emerald-600" />
          Start Onboarding Now
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
