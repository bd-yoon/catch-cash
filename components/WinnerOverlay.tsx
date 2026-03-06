'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { getMsUntilNextHour, formatMMSS } from '@/lib/date';
import { useState } from 'react';

interface Props {
  isWinner: boolean;
  answer: string;
  winnerNick?: string;
  attempts?: number;
  points?: number;
  onClose?: () => void;
}

export default function WinnerOverlay({ isWinner, answer, winnerNick, attempts, points, onClose }: Props) {
  const [nextMs, setNextMs] = useState(getMsUntilNextHour());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 카운트다운
  useEffect(() => {
    const id = setInterval(() => setNextMs(getMsUntilNextHour()), 1000);
    return () => clearInterval(id);
  }, []);

  // 폭죽 confetti (위너일 때)
  useEffect(() => {
    if (!isWinner || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FFD700', '#FFE566', '#FF6B1A', '#C4963A', '#FFFFFF'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 10,
    }));

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        ctx.restore();
      });
      if (particles.some((p) => p.y < canvas.height)) {
        frame = requestAnimationFrame(draw);
      }
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [isWinner]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,14,0,0.95)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {isWinner && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      )}

      <motion.div
        className="relative z-10 mx-6 rounded-2xl p-8 text-center flex flex-col gap-4 max-w-sm w-full"
        style={{ background: '#2D1A00', border: '1px solid rgba(255,215,0,0.25)' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {isWinner ? (
          <>
            <div className="text-5xl">⭐</div>
            <h2 className="text-2xl font-black text-gold-gradient">
              황금 획득!
            </h2>
            <p className="text-sm" style={{ color: '#A08060' }}>정답은</p>
            <p className="text-3xl font-bold" style={{ color: '#FFF8E7' }}>{answer}</p>
            <div
              className="rounded-xl py-3 px-4"
              style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)' }}
            >
              <span className="font-black text-xl" style={{ color: '#FFD700' }}>+{points ?? 0}P</span>
              <span className="text-sm ml-2" style={{ color: '#A08060' }}>획득!</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-4xl">🏺</div>
            <p className="text-sm" style={{ color: '#A08060' }}>스핑크스의 정답은</p>
            <p className="text-3xl font-bold" style={{ color: '#FFD700' }}>{answer}</p>
            {winnerNick && (
              <p className="text-sm" style={{ color: '#A08060' }}>
                <span className="font-semibold" style={{ color: '#FFF8E7' }}>{winnerNick}</span>님이{' '}
                {attempts}번째 시도에 맞추셨어요
              </p>
            )}
          </>
        )}

        <div className="mt-2 rounded-xl py-3" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.12)' }}>
          <p className="text-xs mb-1" style={{ color: '#A08060' }}>다음 수수께끼까지</p>
          <p className="tabular-nums font-mono font-bold text-xl" style={{ color: '#FFD700' }}>
            {formatMMSS(nextMs)}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-1 text-sm underline"
            style={{ color: '#A08060' }}
          >
            닫기
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
