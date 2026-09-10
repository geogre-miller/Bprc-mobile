import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useWindowDimensions, View, StyleSheet } from 'react-native';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { BOTTOM_NAV_ITEMS } from '@/constants/navigation';
import { useTheme } from '@/hooks/use-theme';
import { Icon, type IconName } from '@/screens/home-dashboard/icons';

type TabButtonProps = TabTriggerSlotProps & {
  compact?: boolean;
  iconName?: IconName;
};

type CustomTabListProps = TabListProps & {
  compact?: boolean;
};

export default function AppTabs() {
  const { width } = useWindowDimensions();
  const compact = width <= 600;

  return (
    <Tabs>
      <TabSlot style={[styles.tabSlot, compact && styles.compactTabSlot]} />
      <TabList asChild>
        <CustomTabList compact={compact}>
          {BOTTOM_NAV_ITEMS.map((item) => (
            <TabTrigger key={item.key} name={item.key} href={item.href} resetOnFocus={item.key === 'home'} asChild>
              <TabButton compact={compact} iconName={item.icon}>
                {item.label}
              </TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, compact = false, iconName, ...props }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [compact && styles.compactTabButton, pressed && styles.pressed]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.tabButtonView, compact && styles.compactTabButtonView]}>
        {compact && iconName && (
          <Icon name={iconName} size={18} color={isFocused ? theme.primary : theme.textSecondary} />
        )}
        <ThemedText
          type="small"
          themeColor={isFocused ? (compact ? 'primary' : 'text') : 'textSecondary'}
          style={compact && styles.compactTabLabel}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList({ compact = false, ...props }: CustomTabListProps) {
  const colors = useTheme();

  return (
    <View {...props} style={[styles.tabListContainer, compact && styles.compactTabListContainer]}>
      <ThemedView
        type="backgroundElement"
        style={[styles.innerContainer, compact && styles.compactInnerContainer]}>
        {!compact && (
          <ThemedText type="smallBold" style={styles.brandText}>
            Rẫy Giá
          </ThemedText>
        )}

        {props.children}

        {!compact && (
          <ExternalLink href="https://docs.expo.dev" asChild>
            <Pressable style={styles.externalPressable}>
              <ThemedText type="link">Docs</ThemedText>
              <SymbolView
                tintColor={colors.text}
                name={{ ios: 'arrow.up.right.square', web: 'link' }}
                size={12}
              />
            </Pressable>
          </ExternalLink>
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabSlot: {
    height: '100%',
  },
  compactTabSlot: {
    paddingBottom: 64,
  },
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  compactTabListContainer: {
    bottom: 0,
    height: 64,
    padding: 0,
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  compactInnerContainer: {
    width: '100%',
    maxWidth: 430,
    height: 64,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 0,
    gap: 0,
    flexGrow: 0,
    justifyContent: 'space-around',
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  compactTabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTabButtonView: {
    width: '100%',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: Spacing.one,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  compactTabLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
