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
      <main className="flex-1 p-5 lg:p-7">
        <div className="max-w-xl mx-auto space-y-6">

          {/* Page heading */}
          <div>
            <h1 className="text-slate-900 dark:text-white font-bold text-xl mb-1">Send CNGN Transfer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              GoalGuard will evaluate your transfer against active savings goals before executing on BMONI rails.
            </p>
          </div>

          {/* Impulse presets */}
          <ImpulsePresets />

          {/* Transfer form card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-slate-900 dark:text-white font-semibold text-sm">Transfer Details</h2>
            </div>
            <TransferForm />
          </div>

          {/* Privacy notice */}
          <p className="text-center text-slate-500 dark:text-slate-600 text-xs">
            🔒 PII is anonymised before GoalGuard AI evaluation. Transaction data is never sent raw to third-party models.
          </p>

        </div>
      </main>
    </>
  );
}
