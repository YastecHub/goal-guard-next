import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import InterceptModal from '@/components/modals/InterceptModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GoalGuard — AI CNGN Wallet Copilot',
  description: 'BMONI-powered smart wallet copilot that intercepts transfers in real-time to protect your savings goals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-slate-950 text-white antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {children}
          </div>
        </div>
        <InterceptModal />
      </body>
    </html>
  );
}
