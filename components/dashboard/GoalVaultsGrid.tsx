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
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5 hover:border-slate-600 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">{vault.name}</p>
          <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
            <Clock size={10} />
            {vault.days} days remaining
          </p>
        </div>
        <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-slate-400'}`}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-slate-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs mb-4">
        <span className="text-slate-300 font-medium">₦{vault.saved.toLocaleString()} saved</span>
        <span className="text-slate-500">of ₦{vault.target.toLocaleString()}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleDeposit}
          disabled={loading === 'dep'}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 hover:bg-emerald-600/20 transition-all disabled:opacity-50"
        >
          <PlusCircle size={12} />
          {loading === 'dep' ? '...' : '+ Deposit ₦5k'}
        </button>
        <button
          onClick={handleWithdraw}
          disabled={loading === 'wd'}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 transition-all disabled:opacity-50"
        >
          <MinusCircle size={12} />
          {loading === 'wd' ? '...' : 'Withdraw ₦5k'}
        </button>
      </div>

      {toast && (
        <p className="text-center text-emerald-400 text-xs mt-2 animate-pulse">{toast}</p>
      )}
    </div>
  );
}

export default function GoalVaultsGrid() {
  const { vaults } = useStore();
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <Target size={15} className="text-emerald-400" />
          Active Goal Vaults
          <span className="text-slate-500 font-normal text-xs">({vaults.length})</span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          + New Vault <ChevronRight size={12} className={`transition-transform ${showForm ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {vaults.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">
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
