'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AssetCategory, AssetFormData } from '@/types/financial';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData) => void;
}

export default function AddAssetModal({ isOpen, onClose, onSubmit }: AddAssetModalProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: AssetCategory.SAVINGS_ACCOUNT,
    value: 0,
  });
  const [valueInput, setValueInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      category: AssetCategory.SAVINGS_ACCOUNT,
      value: 0,
    });
    setValueInput('');
    onClose();
  };

  const assetCategories = Object.values(AssetCategory);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Asset</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Asset Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Chase Checking Account"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as AssetCategory })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <optgroup label="Cash & Cash Equivalents">
                {assetCategories.slice(0, 6).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Investments">
                {assetCategories.slice(6, 12).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Real Estate">
                {assetCategories.slice(12, 16).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Personal Property">
                {assetCategories.slice(16, 20).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other">
                {assetCategories.slice(20).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
              Current Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <Input
                id="value"
                type="number"
                value={valueInput}
                onChange={(e) => {
                  setValueInput(e.target.value);
                  setFormData({ ...formData, value: parseFloat(e.target.value) || 0 });
                }}
                className="pl-8"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" className="flex-1">
              Add Asset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
