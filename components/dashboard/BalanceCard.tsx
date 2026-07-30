'use client';
import { useStore } from '@/lib/store';
import { ArrowUpRight, TrendingUp, Wallet, Copy, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BalanceCard() {
  const { balance, vaults, onboarding, openOnboardingModal, openCreateVault } = useStore();
  const totalSaved = vaults.reduce((acc, v) => acc + v.saved, 0);
  const addr = onboarding.walletAddress;
  const displayAddr = addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Not Created';
  const isComplete = onboarding.generalStatus === 'Onboarded' || onboarding.currentStep >= 4;

  return (
    <div className="space-y-4">
      {/* Wallet Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="min-w-0 flex-1">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 truncate">BMONI Smart Wallet</p>
            <div className="flex items-center gap-2">
              <code className="text-slate-800 dark:text-slate-200 text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700 truncate max-w-[140px]">{displayAddr}</code>
              {addr && (
                <button
                  onClick={() => navigator.clipboard.writeText(addr)}
                  className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                  title="Copy address"
                >
                  <Copy size={13} />
                </button>
              )}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap border ${
            isComplete
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isComplete ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
            {isComplete ? 'NGN Rail Active' : 'Setup Required'}
          </span>
        </div>

        {/* Notice when not onboarded */}
        {!isComplete && (
          <div className="mb-4 p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <ShieldAlert size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
              Onboarding Required First
            </div>
            <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90 font-medium leading-relaxed">
              Complete your 4-step BMONI setup to activate your smart wallet & CNGN rail before executing transfers.
            </p>
            <button
              onClick={openOnboardingModal}
              className="w-full flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Sparkles size={13} />
              Complete Onboarding Now
            </button>
          </div>
        )}

        {/* Main Balance */}
        <div className="mb-5">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Available CNGN Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
              ₦{balance.toLocaleString()}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">CNGN</span>
          </div>
        </div>

        {/* Total Vault Savings */}
        <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">Total Vault Savings</p>
          </div>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm whitespace-nowrap">
            ₦{totalSaved.toLocaleString()} CNGN
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link
            href="/transfer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-2.5 py-2.5 rounded-xl transition-all shadow-xs shrink-0 whitespace-nowrap active:scale-[0.98]"
          >
            <ArrowUpRight size={15} className="shrink-0" />
            Send CNGN
          </Link>
          <button
            onClick={openCreateVault}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold px-2.5 py-2.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shrink-0 whitespace-nowrap active:scale-[0.98] cursor-pointer"
          >
            <Wallet size={15} className="shrink-0" />
            + Create Vault
          </button>
        </div>
      </div>
    </div>
  );
}
