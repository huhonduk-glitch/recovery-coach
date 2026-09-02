import type {
  AgeGroup,
  AvailableTime,
  BodyRegion,
  EatingRiskId,
  Equipment,
  Goal,
  Place,
  RedFlagId,
  UserType,
} from './assessmentTypes';

/**
 * 설문 문항 정의.
 *
 * 화면은 이 파일만 읽어서 그린다. 문항을 바꿀 때 화면 코드를 고치지 않아도 된다.
 * ⚠️ 위험 신호 문항은 안전과 직결되므로, 문구 변경 시 docs/SAFETY_POLICY.md 도 함께 고친다.
 */

export interface Choice<T extends string | number> {
  value: T;
  label: string;
  hint?: string;
}

// ---------- A. 기본 정보 ----------
export const USER_TYPE_CHOICES: Choice<UserType>[] = [
  { value: 'student', label: '학생', hint: '중·고등학생' },
  { value: 'adult', label: '성인' },
  { value: 'athlete', label: '운동선수', hint: '체대 입시생 포함' },
  { value: 'general', label: '일반인' },
];

export const AGE_GROUP_CHOICES: Choice<AgeGroup>[] = [
  { value: 'teens', label: '10대' },
  { value: 'twenties', label: '20대' },
  { value: 'thirties', label: '30대' },
  { value: 'fortiesPlus', label: '40대 이상' },
];

export const SEX_CHOICES: Choice<'undisclosed' | 'male' | 'female'>[] = [
  { value: 'undisclosed', label: '선택 안 함' },
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
];

export const PLACE_CHOICES: Choice<Place>[] = [
  { value: 'home', label: '집' },
  { value: 'school', label: '학교' },
  { value: 'gym', label: '헬스장' },
  { value: 'field', label: '운동장' },
];

export const EQUIPMENT_CHOICES: Choice<Equipment>[] = [
  { value: 'bodyweight', label: '맨몸' },
  { value: 'band', label: '밴드' },
  { value: 'dumbbell', label: '덤벨' },
  { value: 'foamRoller', label: '폼롤러' },
  { value: 'mat', label: '매트' },
];

export const AVAILABLE_TIME_CHOICES: Choice<AvailableTime>[] = [
  { value: 10, label: '10분' },
  { value: 20, label: '20분' },
  { value: 30, label: '30분' },
  { value: 45, label: '45분 이상' },
];

// ---------- B. 목표 ----------
export const GOAL_CHOICES: Choice<Goal>[] = [
  { value: 'painRelief', label: '통증 완화' },
  { value: 'injuryRecovery', label: '부상 후 회복' },
  { value: 'posture', label: '체형교정' },
  { value: 'flexibility', label: '유연성 향상' },
  { value: 'strength', label: '근력 향상' },
  { value: 'endurance', label: '체력 향상' },
  { value: 'diet', label: '다이어트' },
  { value: 'bulkUp', label: '벌크업' },
  { value: 'generalHealth', label: '일반 건강관리' },
  { value: 'performance', label: '스포츠 수행능력 향상' },
];

// ---------- C. 통증 부위 ----------
export const BODY_REGION_CHOICES: Choice<BodyRegion>[] = [
  { value: 'shoulder', label: '어깨' },
  { value: 'lowBack', label: '허리' },
  { value: 'knee', label: '무릎' },
  { value: 'ankle', label: '발목' },
  { value: 'neckUpperBack', label: '목 / 등 상부' },
];

export const PAIN_DURATION_CHOICES = [
  { value: 'today', label: '오늘' },
  { value: 'within1Week', label: '1주 이내' },
  { value: 'within1Month', label: '1개월 이내' },
  { value: 'over3Months', label: '3개월 이상' },
] as const;

export const PAIN_CAUSE_CHOICES = [
  { value: 'sprain', label: '접질림' },
  { value: 'collision', label: '충돌' },
  { value: 'fall', label: '넘어짐' },
  { value: 'overuse', label: '반복사용' },
  { value: 'unknown', label: '모름' },
] as const;

