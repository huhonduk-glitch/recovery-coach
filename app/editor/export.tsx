import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { Button, Card, SafetyNotice, Screen } from '@/components';
import { editedCount, exportAsCode } from '@/features/library/exerciseLibrary';
import { useLibrary } from '@/features/library/useLibrary';
import { colors, radius, spacing, typography } from '@/theme';

/**
 * 편집한 운동·프로그램을 코드로 내보내는 화면.
 *
 * 앱 안의 편집 내용은 이 기기에만 있습니다. 앱을 지우거나 기기를 바꾸면 사라집니다.
 */
export default function LibraryExportScreen() {
  const store = useLibrary();
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => exportAsCode(store), [store]);
  const counts = editedCount(store);

  return (
    <Screen footer={<Button label="닫기" variant="outline" onPress={() => router.back()} />}>
      <Text style={styles.title} accessibilityRole="header">
        코드로 내보내기
      </Text>
      <Text style={styles.desc}>
        앱에서 고친 운동 {counts.exercises}개, 프로그램 {counts.programs}개입니다. 아래 글을
        복사해 `src/data/` 안의 해당 파일에 붙여 넣으면 다음 빌드부터 기본값이 됩니다.
      </Text>

      <SafetyNotice
        tone="info"
        title="이 내용은 이 기기에만 있어요"
        text="앱을 지우거나 기기를 바꾸면 사라집니다. 오래 남기려면 아래 내용을 복사해 두세요."
      />

      <Card title="붙여 넣을 코드">
        <TextInput
          value={code}
          editable={false}
          multiline
          style={styles.code}
          accessibilityLabel="내보낼 코드"
        />
        <Button
          label={copied ? '복사했어요' : '전체 복사'}
          onPress={() => {
            void Clipboard.setStringAsync(code);
            setCopied(true);
          }}
          style={styles.button}
        />
        <Text style={styles.note}>
          복사가 되지 않으면 위 글을 길게 눌러 직접 선택해 주세요.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.xs },
  desc: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  code: {
    ...typography.caption,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 240,
    textAlignVertical: 'top',
  },
  button: { marginTop: spacing.md },
  note: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
});
