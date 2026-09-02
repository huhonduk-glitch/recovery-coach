import { SCHEMA_VERSION, type RedFlagId, type ScreeningResult } from '@/types';

import { STORAGE_KEYS } from '../keys';
import { getJSON, remove, setJSON } from '../storage';

/**
 * 안전 스크리닝 결과 저장소.
 *
 * 차단 상태를 기기에 남겨, 앱을 껐다 켜서 차단을 우회하지 못하게 한다.
 * 다시 설문하려면 명시적으로 clear() 를 호출해야 한다.
 */
export const screeningRepository = {
  async get(): Promise<ScreeningResult | null> {
    return getJSON<ScreeningResult | null>(STORAGE_KEYS.screening, null);
  },

  async save(flags: RedFlagId[]): Promise<ScreeningResult> {
    const result: ScreeningResult = {
      schemaVersion: SCHEMA_VERSION,
      answeredAt: new Date().toISOString(),
      flags,
      blocked: flags.length > 0,
    };
    await setJSON<ScreeningResult>(STORAGE_KEYS.screening, result);
    return result;
  },

  /** 저장된 결과 기준으로 지금 차단 상태인지 */
  async isBlocked(): Promise<boolean> {
    const result = await this.get();
    return result?.blocked === true;
  },

  async clear(): Promise<void> {
    return remove(STORAGE_KEYS.screening);
  },
};