export const SWELLING_CHOICES = [
  { value: 'none', label: '없음' },
  { value: 'mild', label: '약간' },
  { value: 'severe', label: '심함' },
] as const;

export const ON_MOVEMENT_CHOICES = [
  { value: 'none', label: '없음' },
  { value: 'specificMotion', label: '특정 동작에서' },
  { value: 'always', label: '항상' },
] as const;

export const DIAGNOSIS_CHOICES = [
  { value: 'none', label: '없음' },
  { value: 'diagnosed', label: '있음' },
  { value: 'surgery', label: '수술 경험 있음' },
] as const;

/** 통증 점수 0~10 을 말로 풀어 준다. 숫자만 두면 사람마다 기준이 달라진다. */
export function painScoreLabel(score: number): string {
  if (score === 0) return '통증 없음';
  if (score <= 3) return '신경 쓰이지만 생활은 가능';
  if (score <= 6) return '움직일 때 꽤 아픔';
  if (score <= 8) return '많이 아픔, 생활이 어려움';
  return '참기 어려움';
}

// ---------- D. 위험 신호 ----------
export interface RedFlagQuestion {
  id: RedFlagId;
  label: string;
  hint: string;
}

/**
 * 위험 신호 체크리스트.
 * 하나라도 해당하면 운동 추천을 막고 전문가 상담 안내로 보낸다.
 */
export const RED_FLAG_QUESTIONS: readonly RedFlagQuestion[] = [
  {
    id: 'severeTrauma',
    label: '심한 외상 후 통증이 있다',
    hint: '크게 부딪히거나 넘어진 뒤 생긴 통증',
  },
  {
    id: 'fractureSuspect',
    label: '골절이나 탈구가 의심된다',
    hint: '뚝 소리가 났거나, 관절이 빠진 느낌이 있었다',
  },
  { id: 'jointDeformity', label: '관절 모양이 이상하다', hint: '평소와 다르게 튀어나오거나 휘었다' },
  {
    id: 'cannotBearWeight',
    label: '체중을 싣기 어렵다',
    hint: '아픈 다리로 서 있거나 걷기가 거의 안 된다',
  },
  { id: 'severeSwelling', label: '심한 붓기나 열감이 있다', hint: '눈에 띄게 붓고 만지면 뜨겁다' },
  {
    id: 'numbnessParalysis',
    label: '저림, 마비, 감각 이상이 있다',
    hint: '찌릿하거나 감각이 둔한 부위가 있다',
  },
  { id: 'weakness', label: '힘이 빠지는 증상이 있다', hint: '물건을 놓치거나 다리에 힘이 안 들어간다' },
  {
    id: 'bowelBladder',
    label: '허리 통증과 함께 대소변에 이상이 있다',
    hint: '소변이 잘 안 나오거나 조절이 어렵다',
  },
  {
    id: 'chestPain',
    label: '가슴 통증, 호흡곤란, 실신할 것 같은 느낌이 있었다',
    hint: '운동 중 또는 평상시 모두 포함',
  },
  {
    id: 'unexplainedWeightLoss',
    label: '원인 모를 체중 감소가 있다',
    hint: '다이어트를 하지 않았는데 체중이 줄었다',
  },
  { id: 'nightPain', label: '밤에 가만히 있어도 심하게 아프다', hint: '자다가 통증으로 깬다' },
  {
    id: 'postOpOrRestricted',
    label: '수술 직후이거나 의사에게 운동 제한을 안내받았다',
    hint: '의료진 지시가 항상 우선입니다',
  },
];

// ---------- E. 운동 경험 ----------
export const EXERCISE_FREQUENCY_CHOICES = [
  { value: 'none', label: '0회' },
  { value: 'f1to2', label: '1~2회' },
  { value: 'f3to4', label: '3~4회' },
  { value: 'f5plus', label: '5회 이상' },
] as const;

