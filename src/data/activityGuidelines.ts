/**
 * 운동 지침 안내 자료.
 *
 * ── 이 파일이 하는 일 ───────────────────────────────────────
 * '얼마나 움직여야 하는가' 에 대한 공개된 권고를 옮겨 적어 둡니다.
 * 앱이 만들어 낸 숫자가 아니라, 밖에 이미 나와 있는 지침을 그대로 전달합니다.
 *
 * ── 지켜야 할 선 (docs/SAFETY_POLICY.md) ────────────────────
 * - 이것은 '일반 성인·청소년에게 권장되는 활동량' 입니다. 처방이 아닙니다.
 * - 통증이 있거나 치료 중인 사람에게 이 숫자를 그대로 들이대면 안 됩니다.
 *   그런 경우에는 앱의 회복운동 단계를 따르고, 담당 전문가의 말이 우선입니다.
 * - 숫자를 추측해서 적지 않습니다. 확인하지 못한 항목은 verified: false 로 두고
 *   화면에도 '확인 필요' 라고 그대로 보여 줍니다.
 * ─────────────────────────────────────────────────────────────
 */

export interface GuidelineItem {
  id: string;
  /** 무엇에 대한 권고인지 */
  label: string;
  /** 권고 내용 (숫자 포함) */
  detail: string;
  /** 왜 이렇게 권하는지, 한 문장 */
  why: string;
  /**
   * 2026-09-02 작업 중 웹에서 확인한 항목인지.
   * false 면 화면에 '확인 필요' 라고 표시한다.
   */
  verified: boolean;
  source: string;
}

export interface GuidelineGroup {
  id: string;
  title: string;
  audience: string;
  items: GuidelineItem[];
}

/** 지침 자료를 마지막으로 확인한 날 */
export const GUIDELINE_CHECKED_AT = '2026-09-02';

/**
 * ACSM 운동검사·운동처방 지침서(GETP) 판 정보.
 *
 * 2026-09-02 확인: 12판이 최신이며, ACSM 자격시험은 2025년 7월 10일부터
 * 12판 내용을 반영합니다.
 */
export const ACSM_EDITION = {
  name: 'ACSM Guidelines for Exercise Testing and Prescription',
  koreanName: 'ACSM 운동검사·운동처방 지침',
  edition: '12판 (12th edition)',
  examNote: 'ACSM 자격시험은 2025년 7월 10일부터 12판을 반영합니다.',
  changeNote:
    '11판에서 12판으로 넘어오며 저항운동 장과 행동 변화 이론 장이 손질되었고, 성별 차이 등 새 항목이 들어갔습니다.',
  verified: true,
  source: '2026-09-02 웹 확인 (ACSM 공개 안내)',
} as const;

export const GUIDELINE_GROUPS: readonly GuidelineGroup[] = [
  {
    id: 'adult',
    title: '성인 활동량 권고',
    audience: '통증이나 치료 중인 상태가 아닌 일반 성인',
    items: [
      {
        id: 'aerobic',
        label: '유산소 운동',
        detail: '중강도로 주 150분 이상. 고강도로 하면 주 75분 이상.',
        why: '심폐 건강과 대사 건강에 필요한 최소한의 양으로 제시된 기준입니다.',
        verified: true,
        source: 'ACSM·미국 신체활동 지침 (2026-09-02 확인)',
      },
      {
        id: 'aerobicMore',
        label: '더 큰 효과를 원하면',
        detail: '중강도 기준으로 주 300분까지 늘리면 추가 효과가 있다고 봅니다.',
        why: '150분은 최소선이고, 그 위로 더 움직일수록 얻는 것이 늘어납니다.',
        verified: true,
        source: 'ACSM·미국 신체활동 지침 (2026-09-02 확인)',
      },
      {
        id: 'strength',
        label: '근력 운동',
        detail: '주 2일 이상, 모든 주요 근육군을 씁니다.',
        why: '유산소만으로는 근육량과 뼈 건강을 지키기 어렵습니다.',
        verified: true,
        source: 'ACSM·미국 신체활동 지침 (2026-09-02 확인)',
      },
      {
        id: 'flexibility',
        label: '유연성',
        detail: '주 2~3일 이상 스트레칭. 한 자세를 10~30초 정도 유지합니다.',
        why: '관절 가동범위를 지키기 위한 권고입니다.',
        verified: false,
        source: '⚠️ ACSM 지침으로 알려진 내용이나 2026-09-02 작업에서 원문을 확인하지 못했습니다.',
      },
      {
        id: 'neuromotor',
        label: '균형·협응 운동',
        detail: '주 2~3일. 균형, 민첩성, 협응을 함께 쓰는 운동을 넣습니다.',
        why: '넘어짐을 막고 움직임의 질을 지키는 데 필요합니다.',
        verified: false,
        source: '⚠️ ACSM 지침으로 알려진 내용이나 2026-09-02 작업에서 원문을 확인하지 못했습니다.',
      },
      {
        id: 'sedentary',
        label: '앉아 있는 시간',
        detail: '오래 앉아 있는 시간을 줄이고, 중간중간 일어나 움직입니다.',
        why: '운동을 따로 해도 앉아 있는 시간이 길면 그 효과가 깎입니다.',
        verified: true,
        source: 'ACSM·미국 신체활동 지침 (2026-09-02 확인)',
      },
    ],
  },
  {
    id: 'youth',
    title: '청소년 활동량 권고',
    audience: '만 6~17세. 성인 기준을 그대로 쓰면 안 됩니다.',
    items: [
      {
        id: 'youthDaily',
        label: '하루 활동량',
        detail: '하루 평균 60분 이상, 중강도 이상으로 움직입니다.',
        why: '성장기에는 활동량 자체가 뼈와 근육이 자라는 조건입니다.',
        verified: false,
        source:
          '⚠️ WHO·미국 신체활동 지침으로 알려진 내용이나 2026-09-02 작업에서 원문을 확인하지 못했습니다.',
      },
      {
        id: 'youthStrength',
        label: '근력·뼈 자극 운동',
        detail: '주 3일 이상, 근력 운동과 뼈에 자극이 되는 활동(달리기·점프 등)을 넣습니다.',
        why: '뼈가 굵어지는 시기에 자극이 있어야 골밀도가 올라갑니다.',
        verified: false,
        source:
          '⚠️ WHO·미국 신체활동 지침으로 알려진 내용이나 2026-09-02 작업에서 원문을 확인하지 못했습니다.',
      },
    ],
  },
];

/** 지침을 그대로 적용하면 안 되는 경우 */
export const GUIDELINE_CAUTIONS: readonly string[] = [
  '통증이 있거나 병원에서 치료를 받는 중이라면 이 숫자를 목표로 삼지 마세요. 앱의 회복운동 단계를 먼저 따릅니다.',
  '담당 의사나 물리치료사가 정해 준 범위가 있다면 그쪽이 항상 우선입니다.',
  '오래 쉬었다가 다시 시작할 때는 처음부터 150분을 채우려 하지 말고, 할 수 있는 만큼에서 조금씩 늘립니다.',
  '이 앱은 지침을 옮겨 전달할 뿐, 개인에게 맞춘 운동 처방을 하지 않습니다.',
];

/** 확인하지 못한 항목 수 — 화면과 검수 문서에서 함께 쓴다 */
export function unverifiedGuidelineCount(): number {
  return GUIDELINE_GROUPS.reduce(
    (sum, group) => sum + group.items.filter((item) => !item.verified).length,
    0,
  );
}
