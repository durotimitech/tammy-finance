'use client';

import { animate } from 'framer-motion';
import { useEffect, useState } from 'react';

export function useAnimatedNumber(value: number, duration: number = 1) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  return displayValue;
}
