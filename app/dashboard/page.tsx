import Header from '@/components/layout/Header';
import BalanceCard from '@/components/dashboard/BalanceCard';
import GoalVaultsGrid from '@/components/dashboard/GoalVaultsGrid';
import TransactionFeed from '@/components/dashboard/TransactionFeed';
import BmoniConsole from '@/components/dashboard/BmoniConsole';

export const metadata = {
  title: 'Dashboard — GoalGuard',
};

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full bg-slate-50/60 dark:bg-slate-950/50 min-h-[calc(100vh-3.5rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

          {/* Left column */}
          <div className="space-y-6">
            <BalanceCard />
            <BmoniConsole />
          </div>

          {/* Right column */}
          <div className="space-y-8" id="vaults">
            <GoalVaultsGrid />
            <TransactionFeed />
          </div>
        </div>
      </main>
    </>
  );
}
