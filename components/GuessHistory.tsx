'use client';

import { useEffect, useRef } from 'react';
import GuessRow, { type Guess } from './GuessRow';

interface Props {
  guesses: Guess[];
}

export default function GuessHistory({ guesses }: Props) {
  const topRef = useRef<HTMLDivElement>(null);

  // 새 추측 등록 시 최상단으로 스크롤
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guesses.length]);

  if (guesses.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-white/30">
        <span className="text-4xl">🔍</span>
        <p className="text-sm">단어를 입력해서 유사도를 확인해보세요</p>
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
