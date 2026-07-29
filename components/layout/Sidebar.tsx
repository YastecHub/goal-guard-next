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
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-slate-900 border-r border-slate-800 p-5 gap-8 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mt-1">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
          <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight tracking-tight">GoalGuard</p>
          <p className="text-emerald-400 text-[10px] font-semibold tracking-widest uppercase">BMONI Copilot</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-2 px-3">Menu</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="mt-auto">
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 flex items-center gap-2.5">
          <Wallet size={14} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-slate-300 text-xs font-semibold">NGN Rail</p>
            <p className="text-emerald-400 text-[11px]">Testnet Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
