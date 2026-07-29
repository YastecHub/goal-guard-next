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
      <main className="flex-1 p-5 lg:p-7 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

          {/* Left column */}
          <div className="space-y-5">
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
