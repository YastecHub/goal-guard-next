'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Send, ShieldCheck, Wallet } from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transfer', label: 'Send CNGN', icon: Send },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 p-5 gap-8 shrink-0 transition-colors duration-200">
      {/* Logo */}
      <div className="flex items-center gap-3 mt-1">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
          <ShieldCheck size={22} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-slate-900 dark:text-white font-extrabold text-base leading-tight tracking-tight">GoalGuard</p>
          <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-widest uppercase">BMONI Copilot</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 px-3">Menu</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                active
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="mt-auto">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
            <Wallet size={15} className="text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-slate-200 text-xs font-bold">NGN Rail</p>
            <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">Testnet Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
