'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LiabilityCategory } from '@/types/financial';

interface AddLiabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (liability: { name: string; category: string; amount_owed: number }) => void;
  initialData?: { name: string; category: string; amount_owed: number };
  isEditing?: boolean;
}

export default function AddLiabilityModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: AddLiabilityModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || LiabilityCategory.CREDIT_CARD,
    amount_owed: initialData?.amount_owed?.toString() || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        amount_owed: initialData.amount_owed.toString(),
      });
    } else {
      setFormData({
        name: '',
        category: LiabilityCategory.CREDIT_CARD,
        amount_owed: '',
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      category: formData.category,
      amount_owed: parseFloat(formData.amount_owed),
    });
    if (!isEditing) {
      setFormData({
        name: '',
        category: LiabilityCategory.CREDIT_CARD,
        amount_owed: '',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Liability' : 'Add New Liability'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Liability Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Chase Credit Card"
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
                setFormData({ ...formData, category: e.target.value as LiabilityCategory })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              {Object.values(LiabilityCategory).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount_owed" className="block text-sm font-medium text-gray-700 mb-2">
              Amount Owed
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <Input
                id="amount_owed"
                type="number"
                step="0.01"
                value={formData.amount_owed}
                onChange={(e) => setFormData({ ...formData, amount_owed: e.target.value })}
                className="pl-8"
                placeholder="0.00"
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
              {isEditing ? 'Update Liability' : 'Add Liability'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
