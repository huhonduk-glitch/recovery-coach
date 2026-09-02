import { assessmentStorage, recommendationStorage } from './assessmentStorage';
import { buildRecommendation, type Recommendation } from './recommendation';

/**
 * 저장된 추천 결과를 불러온다.
 *
 * 추천 결과는 설문에서 계산해 낸 값이라, 어떤 이유로든 비어 있을 수 있다.
 * (앱 버전 변경, 저장 실패, 일부 데이터만 삭제 등)
 *
 * 이럴 때 사용자를 설문으로 되돌려 보내면, 이미 설문을 마친 사람이
 * 다시 처음부터 답해야 한다. 그래서 설문 응답이 남아 있으면 다시 계산해서 채운다.
 *
 * 추천 계산은 순수 함수라 같은 설문이면 항상 같은 결과가 나온다.
 */
export async function loadRecommendation(): Promise<Recommendation | null> {
  const saved = await recommendationStorage.get();
  if (saved !== null) return saved;

  const assessment = await assessmentStorage.get();
  if (assessment === null) return null;

  const recomputed = buildRecommendation(assessment);
  await recommendationStorage.save(recomputed);
  return recomputed;
}

/** 설문을 마친 사용자인지 (추천 결과가 없어도 설문만 있으면 마친 것으로 본다) */
export async function hasCompletedAssessment(): Promise<boolean> {
  return (await assessmentStorage.get()) !== null;
}
