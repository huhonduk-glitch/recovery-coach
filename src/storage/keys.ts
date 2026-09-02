/**
 * AsyncStorage 키 목록.
 *
 * 화면에서 문자열을 직접 쓰지 않는다. 오타 한 글자가 데이터 유실이 된다.
 * '내 데이터 전체 삭제' 는 이 목록 전체를 지운다.
 */
export const STORAGE_KEYS = {
  consent: '@rfc/consent',
  profile: '@rfc/profile',
  survey: '@rfc/survey/latest',
  plan: '@rfc/plan/current',
  records: '@rfc/records',
  settings: '@rfc/settings',
  schema: '@rfc/schemaVersion',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** 전체 삭제 대상 (사용자 데이터 전부) */
export const ALL_STORAGE_KEYS: readonly StorageKey[] = Object.values(STORAGE_KEYS);
