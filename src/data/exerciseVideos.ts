/**
 * 운동 동작 영상 링크 등록표.
 *
 * ── 검수 상태 ────────────────────────────────────────────────
 * 2026-09-02 검수표(docs/검수표.xlsx)에서 O 판정을 받은 링크만 등록되어 있습니다.
 * X 판정을 받은 링크는 넣지 않습니다.
 *
 * ── 영상을 추가하는 방법 ─────────────────────────────────────
 * 1. 유튜브에서 동작 영상을 찾습니다.
 * 2. 주소창의 링크를 복사합니다.  예) https://www.youtube.com/watch?v=abc123
 * 3. 아래 EXERCISE_VIDEOS 에서 해당 운동 id 를 찾아 항목을 추가합니다.
 *    (한 운동에 여러 개를 넣을 수 있습니다. 화면에 모두 표시됩니다)
 *
 *      'knee-p1-01': [
 *        { url: '...', title: '쿼드셋 시연', source: '채널 이름', korean: true },
 *      ],
 *
 * 4. npm run videos:check 로 확인합니다.
 *
 * ── 저작권 ──────────────────────────────────────────────────
 * 이 앱은 영상을 내려받거나 앱 안에 담지 않습니다.
 * '영상 보기' 를 누르면 유튜브 앱이나 브라우저가 열립니다.
 * 원작자의 채널에서 재생되므로 조회수도 원작자에게 갑니다.
 *
 * ⚠️ 영상 파일을 받아서 앱에 넣는 것은 저작권 침해입니다. 하지 마세요.
 *
 * ── 영상을 고르는 기준 (docs/VIDEO_GUIDE.md) ────────────────
 * 조회수가 높다고 안전한 영상은 아닙니다. 아래를 먼저 봅니다.
 *   1. 만든 사람이 물리치료사·운동전문가인가
 *   2. 우리 앱의 동작 설명과 자세가 같은가
 *   3. 통증을 참으라거나 무리하라는 말이 없는가
 *   4. 광고·판매 유도가 심하지 않은가
 * ─────────────────────────────────────────────────────────────
 */

export interface ExerciseVideo {
  /** 유튜브 링크 (watch, youtu.be, shorts 모두 가능) */
  url: string;
  /** 화면에 보여 줄 제목 */
  title: string;
  /** 채널 이름 등 출처 */
  source: string;
  /** 한국어 영상인지. false 면 화면에 '영어 영상' 이라고 알려 준다 */
  korean: boolean;
  /**
   * 이 영상에 여러 동작이 함께 들어 있는 경우의 안내.
   * 사용자가 어느 부분을 봐야 하는지 알 수 있게 한다.
   */
  note?: string;
}

