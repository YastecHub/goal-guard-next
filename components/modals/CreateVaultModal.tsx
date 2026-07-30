'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { X, Target, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

const PRESETS = [
  { name: 'Laptop Savings', target: 250000, days: 60, icon: '💻' },
  { name: 'Rent Fund', target: 500000, days: 90, icon: '🏠' },
  { name: 'Emergency Reserve', target: 100000, days: 30, icon: '🛡️' },
];

export default function CreateVaultModal() {
  const { isCreateVaultOpen, closeCreateVault, addVault } = useStore();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [days, setDays] = useState('30');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isCreateVaultOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(target);
    const daysNum = parseInt(days, 10);

    if (!name.trim()) {
      setError('Please enter a goal name');
      return;
    }
    if (!targetNum || targetNum < 1000) {
      setError('Minimum target amount is ₦1,000');
      return;
    }
    if (!daysNum || daysNum < 1) {
      setError('Please enter a valid target duration in days');
      return;
    }

    setError('');
    addVault(name.trim(), targetNum, daysNum);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setName('');
      setTarget('');
      setDays('30');
      closeCreateVault();
    }, 1200);
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setName(p.name);
    setTarget(p.target.toString());
    setDays(p.days.toString());
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={closeCreateVault}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center">
              <Target size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white font-extrabold text-base">Create Goal Vault</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Set a target to protect with GoalGuard AI</p>
            </div>
          </div>

          <button
            onClick={closeCreateVault}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-extrabold text-lg">Goal Vault Created!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              '{name}' is now active and protected by GoalGuard AI.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 rounded-xl">
                {error}
              </div>
            )}

            {/* Quick Presets */}
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                Quick Goal Presets:
              </p>
              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vault Name */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold mb-1.5">
                Goal / Vault Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Masterclass Certification"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            {/* Target Amount + Days */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold mb-1.5">
                  Target Amount (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₦</span>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="100,000"
                    min="1000"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-7 pr-3 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold mb-1.5">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="30"
                  min="1"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-bold"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.98] text-sm"
              >
                <Plus size={16} />
                Create Vault & Activate GoalGuard
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
