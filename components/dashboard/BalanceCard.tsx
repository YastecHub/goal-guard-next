'use client';
import { useStore } from '@/lib/store';
import { ArrowUpRight, TrendingUp, Wallet, Copy } from 'lucide-react';
import Link from 'next/link';

export default function BalanceCard() {
  const { balance, vaults, onboarding } = useStore();
  const totalSaved = vaults.reduce((acc, v) => acc + v.saved, 0);
  const addr = onboarding.walletAddress;
  const displayAddr = addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Not Created';

  return (
    <div className="space-y-4">
      {/* Wallet Status Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">BMONI Smart Wallet</p>
            <div className="flex items-center gap-2">
              <code className="text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700">{displayAddr}</code>
              {addr && (
                <button
                  onClick={() => navigator.clipboard.writeText(addr)}
                  className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Copy address"
                >
                  <Copy size={13} />
                </button>
              )}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
            onboarding.railActive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${onboarding.railActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {onboarding.railActive ? 'NGN Rail Active' : 'Rail Inactive'}
          </span>
        </div>

        {/* Main Balance */}
        <div className="mb-5">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Available CNGN Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-900 dark:text-white text-4xl font-extrabold tracking-tight">
              ₦{balance.toLocaleString()}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">CNGN</span>
          </div>
        </div>

        {/* Total Vault Savings */}
        <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Total Vault Savings</p>
          </div>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            ₦{totalSaved.toLocaleString()} CNGN
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link
            href="/transfer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
          >
            <ArrowUpRight size={16} />
            Send CNGN
          </Link>
          <Link
            href="/dashboard#vaults"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-[0.98]"
          >
            <Wallet size={16} />
            + Create Vault
          </Link>
        </div>
      </div>
    </div>
  );
}
