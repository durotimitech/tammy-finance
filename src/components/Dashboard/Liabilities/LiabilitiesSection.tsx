'use client';

import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddLiabilityModal from './AddLiabilityModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';

interface Liability {
  id: string;
  name: string;
  category: string;
  amount: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function LiabilitiesSection() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchLiabilities = async () => {
    try {
      const response = await fetch('/api/liabilities');
      if (!response.ok) throw new Error('Failed to fetch liabilities');
      const data = await response.json();
      setLiabilities(data.liabilities);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const handleAddLiability = async (liabilityData: {
    name: string;
    category: string;
    amount: number;
  }) => {
    try {
      const response = await fetch('/api/liabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(liabilityData),
      });

      if (!response.ok) throw new Error('Failed to add liability');

      await fetchLiabilities();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding liability:', error);
    }
  };

  const handleDeleteLiability = async (id: string) => {
    if (!confirm('Are you sure you want to delete this liability?')) return;

    try {
      const response = await fetch(`/api/liabilities?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete liability');

      await fetchLiabilities();
    } catch (error) {
      console.error('Error deleting liability:', error);
    }
  };

  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);

  const groupedLiabilities = liabilities.reduce(
    (acc, liability) => {
      if (!acc[liability.category]) {
        acc[liability.category] = [];
      }
      acc[liability.category].push(liability);
      return acc;
    },
    {} as Record<string, Liability[]>,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg p-6"
      style={{ borderColor: '#e5e7eb', borderWidth: '1px', borderStyle: 'solid' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Liabilities</h2>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Liability
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ) : liabilities.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No liabilities added yet</p>
          <p className="text-sm text-gray-500">
            Click &ldquo;Add Liability&rdquo; to track your debts
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Total Liabilities Amount</p>
            <p className="text-2xl font-bold">
              $
              {totalLiabilities.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedLiabilities).map(([category, categoryLiabilities]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryLiabilities.map((liability) => (
                    <motion.div
                      key={liability.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{liability.name}</p>
                          <p className="text-sm text-gray-600">{liability.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">
                          $
                          {liability.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <Button
                          onClick={() => handleDeleteLiability(liability.id)}
                          variant="default"
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100 border-none"
                          data-testid={`delete-liability-${liability.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAddModal && (
        <AddLiabilityModal onClose={() => setShowAddModal(false)} onAdd={handleAddLiability} />
      )}
    </motion.div>
  );
}
