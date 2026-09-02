/** 이용 모드. 만 18세 미만은 항상 'student' 로 고정된다. */
export type Mode = 'student' | 'adult';

/** 로컬 저장 스키마 버전. 구조가 바뀌면 올리고 마이그레이션을 작성한다. */
export const SCHEMA_VERSION = 1 as const;
export type SchemaVersion = typeof SCHEMA_VERSION;

export type AgeBand = '13-15' | '16-18' | '19-29' | '30-39' | '40-49' | '50-59' | '60+';
export type Sex = 'female' | 'male' | 'undisclosed';

/** 학생 모드가 강제되는 연령대 (만 18세 미만) */
export const STUDENT_AGE_BANDS: readonly AgeBand[] = ['13-15', '16-18'];

export interface Profile {
  ageBand: AgeBand;
  sex: Sex;
  mode: Mode;
  createdAt: string;
  updatedAt: string;
}

export interface Consent {
  agreed: boolean;
  disclaimerVersion: number;
  agreedAt: string;
}

export interface Settings {
  notificationEnabled: boolean;
  lastOpenedAt?: string;
}
