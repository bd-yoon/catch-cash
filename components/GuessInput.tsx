'use client';

import { useState, useRef } from 'react';

interface Props {
  onSubmit: (word: string) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export default function GuessInput({ onSubmit, disabled, loading, placeholder }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const word = value.trim();
    if (!word || disabled || loading) return;
    setValue('');
    await onSubmit(word);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      className="flex gap-2 items-center px-4 py-3 safe-bottom"
      style={{ borderTop: '1px solid rgba(255,215,0,0.15)', background: '#2D1A00', flexShrink: 0 }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        placeholder={placeholder ?? '단어를 입력하세요'}
        className="flex-1 rounded-xl px-4 py-3 text-base outline-none transition-colors duration-200"
        style={{
          background: '#3D2500',
          color: '#FFF8E7',
          border: '1px solid rgba(255,215,0,0.2)',
        }}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || loading || !value.trim()}
        className="min-w-[64px] h-12 rounded-xl font-black text-sm px-4 transition-all duration-150 active:scale-95 disabled:opacity-30"
        style={{
          background: 'linear-gradient(135deg, #FFE566, #FFD700)',
          color: '#1A0E00',
        }}
      >
        {loading ? '···' : '확인'}
      </button>
    </div>
  );
}
