"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg p-6 w-full max-w-md"
          style={{
            borderColor: "#e5e7eb",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <div className="flex items-start gap-4">
            {isDestructive && (
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              variant="secondary"
              className={`flex-1`}
            >
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
