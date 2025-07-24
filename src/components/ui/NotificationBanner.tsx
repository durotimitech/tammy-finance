import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationBannerProps {
  message: string;
  type?: NotificationType;
  onClose?: () => void;
}

const typeStyles: Record<NotificationType, string> = {
  success: 'bg-green-100 text-green-800 border-green-300',
  error: 'bg-red-100 text-red-800 border-red-300',
  info: 'bg-blue-100 text-blue-800 border-blue-300',
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type = 'info',
  onClose,
}) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`fixed top-6 right-6 z-50 w-full max-w-xs shadow-lg flex items-center justify-between px-4 py-2 rounded-lg border ${typeStyles[type]} animate-fade-in`}
          role="alert"
          aria-live="polite"
        >
          <span>{message}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 text-lg font-bold text-inherit hover:opacity-70 focus:outline-none"
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
