# 리커버핏 Coach — 아키텍처 설계서

> 문서 버전: v0.1 (초안)
> 최종 수정: 2026-09-02
> 대상 독자: 개발자(본인 + AI 협업), 코드 리뷰어

---

## 1. 설계 원칙

1. **안전 우선 (Safety First)** — 안전 게이트는 다른 모든 로직보다 먼저 실행된다. 우회 경로를 만들지 않는다.
2. **로컬 온리 (Local-only)** — 1차 버전은 네트워크 요청 없음. 건강정보가 기기를 떠나지 않는다.
3. **결정론적 룰 엔진 (Deterministic)** — 같은 입력 → 항상 같은 출력. 랜덤·AI 생성 없음. 테스트 가능해야 한다.
4. **콘텐츠와 로직 분리** — 운동/영양 내용은 데이터(JSON/TS). 코드 수정 없이 콘텐츠만 교체 가능.
5. **화면은 얇게 (Thin UI)** — 화면은 렌더링만. 판단은 전부 `src/engine`.
6. **타입으로 막기** — `strict: true`. 위험 판정 결과는 유니온 타입으로 표현해 분기 누락을 컴파일 타임에 잡는다.

---

## 2. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 런타임 | Expo (React Native) | 네이티브 빌드 환경 없이 개발·배포 가능. 비전공자 진입 장벽 최소 |
| 언어 | TypeScript (strict) | 안전 분기 누락 방지 |
| 라우팅 | Expo Router | 파일 기반 라우팅. 화면 구조가 폴더로 드러남 |
| UI | React Native Paper + 커스텀 테마 | 접근성·컴포넌트 기본기 확보. 테마로 톤 통일 |
| 로컬 저장 | `@react-native-async-storage/async-storage` | 단순 key-value. 1차 요구에 충분 |
| 상태 관리 | React Context + `useReducer` (전역 최소) | 외부 상태 라이브러리 없이 시작. 복잡해지면 Zustand 검토 |
| 콘텐츠 | 로컬 TypeScript / JSON | 오프라인 동작, 리뷰 가능 |
| 테스트 | Jest (`jest-expo`) + React Native Testing Library | 룰 엔진 단위 테스트가 핵심 |
| 품질 | ESLint + Prettier | |

### 2.1 의존성 최소 원칙
- 애널리틱스 SDK, 크래시 리포팅 SDK는 **MVP에서 넣지 않는다.** (건강정보 유출 경로 차단)
- 광고 SDK 금지.
- 추가 라이브러리는 "이게 없으면 안 되는가"를 통과해야 도입한다.

---

## 3. 폴더 구조

