'use client';

import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatCurrency } from '@/lib/utils';
import { Asset, Liability } from '@/types/financial';

type FinancialItem = Asset | Liability;

interface GroupedItems<T extends FinancialItem> {
  [category: string]: T[];
}

interface CategorySubtotals {
  [category: string]: number;
}

interface FinancialAccordionProps<T extends FinancialItem> {
  items: GroupedItems<T>;
  subtotals: CategorySubtotals;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  type: 'asset' | 'liability';
  defaultOpenCategories?: string[];
}

export default function FinancialAccordion<T extends FinancialItem>({
  items,
  subtotals,
  onEdit,
  onDelete,
  type,
  defaultOpenCategories,
}: FinancialAccordionProps<T>) {
  const allCategories = defaultOpenCategories || Object.keys(items);
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <Accordion type="multiple" defaultValue={allCategories} className="space-y-2">
      {Object.entries(items).map(([category, categoryItems], categoryIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1, duration: 0.4 }}
        >
          <AccordionItem value={category} className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex justify-between items-center w-full pr-2">
                <span className="font-medium">{category}</span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(subtotals[category] || 0)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-2">
                {categoryItems.map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    custom={itemIndex}
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md group hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-sm font-medium ${
                          type === 'liability' ? 'text-red-600' : ''
                        }`}
                      >
                        {formatCurrency(
                          type === 'asset'
                            ? (item as Asset).value
                            : Number((item as Liability).amount_owed),
                        )}
                      </p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onEdit(item)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          aria-label={`Edit ${type}`}
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(item.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          aria-label={`Delete ${type}`}
                          data-testid={`delete-${type}-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  );
}
