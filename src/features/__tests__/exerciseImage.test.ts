import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { EXERCISES } from '@/data/exercises';
import { EXERCISE_IMAGES, getExerciseImage } from '@/data/exerciseImages';

const ROOT = join(__dirname, '..', '..', '..');
const ASSET_DIR = join(ROOT, 'assets', 'exercises');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

/**
 * 동작 이미지 파이프라인.
 * 이미지가 없어도 앱이 정상 동작해야 하고, 등록한 이미지는 실제로 있어야 한다.
 */

describe('이미지가 없어도 앱은 동작한다', () => {
  it('등록되지 않은 운동은 null 을 돌려준다', () => {
    expect(getExerciseImage('없는-운동-id')).toBeNull();
  });

  it('모든 운동이 이미지 없이도 조회된다', () => {
    for (const exercise of EXERCISES) {
      expect(() => getExerciseImage(exercise.id)).not.toThrow();
    }
  });

  it('이미지가 없으면 부위 표시 그림으로 대체한다', () => {
    const source = read('src/components/ExerciseFigure.tsx');
    expect(source).toContain('BodyDiagram');
    expect(source).toContain('동작 사진은 준비 중이에요');
  });

  it('부위 표시 그림이 자세 안내가 아님을 코드에 명시했다', () => {
    const source = read('src/components/BodyDiagram.tsx');
    expect(source).toContain('자세를 보여 주는 그림이 아니다');
  });
});

describe('등록한 이미지는 실제로 존재해야 한다', () => {
  const files = existsSync(ASSET_DIR)
    ? readdirSync(ASSET_DIR).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    : [];

  it('등록표의 id 는 모두 실제 운동 id 다', () => {
    const validIds = new Set(EXERCISES.map((e) => e.id));
    const unknown = Object.keys(EXERCISE_IMAGES).filter((id) => !validIds.has(id));
    expect(unknown).toEqual([]);
  });

  it('등록표에 있는 이미지는 파일이 존재한다', () => {
    const missing = Object.keys(EXERCISE_IMAGES).filter(
      (id) => !files.some((f) => f.startsWith(id)),
    );
    expect(missing).toEqual([]);
  });
});

describe('이미지 안전 규칙이 문서에 남아 있다', () => {
  it.each([
    ['assets/exercises/README.md', '얼굴이 알아볼 수 있게 나온 사진'],
    ['assets/exercises/README.md', '학생을 모델로 쓰지 않습니다'],
    ['docs/IMAGE_LIST.md', '확신이 없으면 넣지 마세요'],
    ['src/data/exerciseImages.ts', '초상권'],
  ])('%s 에 "%s" 안내가 있다', (file, phrase) => {
    expect(read(file)).toContain(phrase);
  });
});

describe('제작 목록이 운동 데이터와 맞는다', () => {
  const list = read('docs/IMAGE_LIST.md');

  it('총 개수가 일치한다', () => {
    expect(list).toContain(`총 **${EXERCISES.length}개** 운동의 이미지가 필요합니다.`);
  });

  it('모든 운동의 파일명이 목록에 있다', () => {
    const missing = EXERCISES.filter((e) => !list.includes(`\`${e.id}.png\``)).map((e) => e.id);
    expect(missing).toEqual([]);
  });
});
