'use client';
import { useStore, TransactionStatus } from '@/lib/store';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

const STATUS_STYLES: Record<TransactionStatus, string> = {
  'Direct Transfer': 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  'AI Adjusted': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
  'Canceled': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25',
};

export default function TransactionFeed() {
  const { transactions } = useStore();

  return (
    <div>
      <h2 className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-2 mb-4">
        <History size={15} className="text-slate-400 dark:text-slate-400" />
        BMONI Transaction History
      </h2>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-semibold uppercase tracking-wider">
          <span>Type</span>
          <span>Recipient / Description</span>
          <span className="text-right">Amount</span>
          <span className="text-right">GoalGuard Status</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">No transactions yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.slice(0, 15).map((tx) => {
              const isCredit = tx.type === 'Credit';
              return (
                <div key={tx.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3.5 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-600/10' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {isCredit
                      ? <ArrowDownLeft size={14} className="text-emerald-600 dark:text-emerald-400" />
                      : <ArrowUpRight size={14} className="text-slate-500 dark:text-slate-400" />
                    }
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{tx.recipient}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs">{tx.date} · {tx.category}</p>
                  </div>

                  {/* Amount */}
                  <p className={`text-sm font-semibold tabular-nums whitespace-nowrap ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {isCredit ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </p>

                  {/* Status badge */}
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md border whitespace-nowrap ${STATUS_STYLES[tx.status]}`}>
                    {tx.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
