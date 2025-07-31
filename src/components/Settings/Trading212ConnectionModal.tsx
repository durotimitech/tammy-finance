'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Callout } from '@/components/ui/callout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Trading212ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function Trading212ConnectionModal({
  isOpen,
  onClose,
  onSuccess,
}: Trading212ConnectionModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConnect = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError('Please enter your API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, test the API key by making a test request
      setError(null);
      const testResponse = await fetch('/api/trading212/portfolio', {
        method: 'GET',
        headers: {
          'X-Trading212-ApiKey': trimmedKey,
        },
      });

      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          throw new Error('Invalid API key. Please check your Trading 212 API key and try again.');
        } else {
          throw new Error('Failed to validate API key. Please try again.');
        }
      }

      // API key is valid, now save it (server will handle encryption)

      // First check if credential already exists
      const checkResponse = await fetch('/api/credentials');
      let credentialExists = false;

      if (checkResponse.ok) {
        const existingCreds = await checkResponse.json();
        credentialExists =
          existingCreds.credentials?.some((cred: { name: string }) => cred.name === 'trading212') ||
          false;
      }

      // Use PUT if credential exists, POST if it doesn't
      const response = await fetch(
        credentialExists ? '/api/credentials/trading212' : '/api/credentials',
        {
          method: credentialExists ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'trading212',
            value: trimmedKey,
            isEncrypted: false,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect account');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setApiKey('');
      setError(null);
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-black">Connect Trading 212</DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter your Trading 212 API key to connect your investment account
          </DialogDescription>
        </DialogHeader>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-4">
          {!isSuccess ? (
            <>
              <Callout type="info">
                <p>
                  To generate an API key, visit your Trading 212 settings.{' '}
                  <a
                    href="https://helpcentre.trading212.com/hc/en-us/articles/14584770928157-How-can-I-generate-an-API-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Learn how to generate an API key
                  </a>
                </p>
              </Callout>

              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Trading 212 API key"
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400"
                />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Callout type="error">
                    <p>{error}</p>
                  </Callout>
                </motion.div>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={handleClose} disabled={isLoading} size="sm">
                  Cancel
                </Button>
                <Button
                  onClick={handleConnect}
                  loading={isLoading}
                  disabled={isLoading || !apiKey.trim()}
                  size="sm"
                >
                  Connect
                </Button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Successfully Connected!</h3>
              <p className="text-sm text-gray-500">Your Trading 212 account has been connected.</p>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
