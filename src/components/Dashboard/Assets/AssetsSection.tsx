'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddAssetModal from './AddAssetModal';
import { Button } from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Asset, AssetFormData } from '@/types/financial';

export default function AssetsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    assetId: string | null;
  }>({ isOpen: false, assetId: null });

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAsset = async (data: AssetFormData) => {
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
    }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

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

              {/* Assets List */}
              <div className="space-y-2">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{asset.name}</h4>
                      <p className="text-sm text-gray-500">{asset.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{formatCurrency(asset.value)}</p>
                      <button
                        onClick={() => setDeleteConfirmation({ isOpen: true, assetId: asset.id })}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors hover:cursor-pointer"
                        data-testid={`delete-asset-${asset.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddAsset}
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
