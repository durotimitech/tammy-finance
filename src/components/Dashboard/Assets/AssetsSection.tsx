'use client';

import { Plus, Trash2, Edit2, Link } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AddAssetModal from './AddAssetModal';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Callout } from '@/components/ui/callout';
import {
  useAssets,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
} from '@/hooks/use-financial-data';
import { formatCurrency, groupBy, calculateSubtotals } from '@/lib/utils';
import { Asset, AssetFormData } from '@/types/financial';

interface Trading212Portfolio {
  totalValue: number;
}

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
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();

  // Extract Trading212 data from assets if it exists
  const trading212Asset = assets.find(
    (asset) => asset.name === 'Trading 212' && asset.category === 'External Connections',
  );
  const trading212Portfolio: Trading212Portfolio | null = trading212Asset
    ? { totalValue: Number(trading212Asset.value) }
    : null;

  // Fetch connected accounts on component mount
  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch('/api/credentials');
      if (response.ok) {
        const data = await response.json();
        setHasConnectedAccounts(data.credentials && data.credentials.length > 0);
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
    } finally {
      setIsCheckingAccounts(false);
    }
  };

  const handleAddAsset = async (data: AssetFormData) => {
    try {
      await createAssetMutation.mutateAsync(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleUpdateAsset = async (data: AssetFormData) => {
    if (!editingAsset) return;

    try {
      await updateAssetMutation.mutateAsync({ id: editingAsset.id, ...data });
      setIsModalOpen(false);
      setEditingAsset(null);
    } catch (error) {
      console.error('Error updating asset:', error);
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
      console.error('Error deleting asset:', error);
    }
  };

  const totalManualAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalExternalAccounts = trading212Portfolio?.totalValue || 0;
  const totalValue = totalManualAssets + totalExternalAccounts;

  // Group assets by category
  const assetsByCategory = groupBy(assets, 'category');

  // Calculate subtotals for each category
  const categorySubtotals = calculateSubtotals(assetsByCategory, 'value');

  // Get all category names for default open state
  const allCategories = Object.keys(assetsByCategory);

  return (
    <>
      <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e5e7eb' }}>
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
                <h3 className="font-medium">Connect your investment accounts</h3>
                <p className="text-sm text-gray-600">
                  Automatically import your portfolio data from brokers
                </p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/settings')}
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
            <span className="text-xl font-semibold">{formatCurrency(totalValue)}</span>
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
            {assets.length === 0 && !trading212Portfolio ? (
              <div className="text-center py-8 text-gray-500">
                <p>No assets added yet</p>
                <p className="text-sm mt-2">
                  Click &quot;Add Asset&quot; to start tracking your wealth
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* External Accounts Section - Show if Trading 212 is connected */}
                {trading212Portfolio && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">External Accounts</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Trading 212</p>
                          <p className="text-sm text-gray-600">
                            Last updated: {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-lg font-semibold">
                          {formatCurrency(trading212Portfolio.totalValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Assets Section */}
                {assets.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Manual Assets</h3>
                    <Accordion type="multiple" defaultValue={allCategories} className="space-y-2">
                      {Object.entries(assetsByCategory).map(([category, categoryAssets]) => (
                        <AccordionItem
                          key={category}
                          value={category}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <div className="flex justify-between items-center w-full pr-2">
                              <span className="font-medium">{category}</span>
                              <span className="text-sm text-gray-600">
                                {formatCurrency(categorySubtotals[category] || 0)}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3">
                            <div className="space-y-2">
                              {(categoryAssets as Asset[]).map((asset) => (
                                <div
                                  key={asset.id}
                                  className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md group hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{asset.name}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <p className="text-sm font-medium">
                                      {formatCurrency(asset.value)}
                                    </p>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleEdit(asset)}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        aria-label="Edit asset"
                                      >
                                        <Edit2 className="w-4 h-4 text-gray-600" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setDeleteConfirmation({
                                            isOpen: true,
                                            assetId: asset.id,
                                          })
                                        }
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        aria-label="Delete asset"
                                        data-testid={`delete-asset-${asset.id}`}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </button>
                                    </div>
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
        isLoading={createAssetMutation.isPending || updateAssetMutation.isPending}
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