```
recovery-coach/
├─ app/                          # Expo Router — 화면(파일=라우트)
│  ├─ _layout.tsx                # 루트 레이아웃 + 전역 Provider + 동의 가드
│  ├─ index.tsx                  # 진입 분기 (동의 여부 → 온보딩 or 홈)
│  ├─ (onboarding)/
│  │  ├─ _layout.tsx
│  │  ├─ intro.tsx
│  │  ├─ safety.tsx              # 안전 안내 + 동의
│  │  └─ profile.tsx
│  ├─ (survey)/
│  │  ├─ _layout.tsx             # 설문 진행 상태 Provider
│  │  ├─ screening.tsx
│  │  ├─ body.tsx
│  │  ├─ pain.tsx
│  │  ├─ activity.tsx
│  │  ├─ goal.tsx
│  │  └─ nutrition.tsx
│  ├─ (result)/
│  │  ├─ summary.tsx
│  │  ├─ exercise.tsx
│  │  ├─ nutrition.tsx
│  │  └─ blocked.tsx             # 루틴 미제공 + 상담 안내
│  ├─ (tabs)/
│  │  ├─ _layout.tsx
│  │  ├─ home.tsx
│  │  ├─ routine.tsx
│  │  ├─ record.tsx
│  │  └─ settings.tsx
│  └─ session/
│     ├─ [routineId].tsx
│     ├─ play.tsx
│     └─ complete.tsx
│
├─ src/
│  ├─ theme/                     # 디자인 토큰
│  │  ├─ colors.ts
│  │  ├─ typography.ts
│  │  ├─ spacing.ts
│  │  └─ index.ts
│  ├─ components/                # 재사용 UI (로직 없음)
│  │  ├─ common/                 # Button, Card, Slider, ProgressBar ...
│  │  ├─ survey/                 # QuestionCard, BodyMap, PainScale ...
│  │  ├─ exercise/               # ExerciseCard, PhaseBadge, Timer ...
│  │  └─ safety/                 # DisclaimerBanner, WarningCard ...
│  ├─ engine/                    # ★ 판단 로직 (순수 함수, UI 의존 없음)
│  │  ├─ safety/
│  │  │  ├─ redFlags.ts          # 레드 플래그 판정
│  │  │  ├─ painGate.ts          # 통증 컷오프 판정
│  │  │  └─ index.ts
│  │  ├─ exercise/
│  │  │  ├─ selectCategory.ts
│  │  │  ├─ decidePhase.ts
│  │  │  ├─ buildRoutine.ts
│  │  │  └─ progression.ts
│  │  ├─ nutrition/
│  │  │  ├─ selectTrack.ts
│  │  │  └─ buildGuide.ts
│  │  └─ __tests__/              # 룰 엔진 테스트 (경계값 필수)
│  ├─ content/                   # 콘텐츠 데이터 (코드 아님)
│  │  ├─ exercises/
│  │  │  ├─ shoulder.ts
│  │  │  ├─ lowBack.ts
│  │  │  ├─ knee.ts
│  │  │  ├─ ankle.ts
│  │  │  ├─ neckUpperBack.ts
│  │  │  ├─ posture.ts           # 체형교정
│  │  │  ├─ dynamicWarmup.ts
│  │  │  └─ functional.ts
│  │  ├─ nutrition/
│  │  │  ├─ weightCare.ts
│  │  │  ├─ bulkUp.ts
│  │  │  ├─ general.ts
│  │  │  └─ recovery.ts
│  │  ├─ survey/
│  │  │  └─ questions.ts
│  │  └─ copy/
│  │     ├─ disclaimer.ts        # 면책 문구 (버전 관리)
│  │     └─ blockedMessages.ts
│  ├─ storage/
│  │  ├─ keys.ts                 # 저장 키 상수
│  │  ├─ storage.ts              # AsyncStorage 래퍼 (JSON 직렬화 + 스키마 버전)
│  │  ├─ repositories/           # profile / survey / plan / record / settings
│  │  └─ migrate.ts              # 스키마 버전 마이그레이션
│  ├─ context/
│  │  ├─ AppProvider.tsx
│  │  ├─ ConsentContext.tsx
│  │  ├─ SurveyContext.tsx
│  │  └─ SessionContext.tsx
│  ├─ hooks/
│  ├─ types/                     # 도메인 타입 (§5)
│  └─ utils/
│
├─ assets/                       # 이미지·아이콘·폰트
│  ├─ exercises/                 # 동작 이미지
│  └─ icons/
│
├─ docs/                         # 본 문서들
├─ app.json
├─ package.json
├─ tsconfig.json
├─ .gitignore
└─ README.md
```

### 3.1 의존 방향 규칙 (지켜야 하는 선)
```
app/  →  src/components  →  src/theme
  ↓            ↓
src/context → src/engine → src/content
                  ↓
             src/types
```
- `src/engine` 은 **React를 import 하지 않는다.** (순수 함수 유지 → 테스트 쉬움)
- `src/content` 는 **아무것도 import 하지 않는다.** (`src/types` 제외)
- 화면(`app/`)에서 직접 AsyncStorage 를 호출하지 않는다. 반드시 `src/storage/repositories` 경유.

---

## 4. 라우팅 & 화면 전이

### 4.1 진입 가드 (`app/_layout.tsx`)
```
앱 시작
 → 저장소에서 consent 로드
    ├─ consent 없음 또는 버전 불일치 → /(onboarding)/intro 로 리다이렉트
    └─ consent 있음
        ├─ 최근 설문 없음 → /(survey)/screening
        └─ 설문 있음 → /(tabs)/home
```
- 면책 문구가 개정되면 `DISCLAIMER_VERSION` 을 올린다 → 기존 사용자도 재동의 화면을 다시 본다.

### 4.2 차단 화면으로의 강제 이동
`blocked` 화면은 **뒤로가기로 우회할 수 없어야 한다.**
- `router.replace()` 사용 (push 아님)
- 스택 초기화 후 이동
- 차단 사유는 `blockedReason` 파라미터로 전달하되, 사유는 **유형 코드**만 넘긴다 (자유 텍스트 금지)

