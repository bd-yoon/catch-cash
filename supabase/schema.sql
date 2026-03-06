-- ============================================================
-- 캐치 캐쉬 — Supabase Schema
-- Supabase SQL Editor에 전체 복붙 후 실행
-- ============================================================

-- 1. rounds 테이블
--    라운드 ID: YYYYMMDDHH (KST 기준)
--    answer_word는 서버에서만 접근 (RLS로 클라이언트 차단)
CREATE TABLE IF NOT EXISTS rounds (
  id              TEXT PRIMARY KEY,        -- e.g. "2026030614"
  answer_word     TEXT NOT NULL,
  winner_user_id  TEXT,
  winner_nick     TEXT,
  winner_at       TIMESTAMPTZ,
  winner_attempts INTEGER,
  points          INTEGER NOT NULL DEFAULT 100,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. guess_log 테이블
--    rate limiting + 히스토리 용도
CREATE TABLE IF NOT EXISTS guess_log (
  id         BIGSERIAL PRIMARY KEY,
  round_id   TEXT NOT NULL REFERENCES rounds(id),
  user_id    TEXT NOT NULL,
  word       TEXT NOT NULL,
  score      INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guess_log_user_round
  ON guess_log (user_id, round_id, created_at DESC);

-- 3. leaderboard 테이블
--    오늘의 위너 목록
CREATE TABLE IF NOT EXISTS leaderboard (
  id         BIGSERIAL PRIMARY KEY,
  round_id   TEXT NOT NULL REFERENCES rounds(id),
  user_id    TEXT NOT NULL,
  points     INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (round_id)                         -- 라운드당 위너 1명
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_round
  ON leaderboard (round_id);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE rounds     ENABLE ROW LEVEL SECURITY;
ALTER TABLE guess_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- rounds: anon은 answer_word 제외한 컬럼만 읽기 허용
CREATE POLICY "rounds_read_safe" ON rounds
  FOR SELECT USING (true);
-- answer_word 컬럼은 View로 마스킹 (아래 View 참조)

-- guess_log: anon 쓰기 허용 (API 서버가 service key로 씀 → 불필요하지만 fallback)
CREATE POLICY "guess_log_insert" ON guess_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "guess_log_read_own" ON guess_log
  FOR SELECT USING (true);

-- leaderboard: 읽기 전용 (anon)
CREATE POLICY "leaderboard_read" ON leaderboard
  FOR SELECT USING (true);

-- ============================================================
-- View: rounds_public
-- answer_word를 숨긴 클라이언트용 뷰
-- ============================================================
CREATE OR REPLACE VIEW rounds_public AS
  SELECT
    id,
    winner_user_id,
    winner_nick,
    winner_at,
    winner_attempts,
    points,
    created_at
  FROM rounds;

-- ============================================================
-- Realtime 활성화
-- Supabase Dashboard > Database > Replication 에서
-- 'rounds' 테이블을 활성화해야 합니다.
-- 아래 SQL은 publication에 rounds 추가:
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;

-- ============================================================
-- 단어 스케줄 시드 데이터 삽입 함수
-- 실제 단어는 scripts/seed-rounds.ts 에서 삽입
-- ============================================================
