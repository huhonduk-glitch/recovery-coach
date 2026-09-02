import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { StructureKey } from '@/data/injuryEducation';
import type { BodyRegion } from '@/features/assessment/assessmentTypes';
import { colors, radius, spacing, typography } from '@/theme';

/**
 * 부위별 구조 개념도.
 *
 * ⚠️ 이것은 개념도입니다. 실제 해부도나 사진이 아닙니다.
 *    인대·연골이 "대략 어디에 있고 무엇과 무엇을 잇는가" 만 보여 줍니다.
 *    크기 비율과 모양은 실제와 다릅니다.
 *
 * 실제 해부 사진이나 의학 삽화는 저작권이 있어 앱에 넣을 수 없습니다.
 * 정확한 그림이 필요하면 병원에서 설명을 들으시는 편이 낫습니다.
 */

interface Props {
  region: BodyRegion;
  /** 강조할 구조물. null 이면 전체를 회색으로 그린다 */
  highlight: StructureKey | null;
  size?: number;
}

/** 뼈는 배경, 인대·힘줄은 앞. 배경 위에서 구분되도록 대비를 준다 */
const BONE = colors.border;
const BONE_EDGE = colors.textDisabled;
const SOFT = colors.textMuted;
const ON = colors.primary;

export function AnatomyDiagram({ region, highlight, size = 200 }: Props) {
  const on = (key: StructureKey) => (highlight === key ? ON : SOFT);
  const width = (key: StructureKey) => (highlight === key ? 5 : 3);

  return (
    <View style={styles.root}>
      <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityRole="image">
        {region === 'knee' ? <Knee on={on} width={width} /> : null}
        {region === 'shoulder' ? <Shoulder on={on} width={width} /> : null}
        {region === 'lowBack' ? <LowBack on={on} width={width} /> : null}
        {region === 'ankle' ? <Ankle on={on} width={width} /> : null}
        {region === 'neckUpperBack' ? <Neck on={on} width={width} /> : null}
      </Svg>
      <Text style={styles.caption}>개념도입니다. 실제 해부도가 아닙니다.</Text>
    </View>
  );
}

interface PartProps {
  on: (key: StructureKey) => string;
  width: (key: StructureKey) => number;
}

/** 무릎 — 앞에서 본 모습을 단순화 */
function Knee({ on, width }: PartProps) {
  return (
    <G>
      {/* 넙다리뼈 — 몸통과 두 개의 둥근 끝 */}
      <Rect x="39" y="6" width="22" height="26" rx="6" fill={BONE} stroke={BONE_EDGE} />
      <Ellipse cx="44" cy="38" rx="10" ry="9" fill={BONE} stroke={BONE_EDGE} />
      <Ellipse cx="57" cy="38" rx="10" ry="9" fill={BONE} stroke={BONE_EDGE} />

      {/* 관절연골 — 뼈 끝을 덮는 얇은 층 */}
      <Path
        d="M35 44 Q44 49 50 45 Q56 49 66 44"
        stroke={on('cartilage')}
        strokeWidth={width('cartilage')}
        fill="none"
      />

      {/* 반월상연골 — 정강뼈 위에 얹힌 초승달 */}
      <Ellipse cx="42" cy="50" rx="7" ry="2.5" fill={on('meniscus')} />
      <Ellipse cx="59" cy="50" rx="7" ry="2.5" fill={on('meniscus')} />

      {/* 정강뼈 — 넓은 윗면과 몸통 */}
      <Rect x="32" y="55" width="37" height="7" rx="3" fill={BONE} stroke={BONE_EDGE} />
      <Rect x="41" y="61" width="19" height="31" rx="5" fill={BONE} stroke={BONE_EDGE} />

      {/* 십자인대 — 두 뼈 사이에서 엇갈린다 */}
      <Line x1="45" y1="33" x2="55" y2="54" stroke={on('acl')} strokeWidth={width('acl')} />
      <Line x1="56" y1="33" x2="46" y2="54" stroke={on('pcl')} strokeWidth={width('pcl')} />

      {/* 내측측부인대 — 안쪽 옆을 세로로 잇는다 */}
      <Line x1="31" y1="34" x2="31" y2="64" stroke={on('mcl')} strokeWidth={width('mcl')} />

      {/* 슬개골과 슬개건 — 앞쪽 도르래 */}
      <Ellipse cx="77" cy="42" rx="6" ry="8" fill={BONE} stroke={BONE_EDGE} />
      <Line
        x1="77"
        y1="50"
        x2="69"
        y2="64"
        stroke={on('patellarTendon')}
        strokeWidth={width('patellarTendon') + 1}
      />
    </G>
  );
}

/** 어깨 — 앞에서 본 모습을 단순화 */
function Shoulder({ on, width }: PartProps) {
  return (
    <G>
      {/* 견갑골 */}
      <Polygon points="18,26 46,34 22,70" fill={on('scapula')} opacity={0.55} />
      {/* 견봉 — 위를 덮는 지붕 */}
      <Rect x="34" y="22" width="34" height="6" rx="3" fill={BONE} stroke={BONE_EDGE} />
      {/* 견봉 아래 공간 */}
      <Rect x="38" y="30" width="26" height="5" rx="2" fill={on('subacromial')} opacity={0.7} />
      {/* 위팔뼈 머리 */}
      <Circle cx="52" cy="48" r="12" fill={BONE} stroke={BONE_EDGE} />
      {/* 위팔뼈 */}
      <Rect x="46" y="58" width="13" height="32" rx="5" fill={BONE} stroke={BONE_EDGE} />
      {/* 관절와순 — 접시 테두리 */}
      <Path d="M41 38 Q35 48 41 59" stroke={on('labrum')} strokeWidth={width('labrum')} fill="none" />
      {/* 회전근개 — 머리를 감싸는 힘줄 */}
      <Path d="M42 40 Q52 32 63 41" stroke={on('rotatorCuff')} strokeWidth={width('rotatorCuff')} fill="none" />
      <Path d="M42 56 Q52 64 63 55" stroke={on('rotatorCuff')} strokeWidth={width('rotatorCuff')} fill="none" />
    </G>
  );
}

