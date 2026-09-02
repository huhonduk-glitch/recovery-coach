import AsyncStorage from '@react-native-async-storage/async-storage';

import { judgeScreening, type RedFlagAnswers } from '@/engine/safety';
import { screeningRepository } from '@/storage';
import { RED_FLAG_IDS } from '@/types';

function allNo(): RedFlagAnswers {
  return Object.fromEntries(RED_FLAG_IDS.map((id) => [id, false])) as RedFlagAnswers;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('[S2] 차단 상태는 앱을 다시 켜도 유지된다', () => {
  it('플래그가 저장되면 차단 상태로 남는다', async () => {
    await screeningRepository.save(['rf_chest']);
    await expect(screeningRepository.isBlocked()).resolves.toBe(true);
  });

  it('통과하면 차단 상태가 아니다', async () => {
    await screeningRepository.save([]);
    await expect(screeningRepository.isBlocked()).resolves.toBe(false);
  });

  it('스크리닝을 한 적이 없으면 차단 상태가 아니다 (아직 판정 전)', async () => {
    await expect(screeningRepository.isBlocked()).resolves.toBe(false);
    await expect(screeningRepository.get()).resolves.toBeNull();
  });

  it('다시 확인하기를 누르면 차단 기록이 지워진다', async () => {
    await screeningRepository.save(['rf_night_pain']);
    await screeningRepository.clear();
    await expect(screeningRepository.isBlocked()).resolves.toBe(false);
  });
});

describe('스크리닝 판정과 저장이 이어진다', () => {
  it.each(RED_FLAG_IDS)('%s 에 "예" 로 답하면 차단 상태로 저장된다', async (flagId) => {
    const verdict = judgeScreening({ ...allNo(), [flagId]: true });
    expect(verdict.status).toBe('blocked');

    if (verdict.status === 'blocked') {
      const saved = await screeningRepository.save(verdict.flags);
      expect(saved.blocked).toBe(true);
      expect(saved.flags).toEqual([flagId]);
    }
  });
});
