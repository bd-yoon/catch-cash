# 캐치 캐쉬 — 개발 로그

## 2026-03-06 — 프로젝트 킥오프 (PO)

### 결정사항
- **DB 선택: Supabase** (Upstash Redis 대신)
  - 이유: Realtime subscriptions으로 polling 없이 위너 감지 가능
  - 리더보드 등 관계형 데이터 처리 용이
  - v2 계정 시스템 도입 시 Supabase Auth 재활용 가능
- **앱 타입**: Non-Game WebView (Next.js 14 + TDS Mobile)
- **리워드**: 가상 포인트 (v1) → 토스포인트 연동 (v2)
- **단어 유사도**: FastText cc.ko.300.vec 기반 사전 계산 JSON (꼬맨틀 방식)

### 생성된 파일
- `PROJECT_BRIEF.md` 작성 완료
- 디렉토리 구조 생성 완료

### 다음 단계
1. ~~`/designer` → UX 플로우 + 컬러 시스템 설계~~ ✅
2. `/frontend` → 게임 UI + Realtime 연동 구현
3. `/backend` → Supabase 프로젝트 생성 + 테이블 설계 + API 구현

---

## 2026-03-06 — UX/디자인 설계 완료 (Designer)

### 결정사항
- **콘셉트**: 딥 네이비 배경 + 골드/민트 포인트 — 경쟁 게임 긴장감
- **유사도 색상**: 파랑(0-30) → 노랑(31-60) → 주황(61-90) → 빨강(91-99) → 금색 폭발(100)
- **카운트다운**: 10분 이하 빨간색 + pulse 애니메이션, 60초 이하 가속
- **광고 UX**: 기회 소진 모달(강제 아님) + 힌트 버튼(선택적)
- **레이아웃**: 헤더 고정 + 추측 리스트 스크롤 + 입력 하단 고정

### 생성된 파일
- `DESIGN.md` 작성 완료 (화면 상태 머신, 컴포넌트 명세, 색상 팔레트, 애니메이션 스펙 포함)

---

## 2026-03-06 — Frontend 구현 완료 (Frontend Developer)

### 결정사항
- **Static export 포기**: API 라우트 사용으로 `output: 'export'` 불가 → Vercel 서버리스 모드
- **Supabase lazy init**: 빌드 시 모듈 레벨 초기화 금지 → `supabaseClient()` 함수로 lazy 패턴
- **API routes**: `export const dynamic = 'force-dynamic'` 필수 (정적 생성 방지)
- **vercel.json**: `outputDirectory` 제거 (서버리스 모드에서는 Vercel 자동 감지)

### 생성된 파일
- `app/layout.tsx` — TDSWrapper, metadata, viewport 분리
- `app/TDSWrapper.tsx` — useUserAgent() 포함
- `app/page.tsx` — 메인 게임 화면 상태 머신
- `app/api/round/route.ts` — 라운드 정보 API
- `app/api/guess/route.ts` — 단어 추측 + 위너 결정 API
- `app/api/leaderboard/route.ts` — 오늘의 위너 목록 API
- `components/CountdownTimer.tsx` — 10분↓ 빨강 pulse
- `components/GuessRow.tsx` — 유사도 색상 온도계
- `components/SimilarityBar.tsx` — 애니메이션 바
- `components/GuessHistory.tsx` — 추측 기록 리스트
- `components/GuessInput.tsx` — IME 조합 대응 입력
- `components/WinnerOverlay.tsx` — 폭죽 confetti + 축하
- `components/OutOfChancesModal.tsx` — 광고 유도 모달
- `lib/storage.ts`, `lib/date.ts`, `lib/adsInToss.ts`, `lib/supabase.ts`, `lib/scoreColor.ts`

### 빌드 결과
- `npm run build` 성공 ✅
- `/` → Static, `/api/*` → Dynamic (서버리스)

### 다음 단계
- `.env.local` 생성 후 `npm run dev`로 로컬 테스트
- `/backend` 호출 → Supabase 프로젝트 생성 + 테이블 설계 + 단어 데이터 스크립트

---

## 2026-03-06 — Backend 구현 완료 (Backend Engineer)

### 결정사항
- **rounds 테이블 RLS**: anon은 answer_word 제외 조회 → `rounds_public` View로 마스킹
- **단어 스케줄**: `pickWord(roundId)` 결정론적 해시 → 서버 재시작해도 동일 단어 보장
- **포인트**: 자정~새벽(0-5시) 200P, 낮 100P (야심야 도전 인센티브)
- **Rate limit**: 라운드당 1분 30회 (guess_log COUNT 쿼리)
- **Mock 데이터**: FastText 없이 로컬 테스트 가능 (`npm run mock-similarity`)

### 생성된 파일
- `supabase/schema.sql` — 테이블 3개 + RLS + Realtime 설정 SQL
- `scripts/seed-rounds.ts` — 7일치 라운드 시드 (`npm run seed`)
- `scripts/generate-mock-similarity.ts` — 개발용 mock 유사도 JSON (`npm run mock-similarity`)
- `scripts/precompute-similarity.py` — FastText 기반 실제 유사도 계산 (프로덕션용)
- `scripts/word-pool.txt` — 정답 후보 단어 풀 (112개)

### 로컬 개발 시작 순서
1. `cp .env.local.example .env.local` → Supabase 키 입력
2. Supabase Dashboard에서 `supabase/schema.sql` 실행
3. `npm run mock-similarity` → data/words/ 생성
4. `npm run seed` → rounds 테이블 7일치 시드
5. `npm run dev`

### 프로덕션 준비 체크리스트
- [ ] FastText cc.ko.300.bin 다운로드 + `precompute-similarity.py` 실행
- [ ] Supabase Dashboard > Replication > rounds 테이블 활성화
- [ ] Vercel 환경변수 3개 설정 (URL, ANON_KEY, SERVICE_KEY)
- [ ] AdMob 테스트 ID → 프로덕션 ID 교체 (제출 직전)
