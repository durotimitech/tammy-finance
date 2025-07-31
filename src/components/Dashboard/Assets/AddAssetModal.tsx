'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AssetFormData, UserAssetCategory } from '@/types/financial';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData) => void;
  initialData?: AssetFormData;
  isEditing?: boolean;
  isLoading?: boolean;
  isExternalConnection?: boolean;
}

export default function AddAssetModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false,
  isExternalConnection = false,
}: AddAssetModalProps) {
  const [formData, setFormData] = useState<AssetFormData>(
    initialData || {
      name: '',
      category: '',
      value: 0,
    },
  );
  const [valueInput, setValueInput] = useState(initialData?.value?.toString() || '');
  const [categories, setCategories] = useState<UserAssetCategory[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setValueInput(initialData.value.toString());
    } else {
      setFormData({
        name: '',
        category: '',
        value: 0,
      });
      setValueInput('');
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/assets/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use new category if user is adding one
    const categoryToSubmit = isAddingCategory && newCategory ? newCategory : formData.category;
    onSubmit({ ...formData, category: categoryToSubmit });
    if (!isEditing) {
      setFormData({
        name: '',
        category: '',
        value: 0,
      });
      setValueInput('');
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'add_new') {
      setIsAddingCategory(true);
      setFormData({ ...formData, category: '' });
    } else {
      setIsAddingCategory(false);
      setFormData({ ...formData, category: value });
      setNewCategory('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">{isEditing ? 'Edit Asset' : 'Add New Asset'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isExternalConnection && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                External connections can only have their category changed. Name and value are automatically managed.
              </p>
            </div>
          )}
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
              disabled={isExternalConnection}
              className={isExternalConnection ? "bg-gray-100 cursor-not-allowed" : ""}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            {!isAddingCategory ? (
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))}
                <option value="add_new" className="font-semibold text-blue-600">
                  + Add New Category
                </option>
              </select>
            ) : (
              <div className="space-y-2">
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategory('');
                    setFormData({ ...formData, category: categories[0]?.category_name || '' });
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
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
                className={`pl-8 ${isExternalConnection ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={isExternalConnection}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="w-full sm:flex-1 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" className="w-full sm:flex-1 order-1 sm:order-2" loading={isLoading}>
              {isEditing ? 'Update Asset' : 'Add Asset'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
