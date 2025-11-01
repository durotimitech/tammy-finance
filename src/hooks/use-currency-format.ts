'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils';

/**
 * Hook that provides currency-aware formatting functions
 */
export function useCurrencyFormat() {
  const { currency } = useCurrency();

  const formatCurrency = (value: number) => {
    return formatCurrencyUtil(value, currency);
  };

  const formatCompactNumber = (value: number) => {
    // Get currency symbol for compact formatting
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const parts = formatter.formatToParts(0);
    const symbol = parts.find((part) => part.type === 'currency')?.value || '$';

    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${symbol}${value}`;
  };

  return {
    formatCurrency,
    formatCompactNumber,
    currency,
  };
}
