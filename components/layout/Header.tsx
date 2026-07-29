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
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Menu size={18} className="text-slate-500 md:hidden" />
        <h1 className="text-slate-900 dark:text-white font-extrabold text-base tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* AI Persona Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl px-3 py-1.5 shadow-2xs">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold whitespace-nowrap">AI Tone:</span>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value as Persona)}
            className="bg-transparent text-emerald-700 dark:text-emerald-400 text-xs font-bold outline-none cursor-pointer"
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
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            isMockMode
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${isMockMode ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {isMockMode ? 'Sandbox' : 'Live'}
        </button>

        {/* Dark / Light mode toggle */}
        <button
          id="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer shadow-2xs"
        >
          {isDarkMode ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
        </button>
      </div>
    </header>
  );
}
