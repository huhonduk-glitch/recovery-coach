import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PROGRAMS } from '@/data/programs';
import { RED_FLAG_QUESTIONS } from '@/features/assessment/assessmentQuestions';
import { assessmentTrack, type RedFlagId } from '@/features/assessment/assessmentTypes';
import {
  isCategoryAllowed,
  PURPOSE_CHOICES,
  PURPOSE_TRACK_FLAG_IDS,
  purposeToGoals,
  RECOVERY_CATEGORIES,
  resolveTrack,
  TRACK_CHOICES,
} from '@/features/assessment/tracks';

import { makeAssessment } from './fixtures';

const ROOT = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

/**
 * 투트랙(목적 / 설문)의 안전 경계.
 *
 * 시작을 가볍게 하되, 아픈 몸에 목적만 보고 운동을 주지 않는다는 선은 지킨다.
 */

describe('트랙 선택', () => {
  it('두 갈래를 제공하고, 각각 무엇으로 정하는지 밝힌다', () => {
    expect(TRACK_CHOICES).toHaveLength(2);
    const byId = Object.fromEntries(TRACK_CHOICES.map((t) => [t.id, t]));
    expect(byId.purpose?.decidedBy).toContain('운동 목적');
    expect(byId.assessment?.decidedBy).toContain('설문 결과');
  });

  it('트랙 정보가 없는 예전 응답은 설문 트랙으로 본다', () => {
    expect(assessmentTrack({})).toBe('assessment');
    expect(assessmentTrack({ track: 'purpose' })).toBe('purpose');
  });
});

describe('아픈 몸에 목적만 보고 운동을 주지 않는다', () => {
  it('목적으로 시작했어도 아픈 곳이 있으면 설문 트랙으로 넘긴다', () => {
    expect(resolveTrack({ chosen: 'purpose', hasPain: true })).toBe('assessment');
  });

  it('아픈 곳이 없으면 목적 트랙 그대로 간다', () => {
    expect(resolveTrack({ chosen: 'purpose', hasPain: false })).toBe('purpose');
  });

  it('설문 트랙은 어떤 경우에도 설문 트랙이다', () => {
    expect(resolveTrack({ chosen: 'assessment', hasPain: false })).toBe('assessment');
    expect(resolveTrack({ chosen: 'assessment', hasPain: true })).toBe('assessment');
  });

  it('설문 화면이 저장 직전에 한 번 더 바로잡는다', () => {
    // 화면 흐름이 바뀌어도 저장되는 값은 틀리지 않아야 한다
    const source = read('app/assessment/index.tsx');
    expect(source).toContain('resolveTrack({');
    expect(source).toContain('hasPain: assessment.painRegions.length > 0');
  });
});

