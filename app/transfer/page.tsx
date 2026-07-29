import Header from '@/components/layout/Header';
import TransferForm from '@/components/transfer/TransferForm';
import ImpulsePresets from '@/components/transfer/ImpulsePresets';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Send CNGN — GoalGuard',
};

export default function TransferPage() {
  return (
    <>
      <Header title="Send CNGN" />
      <main className="flex-1 p-6 lg:p-8 bg-slate-50/60 dark:bg-slate-950/50 min-h-[calc(100vh-3.5rem)]">
        <div className="max-w-xl mx-auto space-y-6">

          {/* Page heading */}
          <div>
            <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl mb-1 tracking-tight">Send CNGN Transfer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              GoalGuard will evaluate your transfer against active savings goals before executing on BMONI rails.
            </p>
          </div>

          {/* Impulse presets */}
          <ImpulsePresets />

          {/* Transfer form card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-slate-900 dark:text-white font-bold text-base">Transfer Details</h2>
            </div>
            <TransferForm />
          </div>

          {/* Privacy notice */}
          <p className="text-center text-slate-500 dark:text-slate-500 text-xs font-medium">
            🔒 PII is anonymised before GoalGuard AI evaluation. Transaction data is never sent raw to third-party models.
          </p>

        </div>
      </main>
    </>
  );
}
