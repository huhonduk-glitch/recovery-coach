import { getJSON, removeKey, setJSON, STORAGE_KEYS } from '@/utils/storage';

import {
  EMPTY_LIBRARY_STORE,
  LIBRARY_OVERRIDE_VERSION,
  type LibraryOverrideStore,
} from './libraryTypes';

/**
 * 운동·프로그램 편집 내용 저장소.
 *
 * 이 기기 안에만 저장됩니다. 서버로 보내지 않습니다.
 * 담기는 것은 운동 설명과 편성뿐이고, 사용자의 몸 상태 정보는 들어가지 않습니다.
 */
export const libraryStorage = {
  async get(): Promise<LibraryOverrideStore> {
    const raw = await getJSON<LibraryOverrideStore>(
      STORAGE_KEYS.libraryOverrides,
      EMPTY_LIBRARY_STORE,
    );
    // 형태가 깨졌으면 기본값으로 돌아간다. 앱을 죽이지 않는다.
    if (
      raw === null ||
      typeof raw !== 'object' ||
      raw.version !== LIBRARY_OVERRIDE_VERSION ||
      typeof raw.exercises !== 'object' ||
      raw.exercises === null ||
      !Array.isArray(raw.addedExerciseIds) ||
      !Array.isArray(raw.removedExerciseIds) ||
      typeof raw.programs !== 'object' ||
      raw.programs === null ||
      !Array.isArray(raw.addedProgramIds) ||
      !Array.isArray(raw.removedProgramIds)
    ) {
      return EMPTY_LIBRARY_STORE;
    }
    return raw;
  },

  async save(store: LibraryOverrideStore): Promise<boolean> {
    return setJSON(STORAGE_KEYS.libraryOverrides, store);
  },

  async clear(): Promise<void> {
    await removeKey(STORAGE_KEYS.libraryOverrides);
  },
};
