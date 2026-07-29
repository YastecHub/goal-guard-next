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
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/60 border border-slate-700 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">BMONI Smart Wallet</p>
            <div className="flex items-center gap-2">
              <code className="text-slate-200 text-sm font-mono">{displayAddr}</code>
              {addr && (
                <button
                  onClick={() => navigator.clipboard.writeText(addr)}
                  className="text-slate-500 hover:text-emerald-400 transition-colors"
                  title="Copy address"
                >
                  <Copy size={12} />
                </button>
              )}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
            onboarding.railActive
              ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-600/25'
              : 'bg-slate-700 text-slate-400 border border-slate-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${onboarding.railActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {onboarding.railActive ? 'NGN Rail Active (Testnet)' : 'Rail Inactive'}
          </span>
        </div>

        {/* Main Balance */}
        <div className="mb-4">
          <p className="text-slate-500 text-xs font-medium mb-1">Available CNGN Balance</p>
          <p className="text-white text-4xl font-bold tracking-tight">
            ₦{balance.toLocaleString()}
            <span className="text-slate-400 text-sm font-normal ml-2">CNGN</span>
          </p>
        </div>

        {/* Total Vault Savings */}
        <div className="flex items-center justify-between py-3 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <p className="text-slate-400 text-sm">Total Vault Savings</p>
          </div>
          <p className="text-emerald-400 font-semibold text-sm">
            ₦{totalSaved.toLocaleString()} CNGN
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 pt-1">
          <Link
            href="/transfer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30"
          >
            <ArrowUpRight size={15} />
            Send CNGN
          </Link>
          <Link
            href="/dashboard#vaults"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-600"
          >
            <Wallet size={15} />
            + Create Vault
          </Link>
        </div>
      </div>
    </div>
  );
}