---

## 5. 데이터 구조 (도메인 타입)

> 실제 파일: `src/types/*.ts`. 아래는 확정 초안.

```ts
// ---------- 공통 ----------
export type Mode = 'student' | 'adult';
export type SchemaVersion = 1;

// ---------- 프로필 ----------
export type AgeBand = '13-15' | '16-18' | '19-29' | '30-39' | '40-49' | '50-59' | '60+';
export type Sex = 'female' | 'male' | 'undisclosed';

export interface Profile {
  ageBand: AgeBand;
  sex: Sex;
  mode: Mode;              // 18세 미만이면 항상 'student'
  createdAt: string;       // ISO
  updatedAt: string;
}

// ---------- 동의 ----------
export interface Consent {
  agreed: boolean;
  disclaimerVersion: number;
  agreedAt: string;
}

// ---------- 설문 ----------
export type BodyPart =
  | 'shoulder' | 'lowBack' | 'knee' | 'ankle' | 'neckUpperBack' | 'none';

export type PainLevel = 0|1|2|3|4|5|6|7|8|9|10;
export type PainDuration = 'under3d' | 'w1to4' | 'm1to3' | 'over3m';
export type PainTrigger = 'onMove' | 'onSit' | 'morning' | 'afterExercise' | 'always';

export interface PainDetail {
  part: Exclude<BodyPart, 'none'>;
  level: PainLevel;
  duration: PainDuration;
  triggers: PainTrigger[];
}

export type RedFlagId =
  | 'rf_recent_injury' | 'rf_night_pain' | 'rf_numbness' | 'rf_post_op'
  | 'rf_systemic' | 'rf_chest' | 'rf_pregnancy' | 'rf_doctor_stop';

export type Goal = 'recovery' | 'posture' | 'function' | 'weightCare' | 'muscle';
export type Equipment = 'none' | 'band' | 'mat' | 'dumbbell' | 'bar';

export interface ExerciseSurvey {
  parts: BodyPart[];               // 최대 3
  pains: PainDetail[];
  activityFreq: 'none' | 'f1to2' | 'f3to4' | 'f5plus';
  experience: 'beginner' | 'some' | 'familiar';
  timeBudgetMin: 5 | 10 | 15 | 20;
  equipment: Equipment[];
  goals: Goal[];                   // 최대 2
}

export interface NutritionSurvey {
  mealRegularity: 'irregular' | 'twoMeals' | 'threeMeals';
  proteinFreq: 'rare' | 'sometimes' | 'daily';
  vegFreq: 'rare' | 'sometimes' | 'daily';
  water: 'low' | 'mid' | 'high';
  goal: NutritionTrack;
  restrictions: string[];          // 알레르기 등 (선택지 기반, 자유입력 금지)
  lateNight: boolean;
}

export interface SurveyResult {
  schemaVersion: SchemaVersion;
  answeredAt: string;
  redFlags: RedFlagId[];           // 비어 있어야 통과
  exercise: ExerciseSurvey;
  nutrition: NutritionSurvey;
}

// ---------- 운동 콘텐츠 ----------
export type ExerciseCategory =
  | 'posture' | 'dynamicWarmup' | 'functional'
  | 'shoulderRecovery' | 'lowBackRecovery' | 'kneeRecovery'
  | 'ankleRecovery' | 'neckUpperBackRecovery';

export type Phase = 1 | 2 | 3 | 4;

export interface Exercise {
  id: string;
  name: string;                    // 한국어 동작명
  category: ExerciseCategory;
  phase: Phase;
  purpose: string;                 // 이 동작을 왜 하는지 (1문장)
  cues: string[];                  // 수행 큐 3~5개
  cautions: string[];              // 하지 말아야 할 것
  stopSigns: string[];             // 즉시 중단 신호
  reps?: number;
  sets?: number;
  holdSec?: number;
  restSec?: number;
  equipment: Equipment[];
  image?: string;                  // assets 경로
  estimatedSec: number;
}

export interface Routine {
  id: string;
  title: string;
  category: ExerciseCategory;
  phase: Phase;
  exerciseIds: string[];
  totalSec: number;
  description: string;
}

// ---------- 추천 결과 ----------
export type BlockReason =
  | 'redFlag' | 'painTooHigh' | 'painWorsening' | 'noConsent';

export type ExerciseRecommendation =
  | { status: 'blocked'; reason: BlockReason; guidanceKey: string }
  | { status: 'ok'; routines: Routine[]; phase: Phase; notes: string[] };

// ---------- 영양 ----------
export type NutritionTrack = 'weightCare' | 'bulkUp' | 'general' | 'recovery';

export interface HandPortionGuide {
  protein: string;      // 예: "매 끼 손바닥 1개분"
  vegetable: string;
  carb: string;
  fat: string;
}

export interface NutritionGuide {
  track: NutritionTrack;
  mode: Mode;
  headline: string;
  handPortions: HandPortionGuide;
  foodExamples: { group: string; items: string[] }[];
  tips: string[];
  macroRatio?: { carb: number; protein: number; fat: number }; // 학생 모드에서는 undefined
  calorieRange?: string;                                        // 학생 모드에서는 undefined
  cautions: string[];
}

// ---------- 기록 ----------
export interface SessionRecord {
  id: string;
  routineId: string;
  startedAt: string;
  finishedAt?: string;
  completed: boolean;
  abortReason?: 'pain' | 'time' | 'difficulty' | 'other';
  painBefore?: PainLevel;
  painAfter?: PainLevel;
  perceivedEffort?: 1|2|3|4|5;
}

export interface PlanState {
  category: ExerciseCategory;
  phase: Phase;
  consecutiveWorsening: number;    // 통증 증가 연속 횟수
  sessionsInPhase: number;
  updatedAt: string;
}
```

