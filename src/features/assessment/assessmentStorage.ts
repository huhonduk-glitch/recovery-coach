import { getJSON, removeKey, setJSON, STORAGE_KEYS } from '@/utils/storage';

import type { Recommendation } from './recommendation';
import type { Assessment } from './assessmentTypes';

export interface ConsentRecord {
  agreed: boolean;
  version: number;
  agreedAt: string;
}

const EMPTY_CONSENT: ConsentRecord = { agreed: false, version: 0, agreedAt: '' };

export const consentStorage = {
  async get(): Promise<ConsentRecord> {
    return getJSON<ConsentRecord>(STORAGE_KEYS.consent, EMPTY_CONSENT);
  },

  async save(version: number): Promise<void> {
    await setJSON<ConsentRecord>(STORAGE_KEYS.consent, {
      agreed: true,
      version,
      agreedAt: new Date().toISOString(),
    });
  },

  /**
   * 현재 안내문 버전에 대해 동의가 유효한지.
   * 안내문이 개정되면(버전 상승) 기존 사용자도 다시 동의해야 한다.
   */
  async isValid(currentVersion: number): Promise<boolean> {
    const c = await this.get();
    return c.agreed && c.version >= currentVersion;
  },

  async clear(): Promise<void> {
    return removeKey(STORAGE_KEYS.consent);
  },
};

/** 개인정보 수집·이용 동의 */
export const privacyStorage = {
  async get(): Promise<ConsentRecord> {
    return getJSON<ConsentRecord>(STORAGE_KEYS.privacy, EMPTY_CONSENT);
  },

  async save(version: number): Promise<void> {
    await setJSON<ConsentRecord>(STORAGE_KEYS.privacy, {
      agreed: true,
      version,
      agreedAt: new Date().toISOString(),
    });
  },

  async isValid(currentVersion: number): Promise<boolean> {
    const c = await this.get();
    return c.agreed && c.version >= currentVersion;
  },

  async clear(): Promise<void> {
    return removeKey(STORAGE_KEYS.privacy);
  },
};

export const assessmentStorage = {
  async get(): Promise<Assessment | null> {
    return getJSON<Assessment | null>(STORAGE_KEYS.assessment, null);
  },

  async save(assessment: Assessment): Promise<void> {
    await setJSON(STORAGE_KEYS.assessment, assessment);
  },

  async clear(): Promise<void> {
    return removeKey(STORAGE_KEYS.assessment);
  },
};

export const recommendationStorage = {
  async get(): Promise<Recommendation | null> {
    return getJSON<Recommendation | null>(STORAGE_KEYS.recommendation, null);
  },

  async save(recommendation: Recommendation): Promise<void> {
    await setJSON(STORAGE_KEYS.recommendation, recommendation);
  },

  async clear(): Promise<void> {
    return removeKey(STORAGE_KEYS.recommendation);
  },
};
