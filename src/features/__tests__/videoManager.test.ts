import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { EXERCISE_VIDEOS } from '@/data/exerciseVideos';
import {
  addVideo,
  customizedCount,
  exportAsCode,
  isCustomized,
  moveVideo,
  removeVideo,
  resetAll,
  resetExercise,
  resolveVideos,
  updateVideo,
} from '@/features/videos/videoLibrary';
import {
  checkVideoUrl,
  EMPTY_OVERRIDE_STORE,
  isSameVideo,
  REJECTED_VIDEO_IDS,
  type VideoOverrideStore,
} from '@/features/videos/videoTypes';

const ROOT = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

const OK = 'https://www.youtube.com/watch?v=aaaaaaaaaaa';

function must(result: { ok: boolean; store?: VideoOverrideStore; reason?: string }) {
  if (!result.ok || result.store === undefined) {
    throw new Error(`실패했다: ${result.reason ?? ''}`);
  }
  return result.store;
}

describe('주소 확인', () => {
  it('유튜브 watch / youtu.be / shorts 를 모두 같은 주소로 정리한다', () => {
    const forms = [
      'https://www.youtube.com/watch?v=d5A5LWDOPE0',
      'https://youtu.be/d5A5LWDOPE0',
      'https://www.youtube.com/shorts/d5A5LWDOPE0',
      'https://m.youtube.com/watch?v=d5A5LWDOPE0&t=30s',
      'youtube.com/watch?v=d5A5LWDOPE0',
    ];
    for (const form of forms) {
      const check = checkVideoUrl(form);
      expect(check.ok).toBe(true);
      if (check.ok) {
        expect(check.parsed.normalizedUrl).toBe('https://www.youtube.com/watch?v=d5A5LWDOPE0');
      }
    }
  });

  it('인스타그램 릴스와 게시물을 받는다', () => {
    const check = checkVideoUrl('https://www.instagram.com/reels/ABC123xyz/');
    expect(check.ok).toBe(true);
    if (check.ok) {
      expect(check.parsed.kind).toBe('instagram');
      expect(check.parsed.normalizedUrl).toBe('https://www.instagram.com/reel/ABC123xyz/');
    }
  });

  it('유튜브·인스타그램이 아닌 주소는 이유와 함께 막는다', () => {
    for (const bad of ['', '그냥 글자', 'https://example.com/video.mp4', 'https://vimeo.com/1']) {
      const check = checkVideoUrl(bad);
      expect(check.ok).toBe(false);
      if (!check.ok) expect(check.reason.length).toBeGreaterThan(0);
    }
  });

  it('2026-09-02 점검에서 제외한 영상은 다시 넣을 수 없다', () => {
    for (const id of REJECTED_VIDEO_IDS) {
      const check = checkVideoUrl(`https://www.youtube.com/watch?v=${id}`);
      expect(check.ok).toBe(false);
    }
  });

  it('주소 모양이 달라도 같은 영상이면 같은 것으로 본다', () => {
    expect(isSameVideo('https://youtu.be/d5A5LWDOPE0', OK)).toBe(false);
    expect(
      isSameVideo('https://youtu.be/d5A5LWDOPE0', 'https://www.youtube.com/watch?v=d5A5LWDOPE0'),
    ).toBe(true);
  });
});

describe('영상 추가·수정·삭제', () => {
  it('덮어쓰기가 없으면 기본 목록을 그대로 쓴다', () => {
    expect(resolveVideos(EMPTY_OVERRIDE_STORE, 'knee-p1-01')).toEqual(
      EXERCISE_VIDEOS['knee-p1-01'],
    );
    expect(isCustomized(EMPTY_OVERRIDE_STORE, 'knee-p1-01')).toBe(false);
  });

  it('추가하면 기존 목록 뒤에 붙는다', () => {
    const before = resolveVideos(EMPTY_OVERRIDE_STORE, 'knee-p1-01').length;
    const store = must(
      addVideo(EMPTY_OVERRIDE_STORE, 'knee-p1-01', {
        url: OK,
        title: '새 영상',
        source: '',
        korean: true,
      }),
    );
    const list = resolveVideos(store, 'knee-p1-01');
    expect(list).toHaveLength(before + 1);
    expect(list[before]?.title).toBe('새 영상');
    expect(list[before]?.source).toBe('직접 등록');
  });

  it('같은 영상을 두 번 넣을 수 없다', () => {
    const store = must(
      addVideo(EMPTY_OVERRIDE_STORE, 'knee-p1-01', {
        url: OK,
        title: '새 영상',
        source: '',
        korean: true,
      }),
    );
    const again = addVideo(store, 'knee-p1-01', {
      url: 'https://youtu.be/aaaaaaaaaaa',
      title: '또 넣기',
      source: '',
      korean: true,
    });
    expect(again.ok).toBe(false);
  });

  it('제목이 비면 추가되지 않는다', () => {
    const result = addVideo(EMPTY_OVERRIDE_STORE, 'knee-p1-01', {
      url: OK,
      title: '   ',
      source: '',
      korean: true,
    });
    expect(result.ok).toBe(false);
  });

  it('기본 목록의 영상도 지울 수 있고, 지운 결과가 유지된다', () => {
    const before = resolveVideos(EMPTY_OVERRIDE_STORE, 'ankle-p1-01').length;
    const store = must(removeVideo(EMPTY_OVERRIDE_STORE, 'ankle-p1-01', 0));
    expect(resolveVideos(store, 'ankle-p1-01')).toHaveLength(before - 1);
    // 기본 상수는 건드리지 않는다
    expect(EXERCISE_VIDEOS['ankle-p1-01']).toHaveLength(before);
  });

  it('수정은 주소를 바꾸지 않는다', () => {
    const original = resolveVideos(EMPTY_OVERRIDE_STORE, 'ankle-p1-01')[0];
    const store = must(
      updateVideo(EMPTY_OVERRIDE_STORE, 'ankle-p1-01', 0, {
        title: '제목 바꿈',
        source: '새 출처',
        korean: false,
        note: '2분부터 보세요',
      }),
    );
    const edited = resolveVideos(store, 'ankle-p1-01')[0];
    expect(edited?.url).toBe(original?.url);
    expect(edited?.title).toBe('제목 바꿈');
    expect(edited?.korean).toBe(false);
    expect(edited?.note).toBe('2분부터 보세요');
  });

  it('안내 문구를 비우면 아예 넣지 않는다', () => {
    const store = must(
      updateVideo(EMPTY_OVERRIDE_STORE, 'ankle-p1-01', 0, {
        title: '제목',
        source: '출처',
        korean: true,
        note: '   ',
      }),
    );
    expect(resolveVideos(store, 'ankle-p1-01')[0]).not.toHaveProperty('note');
  });
});

