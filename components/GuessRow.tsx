'use client';

import { motion } from 'framer-motion';
import { getScoreColor } from '@/lib/scoreColor';
import SimilarityBar from './SimilarityBar';

export interface Guess {
  word: string;
  score: number;
  id: string;
}

interface Props {
  guess: Guess;
  isNew?: boolean;
}

export default function GuessRow({ guess, isNew }: Props) {
  const { text } = getScoreColor(guess.score);

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface2"
      initial={isNew ? { opacity: 0, x: -16 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <span className="w-20 font-semibold text-base truncate">{guess.word}</span>
      <SimilarityBar score={guess.score} />
      <span
        className="tabular-nums font-mono font-bold text-sm w-10 text-right"
        style={{ color: text }}
      >
        {guess.score}%
      </span>
    </motion.div>
  );
}
