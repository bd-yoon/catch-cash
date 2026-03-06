# 캐치 캐쉬 — Design Spec

## 디자인 콘셉트
"돈을 잡아라" — 긴박함 + 경쟁 + 보상의 감정적 흐름.
어두운 배경에 골드/민트 포인트 컬러로 고급스러운 경쟁 게임 느낌.
단어를 맞출수록 색이 뜨거워지는 시각적 온도계 피드백.

---

## 화면 상태 머신

```
LOADING → PLAYING → WINNER_ANNOUNCED → ROUND_END
                ↓
           OUT_OF_CHANCES → (광고) → PLAYING (기회 추가)
```

| 상태 | 진입 조건 | 탈출 조건 |
|------|-----------|-----------|
| LOADING | 앱 진입 | 라운드 정보 수신 완료 |
| PLAYING | 라운드 활성 + 위너 없음 | 정답 입력 OR 기회 소진 OR 위너 발생 |
| OUT_OF_CHANCES | 기회 0회 + 내가 위너 아님 | 광고 시청 → 기회 3회 추가 |
| WINNER_ANNOUNCED | Supabase Realtime 위너 이벤트 | 자동 (5초 후 ROUND_END) |
| ROUND_END | 라운드 종료 | 다음 라운드 시작 (정각) |

---

## 화면별 설계

### 1. 메인 게임 화면 (상태: PLAYING)

**목적**: 단어 입력 → 유사도 확인 → 반복 도전

**레이아웃** (위→아래 고정 세로):
```
[상단 헤더]
  - 라운드 번호 (좌)        ← Badge 컴포넌트
  - 카운트다운 타이머 (중앙) ← 굵은 모노스페이스, 10분↓ 빨강
  - 남은 기회 (우)          ← "🎯 5회" 형식

[추측 기록 리스트] — 스크롤 가능, 최신이 위
  각 행: [단어] [유사도 바] [점수 숫자]

[입력 영역] — 하단 고정
  - 텍스트 입력창 (한글 전용)
  - 제출 버튼 (TDS Button primary)
  - 힌트 버튼 (TDS Button secondary) — 광고 트리거
```

**TDS 컴포넌트**: Button(primary/secondary), Badge, Toast, Spinner

**광고 트리거**:
- 기회 0회 → OUT_OF_CHANCES 모달 → "광고 보고 3회 추가"
- 힌트 버튼 → 광고 시청 → 상위 5개 유사 단어 힌트 표시
- 포인트 배율 버튼 (선택) → 광고 → 이번 라운드 10배

---

### 2. 추측 기록 행 (GuessRow)

**목적**: 각 추측의 유사도를 직관적으로 표시

**레이아웃**:
```
[단어 텍스트]  [━━━━━━━━░░] 78%
```

**유사도 색상 (온도계 방식)**:
| 점수 | 색상 | 의미 |
|------|------|------|
| 0–30 | #4A90E2 (차가운 파랑) | 멀었어요 |
| 31–60 | #F5C842 (노랑) | 조금 가까워요 |
| 61–90 | #FF8C42 (주황) | 많이 가까워요! |
| 91–99 | #E83D3D (빨강) | 거의 다 왔어요!! |
| 100 | 🎆 폭발 애니메이션 | 정답! |

**아쉬움 메시지** (Toast로 1.5초):
- 91-95%: "거의 다 왔어요! 조금만 더!"
- 96-99%: "손에 닿을 것 같았는데...!"
- 80-90%: "뜨거워지고 있어요 🔥"

---

### 3. 위너 발생 오버레이 (상태: WINNER_ANNOUNCED)

**목적**: 전체 화면 축하 / 패배 수용 유도

**내가 위너일 때**:
```
🎉 [폭죽 파티클 애니메이션]
"축하해요! 이번 라운드 우승!"
정답: [단어]
획득 포인트: +[N]P
[다음 라운드까지 MM:SS]
```

**내가 위너가 아닐 때**:
```
[단어] 가 정답이었어요
[닉네임]님이 [N]번째 시도에 맞추셨어요
[다음 라운드까지 MM:SS]
[다음 라운드 알림 받기] 버튼
```

**애니메이션**:
```javascript
// 오버레이 진입
initial: { opacity: 0, scale: 0.8 }
animate: { opacity: 1, scale: 1 }
transition: { duration: 0.5, ease: 'easeOut' }

// 폭죽 파티클 (위너일 때)
// canvas 기반 confetti — 금색(#FFD700) + 민트(#00E5CC) 조각
```

---

### 4. 기회 소진 모달 (상태: OUT_OF_CHANCES)

**목적**: 광고 시청을 자연스럽게 유도

```
😮 기회를 모두 사용했어요
"광고를 보고 3번 더 도전하기"  ← TDS Button primary
"포기하고 결과 기다리기"        ← TDS Button secondary (ghost)
```

**UX 원칙**: 강제 아님, 선택 가능, 광고 후 즉시 기회 복원

---

### 5. 힌트 표시 (PLAYING 상태 내)

광고 시청 완료 후 리스트 상단에 힌트 카드 삽입:
```
💡 힌트
유사한 단어들: [단어1] [단어2] [단어3] [단어4] [단어5]
(점수 높은 순으로 표시, 정확한 점수는 숨김)
```

