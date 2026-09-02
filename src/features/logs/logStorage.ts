import { getJSON, removeKey, setJSON, STORAGE_KEYS } from '@/utils/storage';

import type { DailyCheck, WorkoutLog } from './logTypes';

/** 운동 기록 저장소. 모든 기록은 기기 안에만 남는다. */
export const logStorage = {
  async list(): Promise<WorkoutLog[]> {
    return getJSON<WorkoutLog[]>(STORAGE_KEYS.workoutLogs, []);
  },

  async add(log: WorkoutLog): Promise<WorkoutLog[]> {
    const logs = await this.list();
    const next = [log, ...logs];
    await setJSON(STORAGE_KEYS.workoutLogs, next);
    return next;
  },

  async recent(n: number): Promise<WorkoutLog[]> {
    const logs = await this.list();
    return logs.slice(0, n);
  },

  /** 이번 주 완료 횟수 */
  async completedThisWeek(now: Date = new Date()): Promise<number> {
    const logs = await this.list();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return logs.filter((l) => l.abortReason === null && new Date(l.date) >= weekAgo).length;
  },

  async clear(): Promise<void> {
    return removeKey(STORAGE_KEYS.workoutLogs);
  },
};

export const dailyCheckStorage = {
  async list(): Promise<DailyCheck[]> {
    return getJSON<DailyCheck[]>(STORAGE_KEYS.dailyChecks, []);
  },

  async upsert(check: DailyCheck): Promise<DailyCheck[]> {
    const checks = await this.list();
    const next = [check, ...checks.filter((c) => c.date !== check.date)];
    await setJSON(STORAGE_KEYS.dailyChecks, next);
    return next;
  },

  async clear(): Promise<void> {
    return removeKey(STORAGE_KEYS.dailyChecks);
  },
};
