'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';
import BudgetSummary from './BudgetSummary';
import { Button } from '@/components/ui/Button';
import DashboardHeaderText from '@/components/ui/DashboardHeaderText';
import { useBudgets } from '@/hooks/useBudgets';

export default function BudgetTracker() {
  const [showForm, setShowForm] = useState(false);
  const { data: budgets = [], isLoading } = useBudgets();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <DashboardHeaderText title="Budget Tracker" />
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Budget
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <BudgetSummary budgets={budgets} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <BudgetList budgets={budgets} isLoading={isLoading} />
      </motion.div>

      {showForm && <BudgetForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
