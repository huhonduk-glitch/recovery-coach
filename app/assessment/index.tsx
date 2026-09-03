import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BodyRegionSelector,
  Button,
  OptionButton,
  PainSlider,
  ProgressBar,
  SafetyNotice,
  Screen,
  WeightInput,
} from '@/components';
import {
  AGE_GROUP_CHOICES,
  ALLERGY_CHOICES,
  AVAILABLE_TIME_CHOICES,
  BREAKFAST_CHOICES,
  CAFFEINE_CHOICES,
  DIAGNOSIS_CHOICES,
  EATING_RISK_QUESTIONS,
  EQUIPMENT_CHOICES,
  EXERCISE_FREQUENCY_CHOICES,
  EXERCISE_INTENSITY_CHOICES,
  GOAL_CHOICES,
  MEAL_COUNT_CHOICES,
  NUTRITION_GOAL_CHOICES,
  ON_MOVEMENT_CHOICES,
  PAIN_CAUSE_CHOICES,
  PAIN_DURATION_CHOICES,
  PLACE_CHOICES,
  PROTEIN_CHOICES,
  RED_FLAG_QUESTIONS,
  SEX_CHOICES,
  SLEEP_CHOICES,
  SNACK_CHOICES,
  SQUAT_EXPERIENCE_CHOICES,
  STRESS_CHOICES,
  USER_TYPE_CHOICES,
  VEGETABLE_CHOICES,
  WATER_CHOICES,
  WORKOUT_STYLE_CHOICES,
} from '@/features/assessment/assessmentQuestions';
import { assessmentStorage, recommendationStorage } from '@/features/assessment/assessmentStorage';
import { buildRecommendation } from '@/features/assessment/recommendation';
import type { BodyRegion } from '@/features/assessment/assessmentTypes';
import {
  PURPOSE_CHOICES,
  PURPOSE_TRACK_FLAG_IDS,
  purposeToGoals,
  resolveTrack,
  TRACK_CHOICES,
  TRACK_SWITCH_NOTICE,
  type PurposeId,
  type TrackId,
} from '@/features/assessment/tracks';
import { useAssessmentForm } from '@/features/assessment/useAssessmentForm';
import { REGION_LABEL } from '@/features/exercise/exerciseRules';
import { colors, spacing, typography } from '@/theme';
import { WEIGHT_INPUT_NOTICE } from '@/utils/privacy';

/**
 * 초기 설문.
 *
 * 한 화면에 한 주제만 보여 준다. 문항을 한꺼번에 나열하면 읽지 않고 넘기기 쉽다.
 * 위험 신호 문항은 특히 그렇다.
 */

/** 설문 트랙 안에서의 길이 선택 */
type SurveyMode = 'quick' | 'full';

type StepId =
  | 'track'
  | 'purposeSafety'
  | 'purpose'
  | 'mode'
  | 'userType'
  | 'basic'
  | 'environment'
  | 'time'
  | 'goals'
  | 'painRegions'
  | 'painDetail'
  | 'redFlags'
  | 'background'
  | 'weight'
  | 'nutritionGoal'
  | 'nutritionHabit'
  | 'allergies'
  | 'eatingRisk'
  | 'condition';

