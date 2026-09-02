import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { BodyRegion } from '@/features/assessment/assessmentTypes';
import { colors, radius } from '@/theme';

/**
 * 몸 부위 표시 그림.
 *
 * ⚠️ 이 그림은 '어느 부위 운동인지'만 알려 준다. 자세를 보여 주는 그림이 아니다.
 *    동작 자세는 사진이나 영상이 준비되기 전까지 글 설명으로 안내한다.
 *    (docs/IMAGE_GUIDE.md)
 */

interface Props {
  region: BodyRegion | null;
  size?: number;
}

const BASE = colors.border;
const HIGHLIGHT = colors.primary;

export function BodyDiagram({ region, size = 120 }: Props) {
  const on = (target: BodyRegion) => (region === target ? HIGHLIGHT : BASE);
  const width = size;
  const height = size * 2;

  return (
    <View style={[styles.root, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 100 200">
        {/* 머리 */}
        <Circle cx="50" cy="16" r="11" fill={BASE} />

        {/* 목 · 등 상부 */}
        <G>
          <Rect x="45" y="26" width="10" height="8" fill={on('neckUpperBack')} />
          <Path d="M28 36 Q50 30 72 36 L70 58 Q50 52 30 58 Z" fill={on('neckUpperBack')} />
        </G>

        {/* 몸통 (기본) */}
        <Path d="M30 56 Q50 50 70 56 L67 100 Q50 105 33 100 Z" fill={BASE} />

        {/* 허리 */}
        <Path d="M33 92 Q50 97 67 92 L65 116 Q50 121 35 116 Z" fill={on('lowBack')} />

        {/* 어깨 */}
        <G>
          <Circle cx="28" cy="42" r="9" fill={on('shoulder')} />
          <Circle cx="72" cy="42" r="9" fill={on('shoulder')} />
        </G>

        {/* 팔 */}
        <Path d="M22 46 L18 90 L26 92 L31 50 Z" fill={BASE} />
        <Path d="M78 46 L82 90 L74 92 L69 50 Z" fill={BASE} />

        {/* 허벅지 */}
        <Path d="M36 114 L32 146 L44 148 L47 116 Z" fill={BASE} />
        <Path d="M64 114 L68 146 L56 148 L53 116 Z" fill={BASE} />

        {/* 무릎 */}
        <G>
          <Ellipse cx="38" cy="152" rx="8" ry="7" fill={on('knee')} />
          <Ellipse cx="62" cy="152" rx="8" ry="7" fill={on('knee')} />
        </G>

        {/* 종아리 */}
        <Path d="M33 158 L32 182 L42 182 L44 158 Z" fill={BASE} />
        <Path d="M67 158 L68 182 L58 182 L56 158 Z" fill={BASE} />

        {/* 발목 */}
        <G>
          <Rect x="31" y="180" width="12" height="8" rx="3" fill={on('ankle')} />
          <Rect x="57" y="180" width="12" height="8" rx="3" fill={on('ankle')} />
        </G>

        {/* 발 */}
        <Rect x="29" y="188" width="16" height="6" rx="3" fill={BASE} />
        <Rect x="55" y="188" width="16" height="6" rx="3" fill={BASE} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
});
