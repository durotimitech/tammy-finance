'use client';

import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddLiabilityModal from './AddLiabilityModal';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Liability {
  id: string;
  name: string;
  category: string;
  amount_owed: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function LiabilitiesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingLiability, setIsSavingLiability] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    liabilityId: string | null;
  }>({ isOpen: false, liabilityId: null });

  // Fetch liabilities on component mount
  useEffect(() => {
    fetchLiabilities();
  }, []);

  const fetchLiabilities = async () => {
    try {
      const response = await fetch('/api/liabilities');
      if (response.ok) {
        const data = await response.json();
        setLiabilities(data.liabilities || []);
      }
    } catch (error) {
      console.error('Error fetching liabilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLiability = async (liabilityData: {
    name: string;
    category: string;
    amount_owed: number;
  }) => {
    setIsSavingLiability(true);
    try {
      const response = await fetch('/api/liabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(liabilityData),
      });

      if (!response.ok) throw new Error('Failed to add liability');

      const { liability } = await response.json();
      setLiabilities([liability, ...liabilities]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding liability:', error);
    } finally {
      setIsSavingLiability(false);
    }
  };

  const handleUpdateLiability = async (liabilityData: {
    name: string;
    category: string;
    amount_owed: number;
  }) => {
    if (!editingLiability) return;

    setIsSavingLiability(true);
    try {
      const response = await fetch('/api/liabilities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...liabilityData, id: editingLiability.id }),
      });

      if (!response.ok) throw new Error('Failed to update liability');

      const { liability } = await response.json();
      setLiabilities(liabilities.map((l) => (l.id === liability.id ? liability : l)));
      setIsModalOpen(false);
      setEditingLiability(null);
    } catch (error) {
      console.error('Error updating liability:', error);
    } finally {
      setIsSavingLiability(false);
    }
  };

  const handleSubmit = async (liabilityData: {
    name: string;
    category: string;
    amount_owed: number;
  }) => {
    if (editingLiability) {
      await handleUpdateLiability(liabilityData);
    } else {
      await handleAddLiability(liabilityData);
    }
  };

  const handleEdit = (liability: Liability) => {
    setEditingLiability(liability);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLiability(null);
  };

  const handleDeleteLiability = async () => {
    if (!deleteConfirmation.liabilityId) return;

    try {
      const response = await fetch(`/api/liabilities?id=${deleteConfirmation.liabilityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete liability');

      setLiabilities(
        liabilities.filter((liability) => liability.id !== deleteConfirmation.liabilityId),
      );
      setDeleteConfirmation({ isOpen: false, liabilityId: null });
    } catch (error) {
      console.error('Error deleting liability:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const totalAmount = liabilities.reduce((sum, liability) => sum + liability.amount_owed, 0);

  // Group liabilities by category
  const liabilitiesByCategory = liabilities.reduce(
    (acc, liability) => {
      if (!acc[liability.category]) {
        acc[liability.category] = [];
      }
      acc[liability.category].push(liability);
      return acc;
    },
    {} as Record<string, Liability[]>,
  );

  // Calculate subtotals for each category
  const categorySubtotals = Object.entries(liabilitiesByCategory).reduce(
    (acc, [category, categoryLiabilities]) => {
      acc[category] = categoryLiabilities.reduce(
        (sum, liability) => sum + liability.amount_owed,
        0,
      );
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get all category names for default open state
  const allCategories = Object.keys(liabilitiesByCategory);

  return (
    <>
      <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Liabilities</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Liability
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {/* Skeleton for Total Value */}
              <div className="mb-4 pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-7 w-40" />
              </div>

              {/* Skeleton for Liability Items */}
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : liabilities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No liabilities added yet</p>
              <p className="text-sm">Click &quot;Add Liability&quot; to track your debts</p>
            </div>
          ) : (
            <>
              {/* Total Value */}
              <div className="mb-4 pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                <p className="text-sm text-gray-600">Total Liabilities Amount</p>
                <p className="text-2xl text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>

              {/* Liabilities Grouped by Category */}
              <Accordion type="multiple" defaultValue={allCategories} className="space-y-4">
                {Object.entries(liabilitiesByCategory)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([category, categoryLiabilities]) => (
                    <AccordionItem
                      key={category}
                      value={category}
                      className="border rounded-lg px-4"
                      style={{ borderColor: '#e5e7eb' }}
                    >
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{category}</h3>
                            <span className="text-sm text-gray-500">
                              ({categoryLiabilities.length})
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(categorySubtotals[category])}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-0">
                        <div className="border-t -mx-4" style={{ borderColor: '#e5e7eb' }}>
                          {categoryLiabilities.map((liability, index) => (
                            <div
                              key={liability.id}
                              className={`flex items-center justify-between p-3 px-4 hover:bg-gray-50 transition-colors ${
                                index !== categoryLiabilities.length - 1 ? 'border-b' : ''
                              }`}
                              style={{ borderColor: '#e5e7eb' }}
                            >
                              <div className="flex-1 pl-6">
                                <h4 className="font-medium text-gray-900">{liability.name}</h4>
                                <p className="text-sm text-gray-500">{liability.category}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-semibold text-gray-900">
                                  {formatCurrency(liability.amount_owed)}
                                </p>
                                <button
                                  onClick={() => handleEdit(liability)}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors hover:cursor-pointer"
                                  data-testid={`edit-liability-${liability.id}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirmation({
                                      isOpen: true,
                                      liabilityId: liability.id,
                                    })
                                  }
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors hover:cursor-pointer"
                                  data-testid={`delete-liability-${liability.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddLiabilityModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          initialData={
            editingLiability
              ? {
                  name: editingLiability.name,
                  category: editingLiability.category,
                  amount_owed: editingLiability.amount_owed,
                }
              : undefined
          }
          isEditing={!!editingLiability}
          isLoading={isSavingLiability}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, liabilityId: null })}
        onConfirm={handleDeleteLiability}
        title="Delete Liability"
        message="Are you sure you want to delete this liability? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
}
