import AsyncStorage from '@react-native-async-storage/async-storage';

import { assessmentStorage, consentStorage, recommendationStorage } from '@/features/assessment/assessmentStorage';
import { buildRecommendation } from '@/features/assessment/recommendation';
import { hasCompletedAssessment, loadRecommendation } from '@/features/assessment/recommendationService';
import { resolveGateRoute } from '@/features/assessment/routeGuard';
import { DISCLAIMER_VERSION } from '@/utils/safety';
import { STORAGE_KEYS } from '@/utils/storage';

import { makeAssessment, makePain } from './fixtures';

/**
 * 재접속 동작.
 * 설문을 마친 사용자는 앱을 다시 켜도 설문 화면으로 되돌아가지 않아야 한다.
 */

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('설문을 마친 사용자의 재접속', () => {
  it('설문과 추천이 모두 있으면 홈으로 간다', () => {
    expect(
      resolveGateRoute({ consentValid: true, hasAssessment: true, blocked: false }),
    ).toBe('/(tabs)');
  });

  it('설문을 아직 안 했으면 설문으로 간다', () => {
    expect(
      resolveGateRoute({ consentValid: true, hasAssessment: false, blocked: false }),
    ).toBe('/assessment');
  });

  it('동의가 없으면 온보딩으로 간다', () => {
    expect(
      resolveGateRoute({ consentValid: false, hasAssessment: true, blocked: false }),
    ).toBe('/onboarding');
  });
});

describe('추천 결과가 비어 있어도 설문을 다시 시키지 않는다', () => {
  it('설문만 남아 있으면 추천을 다시 계산한다', async () => {
    const assessment = makeAssessment({
      painRegions: ['knee'],
      painDetails: [makePain('knee', 5)],
    });
    await assessmentStorage.save(assessment);

    // 추천 결과는 저장하지 않은 상태
    await expect(recommendationStorage.get()).resolves.toBeNull();

    const rec = await loadRecommendation();
    expect(rec).not.toBeNull();
    expect(rec?.exerciseProgramId).toBe('knee_recovery_phase1');
  });

  it('다시 계산한 결과를 저장해 둔다', async () => {
    await assessmentStorage.save(makeAssessment({ goals: ['posture'] }));
    await loadRecommendation();

    const stored = await recommendationStorage.get();
    expect(stored?.exerciseProgramId).toBe('posture_correction_beginner');
  });

  it('다시 계산해도 원래 결과와 같다 (결정론)', async () => {
    const assessment = makeAssessment({
      painRegions: ['shoulder'],
      painDetails: [makePain('shoulder', 2)],
    });
    const direct = buildRecommendation(assessment);

    await assessmentStorage.save(assessment);
    const loaded = await loadRecommendation();

    expect(JSON.stringify(loaded)).toBe(JSON.stringify(direct));
  });

  it('설문 자체가 없으면 null 이다', async () => {
    await expect(loadRecommendation()).resolves.toBeNull();
    await expect(hasCompletedAssessment()).resolves.toBe(false);
  });

  it('저장된 추천이 있으면 그대로 쓴다 (불필요한 재계산 없음)', async () => {
    const assessment = makeAssessment({ goals: ['posture'] });
    await assessmentStorage.save(assessment);
    await recommendationStorage.save({
      ...buildRecommendation(assessment),
      summary: '저장해 둔 값',
    });

    const rec = await loadRecommendation();
    expect(rec?.summary).toBe('저장해 둔 값');
  });
});

describe('위험 신호로 차단된 사용자의 재접속', () => {
  it('앱을 다시 켜도 상담 안내 화면에 머문다', async () => {
    const assessment = makeAssessment({ redFlags: ['numbnessParalysis'] });
    await assessmentStorage.save(assessment);

    const rec = await loadRecommendation();
    expect(rec?.riskLevel).toBe('red');

    expect(
      resolveGateRoute({ consentValid: true, hasAssessment: true, blocked: true }),
    ).toBe('/assessment/blocked');
  });
});

describe('데이터 삭제 후에는 처음부터 시작한다', () => {
  it('전체 삭제하면 온보딩으로 돌아간다', async () => {
    await consentStorage.save(DISCLAIMER_VERSION);
    await assessmentStorage.save(makeAssessment());

    await AsyncStorage.multiRemove([...Object.values(STORAGE_KEYS)]);

    await expect(consentStorage.isValid(DISCLAIMER_VERSION)).resolves.toBe(false);
    await expect(hasCompletedAssessment()).resolves.toBe(false);
  });
});
