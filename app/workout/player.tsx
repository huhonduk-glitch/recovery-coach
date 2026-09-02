import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  Button,
  Card,
  ExerciseFigure,
  PainSlider,
  ProgressBar,
  SafetyNotice,
  Screen,
} from '@/components';
import { getExercises } from '@/data/exercises';
import { getProgram } from '@/data/programs';
import { adjustDuringWorkout, decideExerciseLevel } from '@/features/assessment/assessmentEngine';
import { assessmentStorage } from '@/features/assessment/assessmentStorage';
import type { PainScore } from '@/features/assessment/assessmentTypes';
import type { Exercise } from '@/features/exercise/exerciseTypes';
import { buildWorkout } from '@/features/exercise/workoutBuilder';
import { logStorage } from '@/features/logs/logStorage';
import type { RPE, WorkoutLog } from '@/features/logs/logTypes';
import { colors, radius, spacing, typography } from '@/theme';
import { COMMON_STOP_SIGNS } from '@/utils/safety';

type Stage = 'before' | 'playing' | 'painCheck' | 'stopped' | 'finish';

const RPE_VALUES: RPE[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * 운동 플레이어.
 *
 * 중단 버튼은 항상 한 번의 탭으로 닿아야 한다.
 * 운동 중 통증 체크는 언제든 누를 수 있다. (docs/SAFETY_POLICY.md §5)
 */
export default function WorkoutPlayerScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const program = programId ? getProgram(programId) : undefined;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('before');
  const [beforePain, setBeforePain] = useState<PainScore | null>(null);
  const [afterPain, setAfterPain] = useState<PainScore | null>(null);
  const [checkPain, setCheckPain] = useState<PainScore | null>(null);
  const [rpe, setRpe] = useState<RPE | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [easierMode, setEasierMode] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState<string[] | null>(null);
  const startedAt = useRef(new Date().toISOString());

  // 타이머
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!program) return;
      const assessment = await assessmentStorage.get();
      if (cancelled) return;

      if (assessment) {
        const built = buildWorkout(program.id, assessment, decideExerciseLevel(assessment));
        if (built) {
          setExercises(built.exercises);
          return;
        }
      }
      setExercises(getExercises(program.exerciseIds));
    })();
    return () => {
      cancelled = true;
    };
  }, [program]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const current = exercises[index];
  const isLastExercise = index === exercises.length - 1;

  const target = useMemo(() => current?.durationSeconds ?? null, [current]);

  const saveLog = useCallback(
    async (abortReason: WorkoutLog['abortReason']) => {
      if (!program) return;
      const log: WorkoutLog = {
        id: `${Date.now()}`,
        date: startedAt.current,
        programId: program.id,
        programTitle: program.title,
        completedExerciseIds: completedIds,
        totalExerciseCount: exercises.length,
        beforePainScore: beforePain,
        afterPainScore: afterPain,
        rpe,
        satisfaction: null,
        memo: easierMode ? '중간에 강도를 낮춰서 진행했어요.' : '',
        abortReason,
      };
      await logStorage.add(log);
    },
    [program, completedIds, exercises.length, beforePain, afterPain, rpe, easierMode],
  );

  if (!program) {
    return (
      <Screen>
        <Text style={styles.title}>루틴을 찾을 수 없어요</Text>
        <Button label="돌아가기" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  // ---------- 운동 전 ----------
  if (stage === 'before') {
    return (
      <Screen
        footer={
          <Button
            label="시작하기"
            onPress={() => {
              setStage('playing');
              setRunning(true);
            }}
            disabled={beforePain === null}
          />
        }
      >
        <Text style={styles.title}>{program.title}</Text>
        <Text style={styles.subtitle}>시작하기 전에 지금 상태를 알려 주세요.</Text>

        <PainSlider value={beforePain} onChange={setBeforePain} />

        <SafetyNotice tone="danger" title="이럴 때는 멈추세요" items={[...COMMON_STOP_SIGNS]} />
      </Screen>
    );
  }

  // ---------- 운동 중 통증 체크 ----------
  if (stage === 'painCheck') {
    const verdict = checkPain !== null ? adjustDuringWorkout(checkPain) : null;

    return (
      <Screen
        footer={
          verdict === null ? (
            <Button label="확인" onPress={() => undefined} disabled />
          ) : verdict.action === 'stop' ? (
            <Button
              label="운동 중단하기"
              variant="danger"
              onPress={async () => {
                await saveLog('pain');
                setStage('stopped');
              }}
            />
          ) : (
            <Button
              label="계속하기"
              onPress={() => {
                if (verdict.action === 'reduce') {
                  setEasierMode(true);
                  setAdjustMessage(verdict.hints);
                }
                setCheckPain(null);
                setStage('playing');
              }}
            />
          )
        }
      >
        <Text style={styles.title}>지금 통증은 몇 점인가요?</Text>
        <PainSlider value={checkPain} onChange={setCheckPain} label="" />

        {verdict ? (
          <SafetyNotice
            tone={
              verdict.action === 'stop' ? 'danger' : verdict.action === 'reduce' ? 'warning' : 'info'
            }
            title={verdict.message}
            items={verdict.action === 'reduce' ? verdict.hints : undefined}
            text={
              verdict.action === 'stop'
                ? '통증이 이 정도면 오늘은 여기서 멈추는 것이 안전합니다.'
                : undefined
            }
          />
        ) : null}
      </Screen>
    );
  }

  // ---------- 중단 후 ----------
  if (stage === 'stopped') {
    return (
      <Screen footer={<Button label="홈으로" onPress={() => router.replace('/(tabs)')} />}>
        <Text style={styles.title}>오늘은 여기까지 할게요</Text>
        <Text style={styles.subtitle}>
          여기까지 한 것도 기록에 남겨 두었어요. 무리하지 않는 것이 가장 빠른 회복입니다.
        </Text>

        <SafetyNotice
          tone="danger"
          title="통증이 계속되면"
          text="같은 부위 통증이 반복해서 늘어난다면, 앱의 안내보다 전문가 확인이 먼저입니다. 정형외과·재활의학과 진료나 물리치료사·건강운동관리사 상담을 권합니다."
        />
      </Screen>
    );
  }

  // ---------- 마무리 ----------
  if (stage === 'finish') {
    return (
      <Screen
        footer={
          <Button
            label="기록 저장하고 마치기"
            onPress={async () => {
              await saveLog(null);
              router.replace('/(tabs)/logs');
            }}
            disabled={afterPain === null || rpe === null}
          />
        }
      >
        <Text style={styles.title}>수고하셨어요</Text>
        <Text style={styles.subtitle}>
          {completedIds.length} / {exercises.length}개 운동을 마쳤어요.
        </Text>

        <PainSlider value={afterPain} onChange={setAfterPain} label="지금 통증은 몇 점인가요?" />

        {beforePain !== null && afterPain !== null && afterPain > beforePain ? (
          <SafetyNotice
            tone="warning"
            title="운동 후 통증이 늘었어요"
            text="다음 루틴은 강도를 한 단계 낮춰서 안내해 드릴게요. 이런 일이 반복되면 전문가 상담을 권합니다."
          />
        ) : null}

        <Text style={styles.sectionTitle}>오늘 운동은 얼마나 힘들었나요?</Text>
        <Text style={styles.hint}>1은 아주 편함, 10은 최대로 힘듦</Text>
        <View style={styles.rpeRow}>
          {RPE_VALUES.map((v) => (
            <Button
              key={v}
              label={`${v}`}
              variant={rpe === v ? 'primary' : 'outline'}
              onPress={() => setRpe(v)}
              style={styles.rpeButton}
            />
          ))}
        </View>
      </Screen>
    );
  }

  // ---------- 운동 중 ----------
  if (!current) {
    return (
      <Screen>
        <Text style={styles.title}>운동을 불러오는 중이에요</Text>
      </Screen>
    );
  }

  const next = exercises[index + 1];
  const volume = current.durationSeconds
    ? `${current.durationSeconds}초`
    : `${current.reps ?? 0}회 x ${current.sets ?? 1}세트`;

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footerCol}>
          <View style={styles.footerRow}>
            <Button
              label="통증 체크"
              variant="outline"
              onPress={() => {
                setRunning(false);
                setStage('painCheck');
              }}
              style={styles.flex}
            />
            <Button
              label={isLastExercise ? '마치기' : '다음 운동'}
              onPress={() => {
                setCompletedIds((ids) => [...ids, current.id]);
                setSeconds(0);
                if (isLastExercise) {
                  setRunning(false);
                  setStage('finish');
                } else {
                  setIndex((i) => i + 1);
                }
              }}
              style={styles.flex}
            />
          </View>
          <Button
            label="운동 중단하기"
            variant="danger"
            onPress={async () => {
              setRunning(false);
              await saveLog('other');
              setStage('stopped');
            }}
          />
        </View>
      }
    >
      <ProgressBar current={index + 1} total={exercises.length} />

      <Text style={styles.exerciseName}>{current.name}</Text>
      <Text style={styles.volume}>{volume}</Text>

      <ExerciseFigure exercise={current} compact />

      <View style={styles.timerBox}>
        <Text style={styles.timer}>
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:
          {String(seconds % 60).padStart(2, '0')}
        </Text>
        {target ? <Text style={styles.timerTarget}>목표 {target}초</Text> : null}
        <Button
          label={running ? '일시정지' : '이어서'}
          variant="outline"
          onPress={() => setRunning((r) => !r)}
          style={styles.timerButton}
        />
      </View>

      {easierMode ? (
        <SafetyNotice
          tone="warning"
          title="강도를 낮춰서 진행 중이에요"
          items={adjustMessage ?? current.regressions}
        />
      ) : null}

      <Card title="이렇게 합니다">
        {current.description.map((line, i) => (
          <View key={line} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{i + 1}</Text>
            <Text style={styles.stepText}>{line}</Text>
          </View>
        ))}
      </Card>

      <Card title="핵심 포인트">
        {current.cues.map((cue) => (
          <Text key={cue} style={styles.item}>
            · {cue}
          </Text>
        ))}
      </Card>

      <SafetyNotice tone="warning" title="주의" items={current.precautions} />

      <Button
        label="쉬운 동작으로 바꾸기"
        variant="outline"
        onPress={() => setEasierMode(true)}
        style={styles.easierButton}
      />

      {next ? <Text style={styles.nextUp}>다음 운동: {next.name}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  sectionTitle: { ...typography.title, color: colors.text, marginTop: spacing.lg },
  hint: { ...typography.small, color: colors.textMuted, marginBottom: spacing.md },
  exerciseName: { ...typography.exerciseName, color: colors.text },
  volume: { ...typography.title, color: colors.primary, marginBottom: spacing.lg },
  timerBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  timer: { fontSize: 44, fontWeight: '700', color: colors.text },
  timerTarget: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  timerButton: { marginTop: spacing.lg, minWidth: 160 },
  stepRow: { flexDirection: 'row', marginBottom: spacing.sm },
  stepNumber: {
    ...typography.bodyStrong,
    color: colors.primary,
    minWidth: 20,
    marginRight: spacing.sm,
  },
  stepText: { ...typography.body, color: colors.text, flex: 1 },
  item: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xs },
  easierButton: { marginBottom: spacing.lg },
  nextUp: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
  footerCol: { gap: spacing.sm },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  rpeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rpeButton: { minWidth: 56, paddingHorizontal: spacing.md },
});
