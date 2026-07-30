import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import InterceptModal from '@/components/modals/InterceptModal';
import OnboardingModal from '@/components/modals/OnboardingModal';
import CreateVaultModal from '@/components/modals/CreateVaultModal';
import ThemeProvider from '@/components/layout/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GoalGuard — AI CNGN Wallet Copilot',
  description: 'BMONI-powered smart wallet copilot that intercepts transfers in real-time to protect your savings goals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {children}
          </div>
        </div>
        <InterceptModal />
        <OnboardingModal />
        <CreateVaultModal />
        <Analytics />
      </body>
    </html>
  );
}
