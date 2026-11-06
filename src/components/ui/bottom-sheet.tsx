import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Layout, LightPalette, Radius } from '@/constants/theme';
import { Icon } from '@/screens/home-dashboard/icons';

type BottomSheetProps = {
  title: string;
  /** Small caps line above the title. */
  eyebrow?: string;
  /** Quiet line under the title. */
  subtitle?: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
};

/** Modal bottom sheet chrome: scrim, handle, title row, 44px close, keyboard and safe area handling. */
export function BottomSheet({ title, eyebrow, subtitle, closeLabel, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Pressable accessibilityLabel={closeLabel} style={styles.scrim} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Layout.screenMargin + insets.bottom }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleCopy}>
              {eyebrow && (
                <ThemedText type="labelSm" style={styles.eyebrow}>
                  {eyebrow}
                </ThemedText>
              )}
              <ThemedText type="headlineSm" numberOfLines={2} style={styles.title}>
                {title}
              </ThemedText>
              {subtitle && (
                <ThemedText type="labelSm" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              )}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose} style={styles.close}>
              <Icon name="close" size={20} color={LightPalette.onSurfaceVariant} />
            </Pressable>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Stack of options inside a sheet. */
export function SheetOptions({ children }: { children: ReactNode }) {
  return <View style={styles.options}>{children}</View>;
}

type SheetOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Leading glyph (for toggle rows). */
  icon?: 'check_circle' | 'trending_up';
};

/** One 48px option row; the selected row gets the secondary container and a trailing check. */
export function SheetOption({ label, selected, onPress, icon }: SheetOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}>
      <View style={styles.optionLabel}>
        {icon && <Icon name={icon} size={20} color={LightPalette.secondary} />}
        <ThemedText type="small" style={{ color: LightPalette.onSurface }}>
          {label}
        </ThemedText>
      </View>
      {selected && <Icon name="check_circle" size={20} color={LightPalette.secondary} />}
    </Pressable>
  );
}

export function SheetResetOption({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.reset}>
      <ThemedText type="labelMd" style={{ color: LightPalette.error }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: LightPalette.primaryScrim,
  },
  sheet: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '92%',
    alignSelf: 'center',
    paddingHorizontal: Layout.screenMargin,
    paddingTop: Layout.gutter,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    backgroundColor: LightPalette.surface,
    shadowColor: LightPalette.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginBottom: Layout.gutter,
    borderRadius: Radius.full,
    backgroundColor: LightPalette.outline,
    opacity: 0.45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Layout.sectionGap,
    marginBottom: Layout.sectionGap,
  },
  titleCopy: {
    flex: 1,
  },
  eyebrow: {
    color: LightPalette.secondary,
    letterSpacing: 0.6,
  },
  title: {
    color: LightPalette.primary,
    fontWeight: '700',
  },
  subtitle: {
    color: LightPalette.onSurfaceVariant,
    fontWeight: '600',
  },
  close: {
    width: Layout.touchTarget,
    height: Layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: LightPalette.surfaceContainer,
  },
  options: {
    gap: 8,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Layout.gutter,
    paddingHorizontal: Layout.gutter,
    borderRadius: Radius.container,
    backgroundColor: LightPalette.surfaceLow,
  },
  optionSelected: {
    backgroundColor: LightPalette.secondaryContainer,
  },
  optionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reset: {
    minHeight: Layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: Layout.gutter,
  },
});
