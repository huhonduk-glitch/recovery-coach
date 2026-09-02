import type { ExerciseVideo } from '@/data/exerciseVideos';

/**
 * 영상 관리 기능의 자료형.
 *
 * ── 왜 필요한가 ─────────────────────────────────────────────
 * 기본으로 들어 있는 영상 목록(src/data/exerciseVideos.ts)은 코드 안에 있어
 * 앱을 다시 빌드해야 바뀝니다. 선생님이 앱 안에서 바로 영상을 추가하고,
 * 순서를 바꾸고, 지울 수 있게 하려고 '덮어쓰기(override)' 를 따로 저장합니다.
 *
 * ── 어떻게 겹치는가 ─────────────────────────────────────────
 * 어떤 운동 id 에 덮어쓰기가 있으면, 그 운동은 덮어쓰기 목록만 사용합니다.
 * (기본 목록과 섞지 않습니다. 섞으면 '기본 영상을 지웠는데 다시 살아나는' 일이 생깁니다)
 * 덮어쓰기를 지우면 다시 기본 목록으로 돌아갑니다.
 *
 * ── 저작권 ──────────────────────────────────────────────────
 * 여기에 저장하는 것은 '주소' 뿐입니다. 영상 파일은 담지 않습니다.
 * ─────────────────────────────────────────────────────────────
 */

export const VIDEO_OVERRIDE_VERSION = 1;

export interface VideoOverrideStore {
  version: number;
  /** 운동 id -> 그 운동에서 보여 줄 영상 목록 (기본 목록을 대체) */
  entries: Record<string, ExerciseVideo[]>;
  /** 마지막으로 손댄 시각 (ISO). 내보내기 화면에 표시한다 */
  updatedAt: string | null;
}

export const EMPTY_OVERRIDE_STORE: VideoOverrideStore = {
  version: VIDEO_OVERRIDE_VERSION,
  entries: {},
  updatedAt: null,
};

/**
 * 2026-09-02 검수에서 X 판정을 받은 영상들.
 *
 * 다시 등록되지 않도록 여기에 남겨 둡니다.
 * (중복이거나, 우리 앱의 동작 설명과 자세가 달랐던 영상들입니다)
 */
export const REJECTED_VIDEO_IDS: readonly string[] = [
  '5TUK4uT2nnw',
  'mzTKLYET6QA',
  'm06ilKpj87g',
  'iwiVVQ22vqw',
  'tNLINRNEQtM',
  '4j0vN1WEIyg',
];

export type VideoUrlKind = 'youtube' | 'instagram';

export interface ParsedVideoUrl {
  kind: VideoUrlKind;
  /** 유튜브면 영상 id, 인스타그램이면 게시물 코드 */
  id: string;
  /** 앱이 저장할 정리된 주소 */
  normalizedUrl: string;
}

/** 주소를 확인한 결과. 문제가 있으면 사람이 읽을 수 있는 이유를 준다 */
export type VideoUrlCheck =
  | { ok: true; parsed: ParsedVideoUrl }
  | { ok: false; reason: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * 주소를 확인하고 정리한다.
 *
 * 받는 형태
 *   https://www.youtube.com/watch?v=xxxxxxxxxxx
 *   https://youtu.be/xxxxxxxxxxx
 *   https://www.youtube.com/shorts/xxxxxxxxxxx
 *   https://www.instagram.com/reel/XXXXXXXXX/
 *   https://www.instagram.com/p/XXXXXXXXX/
 */
export function checkVideoUrl(raw: string): VideoUrlCheck {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: '주소를 넣어 주세요.' };
  }

  let url: URL;
  try {
    url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, reason: '주소 형태가 아니에요. 유튜브 주소를 복사해서 붙여 넣어 주세요.' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, reason: '유튜브 또는 인스타그램 주소만 넣을 수 있어요.' };
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');
  const segments = url.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be') {
    const id = segments[0] ?? '';
    return finishYoutube(id);
  }

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (segments[0] === 'shorts' || segments[0] === 'embed' || segments[0] === 'live') {
      return finishYoutube(segments[1] ?? '');
    }
    if (segments[0] === 'watch') {
      return finishYoutube(url.searchParams.get('v') ?? '');
    }
    return { ok: false, reason: '영상 주소가 아니에요. 영상을 연 다음 주소를 복사해 주세요.' };
  }

  if (host === 'instagram.com') {
    const kind = segments[0];
    const code = segments[1] ?? '';
    if ((kind !== 'reel' && kind !== 'reels' && kind !== 'p') || code.length === 0) {
      return { ok: false, reason: '인스타그램 게시물 주소가 아니에요.' };
    }
    return {
      ok: true,
      parsed: {
        kind: 'instagram',
        id: code,
        normalizedUrl: `https://www.instagram.com/${kind === 'reels' ? 'reel' : kind}/${code}/`,
      },
    };
  }

  return { ok: false, reason: '유튜브 또는 인스타그램 주소만 넣을 수 있어요.' };
}

function finishYoutube(id: string): VideoUrlCheck {
  if (!YOUTUBE_ID.test(id)) {
    return { ok: false, reason: '유튜브 영상 번호를 찾지 못했어요. 주소를 다시 확인해 주세요.' };
  }
  if (REJECTED_VIDEO_IDS.includes(id)) {
    return {
      ok: false,
      reason: '2026-09-02 점검에서 제외한 영상이에요. 다른 영상을 찾아 주세요.',
    };
  }
  return {
    ok: true,
    parsed: { kind: 'youtube', id, normalizedUrl: `https://www.youtube.com/watch?v=${id}` },
  };
}

/** 같은 영상인지 (주소가 조금 달라도 같은 영상이면 중복으로 본다) */
export function isSameVideo(a: string, b: string): boolean {
  const pa = checkVideoUrl(a);
  const pb = checkVideoUrl(b);
  if (pa.ok && pb.ok) return pa.parsed.id === pb.parsed.id;
  return a.trim() === b.trim();
}
