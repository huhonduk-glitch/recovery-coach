import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from '@/theme';

/**
 * 웹에서만 보여 주는 저장 위치 안내.
 *
 * 웹은 여러 사람이 같은 기기를 쓸 수 있다. 학교 컴퓨터실처럼 공용 PC 에서 쓰면
 * 다음 사람이 앞사람 기록을 볼 수 있으므로, 사용 후 삭제를 안내한다.
 * (docs/SAFETY_POLICY.md §16)
 */

const DISMISS_KEY = '@rfc/webNoticeDismissed';

export const WEB_STORAGE_MESSAGE =
  '지금은 웹 브라우저로 이용 중이에요. 기록은 이 브라우저에만 저장됩니다. 학교 컴퓨터처럼 여러 사람이 쓰는 기기라면, 다 쓰신 뒤 내정보에서 데이터를 지워 주세요.';

/** 웹에서만 렌더링된다. 앱에서는 아무것도 그리지 않는다. */
export function WebStorageNotice({ dismissible = false }: { dismissible?: boolean }) {
  // 첫 렌더에서 바로 판단한다 (닫은 적이 있으면 처음부터 그리지 않는다)
  const [visible, setVisible] = useState(() => {
    if (!dismissible) return true;
    if (Platform.OS !== 'web') return false;
    try {
      return window.localStorage.getItem(DISMISS_KEY) !== '1';
    } catch {
      // 저장소를 못 읽어도 안내는 보여 준다
      return true;
    }
  });

  if (Platform.OS !== 'web' || !visible) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // 저장 실패해도 이번 화면에서는 닫아 준다
    }
    setVisible(false);
  }

  return (
    <View style={styles.root} accessibilityRole="alert">
      <Text style={styles.title}>공용 컴퓨터를 쓰고 계신가요?</Text>
      <Text style={styles.text}>{WEB_STORAGE_MESSAGE}</Text>

      {dismissible ? (
        <Pressable
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel="안내 닫기"
          style={styles.dismiss}
        >
          <Text style={styles.dismissText}>알겠어요</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: { ...typography.bodyStrong, color: colors.primaryDark, marginBottom: spacing.sm },
  text: { ...typography.small, color: colors.text },
  dismiss: {
    alignSelf: 'flex-start',
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    paddingTop: spacing.sm,
  },
  dismissText: { ...typography.smallStrong, color: colors.primary },
});
