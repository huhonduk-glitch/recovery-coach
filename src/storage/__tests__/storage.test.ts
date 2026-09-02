import AsyncStorage from '@react-native-async-storage/async-storage';

import { DISCLAIMER_VERSION } from '@/content/copy/disclaimer';
import {
  ALL_STORAGE_KEYS,
  clearAll,
  consentRepository,
  getJSON,
  profileRepository,
  recordRepository,
  resolveMode,
  setJSON,
  STORAGE_KEYS,
} from '@/storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('저장소 래퍼', () => {
  it('저장한 값을 그대로 읽어 온다', async () => {
    await setJSON(STORAGE_KEYS.settings, { notificationEnabled: true });
    const loaded = await getJSON(STORAGE_KEYS.settings, { notificationEnabled: false });
    expect(loaded).toEqual({ notificationEnabled: true });
  });

  it('값이 없으면 기본값을 돌려준다', async () => {
    const loaded = await getJSON(STORAGE_KEYS.records, []);
    expect(loaded).toEqual([]);
  });
});

describe('동의 저장소', () => {
  it('처음에는 동의가 유효하지 않다', async () => {
    await expect(consentRepository.isValid(DISCLAIMER_VERSION)).resolves.toBe(false);
  });

  it('동의하면 유효해진다', async () => {
    await consentRepository.save(DISCLAIMER_VERSION);
    await expect(consentRepository.isValid(DISCLAIMER_VERSION)).resolves.toBe(true);
  });

  it('면책 문구 버전이 올라가면 다시 동의를 받아야 한다', async () => {
    await consentRepository.save(DISCLAIMER_VERSION);
    await expect(consentRepository.isValid(DISCLAIMER_VERSION + 1)).resolves.toBe(false);
  });
});

describe('학생 모드 보호', () => {
  it.each(['13-15', '16-18'] as const)(
    '%s 연령대는 일반 모드를 요청해도 학생 모드로 고정된다',
    (ageBand) => {
      expect(resolveMode(ageBand, 'adult')).toBe('student');
    },
  );

  it('성인 연령대는 요청한 모드를 따른다', () => {
    expect(resolveMode('30-39', 'adult')).toBe('adult');
  });

  it('저장된 프로필에도 학생 모드가 강제된다', async () => {
    const saved = await profileRepository.save({
      ageBand: '16-18',
      sex: 'undisclosed',
      mode: 'adult',
    });
    expect(saved.mode).toBe('student');
  });
});

describe('데이터 전체 삭제', () => {
  it('사용자 데이터 키가 모두 지워진다', async () => {
    await consentRepository.save(DISCLAIMER_VERSION);
    await profileRepository.save({ ageBand: '30-39', sex: 'female', mode: 'adult' });
    await recordRepository.add({
      id: 'r1',
      routineId: 'knee-p1',
      startedAt: new Date().toISOString(),
      completed: true,
    });

    await clearAll();

    for (const key of ALL_STORAGE_KEYS) {
      await expect(AsyncStorage.getItem(key)).resolves.toBeNull();
    }
  });
});