/** 허리 — 옆에서 본 척추 마디를 단순화 */
function LowBack({ on, width }: PartProps) {
  const levels = [16, 36, 56, 76];
  return (
    <G>
      {levels.map((y) => (
        <G key={y}>
          {/* 척추뼈 몸통 */}
          <Rect x="26" y={y} width="30" height="12" rx="3" fill={BONE} stroke={BONE_EDGE} />
          {/* 후관절 — 뒤쪽에서 맞물린다 */}
          <Rect x="60" y={y + 2} width="10" height="8" rx="3" fill={on('facet')} />
          {/* 협부 — 앞뒤를 잇는 얇은 다리 */}
          <Line
            x1="56"
            y1={y + 6}
            x2="60"
            y2={y + 6}
            stroke={on('parsInterarticularis')}
            strokeWidth={width('parsInterarticularis')}
          />
        </G>
      ))}
      {/* 추간판 — 마디 사이 */}
      {[28, 48, 68].map((y) => (
        <Rect key={y} x="26" y={y} width="30" height="8" rx="4" fill={on('disc')} />
      ))}
      {/* 심부 몸통 근육 — 앞뒤를 감싸는 띠 */}
      <Path d="M20 14 Q14 50 20 90" stroke={on('deepCore')} strokeWidth={width('deepCore')} fill="none" />
      <Path d="M76 14 Q84 50 76 90" stroke={on('deepCore')} strokeWidth={width('deepCore')} fill="none" />
    </G>
  );
}

/** 발목 — 안쪽에서 본 모습을 단순화 */
function Ankle({ on, width }: PartProps) {
  return (
    <G>
      {/* 정강뼈 · 종아리뼈 */}
      <Rect x="36" y="8" width="16" height="44" rx="5" fill={BONE} stroke={BONE_EDGE} />
      <Rect x="56" y="12" width="9" height="40" rx="4" fill={BONE} stroke={BONE_EDGE} />
      {/* 두 뼈를 묶는 인대 */}
      <Line x1="52" y1="24" x2="56" y2="24" stroke={on('syndesmosis')} strokeWidth={width('syndesmosis')} />
      <Line x1="52" y1="34" x2="56" y2="34" stroke={on('syndesmosis')} strokeWidth={width('syndesmosis')} />
      <Line x1="52" y1="44" x2="56" y2="44" stroke={on('syndesmosis')} strokeWidth={width('syndesmosis')} />
      {/* 목말뼈 */}
      <Ellipse cx="48" cy="60" rx="16" ry="9" fill={BONE} stroke={BONE_EDGE} />
      {/* 발꿈치뼈와 발 */}
      <Rect x="28" y="68" width="44" height="12" rx="5" fill={BONE} stroke={BONE_EDGE} />
      <Rect x="28" y="80" width="52" height="7" rx="3" fill={BONE} stroke={BONE_EDGE} />
      {/* 바깥쪽 인대 (전거비인대) */}
      <Line x1="64" y1="50" x2="72" y2="62" stroke={on('atfl')} strokeWidth={width('atfl')} />
      {/* 안쪽 인대 (삼각인대) — 부채꼴 */}
      <Line x1="36" y1="50" x2="28" y2="62" stroke={on('deltoid')} strokeWidth={width('deltoid')} />
      <Line x1="36" y1="50" x2="32" y2="66" stroke={on('deltoid')} strokeWidth={width('deltoid')} />
      {/* 아킬레스건 — 종아리에서 뒤꿈치로 */}
      <Path d="M70 12 Q76 40 72 68" stroke={on('achilles')} strokeWidth={width('achilles') + 2} fill="none" />
    </G>
  );
}

/** 목·등 — 옆에서 본 모습을 단순화 */
function Neck({ on, width }: PartProps) {
  const cervical = [22, 32, 42, 52];
  return (
    <G>
      {/* 머리 */}
      <Circle cx="42" cy="12" r="10" fill={BONE} stroke={BONE_EDGE} />
      {/* 목뼈 */}
      {cervical.map((y) => (
        <Rect key={y} x="38" y={y} width="16" height="7" rx="2" fill={BONE} stroke={BONE_EDGE} />
      ))}
      {/* 경추 추간판 */}
      {[29, 39, 49].map((y) => (
        <Rect key={y} x="38" y={y} width="16" height="4" rx="2" fill={on('cervicalDisc')} />
      ))}
      {/* 등뼈 */}
      {[62, 72, 82].map((y) => (
        <Rect key={y} x="38" y={y} width="18" height="8" rx="2" fill={on('thoracicSpine')} />
      ))}
      {/* 심부 목굽힘근 — 목뼈 앞을 지나는 선 */}
      <Path d="M36 20 Q30 40 36 58" stroke={on('deepNeckFlexor')} strokeWidth={width('deepNeckFlexor')} fill="none" />
      {/* 상부 승모근 — 뒤통수에서 어깨로 퍼지는 띠 */}
      <Path d="M50 16 Q68 40 80 66" stroke={on('upperTrap')} strokeWidth={width('upperTrap')} fill="none" />
      <Path d="M52 26 Q70 46 82 70" stroke={on('upperTrap')} strokeWidth={width('upperTrap')} fill="none" />
    </G>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  caption: { ...typography.caption, color: colors.textDisabled, marginTop: spacing.xs },
});
