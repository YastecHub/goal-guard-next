'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { handleEvaluateTransfer } from '@/lib/api';
import { Loader2, Send, ShieldCheck } from 'lucide-react';

const CATEGORIES = ['General Transfer', 'Entertainment', 'Business', 'Shopping', 'Food & Dining', 'Education'];

export default function TransferForm() {
  const router = useRouter();
  const { vaults, persona, isMockMode, setPendingTransfer, openIntercept } = useStore();

  const [form, setForm] = useState({
    recipientAddress: '',
    recipientName: '',
    amount: '',
    category: 'General Transfer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const prefill = (data: Partial<typeof form>) => setForm((f) => ({ ...f, ...data }));

  // expose prefill so ImpulsePresets can call it
  (TransferForm as any)._prefill = prefill;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const amount = parseFloat(form.amount);
      if (!amount || amount < 100) {
        setError('Minimum transfer amount is ₦100');
        return;
      }
      setError('');
      setLoading(true);

      try {
        const evalResult = await handleEvaluateTransfer({
          amount,
          category: form.category,
          recipientAddress: form.recipientAddress,
          recipientName: form.recipientName,
          vaults,
          persona,
          isMockMode,
        });

        setPendingTransfer({
          recipientAddress: form.recipientAddress,
          recipientName: form.recipientName,
          amount,
          category: form.category,
          evalResult,
        });

        openIntercept();
      } catch (err: any) {
        setError(err.message || 'Evaluation failed. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [form, vaults, persona, isMockMode, setPendingTransfer, openIntercept]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Recipient Address */}
      <div>
        <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Recipient Wallet Address / Account Number
        </label>
        <input
          id="recipientAddress"
          type="text"
          value={form.recipientAddress}
          onChange={set('recipientAddress')}
          placeholder="0x71C...3A9 or 0123456789"
          required
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
        />
      </div>

      {/* Recipient Name */}
      <div>
        <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Recipient Name
        </label>
        <input
          id="recipientName"
          type="text"
          value={form.recipientName}
          onChange={set('recipientName')}
          placeholder="e.g. Tunde Bakare"
          required
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
        />
      </div>

      {/* Amount + Category row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Amount (₦ CNGN)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₦</span>
            <input
              id="transferAmount"
              type="number"
              value={form.amount}
              onChange={set('amount')}
              placeholder="25,000"
              min="100"
              required
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Category
          </label>
          <select
            id="transferCategory"
            value={form.category}
            onChange={set('category')}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-slate-800">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-sm"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Querying GoalGuard AI Engine & BMONI Ledger...
          </>
        ) : (
          <>
            <ShieldCheck size={16} />
            Evaluate & Send
          </>
        )}
      </button>

      {!loading && (
        <p className="text-center text-slate-400 dark:text-slate-600 text-xs flex items-center justify-center gap-1.5">
          <Send size={10} />
          Funds are only moved after GoalGuard AI review
        </p>
      )}
    </form>
  );
}
