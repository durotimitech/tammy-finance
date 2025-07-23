'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LiabilityCategory } from '@/types/financial';

interface AddLiabilityModalProps {
  onClose: () => void;
  onAdd: (liability: { name: string; category: string; amount_owed: number }) => void;
}

export default function AddLiabilityModal({ onClose, onAdd }: AddLiabilityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: LiabilityCategory.CREDIT_CARD,
    amount_owed: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      category: formData.category,
      amount_owed: parseFloat(formData.amount_owed),
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg p-6 w-full max-w-md"
          style={{ borderColor: '#e5e7eb', borderWidth: '1px', borderStyle: 'solid' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Liability</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as LiabilityCategory })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <label htmlFor="amount_owed" className="block text-sm font-medium text-gray-700 mb-1">
                Amount Owed
              </label>
              <Input
                id="amount_owed"
                type="number"
                step="0.01"
                value={formData.amount_owed}
                onChange={(e) => setFormData({ ...formData, amount_owed: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="default"
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
              >
                Add Liability
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