describe('순서 바꾸기', () => {
  it('위아래로 자리를 바꾼다', () => {
    const before = resolveVideos(EMPTY_OVERRIDE_STORE, 'neck-p1-01');
    const store = must(moveVideo(EMPTY_OVERRIDE_STORE, 'neck-p1-01', 0, 1));
    const after = resolveVideos(store, 'neck-p1-01');
    expect(after[0]?.url).toBe(before[1]?.url);
    expect(after[1]?.url).toBe(before[0]?.url);
    expect(after).toHaveLength(before.length);
  });

  it('맨 위에서 위로, 맨 아래에서 아래로는 움직이지 않는다', () => {
    const last = resolveVideos(EMPTY_OVERRIDE_STORE, 'neck-p1-01').length - 1;
    expect(moveVideo(EMPTY_OVERRIDE_STORE, 'neck-p1-01', 0, -1).ok).toBe(false);
    expect(moveVideo(EMPTY_OVERRIDE_STORE, 'neck-p1-01', last, 1).ok).toBe(false);
  });
});

describe('되돌리기', () => {
  it('한 동작만 기본값으로 되돌린다', () => {
    let store = must(removeVideo(EMPTY_OVERRIDE_STORE, 'neck-p1-01', 0));
    store = must(removeVideo(store, 'ankle-p1-01', 0));
    expect(customizedCount(store)).toBe(2);

    const reset = resetExercise(store, 'neck-p1-01');
    expect(isCustomized(reset, 'neck-p1-01')).toBe(false);
    expect(isCustomized(reset, 'ankle-p1-01')).toBe(true);
    expect(resolveVideos(reset, 'neck-p1-01')).toEqual(EXERCISE_VIDEOS['neck-p1-01']);
  });

  it('전체를 되돌리면 손댄 동작이 하나도 남지 않는다', () => {
    const store = must(removeVideo(EMPTY_OVERRIDE_STORE, 'neck-p1-01', 0));
    expect(customizedCount(resetAll())).toBe(0);
    expect(customizedCount(store)).toBe(1);
  });
});

describe('코드로 내보내기', () => {
  it('바꾼 것이 없으면 안내만 나온다', () => {
    expect(exportAsCode(EMPTY_OVERRIDE_STORE)).toContain('바꾼 영상이 없습니다');
  });

  it('붙여 넣을 수 있는 형태로 뽑는다', () => {
    const store = must(
      addVideo(EMPTY_OVERRIDE_STORE, 'knee-p1-01', {
        url: OK,
        title: "따옴표 ' 가 들어간 제목",
        source: '채널',
        korean: true,
        note: '메모',
      }),
    );
    const code = exportAsCode(store);
    expect(code).toContain("'knee-p1-01': [");
    expect(code).toContain(OK);
    // 따옴표를 그대로 두면 코드가 깨진다
    expect(code).toContain("\\'");
    expect(code).toContain('exerciseVideos.ts');
  });
});

describe('영상 관리 화면은 저작권 선을 지킨다', () => {
  const files = [
    'app/videos/index.tsx',
    'app/videos/[exerciseId].tsx',
    'app/videos/export.tsx',
    'src/features/videos/videoLibrary.ts',
    'src/features/videos/videoTypes.ts',
  ];

  it('앱 안에서 영상을 재생하는 도구를 쓰지 않는다', () => {
    const players = ['WebView', 'iframe', 'react-native-video', 'expo-av', 'expo-video'];
    for (const file of files) {
      const source = read(file);
      for (const player of players) {
        expect(source).not.toContain(player);
      }
    }
  });

  it('관리 화면에 저작권 안내가 들어 있다', () => {
    expect(read('app/videos/index.tsx')).toContain('저작권');
    expect(read('app/videos/[exerciseId].tsx')).toContain('저작권');
  });

  it('영상 목록은 설문·기록 전체 삭제 대상이 아니다', () => {
    const storage = read('src/utils/storage.ts');
    const allKeys = storage.slice(storage.indexOf('ALL_STORAGE_KEYS'));
    expect(allKeys).not.toContain('videoOverrides');
  });
});
