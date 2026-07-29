'use client';
import { useStore, Persona } from '@/lib/store';
import { Menu, Sun, Moon } from 'lucide-react';

const PERSONAS: { value: Persona; label: string }[] = [
  { value: 'english', label: 'Plain English' },
  { value: 'pidgin', label: 'Naija Vernacular' },
  { value: 'genz', label: 'Gen Z' },
  { value: 'merchant', label: 'Merchant Mode' },
];

export default function Header({ title }: { title: string }) {
  const { persona, setPersona, isMockMode, setMockMode, isDarkMode, toggleDarkMode } = useStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-5 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Menu size={18} className="text-slate-400 dark:text-slate-500 md:hidden" />
        <h1 className="text-slate-900 dark:text-white font-semibold text-sm">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* AI Persona Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap">AI Tone:</span>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value as Persona)}
            className="bg-transparent text-emerald-600 dark:text-emerald-400 text-xs font-semibold outline-none cursor-pointer"
          >
            {PERSONAS.map((p) => (
              <option key={p.value} value={p.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mock/Live Mode toggle */}
        <button
          onClick={() => setMockMode(!isMockMode)}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            isMockMode
              ? 'bg-emerald-600/10 border-emerald-600/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isMockMode ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {isMockMode ? 'Sandbox' : 'Live'}
        </button>

        {/* Dark / Light mode toggle */}
        <button
          id="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
        >
          {isDarkMode ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
        </button>
      </div>
    </header>
  );
}
