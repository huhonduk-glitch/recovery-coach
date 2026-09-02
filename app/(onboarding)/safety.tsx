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
import { Button, Checkbox } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DISCLAIMER_FULL, DISCLAIMER_VERSION } from '@/content/copy/disclaimer';
import { consentRepository } from '@/storage';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

/** 스크롤이 바닥 근처에 닿았는지 (여유 24px) */
function isAtBottom(e: NativeSyntheticEvent<NativeScrollEvent>): boolean {
  const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - 24;
}

/**
 * 안전 안내 및 동의 화면.
 *
 * 면책 전문을 끝까지 내려야 체크박스가 활성화된다.
 * 건너뛰기 버튼을 두지 않는다. (docs/SAFETY_POLICY.md §8.1)
 */
export default function SafetyConsentScreen() {
  const insets = useSafeAreaInsets();
  const [readToEnd, setReadToEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSubmit = readToEnd && checked && !saving;

  async function handleAgree() {
    setSaving(true);
    await consentRepository.save(DISCLAIMER_VERSION);
    router.replace('/(onboarding)/profile');
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
        onScroll={(e) => {
          if (isAtBottom(e)) setReadToEnd(true);
        }}
        scrollEventThrottle={64}
      >
        <Text style={styles.title}>이용 전 확인해 주세요</Text>
        <Text style={styles.subtitle}>
          아래 내용을 끝까지 읽으신 뒤 동의해 주세요. 이 앱이 무엇을 하지 않는지가 특히 중요합니다.
        </Text>

        {DISCLAIMER_FULL.map((line, index) => (
          <View key={line} style={styles.item}>
            <Text style={styles.itemNumber}>{index + 1}</Text>
            <Text style={styles.itemText}>{line}</Text>
          </View>
        ))}

        <View style={styles.endMark}>
          <Text style={styles.endMarkText}>여기까지가 안내 전문입니다.</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {!readToEnd ? (
          <Text style={styles.hint}>내용을 끝까지 내려서 읽어 주세요.</Text>
        ) : null}

        <Checkbox.Item
          label="위 내용을 확인했습니다"
          labelStyle={styles.checkboxLabel}
          status={checked ? 'checked' : 'unchecked'}
          disabled={!readToEnd}
          onPress={() => setChecked((v) => !v)}
          position="leading"
          style={styles.checkbox}
        />

        <Button
          mode="contained"
          disabled={!canSubmit}
          loading={saving}
          onPress={handleAgree}
          contentStyle={styles.buttonContent}
        >
          동의하고 시작하기
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  item: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  itemNumber: {
    ...typography.bodyStrong,
    color: colors.primary,
    marginRight: spacing.md,
    minWidth: 16,
  },
  itemText: { ...typography.body, color: colors.text, flex: 1 },
  endMark: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  endMarkText: { ...typography.small, color: colors.textMuted },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  hint: { ...typography.small, color: colors.warning, marginBottom: spacing.xs },
  checkbox: { paddingHorizontal: 0, minHeight: MIN_TOUCH_SIZE },
  checkboxLabel: { ...typography.body, color: colors.text, textAlign: 'left' },
  buttonContent: { minHeight: MIN_TOUCH_SIZE },
});
