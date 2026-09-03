import { useEffect, useSyncExternalStore } from 'react';

import { videoOverrideStorage } from './videoStorage';
import { EMPTY_OVERRIDE_STORE, type VideoOverrideStore } from './videoTypes';

/**
 * 영상 덮어쓰기를 화면들이 함께 보는 아주 작은 저장소.
 *
 * 화면마다 따로 읽으면 한 화면에서 순서를 바꿨는데 다른 화면은 옛날 목록을
 * 보여 주는 일이 생긴다. 그래서 한 곳에 담아 두고 바뀌면 모두에게 알린다.
 */

let cache: VideoOverrideStore = EMPTY_OVERRIDE_STORE;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): VideoOverrideStore {
  return cache;
}

/** 저장소에서 한 번만 읽어 온다 */
export function ensureVideoOverridesLoaded(): Promise<void> {
  loadPromise ??= (async () => {
    const stored = await videoOverrideStorage.get();
    cache = stored;
    emit();
  })();
  return loadPromise;
}

/** 바뀐 목록을 저장하고 모든 화면에 알린다 */
export async function commitVideoOverrides(next: VideoOverrideStore): Promise<boolean> {
  cache = next;
  emit();
  return videoOverrideStorage.save(next);
}

/** 저장된 목록을 모두 지우고 기본 목록으로 되돌린다 */
export async function clearVideoOverrides(): Promise<void> {
  cache = EMPTY_OVERRIDE_STORE;
  emit();
  await videoOverrideStorage.clear();
}

/** 테스트에서 상태를 초기화할 때 쓴다 */
export function __resetVideoOverridesForTest(): void {
  cache = EMPTY_OVERRIDE_STORE;
  loadPromise = null;
  listeners.clear();
}

export function useVideoOverrides(): VideoOverrideStore {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void ensureVideoOverridesLoaded();
  }, []);

  return store;
}
