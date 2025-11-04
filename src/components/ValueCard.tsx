'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import DashboardCard from '@/components/Dashboard/DashboardCard';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

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
  const { formatCurrency } = useCurrencyFormat();
  const animatedValue = useAnimatedNumber(value, 1.2);

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <DashboardCard
      title={title}
      icon={icon}
      isLoading={isLoading}
      onClick={href ? handleClick : undefined}
      testId={testId}
    >
      <motion.p
        className="text-3xl font-semibold text-gray-900 mb-2"
        data-testid={`${testId}-value`}
      >
        {formatCurrency(animatedValue)}
      </motion.p>
      <p className="text-sm text-gray-500">{description}</p>
    </DashboardCard>
  );
}