---

## 6. 룰 엔진 설계

### 6.1 전체 파이프라인
```
SurveyResult
   │
   ├─▶ [1] evaluateRedFlags()        → RedFlagId[]
   │        비어있지 않음 → blocked('redFlag')
   │
   ├─▶ [2] evaluatePainGate()        → 'block' | 'phase1' | 'pass'
   │        block → blocked('painTooHigh')
   │
   ├─▶ [3] selectCategories()        → ExerciseCategory[]
   │
   ├─▶ [4] decidePhase()             → Phase
   │
   └─▶ [5] buildRoutine()            → Routine[]
              (시간예산·장비로 동작 필터링)
```

### 6.2 [1] 레드 플래그 판정
```ts
// src/engine/safety/redFlags.ts
export function evaluateRedFlags(answers: Record<RedFlagId, boolean>): RedFlagId[] {
  return (Object.keys(answers) as RedFlagId[]).filter((id) => answers[id] === true);
}

export function isBlockedByRedFlag(flags: RedFlagId[]): boolean {
  return flags.length > 0;   // 단 하나라도 있으면 차단. 가중치·점수 없음.
}
```
> **설계 의도**: 점수화하지 않는다. "2개 이상이면 차단" 같은 완화 규칙을 두지 않는다.

### 6.3 [2] 통증 게이트 (초안값 — 검수 필요)
```ts
// src/engine/safety/painGate.ts
const PAIN_BLOCK_THRESHOLD = 7;   // ← 초안값. 전문가 검수 후 확정
const PAIN_PHASE1_THRESHOLD = 4;  // ← 초안값

export type PainGateResult = 'block' | 'forcePhase1' | 'pass';

export function evaluatePainGate(pains: PainDetail[]): PainGateResult {
  const max = Math.max(0, ...pains.map((p) => p.level));
  if (max >= PAIN_BLOCK_THRESHOLD) return 'block';
  if (max >= PAIN_PHASE1_THRESHOLD) return 'forcePhase1';
  return 'pass';
}
```

### 6.4 [3] 카테고리 선택
```ts
const PART_TO_CATEGORY: Record<Exclude<BodyPart,'none'>, ExerciseCategory> = {
  shoulder:      'shoulderRecovery',
  lowBack:       'lowBackRecovery',
  knee:          'kneeRecovery',
  ankle:         'ankleRecovery',
  neckUpperBack: 'neckUpperBackRecovery',
};

// 통증 부위가 있으면 회복 카테고리 우선.
// 통증 없음 + 목표에 따라 보조 카테고리 추가.
// 한 세션에 최대 2개 카테고리까지만 조합한다. (과부하 방지)
```

