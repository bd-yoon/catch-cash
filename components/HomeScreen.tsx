'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMsUntilNextHour, formatMMSS } from '@/lib/date';

interface Props {
  onStart: () => void;
}

const RULES = [
  { icon: '🕐', text: '매 시간 새 수수께끼가 출제돼요' },
  { icon: '🏆', text: '가장 먼저 맞춘 사람이 황금 획득!' },
  { icon: '⚡', text: '전국 동시 경쟁 — 실시간 대결' },
  { icon: '🎯', text: '기회는 5번, 광고 보면 3번 추가' },
];

// 스핑크스 SVG 컴포넌트
function SphinxSVG() {
  return (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 몸통 */}
      <ellipse cx="100" cy="120" rx="70" ry="30" fill="#8B6914" opacity="0.9"/>
      <rect x="40" y="90" width="120" height="35" rx="12" fill="#C4963A"/>
      {/* 앞발 */}
      <rect x="38" y="118" width="28" height="16" rx="6" fill="#C4963A"/>
      <rect x="134" y="118" width="28" height="16" rx="6" fill="#C4963A"/>
      {/* 발톱 */}
      <ellipse cx="45" cy="134" rx="4" ry="3" fill="#8B6914"/>
      <ellipse cx="55" cy="135" rx="4" ry="3" fill="#8B6914"/>
      <ellipse cx="65" cy="134" rx="4" ry="3" fill="#8B6914"/>
      <ellipse cx="135" cy="134" rx="4" ry="3" fill="#8B6914"/>
      <ellipse cx="145" cy="135" rx="4" ry="3" fill="#8B6914"/>
      <ellipse cx="155" cy="134" rx="4" ry="3" fill="#8B6914"/>
      {/* 목 */}
      <rect x="82" y="55" width="36" height="40" rx="8" fill="#C4963A"/>
      {/* 두건 (헤드드레스) */}
      <rect x="64" y="20" width="72" height="50" rx="4" fill="#8B6914"/>
      <line x1="64" y1="32" x2="64" y2="80" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
      <line x1="136" y1="32" x2="136" y2="80" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
      {/* 얼굴 */}
      <ellipse cx="100" cy="42" rx="28" ry="26" fill="#D4A843"/>
      {/* 눈 */}
      <ellipse cx="88" cy="36" rx="5" ry="4" fill="#1A0E00"/>
      <ellipse cx="112" cy="36" rx="5" ry="4" fill="#1A0E00"/>
      <ellipse cx="89" cy="35" rx="1.5" ry="1.5" fill="#FFD700"/>
      <ellipse cx="113" cy="35" rx="1.5" ry="1.5" fill="#FFD700"/>
      {/* 콧구멍 */}
      <ellipse cx="95" cy="46" rx="2.5" ry="2" fill="#8B6914"/>
      <ellipse cx="105" cy="46" rx="2.5" ry="2" fill="#8B6914"/>
      {/* 입 (미소) */}
      <path d="M 88 54 Q 100 62 112 54" stroke="#8B6914" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 이마 장식 */}
      <ellipse cx="100" cy="22" rx="6" ry="5" fill="#FFD700"/>
      <ellipse cx="100" cy="21" rx="3" ry="2.5" fill="#FF6B1A"/>
      {/* 황금 목걸이 */}
      <path d="M 75 68 Q 100 78 125 68" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="100" cy="76" r="4" fill="#FFD700"/>
      {/* 모래 그림자 */}
      <ellipse cx="100" cy="138" rx="72" ry="8" fill="#8B6914" opacity="0.4"/>
    </svg>
  );
}

export default function HomeScreen({ onStart }: Props) {
  const [nextMs, setNextMs] = useState(getMsUntilNextHour());

  useEffect(() => {
    const id = setInterval(() => setNextMs(getMsUntilNextHour()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main
      className="flex flex-col items-center min-h-dvh safe-top"
      style={{
        background: 'linear-gradient(180deg, #1A0E00 0%, #2D1A00 60%, #1A0E00 100%)',
        maxWidth: 480,
        margin: '0 auto',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* 상단 타이틀 */}
      <motion.div
        className="w-full text-center pt-10 pb-2 px-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: '#A08060' }}>
          CATCH CASH
        </p>
        <h1 className="text-3xl font-black text-gold-gradient leading-tight">
          스핑크스의
          <br />수수께끼
        </h1>
      </motion.div>

      {/* 스핑크스 */}
      <motion.div
        className="w-56 h-44 my-4"
        style={{ animation: 'sphinx-breathe 4s ease-in-out infinite' }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <SphinxSVG />
      </motion.div>

      {/* 수수께끼 문구 */}
      <motion.p
        className="text-base italic font-medium px-8 text-center mb-6"
        style={{ color: '#FFE566' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        "내가 생각하는 단어를 맞혀라.<br />
        먼저 맞힌 자에게 황금을 주리니."
      </motion.p>

      {/* 게임 룰 카드 */}
      <motion.div
        className="w-full px-5 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div
          className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}
        >
          {RULES.map((rule, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              <span className="text-xl w-7 text-center">{rule.icon}</span>
              <span className="text-sm font-medium" style={{ color: '#FFF8E7' }}>{rule.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 다음 라운드 카운트다운 */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <p className="text-xs mb-1" style={{ color: '#A08060' }}>다음 수수께끼까지</p>
        <p
          className="tabular-nums font-mono font-bold text-2xl"
          style={{ color: nextMs <= 600_000 ? '#FF2D2D' : '#FFD700' }}
        >
          {formatMMSS(nextMs)}
        </p>
      </motion.div>

      {/* 도전하기 버튼 */}
      <motion.button
        onClick={onStart}
        className="w-64 py-4 rounded-2xl font-black text-lg tracking-wide"
        style={{
          background: 'linear-gradient(135deg, #FFE566, #FFD700, #C4963A)',
          color: '#1A0E00',
          boxShadow: '0 0 30px rgba(255,215,0,0.4)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
      >
        도전하기 →
      </motion.button>

      {/* 유사도 가이드 힌트 */}
      <motion.div
        className="mt-6 px-5 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <p className="text-xs text-center mb-2" style={{ color: '#A08060' }}>유사도 점수 가이드</p>
        <div className="flex justify-between text-xs font-semibold gap-1">
          {[
            { color: '#6BBFFF', label: '0~30%', desc: '멀어요' },
            { color: '#FFD700', label: '31~60%', desc: '근접' },
            { color: '#FF6B1A', label: '61~90%', desc: '뜨거워!' },
            { color: '#FF2D2D', label: '91~99%', desc: '거의!' },
            { color: '#FFD700', label: '100%', desc: '정답!' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <div className="w-8 h-1.5 rounded-full" style={{ background: item.color }} />
              <span style={{ color: item.color }} className="leading-none">{item.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="h-8" />
    </main>
  );
}
