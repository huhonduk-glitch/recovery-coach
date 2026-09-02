import { STUDENT_AGE_BANDS, type AgeBand, type Mode, type Profile, type Sex } from '@/types';

import { STORAGE_KEYS } from '../keys';
import { getJSON, remove, setJSON } from '../storage';

/**
 * 만 18세 미만은 학생 모드를 벗어날 수 없다.
 * (docs/SAFETY_POLICY.md §6 — 학생 사용자 보호 정책)
 */
export function resolveMode(ageBand: AgeBand, requested: Mode): Mode {
  return STUDENT_AGE_BANDS.includes(ageBand) ? 'student' : requested;
}

export const profileRepository = {
  async get(): Promise<Profile | null> {
    return getJSON<Profile | null>(STORAGE_KEYS.profile, null);
  },

  async save(input: { ageBand: AgeBand; sex: Sex; mode: Mode }): Promise<Profile> {
    const now = new Date().toISOString();
    const existing = await this.get();
    const profile: Profile = {
      ageBand: input.ageBand,
      sex: input.sex,
      mode: resolveMode(input.ageBand, input.mode),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await setJSON<Profile>(STORAGE_KEYS.profile, profile);
    return profile;
  },

  async clear(): Promise<void> {
    return remove(STORAGE_KEYS.profile);
  },
};
