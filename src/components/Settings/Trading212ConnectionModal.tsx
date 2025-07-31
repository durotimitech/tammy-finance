'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { encryptValue, generateClientPassword, isEncryptionSupported } from '@/lib/crypto/client';
import { createClient } from '@/lib/supabase/client';

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID on component mount
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  const handleConnect = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError('Please enter your API key');
      return;
    }

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    if (!isEncryptionSupported()) {
      setError('Your browser does not support encryption. Please use a modern browser.');
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

      // API key is valid, now encrypt and save it
      // Generate a unique password for this encryption
      const timestamp = Date.now();
      const clientPassword = generateClientPassword(userId, timestamp);

      // Encrypt the API key on the client side
      const encryptedPayload = await encryptValue(trimmedKey, clientPassword);

      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'trading212',
          value: encryptedPayload,
          isEncrypted: true,
        }),
      });

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
