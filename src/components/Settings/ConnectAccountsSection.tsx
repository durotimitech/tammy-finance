'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConnectAccountsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);

  const handleConnectAccount = () => {
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Connect your investment accounts to automatically track your portfolio value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Connected Accounts List */}
            {connectedAccounts.length === 0 ? (
              <p className="text-sm text-gray-500">No accounts connected yet</p>
            ) : (
              <div className="space-y-2">
                {connectedAccounts.map((account) => (
                  <div
                    key={account}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <span className="font-medium">{account}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Handle disconnect
                        setConnectedAccounts(connectedAccounts.filter((a) => a !== account));
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Connect Account Button */}
            <Button
              onClick={handleConnectAccount}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Connect Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TODO: Add AccountConnectionModal here in Stage 5 */}
      {/* For now, just log the state */}
      {isModalOpen && (
        <div style={{ display: 'none' }}>
          {/* Modal would open here */}
          {(() => {
            console.log('Modal would open here');
            setIsModalOpen(false);
            return null;
          })()}
        </div>
      )}
    </motion.div>
  );
}
