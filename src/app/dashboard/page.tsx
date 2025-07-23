import BalanceCards from '@/components/BalanceCards';
import DashboardHeader from '@/components/DashboardHeader';
import ExpenseRecords from '@/components/ExpenseRecords';
import FinancialInsights from '@/components/FinancialInsights';
import Sidebar from '@/components/Sidebar';

export default async function DashboardPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="flex-1 p-6">
          <BalanceCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <FinancialInsights />
            <ExpenseRecords />
          </div>
        </main>
      </div>
    </div>
  );
}
