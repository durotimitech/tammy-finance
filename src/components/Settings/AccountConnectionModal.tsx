'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const handleIntegrationSelect = (integrationId: string) => {
    if (integrationId === 'trading212') {
      setSelectedIntegration(integrationId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Account</DialogTitle>
          <DialogDescription>
            Choose a platform to connect your investment account
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <AnimatePresence mode="wait">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleIntegrationSelect(integration.id)}
                  disabled={!integration.available}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    integration.available
                      ? 'hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                    </div>
                    {!integration.available && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose} size="sm">
            Cancel
          </Button>
        </div>
      </DialogContent>

      {/* Handle Trading 212 selection */}
      {selectedIntegration === 'trading212' && (
        <div style={{ display: 'none' }}>
          {(() => {
            // Store flag to open Trading 212 modal after this one closes
            localStorage.setItem('openTrading212Modal', 'true');
            onClose();
            return null;
          })()}
        </div>
      )}
    </Dialog>
  );
}
