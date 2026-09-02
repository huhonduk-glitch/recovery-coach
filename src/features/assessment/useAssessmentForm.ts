import { useCallback, useMemo, useState } from 'react';

import {
  ASSESSMENT_SCHEMA_VERSION,
  isStudentMode,
  type AgeGroup,
  type Assessment,
  type AvailableTime,
  type BodyRegion,
  type EatingRiskId,
  type Equipment,
  type ExerciseBackground,
  type Goal,
  type NutritionSurvey,
  type PainDetail,
  type PainScore,
  type Place,
  type RedFlagId,
  type Sex,
  type SleepQuality,
  type StressLevel,
  type UserType,
} from './assessmentTypes';

/**
 * 설문 상태 관리.
 *
 * 화면은 이 훅만 쓰면 되고, 저장 형식(Assessment)은 여기서 한 번에 만든다.
 */

export interface AssessmentFormState {
  userType: UserType | null;
  ageGroup: AgeGroup | null;
  sex: Sex | null;
  places: Place[];
  equipment: Equipment[];
  availableTime: AvailableTime | null;
  goals: Goal[];
  painRegions: BodyRegion[];
  painDetails: Partial<Record<BodyRegion, Partial<PainDetail>>>;
  redFlags: RedFlagId[];
  redFlagsConfirmed: boolean;
  background: Partial<ExerciseBackground>;
  nutrition: Partial<NutritionSurvey>;
  eatingRisks: EatingRiskId[];
  sleepQuality: SleepQuality | null;
  stressLevel: StressLevel | null;
}

const INITIAL: AssessmentFormState = {
  userType: null,
  ageGroup: null,
  sex: null,
  places: [],
  equipment: [],
  availableTime: null,
  goals: [],
  painRegions: [],
  painDetails: {},
  redFlags: [],
  redFlagsConfirmed: false,
  background: {},
  nutrition: { allergies: [] },
  eatingRisks: [],
  sleepQuality: null,
  stressLevel: null,
};

function toggle<T>(list: T[], value: T, max?: number): T[] {
  if (list.includes(value)) return list.filter((v) => v !== value);
  if (max !== undefined && list.length >= max) return list;
  return [...list, value];
}

export function useAssessmentForm() {
  const [state, setState] = useState<AssessmentFormState>(INITIAL);

  const set = useCallback(<K extends keyof AssessmentFormState>(
    key: K,
    value: AssessmentFormState[K],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleIn = useCallback(
    <K extends keyof AssessmentFormState>(key: K, value: unknown, max?: number) => {
      setState((prev) => {
        const list = prev[key] as unknown[];
        return { ...prev, [key]: toggle(list, value, max) } as AssessmentFormState;
      });
    },
    [],
  );

  const setPainDetail = useCallback(
    (region: BodyRegion, patch: Partial<PainDetail>) => {
      setState((prev) => ({
        ...prev,
        painDetails: {
          ...prev.painDetails,
          [region]: { ...prev.painDetails[region], region, ...patch },
        },
      }));
    },
    [],
  );

  const studentMode = useMemo(() => {
    if (state.userType === null || state.ageGroup === null) return false;
    return isStudentMode({ userType: state.userType, ageGroup: state.ageGroup });
  }, [state.userType, state.ageGroup]);

  /**
   * 완성된 설문 결과.
   *
   * 건너뛴 항목은 안전한 기본값으로 채운다.
   * 다만 사용자 유형과 나이대는 학생 보호 규칙을 정하는 값이라 건너뛸 수 없다.
   * 위험 신호는 화면에서 확인을 강제하므로 여기서는 그대로 쓴다.
   */
  const build = useCallback((): Assessment | null => {
    const { userType, ageGroup, background, nutrition } = state;

    // 학생 모드 판정에 필요한 두 값은 반드시 있어야 한다
    if (userType === null || ageGroup === null) return null;

    const sex = state.sex ?? 'undisclosed';
    // 건너뛰면 가장 부담이 적은 20분으로 잡는다
    const availableTime = state.availableTime ?? 20;
    const sleepQuality = state.sleepQuality ?? 'fair';
    const stressLevel = state.stressLevel ?? 'medium';

    const painDetails: PainDetail[] = state.painRegions
      .map((region) => {
        const d = state.painDetails[region];
        if (!d || d.score === undefined) return null;
        return {
          region,
          score: d.score as PainScore,
          duration: d.duration ?? 'within1Week',
          cause: d.cause ?? 'unknown',
          swelling: d.swelling ?? 'none',
          onMovement: d.onMovement ?? 'none',
          numbness: d.numbness ?? false,
          weakness: d.weakness ?? false,
          nightPain: d.nightPain ?? false,
          diagnosis: d.diagnosis ?? 'none',
        } satisfies PainDetail;
      })
      .filter((d): d is PainDetail => d !== null);

    return {
      schemaVersion: ASSESSMENT_SCHEMA_VERSION,
      answeredAt: new Date().toISOString(),
      userType,
      ageGroup,
      sex,
      places: state.places.length > 0 ? state.places : ['home'],
      equipment: state.equipment.length > 0 ? state.equipment : ['bodyweight'],
      availableTime,
      // 목표를 건너뛰면 가장 부담이 적은 일반 건강관리로 둔다
      goals: state.goals.length > 0 ? state.goals : ['generalHealth'],
      painRegions: state.painRegions,
      painDetails,
      redFlags: state.redFlags,
      exerciseBackground: {
        frequency: background.frequency ?? 'none',
        intensity: background.intensity ?? 'light',
        squatExperience: background.squatExperience ?? 'none',
        painDuringExerciseLastMonth: background.painDuringExerciseLastMonth ?? false,
        style: background.style ?? 'short',
      },
      nutrition: {
        goal: nutrition.goal ?? 'generalHealth',
        mealCount: nutrition.mealCount ?? 3,
        breakfast: nutrition.breakfast ?? 'sometimes',
        protein: nutrition.protein ?? 'onceADay',
        vegetable: nutrition.vegetable ?? 'sometimes',
        water: nutrition.water ?? 'medium',
        snack: nutrition.snack ?? 'sometimes',
        allergies: nutrition.allergies ?? [],
        caffeine: nutrition.caffeine ?? 'none',
        eatingRisks: state.eatingRisks,
      },
      sleepQuality,
      stressLevel,
    };
  }, [state]);

  const reset = useCallback(() => setState(INITIAL), []);

  return { state, set, toggleIn, setPainDetail, studentMode, build, reset };
}
