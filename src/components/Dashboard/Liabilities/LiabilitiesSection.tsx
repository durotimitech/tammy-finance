"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import AddLiabilityModal from "./AddLiabilityModal";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FinancialAccordion from "@/components/ui/FinancialAccordion";
import {
  useLiabilities,
  useCreateLiability,
  useUpdateLiability,
  useDeleteLiability,
} from "@/hooks/use-financial-data";
import { formatCurrency, groupBy, calculateSubtotals } from "@/lib/utils";
import { Liability } from "@/types/financial";

export default function LiabilitiesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(
    null,
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    liabilityId: string | null;
  }>({ isOpen: false, liabilityId: null });

  // Use React Query hooks
  const { data: liabilities = [], isLoading } = useLiabilities();
  const createLiabilityMutation = useCreateLiability();
  const updateLiabilityMutation = useUpdateLiability();
  const deleteLiabilityMutation = useDeleteLiability();

  const handleAddLiability = async (liabilityData: {
    name: string;
    category: string;
    amount_owed: number;
  }) => {
    try {
      await createLiabilityMutation.mutateAsync(liabilityData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding liability:", error);
    }
  };

  const handleUpdateLiability = async (liabilityData: {
    name: string;
    category: string;
    amount_owed: number;
  }) => {
    if (!editingLiability) return;

    try {
      await updateLiabilityMutation.mutateAsync({
        id: editingLiability.id,
        ...liabilityData,
      });
      setIsModalOpen(false);
      setEditingLiability(null);
    } catch (error) {
      console.error("Error updating liability:", error);
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
      await deleteLiabilityMutation.mutateAsync(deleteConfirmation.liabilityId);
      setDeleteConfirmation({ isOpen: false, liabilityId: null });
    } catch (error) {
      console.error("Error deleting liability:", error);
    }
  };

  const handleDeleteClick = (liabilityId: string) => {
    setDeleteConfirmation({ isOpen: true, liabilityId });
  };

  const totalOwed = liabilities.reduce(
    (sum, liability) => sum + Number(liability.amount_owed),
    0,
  );

  // Group liabilities by category
  const liabilitiesByCategory = groupBy(liabilities, "category");

  // Calculate subtotals for each category
  const categorySubtotals = calculateSubtotals(
    liabilitiesByCategory,
    "amount_owed",
  );

  // Get all category names for default open state
  const allCategories = Object.keys(liabilitiesByCategory);

  return (
    <>
      <div
        className="bg-white rounded-xl p-6 border"
        style={{ borderColor: "#e5e7eb" }}
      >
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

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Owed</span>
            <span
              className="text-xl font-semibold"
              style={{ color: "var(--red)" }}
            >
              {formatCurrency(totalOwed)}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            {liabilities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No liabilities added yet</p>
                <p className="text-sm mt-2">
                  Click &quot;Add Liability&quot; to start tracking your debts
                </p>
              </div>
            ) : (
              <FinancialAccordion
                items={liabilitiesByCategory}
                subtotals={categorySubtotals}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                type="liability"
                defaultOpenCategories={allCategories}
              />
            )}
          </>
        )}
      </div>

      <AddLiabilityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={
          editingLiability
            ? {
                name: editingLiability.name,
                category: editingLiability.category,
                amount_owed: Number(editingLiability.amount_owed),
              }
            : undefined
        }
        isEditing={!!editingLiability}
        isLoading={
          createLiabilityMutation.isPending || updateLiabilityMutation.isPending
        }
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, liabilityId: null })
        }
        onConfirm={handleDeleteLiability}
        title="Delete Liability"
        message="Are you sure you want to delete this liability? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
