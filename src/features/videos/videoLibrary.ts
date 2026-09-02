import { EXERCISE_VIDEOS, type ExerciseVideo } from '@/data/exerciseVideos';

import {
  checkVideoUrl,
  EMPTY_OVERRIDE_STORE,
  isSameVideo,
  VIDEO_OVERRIDE_VERSION,
  type VideoOverrideStore,
} from './videoTypes';

/**
 * 영상 목록을 다루는 순수 함수 모음.
 *
 * 저장소나 화면을 모르는 함수들만 둡니다. 그래야 테스트가 쉽습니다.
 * 모든 함수는 받은 store 를 고치지 않고 새 store 를 돌려줍니다.
 */

/** 이 운동에서 실제로 보여 줄 영상 목록 */
export function resolveVideos(store: VideoOverrideStore, exerciseId: string): ExerciseVideo[] {
  const override = store.entries[exerciseId];
  if (override !== undefined) return override;
  return EXERCISE_VIDEOS[exerciseId] ?? [];
}

/** 이 운동이 기본 목록에서 바뀌었는지 */
export function isCustomized(store: VideoOverrideStore, exerciseId: string): boolean {
  return Object.prototype.hasOwnProperty.call(store.entries, exerciseId);
}

function withEntries(
  store: VideoOverrideStore,
  exerciseId: string,
  list: ExerciseVideo[],
): VideoOverrideStore {
  return {
    version: VIDEO_OVERRIDE_VERSION,
    entries: { ...store.entries, [exerciseId]: list },
    updatedAt: new Date().toISOString(),
  };
}

export type EditResult =
  | { ok: true; store: VideoOverrideStore }
  | { ok: false; reason: string };

/**
 * 영상 추가.
 *
 * - 주소는 유튜브·인스타그램만 받는다
 * - 검수에서 제외한 영상은 막는다 (videoTypes.REJECTED_VIDEO_IDS)
 * - 같은 운동에 같은 영상을 두 번 넣지 않는다
 */
export function addVideo(
  store: VideoOverrideStore,
  exerciseId: string,
  input: { url: string; title: string; source: string; korean: boolean; note?: string },
): EditResult {
  const check = checkVideoUrl(input.url);
  if (!check.ok) return { ok: false, reason: check.reason };

  const title = input.title.trim();
  if (title.length === 0) return { ok: false, reason: '제목을 넣어 주세요.' };

  const current = resolveVideos(store, exerciseId);
  if (current.some((v) => isSameVideo(v.url, check.parsed.normalizedUrl))) {
    return { ok: false, reason: '이미 등록된 영상이에요.' };
  }

  const note = input.note?.trim() ?? '';
  const video: ExerciseVideo = {
    url: check.parsed.normalizedUrl,
    title,
    source: input.source.trim().length > 0 ? input.source.trim() : '직접 등록',
    korean: input.korean,
    ...(note.length > 0 ? { note } : {}),
  };

  return { ok: true, store: withEntries(store, exerciseId, [...current, video]) };
}

/** 영상 정보 수정. 주소는 바꾸지 않는다 (주소를 바꾸려면 지우고 다시 넣는다) */
export function updateVideo(
  store: VideoOverrideStore,
  exerciseId: string,
  index: number,
  patch: { title: string; source: string; korean: boolean; note?: string },
): EditResult {
  const current = resolveVideos(store, exerciseId);
  const target = current[index];
  if (target === undefined) return { ok: false, reason: '수정할 영상을 찾지 못했어요.' };

  const title = patch.title.trim();
  if (title.length === 0) return { ok: false, reason: '제목을 넣어 주세요.' };

  const note = patch.note?.trim() ?? '';
  const next = [...current];
  next[index] = {
    url: target.url,
    title,
    source: patch.source.trim().length > 0 ? patch.source.trim() : '직접 등록',
    korean: patch.korean,
    ...(note.length > 0 ? { note } : {}),
  };

  return { ok: true, store: withEntries(store, exerciseId, next) };
}

/** 영상 삭제 */
export function removeVideo(
  store: VideoOverrideStore,
  exerciseId: string,
  index: number,
): EditResult {
  const current = resolveVideos(store, exerciseId);
  if (current[index] === undefined) return { ok: false, reason: '지울 영상을 찾지 못했어요.' };
  return {
    ok: true,
    store: withEntries(
      store,
      exerciseId,
      current.filter((_, i) => i !== index),
    ),
  };
}

/** 순서 바꾸기. delta 가 -1 이면 위로, +1 이면 아래로 */
export function moveVideo(
  store: VideoOverrideStore,
  exerciseId: string,
  index: number,
  delta: number,
): EditResult {
  const current = resolveVideos(store, exerciseId);
  const to = index + delta;
  const from = current[index];
  const swap = current[to];
  if (from === undefined || swap === undefined) {
    return { ok: false, reason: '더 옮길 수 없어요.' };
  }
  const next = [...current];
  next[index] = swap;
  next[to] = from;
  return { ok: true, store: withEntries(store, exerciseId, next) };
}

/** 이 운동만 기본 목록으로 되돌리기 */
export function resetExercise(store: VideoOverrideStore, exerciseId: string): VideoOverrideStore {
  if (!isCustomized(store, exerciseId)) return store;
  const entries = { ...store.entries };
  delete entries[exerciseId];
  return { version: VIDEO_OVERRIDE_VERSION, entries, updatedAt: new Date().toISOString() };
}

/** 전체를 기본 목록으로 되돌리기 */
export function resetAll(): VideoOverrideStore {
  return { ...EMPTY_OVERRIDE_STORE, updatedAt: new Date().toISOString() };
}

/** 손댄 운동 수 */
export function customizedCount(store: VideoOverrideStore): number {
  return Object.keys(store.entries).length;
}

/**
 * 코드에 옮겨 붙일 수 있는 형태로 내보낸다.
 *
 * 앱에서 만든 목록은 이 기기에만 있습니다. 앱을 지우면 사라집니다.
 * 오래 남기려면 여기서 나온 글을 src/data/exerciseVideos.ts 에 붙여 넣으세요.
 */
export function exportAsCode(store: VideoOverrideStore): string {
  const ids = Object.keys(store.entries).sort();
  if (ids.length === 0) {
    return '// 앱에서 바꾼 영상이 없습니다.';
  }

  const blocks = ids.map((id) => {
    const list = store.entries[id] ?? [];
    if (list.length === 0) {
      return `  // '${id}' 는 영상을 모두 지운 상태입니다.\n  '${id}': [],`;
    }
    const rows = list
      .map((v) => {
        const lines = [
          `      url: ${quote(v.url)},`,
          `      title: ${quote(v.title)},`,
          `      source: ${quote(v.source)},`,
          `      korean: ${String(v.korean)},`,
        ];
        if (v.note !== undefined) lines.push(`      note: ${quote(v.note)},`);
        return `    {\n${lines.join('\n')}\n    },`;
      })
      .join('\n');
    return `  '${id}': [\n${rows}\n  ],`;
  });

  return [
    '// src/data/exerciseVideos.ts 의 EXERCISE_VIDEOS 안에 붙여 넣으세요.',
    `// 내보낸 시각: ${store.updatedAt ?? '알 수 없음'}`,
    ...blocks,
  ].join('\n');
}

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}
