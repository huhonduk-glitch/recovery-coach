import { useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * '안내문을 끝까지 봤는가' 판정.
 *
 * ── 왜 필요한가 ─────────────────────────────────────────────
 * 동의 화면은 끝까지 읽어야 동의 버튼이 열립니다. (docs/SAFETY_POLICY.md §8)
 * 그런데 스크롤 이벤트만으로 판정하면, 화면이 커서 내용이 한눈에 다 들어오는 경우
 * (데스크톱 브라우저, 태블릿) 스크롤이 아예 일어나지 않아 버튼이 영영 잠깁니다.
 * 2026-09-03 웹에서 실제로 발생한 문제입니다.
 *
 * ── 어떻게 고쳤나 ───────────────────────────────────────────
 * '스크롤이 바닥에 닿았는가' 가 아니라 '마지막 줄이 화면에 들어왔는가' 로 봅니다.
 * 내용이 화면보다 짧으면 스크롤 위치가 0이어도 마지막 줄이 이미 보이므로 통과합니다.
 *
 * 안전 기준을 낮춘 것이 아닙니다. 안 보여 준 내용을 건너뛰게 하지 않는다는 원칙은
 * 그대로이고, 다 보여 준 경우를 못 알아보던 것을 고친 것입니다.
 */

/** 바닥으로 인정하는 여유 (px). 소수점 반올림과 그림자 여백을 감안한다 */
export const READ_END_SLACK = 24;

export interface ReadProgress {
  /** 스크롤 영역의 보이는 높이 */
  viewportHeight: number;
  /** 안쪽 내용 전체 높이 */
  contentHeight: number;
  /** 지금 얼마나 내렸는지 */
  scrollOffset: number;
}

/**
 * 마지막 줄이 화면에 들어왔는지.
 *
 * 내용이 화면보다 짧으면 (contentHeight <= viewportHeight) scrollOffset 이 0 이어도 true.
 * 아직 높이를 재지 못했으면 false — 섣불리 열어 주지 않는다.
 */
export function hasReachedEnd(progress: ReadProgress): boolean {
  const { viewportHeight, contentHeight, scrollOffset } = progress;
  if (viewportHeight <= 0 || contentHeight <= 0) return false;
  return scrollOffset + viewportHeight >= contentHeight - READ_END_SLACK;
}

export interface ReadToEndScrollProps {
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onLayout: (e: LayoutChangeEvent) => void;
  onContentSizeChange: (width: number, height: number) => void;
  scrollEventThrottle: number;
}

/**
 * 동의 화면에서 쓰는 훅.
 *
 *   const { readToEnd, scrollProps } = useReadToEnd();
 *   <ScrollView {...scrollProps}> ... </ScrollView>
 *   <Button disabled={!readToEnd} />
 */
export function useReadToEnd(): {
  readToEnd: boolean;
  scrollProps: ReadToEndScrollProps;
} {
  const [readToEnd, setReadToEnd] = useState(false);

  // 높이는 화면을 다시 그리게 할 필요가 없어 ref 에 담는다
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const scrollOffset = useRef(0);

  function recheck() {
    if (readToEnd) return;
    if (
      hasReachedEnd({
        viewportHeight: viewportHeight.current,
        contentHeight: contentHeight.current,
        scrollOffset: scrollOffset.current,
      })
    ) {
      setReadToEnd(true);
    }
  }

  return {
    readToEnd,
    scrollProps: {
      onScroll: (e) => {
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
        viewportHeight.current = layoutMeasurement.height;
        contentHeight.current = contentSize.height;
        scrollOffset.current = contentOffset.y;
        recheck();
      },
      // 화면 크기가 정해질 때 (브라우저 창 크기 변경 포함)
      onLayout: (e: LayoutChangeEvent) => {
        viewportHeight.current = e.nativeEvent.layout.height;
        recheck();
      },
      // 내용 높이가 정해질 때 (글꼴 로딩이 끝난 뒤 등)
      onContentSizeChange: (_width: number, height: number) => {
        contentHeight.current = height;
        recheck();
      },
      scrollEventThrottle: 64,
    },
  };
}
