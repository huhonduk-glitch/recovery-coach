import { router } from 'expo-router';
import { useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, OptionButton, SafetyNotice } from '@/components';
import { privacyStorage } from '@/features/assessment/assessmentStorage';
import { colors, radius, spacing, typography } from '@/theme';
import { PRIVACY_MINOR_NOTICE, PRIVACY_NOTICE, PRIVACY_VERSION } from '@/utils/privacy';

function isAtBottom(e: NativeSyntheticEvent<NativeScrollEvent>): boolean {
  const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - 24;
}

/**
 * 개인정보 수집·이용 동의.
 *
 * 안전 안내 동의 다음에 나온다. 끝까지 읽어야 동의할 수 있다.
 * ⚠️ 문구는 법률 검토 전이다. (docs/SAFETY_POLICY.md §9.3)
 */
export default function PrivacyConsentScreen() {
  const insets = useSafeAreaInsets();
  const [readToEnd, setReadToEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAgree() {
    setSaving(true);
    await privacyStorage.save(PRIVACY_VERSION);
    router.replace('/assessment');
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
        onScroll={(e) => {
          if (isAtBottom(e)) setReadToEnd(true);
        }}
        scrollEventThrottle={64}
      >
        <Text style={styles.title} accessibilityRole="header">
          개인정보 수집·이용 동의
        </Text>
        <Text style={styles.subtitle}>
          어떤 내용을 받고, 어디에 저장되는지 알려 드립니다. 끝까지 읽어 주세요.
        </Text>

        {PRIVACY_NOTICE.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            {section.lines.map((line) => (
              <Text key={line} style={styles.cardLine}>
                · {line}
              </Text>
            ))}
          </View>
        ))}

        <SafetyNotice tone="info" text={PRIVACY_MINOR_NOTICE} />

        <Text style={styles.endMark}>여기까지가 안내 전문입니다.</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {!readToEnd ? <Text style={styles.hint}>내용을 끝까지 내려서 읽어 주세요.</Text> : null}

        <OptionButton
          label="위 내용을 확인했고, 동의합니다"
          multi
          selected={checked}
          onPress={() => {
            if (readToEnd) setChecked((v) => !v);
          }}
        />

        <Button
          label="동의하고 설문 시작하기"
          onPress={handleAgree}
          disabled={!readToEnd || !checked}
          loading={saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: { ...typography.bodyStrong, color: colors.primary, marginBottom: spacing.sm },
  cardLine: { ...typography.body, color: colors.text, marginBottom: spacing.xxs },
  endMark: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  hint: { ...typography.small, color: colors.warning, marginBottom: spacing.sm },
});
