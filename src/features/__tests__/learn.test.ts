import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  ACSM_EDITION,
  GUIDELINE_CAUTIONS,
  GUIDELINE_GROUPS,
  unverifiedGuidelineCount,
} from '@/data/activityGuidelines';
import {
  EDUCATION_DISCLAIMER,
  getRegionEducation,
  REGION_EDUCATION,
} from '@/data/injuryEducation';

const ROOT = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

describe('운동 지침 안내', () => {
  it('기준으로 삼은 지침의 판과 출처를 밝힌다', () => {
    expect(ACSM_EDITION.edition).toContain('12판');
    expect(ACSM_EDITION.source.length).toBeGreaterThan(0);
  });

  it('모든 항목에 출처가 붙어 있다', () => {
    for (const group of GUIDELINE_GROUPS) {
      for (const item of group.items) {
        expect(item.source.length).toBeGreaterThan(0);
        expect(item.detail.length).toBeGreaterThan(0);
        expect(item.why.length).toBeGreaterThan(0);
      }
    }
  });

  it('확인하지 못한 항목은 출처에 경고 표시가 있다', () => {
    for (const group of GUIDELINE_GROUPS) {
      for (const item of group.items) {
        if (!item.verified) expect(item.source).toContain('⚠️');
      }
    }
    // 확인하지 못한 항목이 있다면 화면에서도 그 수를 알려 준다
    expect(unverifiedGuidelineCount()).toBeGreaterThanOrEqual(0);
    expect(read('app/learn/guidelines.tsx')).toContain('unverifiedGuidelineCount');
  });

  it('성인과 청소년 기준을 나누어 둔다', () => {
    const ids = GUIDELINE_GROUPS.map((g) => g.id);
    expect(ids).toContain('adult');
    expect(ids).toContain('youth');
  });

  it('통증이 있거나 재활 중이면 이 숫자를 쓰지 말라고 먼저 말한다', () => {
    expect(GUIDELINE_CAUTIONS.join(' ')).toContain('회복운동 단계를 먼저');
    expect(GUIDELINE_CAUTIONS.join(' ')).toContain('담당 의사');
  });

  it('운동 처방이 아니라고 밝힌다', () => {
    expect(GUIDELINE_CAUTIONS.join(' ')).toContain('처방을 하지 않습니다');
    expect(read('app/learn/guidelines.tsx')).toContain('운동 처방이 아닙니다');
  });
});

describe('부위별 손상 이해 자료', () => {
  it('앱이 다루는 다섯 부위를 모두 덮는다', () => {
    const regions = REGION_EDUCATION.map((r) => r.region).sort();
    expect(regions).toEqual(['ankle', 'knee', 'lowBack', 'neckUpperBack', 'shoulder']);
  });

  it('부위마다 구조물·손상·병원 안내가 비어 있지 않다', () => {
    for (const region of REGION_EDUCATION) {
      expect(region.structures.length).toBeGreaterThanOrEqual(3);
      expect(region.injuries.length).toBeGreaterThanOrEqual(2);
      expect(region.commonCauses.length).toBeGreaterThan(0);
      expect(region.seeProfessional.length).toBeGreaterThan(0);
    }
  });

  it('모든 손상 설명에 기전·제한·재활 목표·주의가 들어 있다', () => {
    for (const region of REGION_EDUCATION) {
      for (const injury of region.injuries) {
        expect(injury.howItHappens.length).toBeGreaterThan(0);
        expect(injury.commonPicture.length).toBeGreaterThan(0);
        expect(injury.whatGetsLimited.length).toBeGreaterThan(0);
        expect(injury.careOverview.length).toBeGreaterThan(0);
        expect(injury.rehabGoals.length).toBeGreaterThan(0);
        expect(injury.warning.length).toBeGreaterThan(0);
      }
    }
  });

  it('강조할 구조물이 그 부위에 실제로 있는 것이어야 한다', () => {
    for (const region of REGION_EDUCATION) {
      const keys = region.structures.map((s) => s.key);
      for (const injury of region.injuries) {
        expect(keys).toContain(injury.structure);
      }
    }
  });

  it('재활 기간을 주 단위 숫자로 적지 않는다', () => {
    // 같은 손상이라도 기간이 사람마다 다르다. 앱이 날짜를 정해 주면
    // 사용자가 그 날짜에 맞춰 복귀하려 한다. (docs/SAFETY_POLICY.md)
    const weekLike = /\d+\s*(주|개월|달)\s*(간|째|후|뒤|이면|이면서|정도|쯤)?/;
    for (const region of REGION_EDUCATION) {
      for (const injury of region.injuries) {
        const text = [
          ...injury.careOverview,
          ...injury.rehabGoals,
          injury.warning,
        ].join(' ');
        expect(text).not.toMatch(weekLike);
      }
    }
  });

  it('복귀 시점은 담당 의사가 정한다고 밝힌다', () => {
    expect(EDUCATION_DISCLAIMER.join(' ')).toContain('담당 의사');
    expect(EDUCATION_DISCLAIMER.join(' ')).toContain('개념도');
  });

  it('"당신이 이 손상이다" 라고 말하지 않는다', () => {
    expect(EDUCATION_DISCLAIMER.join(' ')).toContain('이런 손상이 있다');
    expect(read('app/learn/index.tsx')).toContain('이런 손상이 있다');
  });

  it('없는 부위를 물으면 undefined 를 돌려준다', () => {
    expect(getRegionEducation('없는부위')).toBeUndefined();
    expect(getRegionEducation('knee')?.label).toBe('무릎');
  });
});