### 6.5 [4] Phase 결정
```ts
export function decidePhase(input: {
  gate: PainGateResult;
  maxPain: PainLevel;
  duration: PainDuration;
  experience: ExerciseSurvey['experience'];
  goals: Goal[];
}): Phase {
  if (input.gate === 'forcePhase1') return 1;
  if (input.maxPain >= 2) return 2;
  if (input.duration === 'over3m' || input.experience === 'beginner') return 2;
  if (input.goals.includes('function')) return 3;
  return 3;   // Phase 4 는 자동 배정하지 않는다 → 진행 기록으로만 도달
}
```
> **원칙**: Phase 4(기능 복귀)는 첫 설문만으로 배정하지 않는다. 반드시 수행 기록을 거쳐 도달한다.

### 6.6 [5] 루틴 조립
```
입력: category, phase, timeBudgetMin, equipment
1. content 에서 (category, phase) 로 동작 후보 조회
2. equipment 로 필터 (사용자가 가진 장비만)
3. 정렬: 콘텐츠에 정의된 order (임의 셔플 금지)
4. estimatedSec 누적이 timeBudget 을 넘기 직전까지 담기
5. 최소 동작 수 미달이면 → 시간 초과를 허용하고 최소 개수는 보장
```

### 6.7 진행/후퇴 규칙
```ts
// 운동 후 통증 체크 결과 반영
export function updatePlan(plan: PlanState, record: SessionRecord): PlanState {
  const worsened =
    record.painAfter != null && record.painBefore != null &&
    record.painAfter > record.painBefore;

  if (worsened) {
    const n = plan.consecutiveWorsening + 1;
    if (n >= 3) return { ...plan, /* 상위 레이어에서 blocked 처리 */ consecutiveWorsening: n };
    if (n >= 2 && plan.phase > 1) {
      return { ...plan, phase: (plan.phase - 1) as Phase, consecutiveWorsening: n, sessionsInPhase: 0 };
    }
    return { ...plan, consecutiveWorsening: n };
  }
  return { ...plan, consecutiveWorsening: 0, sessionsInPhase: plan.sessionsInPhase + 1 };
}
```
- Phase 상승은 자동으로 하지 않는다. `sessionsInPhase >= MIN_SESSIONS` 이고 통증 증가가 없을 때 **사용자에게 제안**만 한다.
- `MIN_SESSIONS` 기본 초안: Phase당 6회 (검수 필요).

### 6.8 영양 트랙 선택
```
학생 모드 && goal === 'weightCare'  →  트랙을 'general' 로 강제 대체 + 안내 문구
그 외                              →  설문 goal 그대로 매핑
회복기(통증 부위 존재 또는 최근 부상) → 'recovery' 우선
```

### 6.9 테스트 요구사항 (필수)
| 테스트 | 케이스 |
|---|---|
| 레드 플래그 | 각 플래그 단독 true → 반드시 blocked |
| 통증 경계값 | 6/7 경계, 3/4 경계 각각 검증 |
| 학생 모드 | weightCare 선택 시 general 로 대체되는지 |
| 학생 모드 | 결과 객체에 `calorieRange`, `macroRatio` 가 `undefined` 인지 |
| Phase 후퇴 | 통증 증가 2회 → 한 단계 하향 |
| Phase 차단 | 통증 증가 3회 → blocked |
| 루틴 조립 | 장비 없음 사용자에게 밴드 동작이 안 나오는지 |
| 결정론 | 같은 입력 100회 실행 → 동일 출력 |

---

## 7. 저장소 설계

### 7.1 키
```ts
// src/storage/keys.ts
export const STORAGE_KEYS = {
  consent:  '@rfc/consent',
  profile:  '@rfc/profile',
  survey:   '@rfc/survey/latest',
  plan:     '@rfc/plan/current',
  records:  '@rfc/records',
  settings: '@rfc/settings',
  schema:   '@rfc/schemaVersion',
} as const;
```

### 7.2 래퍼 규칙
- 모든 read/write 는 `src/storage/storage.ts` 의 `getJSON<T>` / `setJSON<T>` 만 사용.
- 읽기 실패·파싱 실패 시 **앱을 죽이지 않고** 기본값 반환 + 내부 플래그 기록.
- 쓰기 전 스키마 버전 태깅.

### 7.3 마이그레이션
```
저장된 schemaVersion < 현재 버전
  → migrate.ts 의 단계별 변환 함수 순차 적용
  → 변환 불가하면 데이터 초기화 + 사용자에게 "설문을 다시 진행해주세요" 안내
```

