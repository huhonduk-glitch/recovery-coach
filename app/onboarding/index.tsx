import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';

/**
 * 온보딩.
 *
 * '이 앱이 하지 않는 일'을 두 번째 장에 따로 둔다.
 * 사용자가 기대치를 먼저 잡아야, 나중에 상담 안내를 받아도 납득할 수 있다.
 */

interface Slide {
  eyebrow: string;
  title: string;
  body: string;
  items: string[];
  accent: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: '리커버핏 Coach',
    title: '지금 몸 상태에 맞는\n회복 루틴을 안내해요',
    body: '간단한 설문에 답하면, 아픈 부위와 몸 상태에 맞는 운동과 영양 가이드를 알려 드려요.',
    items: [
      '부위별 회복 운동을 4단계로 나눠 안내합니다',
      '체형교정, 동적웜업, 기능성 운동을 제공합니다',
      '통증 변화와 운동 기록을 남겨 둡니다',
    ],
    accent: colors.primary,
  },
  {
    eyebrow: '먼저 알아 두세요',
    title: '이 앱이\n하지 않는 일',
    body: '무엇을 하지 않는지가 더 중요합니다. 이 앱은 병원을 대신하지 않아요.',
    items: [
      '진단이나 치료를 하지 않습니다',
      '의료 처방을 제공하지 않습니다',
      '위험 신호가 있으면 운동을 안내하지 않고 전문가 상담을 권합니다',
      '무리한 다이어트나 극단적 식사 제한을 권하지 않습니다',
    ],
    accent: colors.warning,
  },
  {
    eyebrow: '안심하세요',
    title: '기록은 이 기기에만\n남습니다',
    body: '입력하신 내용은 서버로 전송되지 않아요. 이름이나 연락처도 묻지 않습니다.',
    items: [
      '설문 응답과 운동 기록은 기기 안에만 저장됩니다',
      '이름·연락처·학번을 입력받지 않습니다',
      '내정보에서 언제든 전체 삭제할 수 있습니다',
    ],
    accent: colors.secondary,
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;
  const isLast = index === SLIDES.length - 1;

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <View style={styles.dots} accessibilityRole="progressbar">
            {SLIDES.map((s, i) => (
              <View key={s.eyebrow} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.buttons}>
            {index > 0 ? (
              <Button
                label="이전"
                variant="outline"
                onPress={() => setIndex((i) => i - 1)}
                style={styles.backButton}
              />
            ) : null}
            <Button
              label={isLast ? '시작하기' : '다음'}
              onPress={() => {
                if (isLast) router.push('/onboarding/safety');
                else setIndex((i) => i + 1);
              }}
              style={styles.nextButton}
            />
          </View>
        </View>
      }
    >
      <Text style={[styles.eyebrow, { color: slide.accent }]}>{slide.eyebrow}</Text>
      <Text style={styles.title} accessibilityRole="header">
        {slide.title}
      </Text>
      <Text style={styles.body}>{slide.body}</Text>

      <Card accent={slide.accent}>
        <View style={styles.list}>
          {slide.items.map((item) => (
            <Text key={item} style={styles.item}>
              · {item}
            </Text>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.smallStrong, marginBottom: spacing.sm },
  title: { ...typography.display, color: colors.text, marginBottom: spacing.md },
  body: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  list: { gap: spacing.sm },
  item: { ...typography.body, color: colors.textMuted },
  footer: { gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  backButton: { flex: 1 },
  nextButton: { flex: 2 },
});
