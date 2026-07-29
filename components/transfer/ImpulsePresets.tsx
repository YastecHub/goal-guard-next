'use client';
import { useStore } from '@/lib/store';
import { handleEvaluateTransfer } from '@/lib/api';
import { Zap } from 'lucide-react';
import { useState } from 'react';

const PRESETS = [
  { emoji: '🍔', label: '₦5,000 Fast Food', amount: 5000, category: 'Food & Dining', recipient: 'KFC Fast Food', address: '0x74B...A01' },
  { emoji: '👟', label: '₦35,000 Sneakers', amount: 35000, category: 'Shopping', recipient: 'Nike Store', address: '0x82F...C9E' },
  { emoji: '🎧', label: '₦80,000 Gadget', amount: 80000, category: 'Entertainment', recipient: 'Gadget Hub', address: '0x55D...E7A' },
];

export default function ImpulsePresets() {
  const { vaults, persona, isMockMode, setPendingTransfer, openIntercept } = useStore();
  const [loading, setLoading] = useState<number | null>(null);

  const trigger = async (idx: number) => {
    const p = PRESETS[idx];
    setLoading(idx);
    try {
      const evalResult = await handleEvaluateTransfer({
        amount: p.amount,
        category: p.category,
        recipientAddress: p.address,
        recipientName: p.recipient,
        vaults,
        persona,
        isMockMode,
      });
      setPendingTransfer({
        recipientAddress: p.address,
        recipientName: p.recipient,
        amount: p.amount,
        category: p.category,
        evalResult,
      });
      openIntercept();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-amber-400" />
        <h3 className="text-white text-sm font-semibold">Quick Impulse Simulator</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
          One-Tap Test
        </span>
      </div>
      <p className="text-slate-500 text-xs mb-4">Click to instantly test GoalGuard's AI friction copilot:</p>
      <div className="flex gap-3 flex-wrap">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => trigger(i)}
            disabled={loading === i}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-60"
          >
            <span className="text-base">{loading === i ? '⏳' : p.emoji}</span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
