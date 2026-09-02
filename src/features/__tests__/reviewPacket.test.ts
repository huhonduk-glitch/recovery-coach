import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { EXERCISES } from '@/data/exercises';
import { NUTRITION_PLANS } from '@/data/mealTemplates';
import {
  IN_WORKOUT_REDUCE_THRESHOLD,
  IN_WORKOUT_STOP_THRESHOLD,
  PAIN_PHASE1_THRESHOLD,
  PAIN_STOP_THRESHOLD,
} from '@/features/assessment/assessmentEngine';
import { RED_FLAG_QUESTIONS } from '@/features/assessment/assessmentQuestions';

const ROOT = join(__dirname, '..', '..', '..');
const packet = readFileSync(join(ROOT, 'docs', 'REVIEW_PACKET.md'), 'utf8');
const html = readFileSync(join(ROOT, 'docs', 'review-packet.html'), 'utf8');

/**
 * 검수 요청서.
 * 코드가 바뀌었는데 문서가 그대로면, 검수자가 잘못된 내용을 보게 된다.
 */

describe('검수 요청서가 실제 코드와 맞는다', () => {
  it('위험 신호 12개 문항이 모두 들어 있다', () => {
    const missing = RED_FLAG_QUESTIONS.filter((q) => !packet.includes(q.label)).map((q) => q.id);
    expect(missing).toEqual([]);
  });

  it('운동이 모두 들어 있다', () => {
    const missing = EXERCISES.filter((e) => !packet.includes(`\`${e.id}\``)).map((e) => e.id);
    expect(missing).toEqual([]);
  });

  it('운동 개수가 일치한다', () => {
    expect(packet).toContain(`## 5. 운동 목록 (${EXERCISES.length}개)`);
  });

  it('영양 4트랙이 모두 들어 있다', () => {
    for (const plan of NUTRITION_PLANS) {
      expect(packet).toContain(plan.title);
    }
  });

  it('탄단지 비율이 코드 값과 같다', () => {
    for (const plan of NUTRITION_PLANS) {
      const { carbMin, carbMax, proteinMin, proteinMax, fatMin, fatMax } = plan.macroRatio;
      expect(packet).toContain(
        `탄수화물 ${carbMin}~${carbMax}% · 단백질 ${proteinMin}~${proteinMax}% · 지방 ${fatMin}~${fatMax}%`,
      );
    }
  });

  it('통증 기준값이 코드 값과 같다', () => {
    expect(packet).toContain(`PAIN_STOP_THRESHOLD = ${PAIN_STOP_THRESHOLD}`);
    expect(packet).toContain(`PAIN_PHASE1_THRESHOLD = ${PAIN_PHASE1_THRESHOLD}`);
    expect(packet).toContain(`${IN_WORKOUT_STOP_THRESHOLD}점 이상 | 해당 운동 중단`);
    expect(packet).toContain(`${IN_WORKOUT_REDUCE_THRESHOLD}~${IN_WORKOUT_STOP_THRESHOLD - 1}점`);
  });
});

describe('검수자가 판단할 수 있게 되어 있다', () => {
  it('검수 항목 7개를 안내한다', () => {
    for (const section of [
      '## 1. 위험 신호 문항',
      '## 2. 위험도 분류',
      '## 3. 통증 점수별 단계 배정',
      '## 4. 운동 중 통증 대응',
      '## 5. 운동 목록',
      '## 6. 영양 가이드',
      '## 7. 학생(성장기) 보호 규칙',
    ]) {
      expect(packet).toContain(section);
    }
  });

  it('검증된 값이 아니라는 점을 먼저 밝힌다', () => {
    expect(packet).toContain('임상 근거로 검증된 값이 아니라는 점');
  });

  it('표시 방법(O/△/X)을 안내한다', () => {
    expect(packet).toContain('| O | 이대로 괜찮음 |');
    expect(packet).toContain('| X | 빼야 함 / 위험함 |');
  });

  it('검수자 서명란과 최종 판단란이 있다', () => {
    expect(packet).toContain('| 검수자 성함 |');
    expect(packet).toContain('이 앱을 학생에게 사용해도 되겠습니까?');
    expect(packet).toContain('현재 상태로는 사용 권하지 않음');
  });

  it('각 항목마다 구체적인 질문을 던진다', () => {
    const questionCount = (packet.match(/\*\*여쭙고 싶은 것/g) ?? []).length;
    expect(questionCount).toBeGreaterThanOrEqual(5);
  });
});

describe('인쇄용 HTML', () => {
  it('A4 인쇄 설정이 들어 있다', () => {
    expect(html).toContain('@page { size: A4');
    expect(html).toContain('page-break-inside: avoid');
  });

  it('한국어 문서로 선언되어 있다', () => {
    expect(html).toContain('<html lang="ko">');
    expect(html).toContain('<meta charset="utf-8">');
  });

  it('표와 서술란이 실제로 만들어진다', () => {
    expect(html).toContain('<table>');
    expect(html).toContain('pre class="write"');
  });
});
