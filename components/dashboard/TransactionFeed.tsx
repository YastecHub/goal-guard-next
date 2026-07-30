'use client';
import { useStore, TransactionStatus } from '@/lib/store';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

const STATUS_STYLES: Record<TransactionStatus, string> = {
  'Direct Transfer': 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  'AI Adjusted': 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800',
  'Canceled': 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800',
};

export default function TransactionFeed() {
  const { transactions } = useStore();

  return (
    <div>
      <h2 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2 mb-4">
        <History size={17} className="text-slate-500 dark:text-slate-400" />
        BMONI Transaction History
      </h2>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Table header */}
            <div className="grid grid-cols-[36px_1fr_120px_130px] gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider items-center">
              <span>Type</span>
              <span>Recipient / Description</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">No transactions yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {transactions.slice(0, 15).map((tx) => {
                  const isCredit = tx.type === 'Credit';
                  return (
                    <div key={tx.id} className="grid grid-cols-[36px_1fr_120px_130px] gap-3 px-5 py-3.5 items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Type icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
                      }`}>
                        {isCredit
                          ? <ArrowDownLeft size={16} strokeWidth={2.5} />
                          : <ArrowUpRight size={16} strokeWidth={2.5} />
                        }
                      </div>

                      {/* Details */}
                      <div className="min-w-0 pr-2">
                        <p className="text-slate-900 dark:text-white text-sm font-bold truncate">{tx.recipient}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate">{tx.date} · {tx.category}</p>
                      </div>

                      {/* Amount */}
                      <p className={`text-sm font-extrabold tabular-nums whitespace-nowrap text-right ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {isCredit ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </p>

                      {/* Status badge */}
                      <div className="flex justify-end">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap text-right shrink-0 ${STATUS_STYLES[tx.status]}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
