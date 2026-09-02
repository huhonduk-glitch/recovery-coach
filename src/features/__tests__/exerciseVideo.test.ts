import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { EXERCISES } from '@/data/exercises';
import { EXERCISE_VIDEOS, buildSearchUrl, getExerciseVideo } from '@/data/exerciseVideos';

const ROOT = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

/**
 * 동작 영상 링크.
 * 앱은 영상을 담지 않고 링크만 보관한다. 저작권과 안전 안내가 빠지면 안 된다.
 */

describe('영상이 없어도 앱은 동작한다', () => {
  it('등록되지 않은 운동은 null 을 돌려준다', () => {
    expect(getExerciseVideo('없는-운동')).toBeNull();
  });

  it('모든 운동에 대해 검색 링크를 만들 수 있다', () => {
    for (const exercise of EXERCISES) {
      const url = buildSearchUrl(exercise.name, null);
      expect(url).toContain('youtube.com/results');
    }
  });

  it('검색어에 재활 성격의 단어를 넣어 자극적인 영상을 밀어낸다', () => {
    const url = buildSearchUrl('쿼드셋', '무릎');
    expect(decodeURIComponent(url)).toContain('재활 운동 방법');
    expect(decodeURIComponent(url)).toContain('무릎');
  });
});

describe('등록한 영상은 형식이 맞아야 한다', () => {
  it('등록표의 id 는 모두 실제 운동 id 다', () => {
    const validIds = new Set(EXERCISES.map((e) => e.id));
    const unknown = Object.keys(EXERCISE_VIDEOS).filter((id) => !validIds.has(id));
    expect(unknown).toEqual([]);
  });

  it('유튜브 링크만 등록할 수 있다', () => {
    const bad = Object.entries(EXERCISE_VIDEOS).filter(
      ([, v]) => !/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(v.url),
    );
    expect(bad).toEqual([]);
  });

  it('제목과 출처가 비어 있지 않다', () => {
    for (const [id, video] of Object.entries(EXERCISE_VIDEOS)) {
      expect(video.title.length).toBeGreaterThan(0);
      expect(video.source.length).toBeGreaterThan(0);
      expect(id.length).toBeGreaterThan(0);
    }
  });
});

describe('영상은 앱 안에서 재생하지 않는다 (저작권)', () => {
  const component = read('src/components/ExerciseVideoLink.tsx');

  it('외부 브라우저나 유튜브 앱을 연다', () => {
    expect(component).toContain('Linking.openURL');
    expect(component).toContain('window.open');
  });

  it('영상을 앱 안에 담는 코드가 없다', () => {
    expect(component).not.toContain('WebView');
    expect(component).not.toContain('iframe');
    expect(component).not.toContain('<Video');
  });

  it('원작자 채널에서 재생된다는 안내가 있다', () => {
    expect(component).toContain('만든 분의 채널에서 재생됩니다');
  });
});

describe('안전 안내가 화면에 남아 있다', () => {
  const component = read('src/components/ExerciseVideoLink.tsx');

  it('검색 결과를 앱이 검증하지 않았다고 알린다', () => {
    expect(component).toContain('앱이 검증하지 않았습니다');
  });

  it('통증을 참게 하는 영상을 따라 하지 말라고 안내한다', () => {
    expect(component).toContain('통증을 참으라거나 무리하라는 영상은 따라 하지');
  });

  it('영상과 글 설명이 다르면 글 설명을 따르라고 안내한다', () => {
    expect(component).toContain('글 설명과 자세가 다르면 글 설명을 따라');
  });
});

describe('저작권 규칙이 문서에 남아 있다', () => {
  it.each([
    ['docs/VIDEO_GUIDE.md', '링크는 되고, 파일은 안 됩니다'],
    ['docs/VIDEO_GUIDE.md', '조회수 순으로 고르지 마세요'],
    ['docs/VIDEO_CANDIDATES.md', '아직 검수하지 않은 후보'],
    ['src/data/exerciseVideos.ts', '저작권 침해입니다'],
  ])('%s 에 "%s" 안내가 있다', (file, phrase) => {
    expect(read(file)).toContain(phrase);
  });

  it('후보 목록이 조회수를 확인하지 못했다고 밝힌다', () => {
    expect(read('docs/VIDEO_CANDIDATES.md')).toContain('조회수·댓글 수를 확인하지 못했습니다');
  });
});

describe('우선순위 문서', () => {
  const priority = read('docs/MEDIA_PRIORITY.md');

  it('1순위에 부위별 Phase 1 이 들어 있다', () => {
    expect(priority).toContain('knee-p1-01');
    expect(priority).toContain('back-p1-01');
    expect(priority).toContain('shoulder-p1-01');
  });

  it('순위 기준을 밝히고 있다', () => {
    expect(priority).toContain('추천 엔진이 실제로 어떤 루틴을 먼저 내보내는지');
    expect(priority).toContain('임상 통계가 아닙니다');
  });
});
