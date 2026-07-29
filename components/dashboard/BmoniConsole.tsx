'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { runOnboardingStep } from '@/lib/api';
import { CheckCircle2, Circle, Loader2, Terminal } from 'lucide-react';

const STEPS = [
  { n: 1, title: 'Create Sandbox User', endpoint: 'POST /v1/users' },
  { n: 2, title: 'Managed Smart Wallet', endpoint: 'POST /v1/.../smart-wallets/create-managed' },
  { n: 3, title: 'Sandbox KYC (BVN: 22222222222)', endpoint: 'GET /v1/.../onboarding/status' },
  { n: 4, title: 'Activate NGN Rail & Fund', endpoint: 'POST /v1/.../onboarding/start-nigeria' },
];

export default function BmoniConsole() {
  const { onboarding, setOnboarding, isMockMode, addTransaction, setBalance, balance } = useStore();
  const [loading, setLoading] = useState(false);

  const runSetup = async () => {
    setLoading(true);
    try {
      for (let step = 1; step <= 4; step++) {
        const patch = await runOnboardingStep(step, isMockMode);
        setOnboarding({ ...onboarding, ...patch } as typeof onboarding);

        // Step 4: credit test funds
        if (step === 4) {
          setBalance(balance + 1000);
          addTransaction({
            id: `t-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'Credit',
            recipient: 'BMONI CNGN Sandbox Credit',
            amount: 1000,
            category: 'Test Funds',
            status: 'Direct Transfer',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-2">
          <Terminal size={14} className="text-emerald-600 dark:text-emerald-400" />
          BMONI Sandbox Console
        </h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          onboarding.generalStatus === 'Onboarded'
            ? 'text-emerald-700 dark:text-emerald-400 border-emerald-600/30 bg-emerald-600/10'
            : onboarding.generalStatus === 'In Progress'
            ? 'text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
            : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700'
        }`}>
          {onboarding.generalStatus}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {STEPS.map((s) => {
          const done = onboarding.currentStep >= s.n;
          return (
            <div key={s.n} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {done
                  ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  : <Circle size={16} className="text-slate-300 dark:text-slate-600" />
                }
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${done ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{s.title}</p>
                <p className="text-slate-400 dark:text-slate-600 text-xs font-mono truncate">
                  {s.n === 1 && done ? `uid: ${onboarding.userId}` : s.endpoint}
                </p>
                {s.n === 2 && done && onboarding.walletAddress && (
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-mono truncate">
                    {onboarding.walletAddress.slice(0, 14)}...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={runSetup}
        disabled={loading || onboarding.generalStatus === 'Onboarded'}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          onboarding.generalStatus === 'Onboarded'
            ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-600'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
        }`}
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" /> Running Setup...</>
        ) : onboarding.generalStatus === 'Onboarded' ? (
          '✓ Sandbox Active'
        ) : (
          'Run Sandbox Auto-Setup'
        )}
      </button>
    </div>
  );
}
