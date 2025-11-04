'use client';

import { Globe, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CURRENCIES, getCurrencySymbol } from '@/lib/currency';

export default function CurrencySelector() {
  const { currency, setCurrency, isLoading } = useCurrency();
  const [isUpdating, setIsUpdating] = useState(false);

  const currencySymbol = getCurrencySymbol(currency);

  const handleCurrencyChange = async (newCurrency: string) => {
    if (newCurrency === currency || isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      await setCurrency(newCurrency);
    } catch (error) {
      console.error('Failed to update currency:', error);
      // Error is already handled in context (reverts state)
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
        <Globe className="w-4 h-4" />
        <span>€</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isUpdating}
        >
          <span>{currencySymbol}</span>
          {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuRadioGroup value={currency} onValueChange={handleCurrencyChange}>
          {CURRENCIES.map((curr) => (
            <DropdownMenuRadioItem
              key={curr.code}
              value={curr.code}
              disabled={isUpdating}
              className="flex items-center justify-between"
            >
              <span>{curr.name}</span>
              <span className="text-muted-foreground text-xs">{curr.code}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
