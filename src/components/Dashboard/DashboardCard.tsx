"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Skeleton } from "@/components/Skeleton";

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  testId?: string;
  className?: string;
}

export default function DashboardCard({
  title,
  icon,
  children,
  onClick,
  isLoading = false,
  testId,
  className = "",
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`bg-white rounded-xl p-6 border ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ borderColor: "#e5e7eb" }}
      data-testid={testId}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
        </div>
        {icon}
      </div>
      {isLoading ? (
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}
