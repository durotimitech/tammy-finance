'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { Skeleton } from '@/components/Skeleton';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { formatCurrency } from '@/lib/utils';

interface ValueCardProps {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  href?: string;
  isLoading?: boolean;
  testId?: string;
}

export default function ValueCard({
  title,
  value,
  description,
  icon,
  href,
  isLoading = false,
  testId,
}: ValueCardProps) {
  const router = useRouter();
  const animatedValue = useAnimatedNumber(value, 1.2);

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <motion.div
      whileHover={href ? { scale: 1.02 } : undefined}
      whileTap={href ? { scale: 0.98 } : undefined}
      onClick={handleClick}
      className={`bg-white rounded-xl p-6 border ${href ? 'cursor-pointer' : ''}`}
      style={{ borderColor: '#e5e7eb' }}
      data-testid={testId}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm text-gray-600 font-medium mb-2">{title}</h3>
          {isLoading ? (
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : (
            <>
              <motion.p
                className="text-2xl sm:text-3xl text-gray-900 mb-2"
                data-testid={`${testId}-value`}
              >
                {formatCurrency(animatedValue)}
              </motion.p>
              <p className="text-xs sm:text-sm text-gray-500">{description}</p>
            </>
          )}
        </div>
        {icon}
      </div>
    </motion.div>
  );
}