export const EXERCISE_VIDEOS: Record<string, ExerciseVideo[]> = {
  // ───────── 무릎 Phase 1 ─────────
  'knee-p1-01': [
    {
      url: 'https://www.youtube.com/watch?v=d5A5LWDOPE0',
      title: 'Quad Set — 무릎 안정화 시리즈',
      source: 'Knee Stability Exercise Series',
      korean: false,
    },
    {
      url: 'https://www.youtube.com/watch?v=au62CidApd0',
      title: 'Quad Sets 시연',
      source: 'Ask Doctor Jo · 물리치료사',
      korean: false,
    },
  ],
  'knee-p1-02': [
    {
      url: 'https://www.youtube.com/watch?v=t4HVx5NDeHc',
      title: '통증 없이 무릎 굽히는 힐 슬라이드',
      source: '유튜브',
      korean: true,
    },
    {
      url: 'https://www.youtube.com/watch?v=W3_BUipgYU4',
      title: 'Seated Active Heel Slide',
      source: 'Knee Mobility Exercise Series',
      korean: false,
    },
  ],
  'knee-p1-03': [
    {
      url: 'https://www.youtube.com/watch?v=WqI8ln0MpjQ',
      title: '[무릎 재활 1주차] 누워서 발목 당겨 다리 들기',
      source: '유튜브 · 단계별 시리즈',
      korean: true,
    },
  ],

  // ───────── 허리 Phase 1 ─────────
  'back-p1-02': [
    {
      url: 'https://www.youtube.com/watch?v=SaUhRNOjwUg',
      title: '골반 후경사 운동 (누운 자세)',
      source: '유튜브',
      korean: true,
      note: '앱의 동작 설명과 가장 가까운 자세입니다.',
    },
    {
      url: 'https://www.youtube.com/watch?v=HAdd1sP6ruE',
      title: '누워서 골반 움직이기',
      source: '유튜브',
      korean: true,
    },
  ],

  // ───────── 발목 Phase 1 ─────────
  'ankle-p1-01': [
    {
      url: 'https://www.youtube.com/watch?v=u5WF34iRvB4',
      title: '발목 염좌 및 발목 삔 후 재활운동',
      source: '서울백병원',
      korean: true,
      note: '여러 동작이 함께 나옵니다. 발목 알파벳·종아리 스트레칭 구간을 찾아보세요.',
    },
    {
      url: 'https://www.youtube.com/watch?v=eJqA2gPdgHQ',
      title: '현직 물리치료사가 알려주는 단계별 발목 재활 운동법',
      source: '물리치료사',
      korean: true,
      note: '여러 동작이 함께 나옵니다.',
    },
    {
      url: 'https://www.youtube.com/watch?v=hE0IsV4e9oE',
      title: '발목인대 & 염좌 재활운동 1주차',
      source: '유튜브',
      korean: true,
    },
  ],
  'ankle-p1-02': [
    {
      url: 'https://www.youtube.com/watch?v=BrJ67g0NKqE',
      title: '발목 펌프',
      source: '삼성서울병원 스포츠의학실',
      korean: true,
    },
    {
      url: 'https://www.youtube.com/watch?v=G2Cm-VvaY0w',
      title: '[무릎 재활 1주차] 앉아서 발목 펌프 운동',
      source: '유튜브',
      korean: true,
    },
  ],

  // ───────── 어깨 Phase 1 ─────────
  'shoulder-p1-01': [
    {
      url: 'https://www.youtube.com/watch?v=aU3hzceroOk',
      title: '코드만 운동 (Pendulum) 정확히 알고 하기',
      source: '유튜브',
      korean: true,
    },
    {
      url: 'https://www.youtube.com/watch?v=Pl5XLHKNr30',
      title: '시계추운동 · 진자운동 · 벽타기',
      source: '유튜브',
      korean: true,
    },
    {
      url: 'https://www.youtube.com/watch?v=ICmlLI-rd7g',
      title: '집에서도 할 수 있는 어깨 재활 운동',
      source: '물리치료사',
      korean: true,
    },
  ],
  'shoulder-p1-02': [
    {
      url: 'https://www.youtube.com/watch?v=T98_YpZwny0',
      title: '견갑골 안정화 운동',
      source: '유튜브',
      korean: true,
    },
    {
      url: 'https://www.youtube.com/watch?v=mH4Ipg1DRak',
      title: '어깨건강 예방운동 : 견갑골 안정화',
      source: '유튜브',
      korean: true,
    },
    {
      url: 'https://www.youtube.com/watch?v=LXBNdN5RIIs',
      title: '어깨·견갑골 안정화를 위한 전거근 운동',
      source: '유튜브',
      korean: true,
    },
  ],

  // ───────── 목·등 상부 Phase 1 ─────────
  //
  // ⚠️ 턱 당기기는 '모두에게 맞는 운동은 아니다' 라는 견해가 있는 동작입니다.
  //    그래서 시연 영상뿐 아니라 흔한 실수와 반대 견해를 다루는 영상도 함께 넣었습니다.
  //    사용자가 한쪽만 보고 따라 하지 않도록, 화면에서도 여러 개를 나란히 보여 줍니다.
  'neck-p1-01': [
    {
      url: 'https://www.youtube.com/watch?v=PaIzpXp33Sc',
      title: '거북목 2분 교정 — 올바른 친턱(턱당기기) 운동법',
      source: '유튜브',
      korean: true,
    },
    {
      url: 'https://www.youtube.com/watch?v=H0r_ntsH4v4',
      title: "거북목 교정 '턱 당기기' 제대로 하는 법",
      source: '유튜브',
      korean: true,
    },
    {
      url: 'https://www.youtube.com/watch?v=bEPVu8K53qQ',
      title: '일반인 99%가 잘못하고 있는 턱 당기기 운동',
      source: '유튜브',
      korean: true,
      note: '흔한 실수를 다룹니다. 시연 영상과 함께 보시면 좋습니다.',
    },
    {
      url: 'https://www.youtube.com/watch?v=scWH5e22WIs',
      title: '턱 당기기 운동, 해야 하나 말아야 하나?',
      source: '유튜브',
      korean: true,
      note: '이 동작이 모두에게 맞지는 않다는 견해를 다룹니다. 통증이 있다면 먼저 확인해 보세요.',
    },
  ],
};

/** 등록된 영상 목록. 없으면 빈 배열 */
export function getExerciseVideos(exerciseId: string): ExerciseVideo[] {
  return EXERCISE_VIDEOS[exerciseId] ?? [];
}

/**
 * 등록된 영상이 없을 때 쓸 유튜브 검색 링크.
 *
 * 검색어에 '재활' 을 넣어, 자극적인 운동 영상보다
 * 재활 성격의 영상이 위로 오게 한다.
 */
export function buildSearchUrl(exerciseName: string, bodyRegionLabel: string | null): string {
  const keyword = [exerciseName, bodyRegionLabel ?? '', '재활 운동 방법']
    .filter(Boolean)
    .join(' ');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
}

/** 영상이 하나라도 등록된 운동 수 */
export function registeredVideoCount(): number {
  return Object.keys(EXERCISE_VIDEOS).length;
}

/** 등록된 영상 링크 총 개수 */
export function totalVideoCount(): number {
  return Object.values(EXERCISE_VIDEOS).reduce((sum, list) => sum + list.length, 0);
}
