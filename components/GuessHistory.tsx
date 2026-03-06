'use client';

import { useEffect, useRef } from 'react';
import GuessRow, { type Guess } from './GuessRow';

interface Props {
  guesses: Guess[];
}

const SCORE_GUIDE = [
  { color: '#6BBFFF', range: '0~30%', label: '아직 멀었어요' },
  { color: '#FFD700', range: '31~60%', label: '조금 가까워요' },
  { color: '#FF6B1A', range: '61~90%', label: '뜨거워지고 있어요!' },
  { color: '#FF2D2D', range: '91~99%', label: '거의 다 왔어요!!' },
  { color: '#FFD700', range: '100%',   label: '정답! 황금 획득! ⭐' },
];

export default function GuessHistory({ guesses }: Props) {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guesses.length]);

  if (guesses.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
        <div className="text-5xl" style={{ animation: 'sphinx-breathe 3s ease-in-out infinite' }}>🏺</div>
        <p className="text-sm text-center" style={{ color: '#A08060' }}>
          단어를 입력하면 유사도 점수를 알려드려요
        </p>

        {/* 점수 가이드 */}
        <div
          className="w-full rounded-2xl p-4 flex flex-col gap-2.5"
          style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}
        >
          {SCORE_GUIDE.map((g) => (
            <div key={g.range} className="flex items-center gap-3">
              <div className="w-10 h-1.5 rounded-full flex-shrink-0" style={{ background: g.color }} />
              <span className="text-xs font-bold w-14 flex-shrink-0" style={{ color: g.color }}>{g.range}</span>
              <span className="text-xs" style={{ color: '#FFF8E7' }}>{g.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 flex flex-col gap-2">
      <div ref={topRef} />
      {guesses.map((g, i) => (
        <GuessRow key={g.id} guess={g} isNew={i === 0} />
      ))}
    </div>
  );
}