describe('알아보기 화면은 안전 규칙을 지킨다', () => {
  it('앱이 진단·치료·처방을 한다고 말하지 않는다', () => {
    // 교육 자료에서 '치료' 는 병원이 하는 일을 설명할 때만 쓸 수 있다.
    // 앱이 그 행위를 한다고 읽히면 안 된다. (docs/SAFETY_POLICY.md §1)
    const words = ['처방', '치료', '완치', '진단'];
    const allowedPhrases = ['물리치료사', '치료사', '재활의학과', '물리치료'];
    const attributed = /(의사|병원|전문가|받|정합니다|다룹니다|다르게|필요|아닙니다|않|없)/;

    const texts: string[] = [];
    for (const region of REGION_EDUCATION) {
      texts.push(region.intro, ...region.commonCauses, ...region.seeProfessional);
      for (const injury of region.injuries) {
        texts.push(
          ...injury.howItHappens,
          ...injury.commonPicture,
          ...injury.whatGetsLimited,
          ...injury.careOverview,
          ...injury.rehabGoals,
          injury.warning,
        );
      }
    }
    texts.push(...EDUCATION_DISCLAIMER, ...GUIDELINE_CAUTIONS);

    const strip = (t: string) => allowedPhrases.reduce((acc, p) => acc.split(p).join(''), t);
    const offenders = texts.filter(
      (t) => words.some((w) => strip(t).includes(w)) && !attributed.test(t),
    );
    expect(offenders).toEqual([]);
  });

  it('화면에 진단하지 않는다는 안내가 남아 있다', () => {
    const hub = read('app/learn/index.tsx');
    expect(hub).toContain('내 몸이 무엇인지는 알려 주지 않습니다');
    expect(read('app/learn/guidelines.tsx')).toContain('운동 처방이 아닙니다');
  });

  it('그림이 개념도라는 것을 화면에서도 알린다', () => {
    expect(read('src/components/AnatomyDiagram.tsx')).toContain('실제 해부도가 아닙니다');
  });

  it('부위마다 병원부터 가야 하는 신호를 danger 톤으로 보여 준다', () => {
    const screen = read('app/learn/[region].tsx');
    expect(screen).toContain('seeProfessional');
    expect(screen).toContain('tone="danger"');
  });

  it('재활 프로그램 화면에서 해당 부위 자료로 갈 수 있다', () => {
    expect(read('app/workout/[programId].tsx')).toContain('/learn/');
  });

  it('운동 탭에서 알아보기로 갈 수 있다', () => {
    expect(read('app/(tabs)/workout.tsx')).toContain("router.push('/learn')");
  });
});
