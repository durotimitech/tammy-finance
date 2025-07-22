"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, CreditCard } from "lucide-react";
import type { Liability, LiabilityCategory } from "@/types/financial";

interface LiabilitiesListProps {
  onAdd: () => void;
  onEdit: (liability: Liability) => void;
}

export default function LiabilitiesList({ onAdd, onEdit }: LiabilitiesListProps) {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const fetchLiabilities = async () => {
    try {
      const response = await fetch('/api/liabilities');
      if (!response.ok) {
        throw new Error('Failed to fetch liabilities');
      }
      const data = await response.json();
      setLiabilities(data.liabilities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this liability?')) {
      return;
    }

    try {
      const response = await fetch(`/api/liabilities?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete liability');
      }

      // Remove from local state
      setLiabilities(liabilities.filter(liability => liability.id !== id));
    } catch (err) {
      alert('Failed to delete liability');
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

  const getCategoryColor = (category: LiabilityCategory) => {
    const colors: Record<string, string> = {
      'Mortgage': 'bg-red-100 text-red-800',
      'Auto Loan': 'bg-orange-100 text-orange-800',
      'Student Loan': 'bg-yellow-100 text-yellow-800',
      'Credit Card': 'bg-pink-100 text-pink-800',
      'Personal Loan': 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Group liabilities by category
  const groupedLiabilities = liabilities.reduce((acc, liability) => {
    if (!acc[liability.category]) {
      acc[liability.category] = [];
    }
    acc[liability.category].push(liability);
    return acc;
  }, {} as Record<LiabilityCategory, Liability[]>);

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
          <CreditCard className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold">Liabilities</h2>
          <Badge variant="secondary">{liabilities.length}</Badge>
        </div>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Liability
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {liabilities.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No liabilities added yet</p>
          <Button onClick={onAdd} variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Liability
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedLiabilities).map(([category, categoryLiabilities]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
              <div className="space-y-2">
                {categoryLiabilities.map((liability) => (
                  <div
                    key={liability.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{liability.name}</span>
                        <Badge className={getCategoryColor(liability.category)} variant="secondary">
                          {liability.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(liability.amount_owed)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(liability)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(liability.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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