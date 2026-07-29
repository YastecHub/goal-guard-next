'use client';
import { useStore, Persona } from '@/lib/store';
import { Menu } from 'lucide-react';

const PERSONAS: { value: Persona; label: string }[] = [
  { value: 'english', label: 'Plain English' },
  { value: 'pidgin', label: 'Naija Vernacular' },
  { value: 'genz', label: 'Gen Z' },
  { value: 'merchant', label: 'Merchant Mode' },
];

export default function Header({ title }: { title: string }) {
  const { persona, setPersona, isMockMode, setMockMode } = useStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-5 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="flex items-center gap-3">
        <Menu size={18} className="text-slate-500 md:hidden" />
        <h1 className="text-white font-semibold text-sm">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* AI Persona Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
          <span className="text-slate-400 text-xs font-medium whitespace-nowrap">AI Tone:</span>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value as Persona)}
            className="bg-transparent text-emerald-400 text-xs font-semibold outline-none cursor-pointer"
          >
            {PERSONAS.map((p) => (
              <option key={p.value} value={p.value} className="bg-slate-800 text-white">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mode toggle */}
        <button
          onClick={() => setMockMode(!isMockMode)}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            isMockMode
              ? 'bg-emerald-600/10 border-emerald-600/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isMockMode ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {isMockMode ? 'Sandbox' : 'Live'}
        </button>
      </div>
    </header>
  );
}
