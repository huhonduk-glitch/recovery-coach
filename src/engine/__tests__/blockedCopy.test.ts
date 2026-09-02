import { BLOCKED_MESSAGES, CONSULT_GUIDE } from '@/content/copy/blockedMessages';
import { DISCLAIMER_FULL, DISCLAIMER_SHORT } from '@/content/copy/disclaimer';
import { RED_FLAG_QUESTIONS } from '@/content/survey/redFlagQuestions';

/**
 * [S11] 금지 표현 스캔.
 * docs/SAFETY_POLICY.md §1.1 의 금지어가 사용자 노출 문구에 없어야 한다.
 *
 * 단, '진단·치료·처방을 제공하지 않습니다' 처럼 부정문으로 쓰는 것은 허용한다.
 * 금지 대상은 앱이 그 행위를 한다고 말하는 경우다.
 */
const FORBIDDEN_WORDS = ['처방', '치료', '완치', '진단', '교정해 드립니다', '낫습니다'];

/**
 * 금지어를 포함하지만 문제가 없는 표현.
 * 직업명·기관명은 그대로 써야 사용자가 어디로 가야 할지 알 수 있다.
 */
const ALLOWED_PHRASES = ['물리치료사', '치료사', '재활의학과', '진단서'];

/** 부정문(~하지 않습니다 / ~이 아닙니다)이면 금지 대상이 아니다 */
function isNegated(sentence: string): boolean {
  return sentence.includes('않') || sentence.includes('아닙니다');
}

/** 허용 표현을 걷어낸 뒤 남은 문장에서만 금지어를 찾는다 */
function stripAllowed(sentence: string): string {
  return ALLOWED_PHRASES.reduce((acc, phrase) => acc.split(phrase).join(''), sentence);
}

function collectUserFacingCopy(): string[] {
  return [
    DISCLAIMER_SHORT,
    ...DISCLAIMER_FULL,
    ...Object.values(BLOCKED_MESSAGES).flatMap((m) => [m.title, m.body]),
    ...CONSULT_GUIDE.common,
    ...CONSULT_GUIDE.student,
    CONSULT_GUIDE.emergency,
    CONSULT_GUIDE.retry,
    ...RED_FLAG_QUESTIONS.flatMap((q) => [q.question, q.hint]),
  ];
}

describe('[S11] 사용자 노출 문구 금지 표현 검사', () => {
  it.each(FORBIDDEN_WORDS)('"%s" 표현이 없다', (word) => {
    const offenders = collectUserFacingCopy().filter(
      (text) => stripAllowed(text).includes(word) && !isNegated(text),
    );
    expect(offenders).toEqual([]);
  });
});

describe('차단 화면 문구 규칙', () => {
  it('대체 운동을 제안하지 않는다', () => {
    const suggestions = ['스트레칭이라도', '가벼운 운동은', '대신 이 운동'];
    for (const message of Object.values(BLOCKED_MESSAGES)) {
      for (const s of suggestions) {
        expect(message.body).not.toContain(s);
      }
    }
  });

  it('근거 없는 안심 표현을 쓰지 않는다', () => {
    for (const message of Object.values(BLOCKED_MESSAGES)) {
      expect(message.body).not.toContain('괜찮을 거예요');
      expect(message.body).not.toContain('금방 나아');
    }
  });

  it('모든 차단 사유에 문구가 정의되어 있다', () => {
    expect(Object.keys(BLOCKED_MESSAGES).sort()).toEqual(
      ['noConsent', 'painTooHigh', 'painWorsening', 'redFlag'].sort(),
    );
  });
});
