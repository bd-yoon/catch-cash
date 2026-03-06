'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getMsUntilNextHour, formatMMSS } from '@/lib/date';

interface Props {
  onExpire?: () => void;
}

export default function CountdownTimer({ onExpire }: Props) {
  const [ms, setMs] = useState(getMsUntilNextHour());

  useEffect(() => {
    const tick = () => {
      const remaining = getMsUntilNextHour();
      setMs(remaining);
      if (remaining <= 0) onExpire?.();
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onExpire]);

  const isUrgent = ms <= 10 * 60 * 1000;   // 10분 이하
  const isSuper  = ms <= 60 * 1000;          // 60초 이하

  return (
    <motion.span
      className="tabular-nums font-mono font-bold text-2xl"
      style={{ color: isUrgent ? '#E83D3D' : '#fff' }}
      animate={isUrgent ? { scale: [1, 1.04, 1] } : {}}
      transition={{
        repeat: Infinity,
        duration: isSuper ? 0.7 : 1.5,
        ease: 'easeInOut',
      }}
    >
      {formatMMSS(ms)}
    </motion.span>
  );
}
