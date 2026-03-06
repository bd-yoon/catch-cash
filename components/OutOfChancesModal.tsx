'use client';

import { motion } from 'framer-motion';

interface Props {
  onWatchAd: () => void;
  onGiveUp: () => void;
  loading?: boolean;
}

export default function OutOfChancesModal({ onWatchAd, onGiveUp, loading }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center pb-safe"
      style={{ background: 'rgba(13,13,26,0.85)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm mx-4 mb-6 rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">😮</div>
          <h3 className="font-bold text-lg text-white">기회를 모두 사용했어요</h3>
          <p className="text-white/50 text-sm mt-1">광고를 보고 3번 더 도전할 수 있어요</p>
        </div>

        <button
          onClick={onWatchAd}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-bg text-base
                     disabled:opacity-50 active:scale-98 transition-all"
          style={{ background: '#00E5CC' }}
        >
          {loading ? '광고 로딩 중...' : '광고 보고 3회 추가하기'}
        </button>

        <button
          onClick={onGiveUp}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white/40
                     border border-white/10 active:scale-98 transition-all"
        >
          포기하고 결과 기다리기
        </button>
      </motion.div>
    </motion.div>
  );
}