export default function AssessmentScreen() {
  const form = useAssessmentForm();
  const { state, set, toggleIn, setPainDetail, studentMode } = form;

  const [surveyMode, setSurveyMode] = useState<SurveyMode | null>(null);
  /**
   * 사용자가 고른 시작 경로.
   * 저장될 트랙(state.track)과 따로 둔다. '아픈 곳이 있다' 를 고르면 저장될 트랙은
   * 설문으로 바뀌지만, 화면 흐름은 목적 트랙에서 이어져야 하기 때문이다.
   */
  const [trackChoice, setTrackChoice] = useState<TrackId | null>(null);
  const [purpose, setPurpose] = useState<PurposeId | null>(null);
  /** 목적 트랙에서 '아픈 곳이 있다' 를 고르면 설문 트랙으로 넘어간다 */
  const [purposeHasPain, setPurposeHasPain] = useState<boolean | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [painIndex, setPainIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  /**
   * 진행할 단계 목록.
   *
   * 빠른 시작(quick)에서는 꼭 필요한 것만 묻는다.
   * ⚠️ 어떤 모드에서도 위험 신호 확인(redFlags)은 빠지지 않는다.
   *    안전 게이트를 우회하는 경로를 만들지 않는다. (docs/SAFETY_POLICY.md §2)
   */
  const steps = useMemo<StepId[]>(() => {
    const base: StepId[] = ['track'];
    if (trackChoice === null) return base;

    // ── 목적 트랙 ── 나이대까지만 묻고 목적을 고른다
    if (trackChoice === 'purpose') {
      base.push('userType', 'basic', 'purposeSafety');

      // 아픈 곳이 있다고 하면 목적 선택 대신 몸 상태를 여쭙는다
      if (purposeHasPain === true) {
        base.push('painRegions');
        if (state.painRegions.length > 0) base.push('painDetail');
        base.push('redFlags');
        return base;
      }
      base.push('purpose');
      return base;
    }

    // ── 설문 트랙 ──
    base.push('mode');
    if (surveyMode === null) return base;

    base.push('userType', 'basic');

    if (surveyMode === 'full') {
      base.push('environment', 'time', 'goals');
    }

    base.push('painRegions');
    if (state.painRegions.length > 0) base.push('painDetail');
    base.push('redFlags');

    if (surveyMode === 'full') {
      base.push('background', 'weight', 'nutritionGoal', 'nutritionHabit', 'allergies', 'eatingRisk', 'condition');
    }
    return base;
  }, [trackChoice, purposeHasPain, surveyMode, state.painRegions.length]);

  /** 건너뛸 수 있는 단계 (안전과 직결된 단계는 제외한다) */
  const SKIPPABLE: StepId[] = [
    'environment',
    'time',
    'goals',
    'painRegions',
    'background',
    'weight',
    'nutritionGoal',
    'nutritionHabit',
    'allergies',
    'eatingRisk',
    'condition',
  ];

  const step = steps[stepIndex] ?? 'userType';
  const isLast = stepIndex === steps.length - 1;
  const currentRegion: BodyRegion | undefined = state.painRegions[painIndex];

  function goNext() {
    // 통증 상세는 부위 수만큼 반복한다
    if (step === 'painDetail' && painIndex < state.painRegions.length - 1) {
      setPainIndex((i) => i + 1);
      return;
    }
    if (isLast) {
      void submit();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (step === 'painDetail' && painIndex > 0) {
      setPainIndex((i) => i - 1);
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function submit() {
    const assessment = form.build();
    if (!assessment) return;

    // 마지막 방어선: 아픈 곳을 고른 응답이 목적 트랙으로 저장되면
    // 회복운동 제한이 풀려 버린다. 화면 흐름과 무관하게 여기서 바로잡는다.
    const track = resolveTrack({
      chosen: assessment.track ?? 'assessment',
      hasPain: assessment.painRegions.length > 0,
    });
    if (track !== assessment.track) assessment.track = track;

    setSubmitting(true);
    const recommendation = buildRecommendation(assessment);

    await assessmentStorage.save(assessment);
    await recommendationStorage.save(recommendation);

    // 위험 신호가 있으면 결과 화면이 아니라 상담 안내로 보낸다.
    // replace 로 이동해 뒤로가기로 되돌아올 수 없게 한다.
    if (recommendation.riskLevel === 'red') {
      router.replace('/assessment/blocked');
      return;
    }
    router.replace('/assessment/result');
  }

  /** 다음 버튼을 누를 수 있는 조건 */
  const canProceed = ((): boolean => {
    switch (step) {
      case 'track':
        return trackChoice !== null;
      case 'purposeSafety':
        // 위험 신호를 확인했다고 눌렀거나 하나라도 골랐고,
        // 아픈 곳이 있는지도 답해야 넘어간다
        return (state.redFlagsConfirmed || state.redFlags.length > 0) && purposeHasPain !== null;
      case 'purpose':
        return purpose !== null;
      case 'mode':
        return surveyMode !== null;
      case 'userType':
        return state.userType !== null;
      case 'basic':
        // 목적 트랙과 빠른 시작에서는 나이대만 있으면 넘어갈 수 있다 (성별은 선택)
        return trackChoice === 'purpose' || surveyMode === 'quick'
          ? state.ageGroup !== null
          : state.ageGroup !== null && state.sex !== null;
      case 'environment':
        return state.places.length > 0;
      case 'time':
        return state.availableTime !== null;
      case 'goals':
        return state.goals.length > 0;
      case 'painRegions':
        return true;
      case 'painDetail':
        return currentRegion !== undefined && state.painDetails[currentRegion]?.score !== undefined;
      case 'redFlags':
        return state.redFlagsConfirmed || state.redFlags.length > 0;
      case 'background':
        return state.background.frequency !== undefined && state.background.squatExperience !== undefined;
      case 'weight':
        // 선택 입력이라 비워도 넘어갈 수 있다
        return true;
      case 'nutritionGoal':
        return state.nutrition.goal !== undefined;
      case 'nutritionHabit':
        return (
          state.nutrition.mealCount !== undefined &&
          state.nutrition.protein !== undefined &&
          state.nutrition.water !== undefined
        );
      case 'allergies':
        return true;
      case 'eatingRisk':
        return true;
      case 'condition':
        return state.sleepQuality !== null && state.stressLevel !== null;
      default:
        return false;
    }
  })();

  return (
    <Screen
      footer={
        <View style={styles.footerCol}>
          <View style={styles.footerRow}>
            {stepIndex > 0 ? (
              <Button label="이전" variant="outline" onPress={goBack} style={styles.backButton} />
            ) : null}
            <Button
              label={isLast ? '결과 보기' : '다음'}
              onPress={goNext}
              disabled={!canProceed}
              loading={submitting}
              style={styles.nextButton}
            />
          </View>

          {SKIPPABLE.includes(step) ? (
            <Pressable
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel="이 질문 건너뛰기"
              style={styles.skip}
            >
              <Text style={styles.skipText}>이 질문 건너뛰기</Text>
            </Pressable>
          ) : null}
        </View>
      }
    >
      <ProgressBar current={stepIndex + 1} total={steps.length} />

      {step === 'track' ? (
        <>
          <Question
            title="어떻게 시작할까요?"
            hint="두 가지 방법이 있어요. 나중에 언제든 바꿀 수 있습니다."
          />

          {TRACK_CHOICES.map((t) => (
            <OptionButton
              key={t.id}
              label={`${t.label} (${t.duration})`}
              hint={`${t.decidedBy} — ${t.description}`}
              selected={trackChoice === t.id}
              onPress={() => {
                setTrackChoice(t.id);
                set('track', t.id);
                // 트랙을 바꾸면 앞서 고른 것들을 지운다
                setSurveyMode(null);
                setPurpose(null);
                setPurposeHasPain(null);
              }}
            />
          ))}

          <SafetyNotice
            tone="warning"
            title="어느 쪽을 고르셔도 건너뛰지 않는 것"
            text="안전 확인은 두 경로 모두에서 반드시 합니다. 아프거나 불편한 곳이 있다고 하시면, 목적으로 시작하셨더라도 몸 상태를 여쭙고 그 부위에 맞는 회복 루틴으로 안내해 드려요."
          />
        </>
      ) : null}

      {step === 'purposeSafety' ? (
        <>
          <Question
            title="시작 전에 확인할게요"
            hint="해당하는 것이 있으면 골라 주세요. 없으면 아래에서 '해당 없음' 을 눌러 주세요."
          />

          {RED_FLAG_QUESTIONS.filter((q) => PURPOSE_TRACK_FLAG_IDS.includes(q.id)).map((q) => (
            <OptionButton
              key={q.id}
              label={q.label}
              hint={q.hint}
              multi
              selected={state.redFlags.includes(q.id)}
              onPress={() => {
                toggleIn('redFlags', q.id);
                set('redFlagsConfirmed', true);
              }}
            />
          ))}

          <OptionButton
            label="해당하는 것이 없습니다"
            multi
            selected={state.redFlagsConfirmed && state.redFlags.length === 0}
            onPress={() => {
              set('redFlags', []);
              set('redFlagsConfirmed', true);
            }}
          />

          <Question title="지금 아프거나 불편한 곳이 있나요?" />
          <OptionButton
            label="없어요"
            selected={purposeHasPain === false}
            onPress={() => {
              setPurposeHasPain(false);
              set('track', resolveTrack({ chosen: 'purpose', hasPain: false }));
            }}
          />
          <OptionButton
            label="있어요"
            hint="부위와 통증 정도를 여쭙고 회복 루틴으로 안내해 드릴게요."
            selected={purposeHasPain === true}
            onPress={() => {
              setPurposeHasPain(true);
              // 아픈 몸에 목적만 보고 운동을 주지 않는다 (docs/SAFETY_POLICY.md §21)
              set('track', resolveTrack({ chosen: 'purpose', hasPain: true }));
              set('purpose', null);
            }}
          />

          {purposeHasPain === true ? (
            <SafetyNotice tone="info" title="경로를 바꿀게요" text={TRACK_SWITCH_NOTICE} />
          ) : null}
        </>
      ) : null}

      {step === 'purpose' ? (
        <>
          <Question
            title="어떤 운동을 하고 싶으세요?"
            hint="고르신 목적에 맞는 운동을 바로 안내해 드려요."
          />
          {PURPOSE_CHOICES.map((p) => (
            <OptionButton
              key={p.id}
              label={p.label}
              hint={p.description}
              selected={purpose === p.id}
              onPress={() => {
                setPurpose(p.id);
                set('purpose', p.id);
                set('goals', purposeToGoals(p.id));
              }}
            />
          ))}

          <SafetyNotice
            tone="info"
            title="부위별 회복운동은 여기에 없어요"
            text="어깨·허리·무릎·발목·목 회복운동은 통증 정도와 단계를 확인해야 안전하게 안내할 수 있어요. 필요하시면 내정보에서 몸 상태 설문을 진행해 주세요."
          />
        </>
      ) : null}

      {step === 'mode' ? (
        <>
          <Question
            title="어떻게 시작할까요?"
            hint="지금 바로 시작하고, 나중에 자세히 답하셔도 됩니다."
          />

          <OptionButton
            label="빠른 시작 (약 1분)"
            hint="꼭 필요한 것만 묻습니다. 나중에 내정보에서 자세히 채울 수 있어요."
            selected={surveyMode === 'quick'}
            onPress={() => setSurveyMode('quick')}
          />
          <OptionButton
            label="자세히 설문하기 (약 5분)"
            hint="목표·운동 경험·식습관까지 반영해 더 잘 맞는 루틴을 만들어 드려요."
            selected={surveyMode === 'full'}
            onPress={() => setSurveyMode('full')}
          />

          <SafetyNotice
            tone="warning"
            title="어떤 경우에도 건너뛰지 않는 것"
            text="안전 확인(위험 신호 12개)은 빠른 시작에서도 반드시 확인합니다. 이 부분만은 건너뛸 수 없어요."
          />
        </>
      ) : null}

      {step === 'userType' ? (
        <>
          <Question title="어떤 분이신가요?" hint="안내 방식을 조정하는 데 사용합니다." />
          {USER_TYPE_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              hint={c.hint}
              selected={state.userType === c.value}
              onPress={() => set('userType', c.value)}
            />
          ))}
        </>
      ) : null}

      {step === 'basic' ? (
        <>
          <Question title="나이대를 알려 주세요" />
          {AGE_GROUP_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.ageGroup === c.value}
              onPress={() => set('ageGroup', c.value)}
            />
          ))}

          {studentMode ? (
            <SafetyNotice
              tone="info"
              title="학생 모드로 안내해 드릴게요"
              text="성장기에는 숫자보다 균형 잡힌 식사가 더 중요해요. 손바닥·주먹 기준으로 알려 드립니다."
            />
          ) : null}

          <Question
            title="성별"
            hint={
              surveyMode === 'quick'
                ? '선택하지 않고 넘어가셔도 됩니다.'
                : '선택하지 않으셔도 됩니다.'
            }
          />
          {SEX_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.sex === c.value}
              onPress={() => set('sex', c.value)}
            />
          ))}
        </>
      ) : null}

      {step === 'environment' ? (
        <>
          <Question title="어디에서 운동하시나요?" hint="여러 개를 고를 수 있어요." />
          {PLACE_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              multi
              selected={state.places.includes(c.value)}
              onPress={() => toggleIn('places', c.value)}
            />
          ))}

          <Question title="쓸 수 있는 도구가 있나요?" hint="없으면 맨몸만 골라 주세요." />
          {EQUIPMENT_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              multi
              selected={state.equipment.includes(c.value)}
              onPress={() => toggleIn('equipment', c.value)}
            />
          ))}
        </>
      ) : null}

      {step === 'time' ? (
        <>
          <Question title="하루에 운동할 수 있는 시간은?" hint="이 시간에 맞춰 루틴을 만들어 드려요." />
          {AVAILABLE_TIME_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.availableTime === c.value}
              onPress={() => set('availableTime', c.value)}
            />
          ))}
        </>
      ) : null}

      {step === 'goals' ? (
        <>
          <Question title="어떤 목표가 있으신가요?" hint="여러 개를 고를 수 있어요." />
          {GOAL_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              multi
              selected={state.goals.includes(c.value)}
              onPress={() => toggleIn('goals', c.value)}
            />
          ))}
        </>
      ) : null}

      {step === 'painRegions' ? (
        <>
          <Question title="불편하거나 아픈 곳이 있나요?" hint="없으면 그냥 다음을 눌러 주세요." />
          <BodyRegionSelector
            selected={state.painRegions}
            onToggle={(region) => toggleIn('painRegions', region, 3)}
          />
        </>
      ) : null}

      {step === 'painDetail' && currentRegion ? (
        <>
          <Question
            title={`${REGION_LABEL[currentRegion]} 상태를 알려 주세요`}
            hint={`${painIndex + 1} / ${state.painRegions.length} 부위`}
          />

          <PainSlider
            value={state.painDetails[currentRegion]?.score ?? null}
            onChange={(score) => setPainDetail(currentRegion, { score })}
          />

          <Question title="언제부터 아팠나요?" small />
          {PAIN_DURATION_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.painDetails[currentRegion]?.duration === c.value}
              onPress={() => setPainDetail(currentRegion, { duration: c.value })}
            />
          ))}

          <Question title="다친 계기가 있었나요?" small />
          {PAIN_CAUSE_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.painDetails[currentRegion]?.cause === c.value}
              onPress={() => setPainDetail(currentRegion, { cause: c.value })}
            />
          ))}

          <Question title="움직일 때 아픈가요?" small />
          {ON_MOVEMENT_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.painDetails[currentRegion]?.onMovement === c.value}
              onPress={() => setPainDetail(currentRegion, { onMovement: c.value })}
            />
          ))}

          <Question title="병원 진단을 받은 적이 있나요?" small />
          {DIAGNOSIS_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.painDetails[currentRegion]?.diagnosis === c.value}
              onPress={() => setPainDetail(currentRegion, { diagnosis: c.value })}
            />
          ))}
        </>
      ) : null}

      {step === 'redFlags' ? (
        <>
          <Question
            title="아래 중 해당되는 것이 있나요?"
            hint="정확히 답해 주시는 것이 가장 안전합니다."
          />
          <SafetyNotice
            tone="warning"
            text="해당되는 항목이 있으면 운동 루틴 대신 전문가 상담을 안내해 드립니다."
          />

          {RED_FLAG_QUESTIONS.map((q) => (
            <OptionButton
              key={q.id}
              label={q.label}
              hint={q.hint}
              multi
              selected={state.redFlags.includes(q.id)}
              onPress={() => {
                toggleIn('redFlags', q.id);
                set('redFlagsConfirmed', false);
              }}
            />
          ))}

          <View style={styles.spacer} />
          <OptionButton
            label="해당되는 항목이 없습니다"
            selected={state.redFlagsConfirmed && state.redFlags.length === 0}
            onPress={() => {
              set('redFlags', []);
              set('redFlagsConfirmed', true);
            }}
          />
        </>
      ) : null}

      {step === 'background' ? (
        <>
          <Question title="주 몇 회 운동하시나요?" />
          {EXERCISE_FREQUENCY_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.background.frequency === c.value}
              onPress={() => set('background', { ...state.background, frequency: c.value })}
            />
          ))}

          <Question title="운동 강도는 어느 정도인가요?" small />
          {EXERCISE_INTENSITY_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.background.intensity === c.value}
              onPress={() => set('background', { ...state.background, intensity: c.value })}
            />
          ))}

          <Question title="스쿼트나 런지 경험이 있나요?" small />
          {SQUAT_EXPERIENCE_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.background.squatExperience === c.value}
              onPress={() => set('background', { ...state.background, squatExperience: c.value })}
            />
          ))}

          <Question title="최근 1개월 안에 운동 중 통증이 있었나요?" small />
          <OptionButton
            label="예"
            selected={state.background.painDuringExerciseLastMonth === true}
            onPress={() =>
              set('background', { ...state.background, painDuringExerciseLastMonth: true })
            }
          />
          <OptionButton
            label="아니오"
            selected={state.background.painDuringExerciseLastMonth === false}
            onPress={() =>
              set('background', { ...state.background, painDuringExerciseLastMonth: false })
            }
          />

          <Question title="어떤 스타일을 좋아하시나요?" small />
          {WORKOUT_STYLE_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.background.style === c.value}
              onPress={() => set('background', { ...state.background, style: c.value })}
            />
          ))}
        </>
      ) : null}

      {step === 'weight' ? (
        <>
          <Question
            title="체중을 알려 주시겠어요?"
            hint="선택 입력입니다. 넣지 않으셔도 괜찮아요."
          />
          <SafetyNotice tone="info" text={WEIGHT_INPUT_NOTICE} />
          <WeightInput value={state.weightKg} onChange={(v) => set('weightKg', v)} />
        </>
      ) : null}

      {step === 'nutritionGoal' ? (
        <>
          <Question title="영양 목표를 골라 주세요" />
          {NUTRITION_GOAL_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.nutrition.goal === c.value}
              onPress={() => set('nutrition', { ...state.nutrition, goal: c.value })}
            />
          ))}
          {studentMode ? (
            <SafetyNotice
              tone="info"
              text="학생 모드에서는 숫자 목표 대신 손바닥·주먹 기준으로 안내해 드려요."
            />
          ) : null}
        </>
      ) : null}

      {step === 'nutritionHabit' ? (
        <>
          <Question title="하루 몇 끼를 드시나요?" />
          {MEAL_COUNT_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.nutrition.mealCount === c.value}
              onPress={() => set('nutrition', { ...state.nutrition, mealCount: c.value })}
            />
          ))}

          <Question title="아침은 드시나요?" small />
          {BREAKFAST_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.nutrition.breakfast === c.value}
              onPress={() => set('nutrition', { ...state.nutrition, breakfast: c.value })}
            />
          ))}

          <Question title="단백질 식품은 얼마나 자주 드시나요?" small />
          {PROTEIN_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.nutrition.protein === c.value}
              onPress={() => set('nutrition', { ...state.nutrition, protein: c.value })}
            />
          ))}

          <Question title="채소나 과일은 얼마나 자주 드시나요?" small />
          {VEGETABLE_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.nutrition.vegetable === c.value}
              onPress={() => set('nutrition', { ...state.nutrition, vegetable: c.value })}
            />
          ))}

          <Question title="물은 얼마나 드시나요?" small />
          {WATER_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.nutrition.water === c.value}
              onPress={() => set('nutrition', { ...state.nutrition, water: c.value })}
            />
          ))}

          <Question title="야식이나 간식은 얼마나 드시나요?" small />
          {SNACK_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.nutrition.snack === c.value}
              onPress={() => set('nutrition', { ...state.nutrition, snack: c.value })}
            />
          ))}

          <Question title="카페인이나 에너지음료는요?" small />
          {CAFFEINE_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.nutrition.caffeine === c.value}
              onPress={() => set('nutrition', { ...state.nutrition, caffeine: c.value })}
            />
          ))}
        </>
      ) : null}

      {step === 'allergies' ? (
        <>
          <Question
            title="못 먹거나 피해야 하는 음식이 있나요?"
            hint="고른 식품은 추천 목록에서 빼 드려요. 없으면 다음을 눌러 주세요."
          />
          {ALLERGY_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              multi
              selected={(state.nutrition.allergies ?? []).includes(c.value)}
              onPress={() => {
                const current = state.nutrition.allergies ?? [];
                const next = current.includes(c.value)
                  ? current.filter((v) => v !== c.value)
                  : [...current, c.value];
                set('nutrition', { ...state.nutrition, allergies: next });
              }}
            />
          ))}
        </>
      ) : null}

      {step === 'eatingRisk' ? (
        <>
          <Question
            title="식습관에 대해 한 가지만 더 여쭤볼게요"
            hint="해당되는 것이 있으면 골라 주세요. 없으면 다음을 눌러 주세요."
          />
          <SafetyNotice
            tone="info"
            text="해당되는 항목이 있으면 체중 조절 대신 균형 잡힌 식사와 회복을 우선해서 안내해 드립니다."
          />
          {EATING_RISK_QUESTIONS.filter(
            (q) => q.id !== 'menstrualIssue' || state.sex === 'female',
          ).map((q) => (
            <OptionButton
              key={q.id}
              label={q.label}
              multi
              selected={state.eatingRisks.includes(q.id)}
              onPress={() => toggleIn('eatingRisks', q.id)}
            />
          ))}
        </>
      ) : null}

      {step === 'condition' ? (
        <>
          <Question title="요즘 잠은 충분한가요?" />
          {SLEEP_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.sleepQuality === c.value}
              onPress={() => set('sleepQuality', c.value)}
            />
          ))}

          <Question title="요즘 스트레스는 어떤가요?" small />
          {STRESS_CHOICES.map((c) => (
            <OptionButton
              key={c.value}
              label={c.label}
              selected={state.stressLevel === c.value}
              onPress={() => set('stressLevel', c.value)}
            />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

function Question({ title, hint, small }: { title: string; hint?: string; small?: boolean }) {
  return (
    <View style={small ? styles.questionSmall : styles.question}>
      <Text style={small ? styles.questionTitleSmall : styles.questionTitle}>{title}</Text>
      {hint ? <Text style={styles.questionHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  question: { marginBottom: spacing.lg },
  questionSmall: { marginTop: spacing.xl, marginBottom: spacing.md },
  questionTitle: { ...typography.title, color: colors.text },
  questionTitleSmall: { ...typography.bodyStrong, color: colors.text },
  questionHint: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  footerCol: { gap: spacing.sm },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  skip: { alignSelf: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  skipText: { ...typography.small, color: colors.textMuted, textDecorationLine: 'underline' },
  backButton: { flex: 1 },
  nextButton: { flex: 2 },
  spacer: { height: spacing.lg },
});
