import type { SessionRecord } from '@/types';

import { STORAGE_KEYS } from '../keys';
import { getJSON, remove, setJSON } from '../storage';

export const recordRepository = {
  async list(): Promise<SessionRecord[]> {
    return getJSON<SessionRecord[]>(STORAGE_KEYS.records, []);
  },

  async add(record: SessionRecord): Promise<SessionRecord[]> {
    const records = await this.list();
    const next = [record, ...records];
    await setJSON<SessionRecord[]>(STORAGE_KEYS.records, next);
    return next;
  },

  /** 최근 n건 (통증 추이·연속 악화 판정에 쓴다) */
  async recent(n: number): Promise<SessionRecord[]> {
    const records = await this.list();
    return records.slice(0, n);
  },

  async clear(): Promise<void> {
    return remove(STORAGE_KEYS.records);
  },
};
