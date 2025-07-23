'use client';

import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Asset, AssetCategory } from '@/types/financial';

interface AssetsListProps {
  onAdd: () => void;
  onEdit: (asset: Asset) => void;
}

export default function AssetsList({ onAdd, onEdit }: AssetsListProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      const data = await response.json();
      setAssets(data.assets);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      const response = await fetch(`/api/assets?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      // Remove from local state
      setAssets(assets.filter((asset) => asset.id !== id));
    } catch {
      alert('Failed to delete asset');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryColor = (category: AssetCategory) => {
    const colors: Record<string, string> = {
      'Checking Account': 'bg-blue-100 text-blue-800',
      'Savings Account': 'bg-green-100 text-green-800',
      'Brokerage Account': 'bg-purple-100 text-purple-800',
      'Primary Residence': 'bg-orange-100 text-orange-800',
      Vehicle: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Group assets by category
  const groupedAssets = assets.reduce(
    (acc, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = [];
      }
      acc[asset.category].push(asset);
      return acc;
    },
    {} as Record<AssetCategory, Asset[]>,
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Assets</h2>
          <Badge variant="secondary">{assets.length}</Badge>
        </div>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Asset
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {assets.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No assets added yet</p>
          <Button
            onClick={onAdd}
            className="bg-transparent border border-gray-300 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Asset
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedAssets).map(([category, categoryAssets]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
              <div className="space-y-2">
                {categoryAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{asset.name}</span>
                        <Badge className={getCategoryColor(asset.category)} variant="secondary">
                          {asset.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(asset.value)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => onEdit(asset)}
                          className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(asset.id)}
                          className="h-8 w-8 p-0 bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
