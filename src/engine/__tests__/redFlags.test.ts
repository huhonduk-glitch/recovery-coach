import { RED_FLAG_QUESTIONS } from '@/content/survey/redFlagQuestions';
import {
  evaluateRedFlags,
  isBlockedByRedFlag,
  isScreeningComplete,
  judgeScreening,
  type RedFlagAnswers,
} from '@/engine/safety';
import { RED_FLAG_IDS } from '@/types';

/** 8문항 모두 '아니오' 인 응답 */
function allNo(): RedFlagAnswers {
  return Object.fromEntries(RED_FLAG_IDS.map((id) => [id, false])) as RedFlagAnswers;
}

describe('[S1] 레드 플래그 8개 각각 단독으로 차단된다', () => {
  it.each(RED_FLAG_IDS)('%s 하나만 "예" 여도 차단된다', (flagId) => {
    const answers: RedFlagAnswers = { ...allNo(), [flagId]: true };

    const verdict = judgeScreening(answers);

    expect(verdict.status).toBe('blocked');
    if (verdict.status === 'blocked') {
      expect(verdict.reason).toBe('redFlag');
      expect(verdict.flags).toEqual([flagId]);
    }
  });

  it('8개 문항이 모두 검사된다 (문항이 추가되면 이 테스트도 늘어난다)', () => {
    expect(RED_FLAG_IDS).toHaveLength(8);
  });
});

describe('레드 플래그 판정은 점수화하지 않는다', () => {
  it('플래그 1개도 차단이다 (2개 이상 같은 완화 규칙 없음)', () => {
    expect(isBlockedByRedFlag(['rf_chest'])).toBe(true);
  });

  it('플래그가 없어야만 통과한다', () => {
    expect(isBlockedByRedFlag([])).toBe(false);
  });

  it('모두 "아니오" 면 통과한다', () => {
    const verdict = judgeScreening(allNo());
    expect(verdict.status).toBe('pass');
  });

  it('여러 개가 "예" 면 모두 기록된다', () => {
    const answers: RedFlagAnswers = { ...allNo(), rf_chest: true, rf_numbness: true };
    expect(evaluateRedFlags(answers).sort()).toEqual(['rf_chest', 'rf_numbness'].sort());
  });
});

describe('미응답 상태로는 통과시키지 않는다', () => {
  it('한 문항이라도 답하지 않으면 incomplete 다', () => {
    const answers = allNo();
    delete answers.rf_pregnancy;

    expect(isScreeningComplete(answers)).toBe(false);
    expect(judgeScreening(answers).status).toBe('incomplete');
  });

  it('빈 응답은 통과가 아니다', () => {
    expect(judgeScreening({}).status).toBe('incomplete');
  });
});

describe('스크리닝 문항 콘텐츠', () => {
  it('문항 데이터와 타입 목록이 일치한다', () => {
    expect(RED_FLAG_QUESTIONS.map((q) => q.id).sort()).toEqual([...RED_FLAG_IDS].sort());
  });

  it('모든 문항에 질문과 보조 설명이 있다', () => {
    for (const q of RED_FLAG_QUESTIONS) {
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.hint.length).toBeGreaterThan(0);
    }
  });

  it('가슴 통증 문항은 응급 안내 대상으로 표시되어 있다', () => {
    const chest = RED_FLAG_QUESTIONS.find((q) => q.id === 'rf_chest');
    expect(chest?.emergency).toBe(true);
  });
});
