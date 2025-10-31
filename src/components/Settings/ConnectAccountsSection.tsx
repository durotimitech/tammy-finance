"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import AccountConnectionModal from "./AccountConnectionModal";
import Trading212ConnectionModal from "./Trading212ConnectionModal";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConnectedAccount {
  name: string;
  displayName: string;
  connectedAt: string;
}

export default function ConnectAccountsSection() {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTrading212ModalOpen, setIsTrading212ModalOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch("/api/credentials");

      if (response.ok) {
        const data = await response.json();
        setConnectedAccounts(data.credentials || []);
      } else {
        console.error("Failed to fetch connected accounts");
        setConnectedAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
      setConnectedAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectAccount = () => {
    setIsAccountModalOpen(true);
  };

  const handleTrading212Success = () => {
    // Refresh connected accounts
    fetchConnectedAccounts();
    setIsTrading212ModalOpen(false);
  };

  const handleDisconnect = async (accountName: string) => {
    try {
      const response = await fetch(`/api/credentials/${accountName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConnectedAccounts(
          connectedAccounts.filter((a) => a.name !== accountName),
        );
      } else {
        console.error("Failed to disconnect account");
      }
    } catch (error) {
      console.error("Error disconnecting account:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card
        className="bg-white text-black border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <CardHeader>
          <CardTitle className="text-black">Connected Accounts</CardTitle>
          <CardDescription className="text-gray-600">
            Connect your investment accounts to automatically track your
            portfolio value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Connected Accounts List */}
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : connectedAccounts.length === 0 ? (
              <p className="text-sm text-gray-600">No accounts connected yet</p>
            ) : (
              <div className="space-y-2">
                {connectedAccounts.map((account) => (
                  <div
                    key={account.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-100"
                  >
                    <div>
                      <span className="font-medium text-black">
                        {account.displayName}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDisconnect(account.name)}
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

      {/* Account Selection Modal */}
      <AccountConnectionModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          // Check if we need to open Trading 212 modal
          setTimeout(() => {
            const shouldOpenTrading212 = localStorage.getItem(
              "openTrading212Modal",
            );
            if (shouldOpenTrading212 === "true") {
              setIsTrading212ModalOpen(true);
              localStorage.removeItem("openTrading212Modal");
            }
          }, 100);
        }}
      />

      {/* Trading 212 Connection Modal */}
      <Trading212ConnectionModal
        isOpen={isTrading212ModalOpen}
        onClose={() => setIsTrading212ModalOpen(false)}
        onSuccess={handleTrading212Success}
      />
    </motion.div>
  );
}
