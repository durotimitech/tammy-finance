'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { FEATURE_FLAGS } from '@/types/feature-flags';

interface AccountConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IntegrationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

const integrations: IntegrationOption[] = [
  {
    id: 'trading212',
    name: 'Trading 212',
    description: 'Connect your Trading 212 investment account',
    icon: '📈',
    available: true,
  },
  {
    id: 'bank_of_america',
    name: 'Bank of America',
    description: 'Connect your Bank of America accounts',
    icon: '🏦',
    available: false,
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Connect your Coinbase crypto portfolio',
    icon: '🪙',
    available: false,
  },
];

export default function AccountConnectionModal({ isOpen, onClose }: AccountConnectionModalProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const { isFeatureEnabled } = useFeatureFlags();
  const isTrading212Enabled = isFeatureEnabled(FEATURE_FLAGS.TRADING_212_CONNECTION_ENABLED);

  const handleConnect = () => {
    if (selectedIntegration === 'trading212') {
      // Store flag to open Trading 212 modal after this one closes
      localStorage.setItem('openTrading212Modal', 'true');
      onClose();
    }
  };

  // Transform integrations to options format for SearchableSelect
  const integrationOptions = integrations
    .filter((i) => {
      // Filter out Trading 212 if feature flag is disabled
      if (i.id === 'trading212' && !isTrading212Enabled) {
        return false;
      }
      return i.available;
    })
    .map((integration) => ({
      value: integration.id,
      label: integration.name,
      description: integration.description,
    }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-black">Connect Account</DialogTitle>
          <DialogDescription className="text-gray-600">
            Choose a platform to connect your investment account
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Select Account Type</p>
            <SearchableSelect
              options={integrationOptions}
              value={selectedIntegration}
              onChange={setSelectedIntegration}
              placeholder="Choose an account type..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConnect}
            size="sm"
            disabled={!selectedIntegration}
          >
            Connect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
