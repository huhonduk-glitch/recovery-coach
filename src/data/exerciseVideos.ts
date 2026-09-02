/**
 * 운동 동작 영상 링크 등록표.
 *
 * ── 영상을 추가하는 방법 ─────────────────────────────────────
 * 1. 유튜브에서 동작 영상을 찾습니다.
 * 2. 주소창의 링크를 복사합니다.  예) https://www.youtube.com/watch?v=abc123
 * 3. 아래 EXERCISE_VIDEOS 에 한 줄을 추가합니다.
 *
 *      'knee-p1-01': { url: 'https://www.youtube.com/watch?v=abc123',
 *                      title: '쿼드셋 시연', source: '채널 이름' },
 *
 * 4. 앱을 다시 실행하면 그 운동 화면에 '영상 보기' 버튼이 생깁니다.
 *
 * ── 저작권 ──────────────────────────────────────────────────
 * 이 앱은 영상을 내려받거나 앱 안에 담지 않습니다.
 * '영상 보기' 를 누르면 유튜브 앱이나 브라우저가 열립니다.
 * 원작자의 채널에서 재생되므로 조회수도 원작자에게 갑니다.
 *
 * ⚠️ 영상 파일을 받아서 앱에 넣는 것은 저작권 침해입니다. 하지 마세요.
 *
 * ── 영상을 고르는 기준 (docs/VIDEO_GUIDE.md) ────────────────
 * 조회수가 높다고 안전한 영상은 아닙니다. 아래를 먼저 봅니다.
 *   1. 만든 사람이 물리치료사·운동전문가인가
 *   2. 우리 앱의 동작 설명과 자세가 같은가
 *   3. 통증을 참으라거나 무리하라는 말이 없는가
 *   4. 광고·판매 유도가 심하지 않은가
 * ─────────────────────────────────────────────────────────────
 */

export interface ExerciseVideo {
  /** 유튜브 링크 (watch, youtu.be, shorts 모두 가능) */
  url: string;
  /** 화면에 보여 줄 제목 */
  title: string;
  /** 채널 이름 등 출처 */
  source: string;
  /** 한국어 영상인지 (아니면 화면에 '영어 영상' 이라고 알려 준다) */
  korean?: boolean;
}

export const EXERCISE_VIDEOS: Record<string, ExerciseVideo> = {
  // 아직 등록된 영상이 없습니다.
  // docs/VIDEO_CANDIDATES.md 에 후보 목록이 있습니다. 확인 후 여기에 옮겨 적으세요.
};

export function getExerciseVideo(exerciseId: string): ExerciseVideo | null {
  return EXERCISE_VIDEOS[exerciseId] ?? null;
}

/**
 * 등록된 영상이 없을 때 쓸 유튜브 검색 링크.
 *
 * 사용자가 직접 찾아볼 수 있게 검색 결과 페이지를 열어 준다.
 * 검색어에 '재활' 이나 '물리치료' 를 넣어, 자극적인 운동 영상보다
 * 재활 성격의 영상이 위로 오게 한다.
 */
export function buildSearchUrl(exerciseName: string, bodyRegionLabel: string | null): string {
  const keyword = [exerciseName, bodyRegionLabel ?? '', '재활 운동 방법']
    .filter(Boolean)
    .join(' ');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
}

export function registeredVideoCount(): number {
  return Object.keys(EXERCISE_VIDEOS).length;
}
