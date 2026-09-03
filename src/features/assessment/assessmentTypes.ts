/**
 * 설문(Assessment) 데이터 타입.
 *
 * 이 파일은 화면·엔진 어디에도 의존하지 않는다. 순수 타입만 둔다.
 */

/**
 * 시작 경로. 자세한 설명과 상수는 tracks.ts 에 있다.
 * (tracks.ts 가 이 파일을 참조하므로 타입 자체는 여기 둔다)
 */
export type TrackId = 'purpose' | 'assessment';

/** 목적 트랙에서 고른 운동 목적 */
export type PurposeId = 'posture' | 'warmup' | 'functional' | 'strength';

// ---------- 기본 정보 ----------
export type UserType = 'student' | 'adult' | 'athlete' | 'general';
export type AgeGroup = 'teens' | 'twenties' | 'thirties' | 'fortiesPlus';
export type Sex = 'undisclosed' | 'male' | 'female';
export type Place = 'home' | 'school' | 'gym' | 'field';
export type Equipment = 'bodyweight' | 'band' | 'dumbbell' | 'foamRoller' | 'mat';
/** 하루 운동 가능 시간(분) */
export type AvailableTime = 10 | 20 | 30 | 45;

// ---------- 목표 ----------
export type Goal =
  | 'painRelief'      // 통증 완화
  | 'injuryRecovery'  // 부상 후 회복
  | 'posture'         // 체형교정
  | 'flexibility'     // 유연성 향상
  | 'strength'        // 근력 향상
  | 'endurance'       // 체력 향상
  | 'diet'            // 다이어트
  | 'bulkUp'          // 벌크업
  | 'generalHealth'   // 일반 건강관리
  | 'performance';    // 스포츠 수행능력 향상

// ---------- 통증 ----------
export type BodyRegion = 'shoulder' | 'lowBack' | 'knee' | 'ankle' | 'neckUpperBack';
export type PainScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type PainDuration = 'today' | 'within1Week' | 'within1Month' | 'over3Months';
export type PainCause = 'sprain' | 'collision' | 'fall' | 'overuse' | 'unknown';
export type SwellingLevel = 'none' | 'mild' | 'severe';
export type PainOnMovement = 'none' | 'specificMotion' | 'always';
export type DiagnosisHistory = 'none' | 'diagnosed' | 'surgery';

export interface PainDetail {
  region: BodyRegion;
  score: PainScore;
  duration: PainDuration;
  cause: PainCause;
  swelling: SwellingLevel;
  onMovement: PainOnMovement;
  numbness: boolean;
  weakness: boolean;
  nightPain: boolean;
  diagnosis: DiagnosisHistory;
}

// ---------- 위험 신호 ----------
/** docs/SAFETY_POLICY.md §3 — 하나라도 해당하면 운동 추천을 막는다 */
export type RedFlagId =
  | 'severeTrauma'        // 심한 외상 후 통증
  | 'fractureSuspect'     // 골절/탈구 의심
  | 'jointDeformity'      // 관절 모양이 이상함
  | 'cannotBearWeight'    // 체중 부하가 거의 안 됨
  | 'severeSwelling'      // 심한 붓기나 열감
  | 'numbnessParalysis'   // 저림, 마비, 감각 이상
  | 'weakness'            // 힘이 빠지는 증상
  | 'bowelBladder'        // 허리 통증 + 대소변 이상
  | 'chestPain'           // 가슴 통증, 호흡곤란, 실신 느낌
  | 'unexplainedWeightLoss' // 원인 모를 체중 감소
  | 'nightPain'           // 밤에 심하게 아픈 통증
  | 'postOpOrRestricted'; // 수술 직후 또는 의사 운동 제한

export const RED_FLAG_IDS: readonly RedFlagId[] = [
  'severeTrauma',
  'fractureSuspect',
  'jointDeformity',
  'cannotBearWeight',
  'severeSwelling',
  'numbnessParalysis',
  'weakness',
  'bowelBladder',
  'chestPain',
  'unexplainedWeightLoss',
  'nightPain',
  'postOpOrRestricted',
];

/** 즉시 응급 안내를 먼저 보여줘야 하는 항목 */
export const EMERGENCY_FLAG_IDS: readonly RedFlagId[] = ['chestPain', 'bowelBladder'];