---

## 색상 팔레트

```
Primary (토스 블루 변형):  #0064FF
Accent Gold (보상/위너):   #FFD700
Accent Mint (활성/성공):   #00E5CC
Danger/긴박:               #E83D3D

Background:    #0D0D1A  (딥 네이비, 경쟁 긴장감)
Surface:       #1A1A2E  (카드/입력 배경)
Surface2:      #16213E  (리스트 행 배경)

Text Primary:  #FFFFFF
Text Secondary:#A0AEC0
Text Muted:    #4A5568

유사도 바:
  Cold:   #4A90E2
  Warm:   #F5C842
  Hot:    #FF8C42
  Danger: #E83D3D
  Win:    #FFD700
```

---

## 타이포그래피

| 용도 | 크기 | 굵기 | 비고 |
|------|------|------|------|
| 카운트다운 숫자 | 48px | 700 | 모노스페이스 (tabular nums) |
| 점수 숫자 | 24px | 700 | 모노스페이스 |
| 단어 (추측 기록) | 18px | 600 | |
| 본문/설명 | 14px | 400 | |
| 보조/라벨 | 12px | 400 | text-muted |

```css
/* 카운트다운 전용 */
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum";
```

---

## 애니메이션 상세

### 카운트다운 긴박감 (10분 이하)
```javascript
// 10분 이하: 빨간색 전환 + 맥박 효과
animate: { scale: [1, 1.03, 1] }
transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
// color: #E83D3D
```

### 유사도 바 채우기 (새 추측 등록 시)
```javascript
initial: { width: '0%', opacity: 0 }
animate: { width: `${score}%`, opacity: 1 }
transition: { duration: 0.8, ease: 'easeOut' }
```

### 추측 행 진입
```javascript
initial: { opacity: 0, x: -20 }
animate: { opacity: 1, x: 0 }
transition: { duration: 0.3, ease: 'easeOut' }
```

### 위너 오버레이 등장
```javascript
initial: { opacity: 0, scale: 0.8 }
animate: { opacity: 1, scale: 1 }
transition: { duration: 0.5, ease: 'easeOut' }
```

---

## 컴포넌트 명세 (Frontend 전달용)

### CountdownTimer
```
props: { endsAt: Date, onExpire: () => void }
- 남은 초 계산하여 MM:SS 표시
- 600초(10분) 이하: color #E83D3D + pulse 애니메이션
- 60초 이하: 더 빠른 pulse (duration: 0.8s)
- 0초: onExpire 호출
```

### GuessRow
```
props: { word: string, score: number, isNew: boolean }
- score 0-100 → 색상 매핑 (위 팔레트 참조)
- isNew=true → 진입 애니메이션
- score === 100 → 폭발 이펙트 트리거
```

### SimilarityBar
```
props: { score: number }
- 너비: score%
- 색상: 점수 구간별 그라데이션
- 진입 시 0→score% 애니메이션 (0.8s easeOut)
```

### WinnerOverlay
```
props: { isWinner: boolean, answer: string, winnerNick: string, attempts: number, points: number, nextRoundAt: Date }
- isWinner=true → 금색 폭죽 + 축하 문구
- isWinner=false → 정답 공개 + 위너 정보
```

### GuessInput
```
- 한글 입력 전용 (IME 조합 완료 후 제출)
- Enter 키 제출
- 로딩 중 disabled + Spinner
- 기회 0 → disabled (광고 모달 유도)
```

---

## 글로벌 레이아웃

```
max-width: 480px (모바일 최적)
min-height: 100dvh
padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)

[헤더] — fixed top, height: 56px
[추측 리스트] — flex-1, overflow-y: scroll, padding-bottom: 120px
[입력 영역] — fixed bottom, height: 80px + safe-area-bottom
```

---

## 앱스토어 에셋 계획

| 에셋 | 크기 | 콘셉트 |
|------|------|--------|
| 로고 (라이트) | 600×600 | 딥 네이비 배경 + 금색 💰 아이콘 + "캐치 캐쉬" |
| 로고 (다크) | 600×600 | 동일 (다크 배경 강조) |
| 썸네일 | 1000×1000 | 유사도 바 화면 + "내가 먼저 맞추면 포인트 획득!" |
| 썸네일 와이드 | 1932×828 | 위너 축하 화면 + 로고 |
| 프리뷰1 세로 | 636×1048 | 게임 메인 화면 (추측 리스트 + 카운트다운) |
| 프리뷰2 세로 | 636×1048 | 98% 아쉬움 메시지 클로즈업 |
| 프리뷰3 세로 | 636×1048 | 위너 발생 축하 오버레이 |
| 프리뷰4 세로 | 636×1048 | 힌트 기능 화면 |

에셋 생성: `tools/generate-assets.html` 별도 제작 (QA 단계)

---

## 반응형 / 안전 영역

- Safe area: `env(safe-area-inset-*)` 전체 적용
- 세로 고정 레이아웃 (가로 모드 미지원)
- 최소 터치 타겟: 44×44px (모든 버튼)
- 입력창: 키보드 올라올 때 리스트 자동 스크롤 (최신 추측 노출)
