'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AssetCategory, LiabilityCategory, type Asset, type Liability } from '@/types/financial';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'asset' | 'liability';
  item?: Asset | Liability | null;
  onSuccess: () => void;
}

export default function AddItemModal({
  isOpen,
  onClose,
  type,
  item,
  onSuccess,
}: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    value: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!item;
  const title = isEditMode
    ? `Edit ${type === 'asset' ? 'Asset' : 'Liability'}`
    : `Add New ${type === 'asset' ? 'Asset' : 'Liability'}`;

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        value:
          type === 'asset'
            ? (item as Asset).value.toString()
            : (item as Liability).amount_owed.toString(),
      });
    } else {
      setFormData({
        name: '',
        category: '',
        value: '',
      });
    }
    setError(null);
  }, [item, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const numericValue = parseFloat(formData.value);
      if (isNaN(numericValue) || numericValue < 0) {
        throw new Error('Please enter a valid positive number');
      }

      const endpoint = type === 'asset' ? '/api/assets' : '/api/liabilities';
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `${endpoint}?id=${item.id}` : endpoint;

      const body =
        type === 'asset'
          ? {
              name: formData.name,
              category: formData.category as AssetCategory,
              value: numericValue,
            }
          : {
              name: formData.name,
              category: formData.category as LiabilityCategory,
              amount_owed: numericValue,
            };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const categories =
    type === 'asset' ? Object.values(AssetCategory) : Object.values(LiabilityCategory);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the details of your ${type}.`
              : `Enter the details for your new ${type}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={type === 'asset' ? 'e.g., Chase Checking' : 'e.g., Chase Credit Card'}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value">{type === 'asset' ? 'Current Value' : 'Amount Owed'}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="pl-8"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="bg-transparent border border-gray-300 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
