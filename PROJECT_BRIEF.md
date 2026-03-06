# 캐치 캐쉬 — Product Brief

## 한줄 소개
매 시간 숨겨진 단어를 가장 먼저 맞춘 사람이 포인트를 획득하는
한국어 Semantle 실시간 경쟁 게임

## 타겟 사용자
- 주 타겟: 20-30대 토스 앱 사용자
- 사용 맥락: 매 시간 정각에 새 라운드 시작, 짬날 때 도전
- 반복 사용 동기: 매 시간 리셋 + 누적 리워드 + 경쟁 긴장감

## 앱 타입
- [x] Non-Game WebView (Next.js 14 + TDS Mobile)

## 핵심 게임 루프
1. 매 시간 정각 → 새 라운드 시작 (서버에서 정답 단어 결정)
2. 사용자가 단어 입력 → 서버가 유사도 점수(0-100) 반환
3. 유사도 기반 피드백 → 색상 + 햅틱 + 아쉬움 메시지
4. 100점 (정답) 첫 번째 달성자 → 라운드 위너 + 포인트 획득
5. 위너 발생 → 전체 사용자에게 인앱 알림 (다음 라운드 안내)
6. 무위너 시 → 포인트 다음 라운드 누적

## 수익화 전략 (AdMob)
| 트리거 | 광고 타입 | 보상 |
|--------|-----------|------|
| 기회 5회 소진 후 | rewarded | 기회 3회 추가 |
| 힌트 버튼 탭 | rewarded | 상위 5개 유사 단어 힌트 |
| 리워드 배율 | rewarded | 포인트 10배 (해당 라운드) |
| 공유 | - | 기회 1회 추가 |

광고 세션당 최대 3회 / 기회 소진 직후 = 자연스러운 트리거

## 기술 아키텍처

### 프론트엔드
- Next.js 14 + @toss/tds-mobile + Tailwind
- Supabase Realtime 구독 → 위너 발생 시 즉시 UI 업데이트 (polling 불필요)
- 로컬: 내 추측 기록, 기회 횟수, 포인트 (localStorage)

### 백엔드 (팀 최초 도입)
- Vercel Serverless API Routes (app/api/)
- Supabase PostgreSQL (라운드 상태, 위너 기록, 리더보드)
- Supabase Realtime (위너 발생 즉시 전체 클라이언트 push)
- Rate limiting: DB 기반 (guess_log 테이블 활용)

### API 엔드포인트
- GET  /api/round       → 현재 라운드 번호, 남은 시간, 위너 여부
- POST /api/guess       → {word, roundId} → {score, isWinner, rank}
- GET  /api/leaderboard → 오늘의 위너 목록

### Supabase 테이블 설계
- **rounds**: id(YYYYMMDDHH), answer_word, winner_user_id, winner_at, points
- **guess_log**: id, round_id, user_id, word, score, created_at (rate limiting용)
- **leaderboard**: round_id, user_id, points, rank (오늘의 위너 목록)
- Realtime 활성화: `rounds` 테이블 → winner_user_id 업데이트 시 전체 구독자에게 push

### 단어 유사도 데이터
- 꼬맨틀(semantle-ko) 방식 참조: FastText cc.ko.300.vec 기반
- 사전 계산 방식: 정답 후보 단어 풀(약 500개)에 대해 오프라인으로 Top 1000 유사 단어 + 점수 계산
- 저장 형태: /data/words/[word].json (서버에서만 접근)
- 보안: 정답 단어는 서버(Supabase)에만 저장, 클라이언트에 노출 안 됨

### 라운드 결정 방식
- 매 시간 정각 KST 기준 → 라운드 ID = YYYYMMDDHH
- 정답 단어 = 미리 준비된 단어 스케줄 (Supabase rounds 테이블 또는 env 배열)
- 24개/일 × 365일 = 연간 단어 풀 필요

## UX 핵심 요소
1. 긴박한 카운트다운 (MM:SS, 10분 이하 시 빨간색 + 진동 느낌)
2. 유사도 색상 피드백 (0-30 파랑 → 31-60 노랑 → 61-90 주황 → 91-99 빨강 → 100 폭발)
3. 아쉬움 메시지 ("98%... 손에 닿을 것 같았는데!", "거의 다 왔어요!")
4. 위너 발생 시 전체 화면 축하 애니메이션 + "다음 라운드 XX분 후"
5. 기회 소진 시 광고 CTA 자연스럽게 (강제 아님)

## MVP 핵심 기능
### 필수
- [ ] 시간별 라운드 시스템 (서버 기반)
- [ ] 단어 유사도 추측 + 점수 반환
- [ ] Supabase Realtime 위너 감지
- [ ] 기회 5회 + 광고로 3회 추가
- [ ] 위너 포인트 획득 + 순위 표시
- [ ] 카운트다운 타이머

### 있으면 좋음
- [ ] 힌트 시스템 (광고 보상)
- [ ] 오늘의 위너 목록
- [ ] 포인트 10배 광고
- [ ] 공유 기능 (+1 기회)

### v2에서
- 토스포인트 실제 연동
- 푸시 알림 (위너 발생 시)
- 랭킹/프로필 시스템 (Supabase Auth 활용)

## 성공 지표
- D1 리텐션 목표: 35% (시간별 리셋이 강력한 복귀 동기)
- 일 광고 노출 목표: 사용자당 2-3회
- 런칭 후 1개월 목표: 2000 DAU

## 타임라인
| 단계 | 담당 | 기간 |
|------|------|------|
| 단어 데이터 전처리 스크립트 | Backend | D+1 |
| API 설계 + Supabase 세팅 | Backend | D+2 |
| 게임 UI + 타이머 | Frontend | D+2~4 |
| 유사도 피드백 UX | Frontend | D+3~5 |
| Supabase Realtime + 위너 감지 | Frontend+Backend | D+4~6 |
| AdMob 연동 | Frontend | D+6~7 |
| QA + 디바이스 테스트 | QA | D+8~10 |
| 앱인토스 제출 | QA | D+11 |

## 제외 범위 (MVP)
- 실제 토스포인트 지급: v2
- 푸시 알림: v2 (인앱 배너로 대체)
- 유저 계정/로그인: localStorage 기반 익명 ID
- 어뷰징 방지 정교화: 기본 rate limiting만

## 기술 제약 (준수 필수)
- vercel.json에 "framework" 키 금지
- KST: Date.now() + 9 * 60 * 60 * 1000
- TDS: resetGlobalCss={false}
- viewport export 분리
- AdMob: ait-ad-test-rewarded-id (개발), 프로덕션 직전 교체