### 7.4 삭제
- 설정 > "내 데이터 전체 삭제" → `STORAGE_KEYS` 전체 `multiRemove` + 앱 상태 초기화 + 온보딩 재진입.
- 삭제는 되돌릴 수 없음을 확인 다이얼로그로 2단계 확인.

---

## 8. 상태 관리

| 상태 | 위치 | 이유 |
|---|---|---|
| 동의 여부 | `ConsentContext` (전역) | 라우팅 가드가 필요 |
| 프로필/모드 | `AppProvider` (전역) | 학생 모드 분기가 전 화면에 영향 |
| 설문 진행 중 응답 | `SurveyContext` (설문 그룹 한정) | 설문 벗어나면 폐기 |
| 운동 세션 진행 | `SessionContext` (session 그룹 한정) | 타이머·현재 동작 인덱스 |
| 기록 목록 | 화면 로컬 state + repository 조회 | 전역화 불필요 |

- 전역 상태는 **최소한**으로. 전역이 커지면 안전 분기 추적이 어려워진다.

---

## 9. 테마 시스템

```ts
// src/theme/colors.ts — 값은 디자인 확정 후 조정
export const colors = {
  primary:      '#1F6F63',
  primaryLight: '#E6F2EF',
  secondary:    '#3C6E9B',
  warning:      '#C77700',
  danger:       '#B3261E',
  success:      '#2E7D32',
  text:         '#1A1C1B',
  textMuted:    '#5A6260',
  surface:      '#FFFFFF',
  background:   '#F7F9F8',
  border:       '#DCE3E1',
} as const;
```
- 색상 하드코딩 금지. 반드시 `theme` 경유.
- `danger` 는 **중단·상담 안내 전용**. 일반 버튼에 쓰지 않는다 (경고 신호 희석 방지).
- 다크모드는 MVP 이후. 단, 토큰 구조는 지금부터 교체 가능하게 만든다.

---

## 10. 접근성 & 성능

**접근성**
- 모든 인터랙티브 요소에 `accessibilityLabel`, `accessibilityRole`.
- 통증 슬라이더는 숫자 + 텍스트 라벨 동시 제공.
- 대비비 4.5:1 이상, 터치 타깃 48dp 이상.
- 폰트 스케일 확대(시스템 설정) 대응 — 고정 높이 컨테이너 지양.

**성능**
- 콘텐츠는 앱 번들에 포함(오프라인 동작).
- 동작 이미지는 WebP, 화면 폭 기준 2x까지만.
- 루틴 실행 화면은 리렌더 최소화 (타이머는 `useRef` + 인터벌, 초 단위만 상태 갱신).

---

## 11. 보안 / 프라이버시 구현 규칙

1. 네트워크 호출 없음 — `fetch` 사용 시 코드 리뷰에서 사유를 명시해야 통과.
2. 설문 응답·기록을 로그(`console.log`)에 출력하지 않는다. 개발 중에도 마스킹.
3. 크래시 리포트·애널리틱스 SDK 미도입 (MVP).
4. `.env`, 키 파일은 커밋하지 않는다 (`.gitignore` 강제).
5. 스크린샷·문서·이슈에 실제 사용자 응답값을 붙여넣지 않는다.
6. 백업 대상 제외 검토: iOS `excludeFromBackup` 여부는 출시 전 결정.

---

## 12. 에러 처리

| 상황 | 처리 |
|---|---|
| 저장소 읽기 실패 | 기본값으로 진행 + 홈에 "일부 기록을 불러오지 못했어요" 배너 |
| 콘텐츠 조회 결과 0건 | 루틴 미생성 → "적합한 루틴을 찾지 못했습니다. 전문가 상담을 권합니다" (억지 대체 금지) |
| 스키마 불일치 | 마이그레이션 → 실패 시 초기화 안내 |
| 예상치 못한 예외 | ErrorBoundary → 안전 화면 (면책 문구 유지) |

> **중요**: 어떤 에러 상황에서도 "일단 아무 루틴이나 보여주기"는 하지 않는다.

---

## 13. 빌드 & 배포 (개요)
- 개발: `npx expo start` → Expo Go 로 실기기 확인
- 빌드: EAS Build (`eas build -p android/ios`)
- 버전: `app.json` 의 `version` + `DISCLAIMER_VERSION` 을 함께 관리
- 스토어 심사 대비: 앱 설명·스크린샷에 "치료/진단/의료기기" 오인 표현 금지 (SAFETY_POLICY.md §8)
