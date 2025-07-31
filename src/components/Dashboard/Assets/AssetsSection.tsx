'use client';

import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Link, TrendingUp, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AddAssetModal from './AddAssetModal';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Callout } from '@/components/ui/callout';
import { Asset, AssetFormData } from '@/types/financial';

interface Trading212Portfolio {
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
  cashBalance: number;
  positions: Array<{
    ticker: string;
    quantity: number;
    value: number;
    averagePrice: number;
    currentPrice: number;
    profitLoss: number;
    profitLossPercentage: number;
    accountType: string;
  }>;
}

export default function AssetsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [trading212Portfolio, setTrading212Portfolio] = useState<Trading212Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    assetId: string | null;
  }>({ isOpen: false, assetId: null });
  const router = useRouter();

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
        setTrading212Portfolio(data.trading212Portfolio || null);
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

  const handleUpdateAsset = async (data: AssetFormData) => {
    if (!editingAsset) return;

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const refreshTrading212 = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/trading212/portfolio');
      if (response.ok) {
        const data = await response.json();
        setTrading212Portfolio(data.portfolio || null);
      }
    } catch (error) {
      console.error('Error refreshing Trading 212 portfolio:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalManualAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalValue = totalManualAssets + (trading212Portfolio?.totalValue || 0);

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
        {!trading212Portfolio && (
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

              {/* Trading 212 Portfolio */}
              {trading212Portfolio && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Trading 212 Portfolio</h4>
                        <p className="text-sm text-gray-600">Connected Investment Account</p>
                      </div>
                    </div>
                    <button
                      onClick={refreshTrading212}
                      disabled={isRefreshing}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Refresh portfolio"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Portfolio Value</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatCurrency(trading212Portfolio.totalValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Profit/Loss</p>
                      <p
                        className={`text-xl font-semibold ${
                          trading212Portfolio.totalProfitLoss >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {trading212Portfolio.totalProfitLoss >= 0 ? '+' : ''}
                        {formatCurrency(trading212Portfolio.totalProfitLoss)}
                        <span className="text-sm ml-1">
                          ({trading212Portfolio.profitLossPercentage.toFixed(2)}%)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <p>
                      Cash Balance: {formatCurrency(trading212Portfolio.cashBalance)} •{' '}
                      {trading212Portfolio.positions.length} Positions
                    </p>
                  </div>
                </motion.div>
              )}

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
                        onClick={() => handleEdit(asset)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors hover:cursor-pointer"
                        data-testid={`edit-asset-${asset.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
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
