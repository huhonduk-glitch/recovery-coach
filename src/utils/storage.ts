import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage 얇은 래퍼.
 *
 * 원칙 (docs/SAFETY_POLICY.md §9)
 * - 화면에서 AsyncStorage 를 직접 부르지 않는다. 항상 이 파일을 거친다.
 * - 저장 값(설문 응답·통증 기록)을 console 에 출력하지 않는다. 키 이름만 남긴다.
 * - 읽기에 실패해도 앱을 죽이지 않는다. 기본값을 돌려준다.
 */

export const STORAGE_KEYS = {
  consent: '@rfc/consent',
  assessment: '@rfc/assessment',
  recommendation: '@rfc/recommendation',
  workoutLogs: '@rfc/workoutLogs',
  dailyChecks: '@rfc/dailyChecks',
  settings: '@rfc/settings',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** '내 데이터 전체 삭제' 대상 */
export const ALL_STORAGE_KEYS: readonly StorageKey[] = Object.values(STORAGE_KEYS);

export async function getJSON<T>(key: StorageKey, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[storage] 읽기 실패: ${key}`);
    return fallback;
  }
}

export async function setJSON<T>(key: StorageKey, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.warn(`[storage] 저장 실패: ${key}`);
    return false;
  }
}

export async function removeKey(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    console.warn(`[storage] 삭제 실패: ${key}`);
  }
}

/** 사용자 데이터 전체 삭제. 되돌릴 수 없다. */
export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([...ALL_STORAGE_KEYS]);
  } catch {
    console.warn('[storage] 전체 삭제 실패');
  }
}
