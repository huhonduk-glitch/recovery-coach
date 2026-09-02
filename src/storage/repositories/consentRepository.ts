import type { Consent } from '@/types';

import { STORAGE_KEYS } from '../keys';
import { getJSON, remove, setJSON } from '../storage';

const EMPTY: Consent = { agreed: false, disclaimerVersion: 0, agreedAt: '' };

export const consentRepository = {
  async get(): Promise<Consent> {
    return getJSON<Consent>(STORAGE_KEYS.consent, EMPTY);
  },

  async save(disclaimerVersion: number): Promise<boolean> {
    return setJSON<Consent>(STORAGE_KEYS.consent, {
      agreed: true,
      disclaimerVersion,
      agreedAt: new Date().toISOString(),
    });
  },

  /**
   * 현재 면책 문구 버전에 대해 동의가 유효한지.
   * 문구가 개정되면(버전 상승) 기존 사용자도 다시 동의해야 한다.
   */
  async isValid(currentVersion: number): Promise<boolean> {
    const consent = await this.get();
    return consent.agreed && consent.disclaimerVersion >= currentVersion;
  },

  async clear(): Promise<void> {
    return remove(STORAGE_KEYS.consent);
  },
};
