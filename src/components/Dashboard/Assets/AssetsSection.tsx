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
import { formatCurrency, groupBy, calculateSubtotals } from '@/lib/utils';
import { Asset, AssetFormData } from '@/types/financial';

interface Trading212Portfolio {
  totalValue: number;
}

export default function AssetsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [trading212Portfolio, setTrading212Portfolio] = useState<Trading212Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    assetId: string | null;
  }>({ isOpen: false, assetId: null });
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);
  const [isCheckingAccounts, setIsCheckingAccounts] = useState(true);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const router = useRouter();

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
    fetchConnectedAccounts();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
        setTrading212Portfolio(data.trading212Portfolio || null);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    setIsSavingAsset(true);
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const { asset } = await response.json();
        setAssets([asset, ...assets]);
        setIsModalOpen(false);
      } else {
        console.error('Failed to add asset');
      }
    } catch (error) {
      console.error('Error adding asset:', error);
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleUpdateAsset = async (data: AssetFormData) => {
    if (!editingAsset) return;

    setIsSavingAsset(true);
    try {
      const response = await fetch('/api/assets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, id: editingAsset.id }),
      });

      if (response.ok) {
        const { asset } = await response.json();
        setAssets(assets.map((a) => (a.id === asset.id ? asset : a)));
        setIsModalOpen(false);
        setEditingAsset(null);
      } else {
        console.error('Failed to update asset');
      }
    } catch (error) {
      console.error('Error updating asset:', error);
    } finally {
      setIsSavingAsset(false);
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
      const response = await fetch(`/api/assets?id=${deleteConfirmation.assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAssets(assets.filter((asset) => asset.id !== deleteConfirmation.assetId));
        setDeleteConfirmation({ isOpen: false, assetId: null });
      } else {
        console.error('Failed to delete asset');
      }
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
          <div className="mb-4">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : (
          !hasConnectedAccounts && (
            <div className="mb-4">
              <Callout type="info">
                <div className="flex items-center justify-between">
                  <p>Connect your accounts to automatically track your portfolio value</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/dashboard/settings')}
                    className="flex items-center gap-2 ml-4"
                  >
                    <Link className="w-4 h-4" />
                    Connect Account
                  </Button>
                </div>
              </Callout>
            </div>
          )
        )}

        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {/* Skeleton for Total Value */}
              <div className="mb-4 pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-7 w-40" />
              </div>

              {/* Skeleton for Asset Items */}
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
          ) : assets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No assets added yet</p>
              <p className="text-sm">
                Click &quot;Add Asset&quot; to start tracking your portfolio
              </p>
            </div>
          ) : (
            <>
              {/* Total Value */}
              <div className="mb-4 pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                <p className="text-sm text-gray-600">Total Assets Value</p>
                <p className="text-2xl text-gray-900">{formatCurrency(totalValue)}</p>
              </div>


              {/* Assets Grouped by Category */}
              <Accordion type="multiple" defaultValue={allCategories} className="space-y-4">
                {Object.entries(assetsByCategory)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([category, categoryAssets]) => (
                    <AccordionItem
                      key={category}
                      value={category}
                      className="border rounded-lg px-4"
                      style={{ borderColor: '#e5e7eb' }}
                    >
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center justify-between w-full pr-4">
                          <h3 className="font-semibold text-gray-900">{category}</h3>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(categorySubtotals[category])}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-0">
                        <div className="border-t -mx-4" style={{ borderColor: '#e5e7eb' }}>
                          {categoryAssets.map((asset, index) => (
                              <div
                                key={asset.id}
                                className={`flex items-center justify-between p-3 px-4 hover:bg-gray-50 transition-colors ${
                                  index !== categoryAssets.length - 1 ? 'border-b' : ''
                                }`}
                                style={{ borderColor: '#e5e7eb' }}
                              >
                                <div className="flex-1 pl-6">
                                  <h4 className="font-medium text-gray-900">{asset.name}</h4>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="font-semibold text-gray-900">
                                    {formatCurrency(asset.value)}
                                  </p>
                                  <button
                                    onClick={() => handleEdit(asset)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors hover:cursor-pointer"
                                    data-testid={`edit-asset-${asset.id}`}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {asset.category !== 'External Connections' && (
                                    <button
                                      onClick={() =>
                                        setDeleteConfirmation({ isOpen: true, assetId: asset.id })
                                      }
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors hover:cursor-pointer"
                                      data-testid={`delete-asset-${asset.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
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
        isEditing={!!editingAsset}
        isLoading={isSavingAsset}
        isExternalConnection={editingAsset?.category === 'External Connections'}
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, assetId: null })}
        onConfirm={handleDeleteAsset}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
}
