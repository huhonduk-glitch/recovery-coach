import { useEffect, useSyncExternalStore } from 'react';

import { applyLibraryOverrides, clearLibraryOverrides } from '@/data/libraryOverrides';

import { libraryStorage } from './libraryStorage';
import { EMPTY_LIBRARY_STORE, type LibraryOverrideStore } from './libraryTypes';

/**
 * 편집한 운동·프로그램을 모든 화면이 함께 보는 작은 저장소.
 * (영상 관리의 useVideoOverrides 와 같은 방식)
 */

let cache: LibraryOverrideStore = EMPTY_LIBRARY_STORE;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

/**
 * 편집 내용을 화면과 조회 함수 양쪽에 반영한다.
 *
 * 조회 함수(getExercise 등)까지 갈아 끼우는 이유는, 상세 화면에는 고친 설명이
 * 보이는데 운동 중 화면에는 원래 설명이 나오는 엇갈림을 막기 위해서다.
 */
function publish(next: LibraryOverrideStore): void {
  cache = next;
  applyLibraryOverrides(next);
  emit();
}

function emit(): void {
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function getSnapshot(): LibraryOverrideStore {
  return cache;
}

export function ensureLibraryLoaded(): Promise<void> {
  loadPromise ??= (async () => {
    publish(await libraryStorage.get());
  })();
  return loadPromise;
}

export async function commitLibrary(next: LibraryOverrideStore): Promise<boolean> {
  publish(next);
  return libraryStorage.save(next);
}

export async function clearLibrary(): Promise<void> {
  cache = EMPTY_LIBRARY_STORE;
  clearLibraryOverrides();
  emit();
  await libraryStorage.clear();
}

/** 테스트에서 상태를 초기화할 때 쓴다 */
export function __resetLibraryForTest(): void {
  cache = EMPTY_LIBRARY_STORE;
  clearLibraryOverrides();
  loadPromise = null;
  listeners.clear();
}

export function useLibrary(): LibraryOverrideStore {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    void ensureLibraryLoaded();
  }, []);
  return store;
}
