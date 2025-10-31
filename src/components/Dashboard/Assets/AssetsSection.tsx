"use client";

import { Plus, Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AddAssetModal from "./AddAssetModal";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FinancialAccordion from "@/components/ui/FinancialAccordion";
import { Callout } from "@/components/ui/callout";
import { useCurrencyFormat } from "@/hooks/use-currency-format";
import {
  useAssets,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
} from "@/hooks/use-financial-data";
import { groupBy, calculateSubtotals } from "@/lib/utils";
import { Asset, AssetFormData } from "@/types/financial";

export default function AssetsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    assetId: string | null;
  }>({ isOpen: false, assetId: null });
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);
  const [isCheckingAccounts, setIsCheckingAccounts] = useState(true);
  const router = useRouter();

  // Use React Query hooks
  const { data: assets = [], isLoading } = useAssets();
  const { formatCurrency } = useCurrencyFormat();
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();

  // Fetch connected accounts on component mount
  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch("/api/credentials");
      if (response.ok) {
        const data = await response.json();
        setHasConnectedAccounts(
          data.credentials && data.credentials.length > 0,
        );
      }
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
    } finally {
      setIsCheckingAccounts(false);
    }
  };

  const handleAddAsset = async (data: AssetFormData) => {
    try {
      await createAssetMutation.mutateAsync(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding asset:", error);
    }
  };

  const handleUpdateAsset = async (data: AssetFormData) => {
    if (!editingAsset) return;

    try {
      await updateAssetMutation.mutateAsync({ id: editingAsset.id, ...data });
      setIsModalOpen(false);
      setEditingAsset(null);
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  };

  const handleSubmit = async (data: AssetFormData) => {
    if (editingAsset) {
      await handleUpdateAsset(data);
    } else {
      await handleAddAsset(data);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = async () => {
    if (!deleteConfirmation.assetId) return;

    try {
      await deleteAssetMutation.mutateAsync(deleteConfirmation.assetId);
      setDeleteConfirmation({ isOpen: false, assetId: null });
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  const handleDeleteClick = (assetId: string) => {
    setDeleteConfirmation({ isOpen: true, assetId });
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Group assets by category
  const assetsByCategory = groupBy(assets, "category");

  // Calculate subtotals for each category
  const categorySubtotals = calculateSubtotals(assetsByCategory, "value");

  // Get all category names for default open state
  const allCategories = Object.keys(assetsByCategory);

  return (
    <>
      <div
        className="bg-white rounded-xl p-6 border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>

        {/* Connect Account Callout - Only show if no accounts are connected */}
        {isCheckingAccounts ? (
          <div className="py-4">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : !hasConnectedAccounts ? (
          <Callout className="mb-6">
            <Link className="h-4 w-4" />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-medium">
                  Connect your investment accounts
                </h3>
                <p className="text-sm text-gray-600">
                  Automatically import your portfolio data from brokers
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard/settings")}
                variant="secondary"
                size="sm"
              >
                Connect Account
              </Button>
            </div>
          </Callout>
        ) : null}

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Value</span>
            <span className="text-xl font-semibold">
              {formatCurrency(totalValue)}
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
            {assets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No assets added yet</p>
                <p className="text-sm mt-2">
                  Click &quot;Add Asset&quot; to start tracking your wealth
                </p>
              </div>
            ) : (
              <FinancialAccordion
                items={assetsByCategory}
                subtotals={categorySubtotals}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                type="asset"
                defaultOpenCategories={allCategories}
              />
            )}
          </>
        )}
      </div>

      <AddAssetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={
          editingAsset
            ? {
                name: editingAsset.name,
                category: editingAsset.category,
                value: editingAsset.value,
              }
            : undefined
        }
        isLoading={
          createAssetMutation.isPending || updateAssetMutation.isPending
        }
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, assetId: null })}
        onConfirm={handleDeleteAsset}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
