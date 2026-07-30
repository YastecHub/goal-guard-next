'use client';
import { useState } from 'react';
import { useStore, Vault } from '@/lib/store';
import { Target, Clock, PlusCircle, MinusCircle, ChevronRight } from 'lucide-react';

function VaultCard({ vault }: { vault: Vault }) {
  const { depositToVault, withdrawFromVault } = useStore();
  const [loading, setLoading] = useState<'dep' | 'wd' | null>(null);
  const [toast, setToast] = useState('');

  const pct = Math.min(100, Math.round((vault.saved / vault.target) * 100));

  const handleDeposit = async () => {
    setLoading('dep');
    try {
      depositToVault(vault.id, 5000);
      setToast('₦5,000 deposited!');
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setLoading(null);
      setTimeout(() => setToast(''), 2500);
    }
  };

  const handleWithdraw = async () => {
    setLoading('wd');
    try {
      withdrawFromVault(vault.id, 5000);
      setToast('₦5,000 withdrawn!');
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setLoading(null);
      setTimeout(() => setToast(''), 2500);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-slate-900 dark:text-white font-bold text-base">{vault.name}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 flex items-center gap-1 font-medium">
            <Clock size={12} />
            {vault.days} days remaining
          </p>
        </div>
        <span className={`text-sm font-extrabold px-2 py-0.5 rounded-md ${
          pct >= 80
            ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60'
            : pct >= 50
            ? 'text-amber-800 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/60'
            : 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
        }`}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : pct >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-slate-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 text-xs mb-4">
        <span className="text-slate-900 dark:text-slate-200 font-bold text-sm whitespace-nowrap">₦{vault.saved.toLocaleString()} saved</span>
        <span className="text-slate-500 dark:text-slate-400 font-medium text-xs text-right whitespace-nowrap">of ₦{vault.target.toLocaleString()}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5">
        <button
          onClick={handleDeposit}
          disabled={loading === 'dep'}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        >
          <PlusCircle size={13} />
          {loading === 'dep' ? '...' : '+ Deposit ₦5k'}
        </button>
        <button
          onClick={handleWithdraw}
          disabled={loading === 'wd'}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        >
          <MinusCircle size={13} />
          {loading === 'wd' ? '...' : 'Withdraw ₦5k'}
        </button>
      </div>

      {toast && (
        <p className="text-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold mt-2.5 animate-pulse">{toast}</p>
      )}
    </div>
  );
}

export default function GoalVaultsGrid() {
  const { vaults, openCreateVault } = useStore();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2">
          <Target size={17} className="text-emerald-600 dark:text-emerald-400" />
          Active Goal Vaults
          <span className="text-slate-500 dark:text-slate-400 font-medium text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            {vaults.length}
          </span>
        </h2>
        <button
          onClick={openCreateVault}
          className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-xs font-bold flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        >
          + New Vault <ChevronRight size={13} />
        </button>
      </div>

      {vaults.length === 0 ? (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          No vaults yet. Create one to start saving towards a goal.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vaults.map((v) => <VaultCard key={v.id} vault={v} />)}
        </div>
      )}
    </div>
  );
}
