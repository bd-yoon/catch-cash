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
    // IME 조합 중이면 무시
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="flex gap-2 items-center px-4 py-3 border-t border-white/10 bg-surface safe-bottom">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        placeholder={placeholder ?? '단어를 입력하세요'}
        className="flex-1 bg-surface2 rounded-xl px-4 py-3 text-white text-base
                   placeholder:text-white/30 outline-none border border-white/10
                   focus:border-accent-mint/50 disabled:opacity-40
                   transition-colors duration-200"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || loading || !value.trim()}
        className="min-w-[64px] h-12 rounded-xl font-bold text-sm
                   bg-accent-mint text-bg px-4
                   disabled:opacity-30 active:scale-95
                   transition-all duration-150"
      >
        {loading ? '...' : '확인'}
      </button>
    </div>
  );
}
