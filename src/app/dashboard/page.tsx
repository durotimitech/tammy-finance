import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import BalanceCards from "@/components/BalanceCards";
import FinancialInsights from "@/components/FinancialInsights";
import ExpenseRecords from "@/components/ExpenseRecords";
import TransactionHistory from "@/components/TransactionHistory";

export default async function DashboardPage() {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <Sidebar />
            
            <div className="flex-1 flex flex-col">
                <DashboardHeader />
                
                <main className="flex-1 p-6">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">Welcome Back, Yasfin 👋</h2>
                        <p className="text-gray-600">Here&apos;s manage your financial insights.</p>
                    </div>

                    <BalanceCards />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <FinancialInsights />
                        <ExpenseRecords />
                    </div>

                    <div className="mt-6">
                        <TransactionHistory />
                    </div>
                </main>
            </div>
        </div>
    );
}