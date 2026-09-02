import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { Button } from './Button';

interface Props {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** 보여 줄 내용이 없을 때. 왜 비었는지와 다음에 뭘 하면 되는지를 알려 준다. */
export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  description: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: { marginTop: spacing.xl, alignSelf: 'stretch' },
});
