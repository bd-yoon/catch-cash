'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { getCurrentRoundId } from '@/lib/date';
import { getUserId } from '@/lib/storage';
import { getToastMessage } from '@/lib/scoreColor';
import { showRewardedAd } from '@/lib/adsInToss';
import CountdownTimer from '@/components/CountdownTimer';
import GuessHistory from '@/components/GuessHistory';
import GuessInput from '@/components/GuessInput';
import WinnerOverlay from '@/components/WinnerOverlay';
import OutOfChancesModal from '@/components/OutOfChancesModal';
import HomeScreen from '@/components/HomeScreen';
import type { Guess } from '@/components/GuessRow';

type Screen = 'HOME' | 'LOADING' | 'PLAYING' | 'OUT_OF_CHANCES' | 'WINNER_ANNOUNCED' | 'ROUND_END';

const MAX_CHANCES = 5;
const AD_BONUS_CHANCES = 3;

export default function GamePage() {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [chances, setChances] = useState(MAX_CHANCES);
  const [roundId, setRoundId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [winnerInfo, setWinnerInfo] = useState<{
    isWinner: boolean;
    answer: string;
    winnerNick?: string;
    attempts?: number;
    points?: number;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = useRef(getUserId());

  // HOME에서 게임 시작 시 라운드 초기화
  const handleStart = useCallback(() => {
    const id = getCurrentRoundId();
    setRoundId(id);
    setScreen('PLAYING');
  }, []);

  // Supabase Realtime: rounds 테이블 위너 감지
  useEffect(() => {
    if (!roundId) return;

    const channel = supabaseClient()
      .channel(`round-${roundId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rounds',
          filter: `id=eq.${roundId}`,
        },
        (payload) => {
          const row = payload.new as {
            winner_user_id?: string;
            answer_word?: string;
            winner_nick?: string;
            winner_attempts?: number;
            points?: number;
          };
          if (row.winner_user_id) {
            const isWinner = row.winner_user_id === userId.current;
            // 위너 자신은 API 응답에서 이미 처리됨, 다른 플레이어만 여기서 처리
            if (!isWinner) {
              setWinnerInfo({
                isWinner: false,
                answer: row.answer_word ?? '???',
                winnerNick: row.winner_nick,
                attempts: row.winner_attempts,
                points: row.points,
              });
              setScreen('WINNER_ANNOUNCED');
            }
          }
        }
      )
      .subscribe();

    return () => { supabaseClient().removeChannel(channel); };
  }, [roundId]);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const handleGuess = useCallback(async (word: string) => {
    if (submitting || chances <= 0) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, roundId, userId: userId.current }),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.message ?? '오류가 발생했어요');
        return;
      }

      const data: { score: number; isWinner: boolean; points?: number; roundEnded?: boolean; answer?: string } = await res.json();

      // 라운드가 이미 끝난 경우 → 위너 화면으로 전환
      if (data.roundEnded) {
        setWinnerInfo({ isWinner: false, answer: data.answer ?? '???' });
        setScreen('WINNER_ANNOUNCED');
        return;
      }

      const newGuess: Guess = {
        id: `${Date.now()}`,
        word,
        score: data.score,
      };

      setGuesses((prev) => [newGuess, ...prev]);
      setChances((c) => c - 1);

      if (data.isWinner) {
        // 위너 자신: API 응답에서 즉시 오버레이 표시 (Realtime 대기 불필요)
        setWinnerInfo({
          isWinner: true,
          answer: word,
          points: data.points ?? 100,
        });
        setScreen('WINNER_ANNOUNCED');
        return;
      }

      const msg = getToastMessage(data.score);
      if (msg) showToast(msg);

      if (chances - 1 <= 0) {
        setScreen('OUT_OF_CHANCES');
      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, chances, roundId]);

  const handleWatchAd = async () => {
    setAdLoading(true);
    const rewarded = await showRewardedAd();
    setAdLoading(false);
    if (rewarded) {
      setChances((c) => c + AD_BONUS_CHANCES);
      setScreen('PLAYING');
    } else {
      showToast('광고를 완료해야 기회가 추가돼요');
    }
  };

  const handleRoundExpire = () => {
    setScreen('ROUND_END');
    setTimeout(() => {
      setGuesses([]);
      setChances(MAX_CHANCES);
      setWinnerInfo(null);
      setRoundId(getCurrentRoundId());
      setScreen('PLAYING');
    }, 3000);
  };

  if (screen === 'HOME') {
    return <HomeScreen onStart={handleStart} />;
  }

  if (screen === 'LOADING') {
    return (
      <main className="min-h-dvh flex items-center justify-center" style={{ background: '#1A0E00' }}>
        <div className="text-sm animate-pulse" style={{ color: '#A08060' }}>로딩 중...</div>
      </main>
    );
  }

  return (
    <main
      className="flex flex-col"
      style={{
        minHeight: '100dvh',
        maxWidth: 480,
        margin: '0 auto',
        background: '#1A0E00',
      }}
    >
      {/* 헤더 */}
      <header
        className="flex items-center justify-between px-4 safe-top"
        style={{
          height: 60,
          background: '#2D1A00',
          borderBottom: '1px solid rgba(255,215,0,0.12)',
          flexShrink: 0,
        }}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏺</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700' }}
            >
              #{roundId.slice(-4)}
            </span>
          </div>
          <span className="text-xs mt-0.5" style={{ color: '#A08060' }}>먼저 맞추면 100P!</span>
        </div>

        <CountdownTimer onExpire={handleRoundExpire} />

        <div className="flex items-center gap-1.5">
          <span className="text-base">🎯</span>
          <span className="text-sm font-bold" style={{ color: '#FFF8E7' }}>{chances}회</span>
        </div>
      </header>

      {/* 추측 기록 */}
      <GuessHistory guesses={guesses} />

      {/* 토스트 */}
      {toast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-30
                     px-4 py-2 rounded-full text-sm font-semibold text-bg
                     pointer-events-none"
          style={{ background: '#FFD700' }}
        >
          {toast}
        </div>
      )}

      {/* 입력창 */}
      <GuessInput
        onSubmit={handleGuess}
        disabled={screen !== 'PLAYING' || chances <= 0}
        loading={submitting}
        placeholder={chances <= 0 ? '기회가 없어요' : '단어를 입력하세요'}
      />

      {/* 기회 소진 모달 */}
      {screen === 'OUT_OF_CHANCES' && (
        <OutOfChancesModal
          onWatchAd={handleWatchAd}
          onGiveUp={() => setScreen('ROUND_END')}
          loading={adLoading}
        />
      )}

      {/* 위너 오버레이 */}
      {screen === 'WINNER_ANNOUNCED' && winnerInfo && (
        <WinnerOverlay
          {...winnerInfo}
          onClose={() => setScreen('ROUND_END')}
        />
      )}

      {/* 라운드 종료 */}
      {screen === 'ROUND_END' && !winnerInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(26,14,0,0.92)' }}>
          <div className="text-center">
            <div className="text-3xl mb-3">🏺</div>
            <p className="text-sm" style={{ color: '#A08060' }}>다음 수수께끼 준비 중...</p>
            <div className="mt-3 w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#FFD700', borderTopColor: 'transparent' }} />
          </div>
        </div>
      )}
    </main>
  );
}
