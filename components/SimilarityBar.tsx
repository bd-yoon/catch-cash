'use client';

import { motion } from 'framer-motion';
import { getScoreColor } from '@/lib/scoreColor';

interface Props {
  score: number;
}

export default function SimilarityBar({ score }: Props) {
  const { bar } = getScoreColor(score);

  return (
    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: bar }}
        initial={{ width: '0%' }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}
