import { getJSON, removeKey, setJSON, STORAGE_KEYS } from '@/utils/storage';

import {
  EMPTY_OVERRIDE_STORE,
  VIDEO_OVERRIDE_VERSION,
  type VideoOverrideStore,
} from './videoTypes';

/**
 * 영상 덮어쓰기 저장소.
 *
 * 이 기기 안에만 저장됩니다. 서버로 보내지 않습니다.
 * 담기는 것은 영상 주소와 제목뿐이고, 사용자의 몸 상태 정보는 들어가지 않습니다.
 */
export const videoOverrideStorage = {
  async get(): Promise<VideoOverrideStore> {
    const raw = await getJSON<VideoOverrideStore>(
      STORAGE_KEYS.videoOverrides,
      EMPTY_OVERRIDE_STORE,
    );
    // 형태가 깨졌으면 기본값으로 돌아간다. 앱을 죽이지 않는다.
    if (
      raw === null ||
      typeof raw !== 'object' ||
      typeof raw.entries !== 'object' ||
      raw.entries === null
    ) {
      return EMPTY_OVERRIDE_STORE;
    }
    if (raw.version !== VIDEO_OVERRIDE_VERSION) return EMPTY_OVERRIDE_STORE;
    return raw;
  },

  async save(store: VideoOverrideStore): Promise<boolean> {
    return setJSON(STORAGE_KEYS.videoOverrides, store);
  },

  async clear(): Promise<void> {
    await removeKey(STORAGE_KEYS.videoOverrides);
  },
};