describe('목적 트랙에서도 위험 신호를 건너뛰지 않는다', () => {
  it('확인하는 신호가 하나도 없는 일은 없다', () => {
    expect(PURPOSE_TRACK_FLAG_IDS.length).toBeGreaterThanOrEqual(5);
  });

  it('응급 신호는 반드시 들어 있다', () => {
    expect(PURPOSE_TRACK_FLAG_IDS).toContain('chestPain');
    expect(PURPOSE_TRACK_FLAG_IDS).toContain('bowelBladder');
  });

  it('신경 증상과 의료진 지시 항목도 들어 있다', () => {
    for (const id of ['numbnessParalysis', 'weakness', 'postOpOrRestricted'] as RedFlagId[]) {
      expect(PURPOSE_TRACK_FLAG_IDS).toContain(id);
    }
  });

  it('실제로 존재하는 문항만 가리킨다', () => {
    const known = RED_FLAG_QUESTIONS.map((q) => q.id);
    for (const id of PURPOSE_TRACK_FLAG_IDS) expect(known).toContain(id);
  });

  it('뺀 항목은 모두 아픈 부위를 전제로 하는 것뿐이다', () => {
    // 아픈 곳이 있다고 하면 설문 트랙으로 넘어가 12개를 모두 묻는다
    const omitted = RED_FLAG_QUESTIONS.map((q) => q.id).filter(
      (id) => !PURPOSE_TRACK_FLAG_IDS.includes(id),
    );
    expect(omitted.sort()).toEqual(
      [
        'cannotBearWeight',
        'fractureSuspect',
        'jointDeformity',
        'nightPain',
        'severeSwelling',
        'severeTrauma',
      ].sort(),
    );
  });

  it('설문 화면이 목적 트랙에서도 안전 확인 단계를 거친다', () => {
    const source = read('app/assessment/index.tsx');
    // 목적 트랙 분기 안에서 안전 확인이 목적 선택보다 먼저 나와야 한다
    const branch = source.slice(
      source.indexOf("if (trackChoice === 'purpose')"),
      source.indexOf("// ── 설문 트랙 ──"),
    );
    expect(branch.length).toBeGreaterThan(0);
    const safetyAt = branch.indexOf("'purposeSafety'");
    const purposeAt = branch.indexOf("base.push('purpose')");
    expect(safetyAt).toBeGreaterThan(-1);
    expect(purposeAt).toBeGreaterThan(-1);
    expect(safetyAt).toBeLessThan(purposeAt);
  });

  it('목적 트랙에서도 학생 보호 판정에 필요한 나이대를 묻는다', () => {
    // 나이대가 없으면 학생 모드가 켜지지 않아 숫자 목표가 그대로 노출된다
    const source = read('app/assessment/index.tsx');
    const branch = source.slice(
      source.indexOf("if (trackChoice === 'purpose')"),
      source.indexOf("// ── 설문 트랙 ──"),
    );
    expect(branch).toContain("'basic'");
  });
});

describe('목적 트랙에서는 회복운동을 주지 않는다', () => {
  it('회복 카테고리는 목적 트랙에서 막힌다', () => {
    for (const category of RECOVERY_CATEGORIES) {
      expect(isCategoryAllowed('purpose', category)).toBe(false);
      expect(isCategoryAllowed('assessment', category)).toBe(true);
    }
  });

  it('교정·웜업·기능성은 두 트랙 모두 열려 있다', () => {
    for (const category of ['posture', 'dynamicWarmup', 'functional'] as const) {
      expect(isCategoryAllowed('purpose', category)).toBe(true);
      expect(isCategoryAllowed('assessment', category)).toBe(true);
    }
  });

  it('어떤 목적도 회복 카테고리를 가리키지 않는다', () => {
    for (const purpose of PURPOSE_CHOICES) {
      for (const category of purpose.categories) {
        expect(RECOVERY_CATEGORIES).not.toContain(category);
      }
    }
  });

  it('목적마다 실제로 제공할 프로그램이 있다', () => {
    for (const purpose of PURPOSE_CHOICES) {
      const count = PROGRAMS.filter((p) => purpose.categories.includes(p.category)).length;
      expect(count).toBeGreaterThan(0);
    }
  });

  it('운동 탭이 트랙에 따라 목록을 거른다', () => {
    const source = read('app/(tabs)/workout.tsx');
    expect(source).toContain('isCategoryAllowed');
    expect(source).toContain('assessmentTrack');
  });
});

describe('목적은 목표로 이어진다', () => {
  it('모든 목적이 목표를 만들어 낸다', () => {
    for (const purpose of PURPOSE_CHOICES) {
      expect(purposeToGoals(purpose.id).length).toBeGreaterThan(0);
    }
  });

  it('목적 트랙 응답도 추천 엔진이 받아들인다', () => {
    const a = makeAssessment({ track: 'purpose', purpose: 'posture', goals: ['posture'] });
    expect(assessmentTrack(a)).toBe('purpose');
    expect(a.painRegions).toEqual([]);
  });
});