export const EXERCISE_INTENSITY_CHOICES = [
  { value: 'light', label: '가벼움' },
  { value: 'moderate', label: '보통' },
  { value: 'hard', label: '강함' },
] as const;

export const SQUAT_EXPERIENCE_CHOICES = [
  { value: 'none', label: '없음' },
  { value: 'some', label: '조금' },
  { value: 'familiar', label: '익숙함' },
] as const;

export const WORKOUT_STYLE_CHOICES = [
  { value: 'short', label: '짧고 간단하게' },
  { value: 'detailed', label: '자세한 설명과 함께' },
  { value: 'intense', label: '강도 있게' },
] as const;

// ---------- F. 영양 ----------
export const NUTRITION_GOAL_CHOICES = [
  { value: 'weightCare', label: '건강 체중관리' },
  { value: 'bulkUp', label: '벌크업 / 근육량 증가' },
  { value: 'generalHealth', label: '일반 건강식' },
  { value: 'recovery', label: '회복 / 면역 / 미네랄' },
] as const;

export const MEAL_COUNT_CHOICES = [
  { value: 1, label: '1회' },
  { value: 2, label: '2회' },
  { value: 3, label: '3회' },
  { value: 4, label: '4회 이상' },
] as const;

export const BREAKFAST_CHOICES = [
  { value: 'daily', label: '매일' },
  { value: 'sometimes', label: '가끔' },
  { value: 'rarely', label: '거의 안 먹음' },
] as const;

export const PROTEIN_CHOICES = [
  { value: 'everyMeal', label: '매 끼니' },
  { value: 'onceADay', label: '하루 1회' },
  { value: 'rarely', label: '거의 없음' },
] as const;

export const VEGETABLE_CHOICES = [
  { value: 'daily', label: '매일' },
  { value: 'sometimes', label: '가끔' },
  { value: 'rarely', label: '거의 없음' },
] as const;

export const WATER_CHOICES = [
  { value: 'low', label: '적음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '많음' },
] as const;

export const SNACK_CHOICES = [
  { value: 'rarely', label: '거의 없음' },
  { value: 'sometimes', label: '가끔' },
  { value: 'often', label: '자주' },
] as const;

export const CAFFEINE_CHOICES = [
  { value: 'none', label: '없음' },
  { value: 'sometimes', label: '가끔' },
  { value: 'often', label: '자주' },
] as const;

export const ALLERGY_CHOICES: Choice<string>[] = [
  { value: 'milk', label: '우유 / 유제품' },
  { value: 'egg', label: '달걀' },
  { value: 'nut', label: '견과류' },
  { value: 'seafood', label: '해산물 / 생선' },
  { value: 'soy', label: '콩 / 대두' },
  { value: 'wheat', label: '밀 / 글루텐' },
];

/**
 * 학생 사용자에게 추가로 묻는 식습관 위험 신호.
 * 하나라도 해당하면 체중감량 플랜 대신 균형식 + 전문가 상담으로 보낸다.
 */
export interface EatingRiskQuestion {
  id: EatingRiskId;
  label: string;
}

export const EATING_RISK_QUESTIONS: readonly EatingRiskQuestion[] = [
  { id: 'extremeDiet', label: '최근 무리한 다이어트를 한 적이 있다' },
  { id: 'skipMeals', label: '식사를 일부러 자주 거른다' },
  { id: 'bingePurge', label: '폭식이나 구토, 극단적인 식이조절 경험이 있다' },
  { id: 'menstrualIssue', label: '생리불순 또는 무월경이 있다' },
];

// ---------- 수면 / 스트레스 ----------
export const SLEEP_CHOICES = [
  { value: 'poor', label: '부족하다' },
  { value: 'fair', label: '보통이다' },
  { value: 'good', label: '충분하다' },
] as const;

export const STRESS_CHOICES = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
] as const;