// ---------- 운동 경험 ----------
export type ExerciseFrequency = 'none' | 'f1to2' | 'f3to4' | 'f5plus';
export type ExerciseIntensity = 'light' | 'moderate' | 'hard';
export type SquatExperience = 'none' | 'some' | 'familiar';
export type WorkoutStyle = 'short' | 'detailed' | 'intense';
export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseBackground {
  frequency: ExerciseFrequency;
  intensity: ExerciseIntensity;
  squatExperience: SquatExperience;
  painDuringExerciseLastMonth: boolean;
  style: WorkoutStyle;
}

// ---------- 영양 ----------
export type NutritionGoal = 'weightCare' | 'bulkUp' | 'generalHealth' | 'recovery';
export type MealCount = 1 | 2 | 3 | 4;
export type BreakfastHabit = 'daily' | 'sometimes' | 'rarely';
export type ProteinFrequency = 'everyMeal' | 'onceADay' | 'rarely';
export type VegetableFrequency = 'daily' | 'sometimes' | 'rarely';
export type WaterIntake = 'low' | 'medium' | 'high';
export type SnackFrequency = 'rarely' | 'sometimes' | 'often';
export type CaffeineIntake = 'none' | 'sometimes' | 'often';

/**
 * 섭식장애 위험 신호.
 * 하나라도 해당하면 체중감량 플랜을 제공하지 않고 균형식 + 전문가 상담으로 보낸다.
 */
export type EatingRiskId =
  | 'extremeDiet'   // 최근 무리한 다이어트
  | 'skipMeals'     // 식사를 일부러 자주 거름
  | 'bingePurge'    // 폭식/구토/극단적 식이조절 경험
  | 'menstrualIssue'; // 생리불순 또는 무월경

export const EATING_RISK_IDS: readonly EatingRiskId[] = [
  'extremeDiet',
  'skipMeals',
  'bingePurge',
  'menstrualIssue',
];

export interface NutritionSurvey {
  goal: NutritionGoal;
  mealCount: MealCount;
  breakfast: BreakfastHabit;
  protein: ProteinFrequency;
  vegetable: VegetableFrequency;
  water: WaterIntake;
  snack: SnackFrequency;
  /** 알레르기·제외 식품 (선택지 기반) */
  allergies: string[];
  caffeine: CaffeineIntake;
  eatingRisks: EatingRiskId[];
}

// ---------- 수면/피로 ----------
export type SleepQuality = 'poor' | 'fair' | 'good';
export type StressLevel = 'low' | 'medium' | 'high';

// ---------- 설문 전체 ----------
export const ASSESSMENT_SCHEMA_VERSION = 1 as const;

export interface Assessment {
  schemaVersion: typeof ASSESSMENT_SCHEMA_VERSION;
  answeredAt: string;

  /**
   * 어느 경로로 시작했는지. (docs/SAFETY_POLICY.md §21)
   *
   * 이 필드가 생기기 전에 저장된 응답에는 없으므로 선택 필드로 둔다.
   * 읽을 때는 assessmentTrack() 을 써서 기본값을 받는다.
   */
  track?: TrackId;

  /** 목적 트랙에서 고른 운동 목적. 설문 트랙에서는 없다 */
  purpose?: PurposeId;

  userType: UserType;
  ageGroup: AgeGroup;
  sex: Sex;
  heightCm?: number;
  weightKg?: number;
  places: Place[];
  equipment: Equipment[];
  availableTime: AvailableTime;

  goals: Goal[];

  painRegions: BodyRegion[];
  painDetails: PainDetail[];
  redFlags: RedFlagId[];

  exerciseBackground: ExerciseBackground;
  nutrition: NutritionSurvey;

  sleepQuality: SleepQuality;
  stressLevel: StressLevel;
}

/**
 * 이 응답이 어느 트랙인지. 없으면 설문 트랙으로 본다.
 * (트랙 개념이 생기기 전 응답은 모두 설문 트랙이었다)
 */
export function assessmentTrack(assessment: Pick<Assessment, 'track'>): TrackId {
  return assessment.track ?? 'assessment';
}

/** 설문 진행 중의 부분 응답 */
export type AssessmentDraft = Partial<Assessment>;

/**
 * 학생 모드 여부.
 * 사용자 유형이 학생이거나 10대이면 학생 보호 규칙을 적용한다.
 * (docs/SAFETY_POLICY.md §6)
 */
export function isStudentMode(input: {
  userType: UserType;
  ageGroup: AgeGroup;
}): boolean {
  return input.userType === 'student' || input.ageGroup === 'teens';
}
