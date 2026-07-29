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
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2">
          <Terminal size={15} className="text-emerald-600 dark:text-emerald-400" />
          BMONI Sandbox Console
        </h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          onboarding.generalStatus === 'Onboarded'
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-800'
            : onboarding.generalStatus === 'In Progress'
            ? 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800'
            : 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700'
        }`}>
          {onboarding.generalStatus}
        </span>
      </div>

      <div className="space-y-3.5 mb-5">
        {STEPS.map((s) => {
          const done = onboarding.currentStep >= s.n;
          return (
            <div key={s.n} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {done
                  ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  : <Circle size={16} className="text-slate-300 dark:text-slate-700" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold ${done ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-400'}`}>{s.title}</p>
                <div className="mt-1">
                  <code className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/80 inline-block max-w-full truncate">
                    {s.n === 1 && done ? `uid: ${onboarding.userId}` : s.endpoint}
                  </code>
                </div>
                {s.n === 2 && done && onboarding.walletAddress && (
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-mono mt-0.5 truncate font-medium">
                    {onboarding.walletAddress.slice(0, 16)}...
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
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          onboarding.generalStatus === 'Onboarded'
            ? 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-[0.98]'
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
