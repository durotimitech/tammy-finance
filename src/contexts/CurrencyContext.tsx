'use client';

import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [currency, setCurrencyState] = useState<string>('EUR');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile to get currency
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const profile = await apiClient.profiles.get();
        if (profile?.currency) {
          setCurrencyState(profile.currency);
        }
      } catch (error) {
        console.error('Error fetching currency:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrency();
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      apiClient.profiles.get().then((profile) => {
        if (profile?.currency) {
          setCurrencyState(profile.currency);
        }
      });
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [queryClient]);

  const setCurrency = async (newCurrency: string) => {
    const previousCurrency = currency;
    setCurrencyState(newCurrency);

    try {
      await apiClient.profiles.update({ currency: newCurrency });
      // Invalidate all queries that might depend on currency
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['fire-calculation'] });
      queryClient.invalidateQueries({ queryKey: ['networth'] });
    } catch (error) {
      console.error('Error updating currency:', error);
      // Revert on error
      setCurrencyState(previousCurrency);
      throw error;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
