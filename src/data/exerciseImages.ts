import type { ImageSourcePropType } from 'react-native';

/**
 * 운동 동작 이미지 등록표.
 *
 * ── 이미지를 추가하는 방법 (코딩 몰라도 됩니다) ──────────────────
 * 1. 이미지 파일을 `assets/exercises/` 폴더에 넣습니다.
 *    파일 이름은 운동 id 와 똑같이 합니다.  예) knee-p1-01.png
 * 2. 아래 EXERCISE_IMAGES 안에 한 줄을 추가합니다.
 *
 *      'knee-p1-01': require('../../assets/exercises/knee-p1-01.png'),
 *
 * 3. 앱을 다시 실행하면 그 운동 화면에 이미지가 나옵니다.
 *    등록하지 않은 운동은 부위 표시 그림이 대신 나옵니다.
 *
 * ⚠️ 주의
 *  - 얼굴이 알아볼 수 있게 나온 사진은 쓰지 않습니다 (초상권·개인정보).
 *  - 직접 찍었거나 상업적 이용이 가능한 이미지만 씁니다.
 *  - 어떤 운동에 어떤 이미지가 필요한지는 docs/IMAGE_LIST.md 를 보세요.
 *  - 준비된 이미지 목록 확인:  npm run images:check
 * ─────────────────────────────────────────────────────────────
 */
export const EXERCISE_IMAGES: Record<string, ImageSourcePropType> = {
  // 아직 등록된 이미지가 없습니다.
  // 위 설명대로 한 줄씩 추가하세요.
  //
  // 예시:
  // 'knee-p1-01': require('../../assets/exercises/knee-p1-01.png'),
  // 'knee-p1-02': require('../../assets/exercises/knee-p1-02.png'),
};

/** 등록된 이미지가 있으면 돌려준다 */
export function getExerciseImage(exerciseId: string): ImageSourcePropType | null {
  return EXERCISE_IMAGES[exerciseId] ?? null;
}

/** 이미지가 준비된 운동 수 */
export function registeredImageCount(): number {
  return Object.keys(EXERCISE_IMAGES).length;
}
