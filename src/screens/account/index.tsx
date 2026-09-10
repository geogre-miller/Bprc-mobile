import { Link } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, LightPalette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from '../home-dashboard/icons';

import { PROFILE_FONTS, useProfileFonts } from './fonts';

const COLORS = LightPalette;

type SupportRowProps = {
  icon: 'call' | 'menu_book' | 'policy';
  title: string;
  description: string;
  onPress: () => void;
  accent?: boolean;
  isLast?: boolean;
};

function SupportRow({ icon, title, description, onPress, accent, isLast }: SupportRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [styles.supportRow, !isLast && styles.supportRowDivider, pressed && styles.pressed]}>
      <View
        style={[
          styles.supportIconWell,
          { backgroundColor: accent ? COLORS.secondaryContainer : COLORS.surfaceContainer },
        ]}>
        <Icon name={icon} size={18} color={accent ? COLORS.onSecondaryContainer : COLORS.onSurfaceVariant} />
      </View>
      <View style={styles.supportCopy}>
        <ThemedText type="titleMd" style={styles.supportTitle} numberOfLines={2}>
          {title}
        </ThemedText>
        <ThemedText
          type="bodySm"
          style={[styles.supportDescription, accent && { color: COLORS.secondary }]}
          numberOfLines={2}>
          {description}
        </ThemedText>
      </View>
      <Icon name="chevron_right" size={20} color={COLORS.outline} />
    </Pressable>
  );
}

function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <ThemedView style={[styles.card, style]}>{children}</ThemedView>;
}

export function Account() {
  const theme = useTheme();
  const fontsReady = useProfileFonts();
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true);

  const showRegionFeedback = () => {
    Alert.alert('Khu vực tham chiếu', 'Đắk Lắk đang được sử dụng để theo dõi giá bán đại lý địa phương.');
  };

  const showBankFeedback = () => {
    Alert.alert('Tài khoản & Thanh toán', 'Thông tin tài khoản sẽ được cập nhật trong phiên bản tiếp theo.');
  };

  const showGuideFeedback = () => {
    Alert.alert('Cẩm nang kỹ thuật canh tác vụ 2024', 'Nội dung cẩm nang sẽ sớm được cập nhật cho nông hộ.');
  };

  const showPolicyFeedback = () => {
    Alert.alert('Điều khoản bảo vệ giá sàn nông hộ', 'Thông tin chính sách sẽ sớm được cập nhật cho nông hộ.');
  };

  const confirmLogout = () => {
    Alert.alert('Đăng xuất tài khoản', 'Bạn có chắc muốn đăng xuất khỏi tài khoản này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive' },
    ]);
  };

  if (!fontsReady) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.loadingScreen, { backgroundColor: theme.background }]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.shell, { backgroundColor: theme.background }]}>
        <ThemedView style={[styles.header, { backgroundColor: theme.background }]}>
          <View style={styles.headerRow}>
            <View style={styles.brand}>
              <Image
                accessibilityLabel="Biểu trưng NôngSản Pro"
                source={require('@/assets/images/nongsan-pro-logo.png')}
                resizeMode="contain"
                style={styles.brandLogo}
              />
              <View style={styles.brandCopy}>
                <ThemedText type="titleMd" style={styles.brandTitle} numberOfLines={1}>
                  NôngSản Pro
                </ThemedText>
                <View style={styles.regionLine}>
                  <Icon name="location_on" size={14} color={COLORS.secondary} />
                  <ThemedText type="labelSm" style={styles.regionText} numberOfLines={1}>
                    Tây Nguyên • Đắk Lắk
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Link href="/alerts" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Thông báo"
                  style={({ pressed }) => pressed && styles.pressed}>
                  <View style={styles.notificationButton}>
                    <Icon name="notifications" size={22} color={COLORS.onSurfaceVariant} />
                    <View style={styles.notificationDot} />
                  </View>
                </Pressable>
              </Link>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mở trang cá nhân"
                accessibilityState={{ selected: true }}
                onPress={() => undefined}
                style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
                <Image
                  accessibilityLabel="Ảnh đại diện của Chú Năm"
                  source={require('@/assets/images/nongsan-pro-profile.png')}
                  resizeMode="cover"
                  style={styles.headerAvatar}
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.titleRow}>
            <ThemedText type="headlineSm" style={styles.screenTitle}>
              Cá Nhân
            </ThemedText>
            <View style={styles.onlineBadge}>
              <ThemedText type="labelSm" style={styles.onlineText}>
                Trực tuyến
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        <ScrollView
          style={[styles.scrollView, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.identityRow}>
              <View style={styles.profileAvatarWrap}>
                <Image
                  accessibilityLabel="Ảnh đại diện của Nguyễn Văn Năm"
                  source={require('@/assets/images/nongsan-pro-profile.png')}
                  resizeMode="cover"
                  style={styles.profileAvatar}
                />
                <View style={styles.verifiedBadge}>
                  <Icon name="verified" size={15} color={COLORS.onPrimary} />
                </View>
              </View>
              <View style={styles.identityContent}>
                <View style={styles.identityHeader}>
                  <ThemedText type="headlineSm" style={styles.identityName} numberOfLines={1}>
                    Nguyễn Văn Năm
                  </ThemedText>
                  <View style={styles.nicknameBadge}>
                    <ThemedText type="labelSm" style={styles.nicknameText} numberOfLines={1}>
                      Chú Năm
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.detailLine}>
                  <Icon name="nature_people" size={16} color={COLORS.secondary} />
                  <ThemedText type="labelSm" style={styles.detailText} numberOfLines={1}>
                    HTX Nông nghiệp Tân Lập
                  </ThemedText>
                </View>
                <View style={styles.detailLine}>
                  <Icon name="place" size={14} color={COLORS.onSurfaceVariant} />
                  <ThemedText type="bodySm" style={styles.detailText} numberOfLines={1}>
                    Ea Kpam, Cư M&apos;gar, Đắk Lắk
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.farmerIdPanel}>
              <View style={styles.farmerIdCopy}>
                <ThemedText type="labelSm" style={styles.mutedText}>
                  Mã số nông hộ
                </ThemedText>
                <ThemedText type="smallBold" style={styles.farmerId}>
                  DL-2024-8891
                </ThemedText>
              </View>
              <View style={styles.verifiedChip}>
                <Icon name="shield" size={14} color={COLORS.onSecondaryContainer} />
                <ThemedText type="labelSm" style={styles.verifiedText} numberOfLines={1}>
                  Chính chủ đã duyệt
                </ThemedText>
              </View>
            </View>
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <ThemedText type="titleMd" style={styles.sectionTitle}>
                Quy mô nông trại
              </ThemedText>
              <View style={styles.seasonLine}>
                <Icon name="eco" size={14} color={COLORS.secondary} />
                <ThemedText type="labelSm" style={styles.seasonText}>
                  Niên vụ 2024
                </ThemedText>
              </View>
            </View>
            <View style={styles.statGrid}>
              <FarmStat label="Diện tích" value="4.5" description="Hecta (ha)" />
              <FarmStat label="Cây trồng" value="Cà & Tiêu" description="Robusta/Tiêu" valueStyle={styles.cropValue} />
              <FarmStat label="Sản lượng" value="18.2" description="Tấn / năm" valueStyle={styles.secondaryValue} />
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeadingWithIcon}>
                <Icon name="account_balance" size={20} color={COLORS.secondary} />
                <ThemedText type="titleMd" style={styles.sectionTitle}>
                  Tài khoản & Thanh toán
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Thay đổi tài khoản và thanh toán"
                onPress={showBankFeedback}
                style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]}>
                <ThemedText type="labelSm" style={styles.changeText}>
                  Thay đổi
                </ThemedText>
              </Pressable>
            </View>
            <View style={styles.bankPanel}>
              <View style={styles.bankTopRow}>
                <View style={styles.bankIdentity}>
                  <View style={styles.bankIconWell}>
                    <Icon name="payments" size={18} color={COLORS.secondary} />
                  </View>
                  <View style={styles.bankCopy}>
                    <ThemedText type="titleMd" style={styles.bankName}>
                      Vietcombank
                    </ThemedText>
                    <ThemedText type="bodySm" style={styles.mutedText}>
                      Chi nhánh Đắk Lắk
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.accountNumberChip}>
                  <ThemedText type="smallBold" style={styles.accountNumber} numberOfLines={1}>
                    0231••••89
                  </ThemedText>
                </View>
              </View>
              <View style={styles.linkedCallout}>
                <Icon name="task_alt" size={16} color={COLORS.secondary} />
                <ThemedText type="bodySm" style={styles.linkedText}>
                  Đã liên kết CCCD gắn chip &amp; Sổ đỏ nông nghiệp số:{' '}
                  <ThemedText type="smallBold" style={styles.linkedId}>
                    ĐL-671203
                  </ThemedText>
                </ThemedText>
              </View>
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeadingWithIcon}>
              <Icon name="notifications_active" size={20} color={COLORS.secondary} />
              <ThemedText type="titleMd" style={styles.sectionTitle}>
                Cài đặt báo giá & Thị trường
              </ThemedText>
            </View>
            <View style={styles.preferenceRows}>
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceCopy}>
                  <ThemedText type="titleMd" style={styles.preferenceTitle}>
                    Khu vực tham chiếu
                  </ThemedText>
                  <ThemedText type="bodySm" style={styles.mutedText}>
                    Theo dõi giá bán đại lý địa phương
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Chọn khu vực tham chiếu, hiện tại Đắk Lắk"
                  onPress={showRegionFeedback}
                  style={({ pressed }) => [styles.valueChip, pressed && styles.pressed]}>
                  <ThemedText type="bodySm" style={styles.primaryChipText}>
                    Đắk Lắk
                  </ThemedText>
                  <Icon name="expand_more" size={16} color={COLORS.primary} />
                </Pressable>
              </View>

              <View style={styles.preferenceRow}>
                <View style={styles.preferenceCopy}>
                  <ThemedText type="titleMd" style={styles.preferenceTitle}>
                    Báo biến động Zalo / SMS
                  </ThemedText>
                  <ThemedText type="bodySm" style={styles.mutedText}>
                    Khi giá cà phê nhảy &gt; 2,000 ₫/kg
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityLabel="Báo biến động Zalo và SMS"
                  accessibilityState={{ checked: priceAlertsEnabled }}
                  aria-checked={priceAlertsEnabled}
                  onPress={() => setPriceAlertsEnabled((enabled) => !enabled)}
                  style={styles.switchHitbox}>
                  <View style={[styles.switchTrack, priceAlertsEnabled ? styles.switchTrackOn : styles.switchTrackOff]}>
                    <View style={styles.switchThumb} />
                  </View>
                </Pressable>
              </View>

              <View style={styles.preferenceRow}>
                <View style={styles.preferenceCopy}>
                  <ThemedText type="titleMd" style={styles.preferenceTitle}>
                    Đơn vị đo lường
                  </ThemedText>
                  <ThemedText type="bodySm" style={styles.mutedText}>
                    Áp dụng hiển thị trên sàn và sổ chốt
                  </ThemedText>
                </View>
                <View style={styles.valueChip}>
                  <ThemedText type="smallBold" style={styles.unitText} numberOfLines={1}>
                    VND (₫) / kg
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeadingWithIcon}>
              <Icon name="support_agent" size={20} color={COLORS.secondary} />
              <ThemedText type="titleMd" style={styles.sectionTitle}>
                Hỗ trợ nông hộ & Khuyến nông
              </ThemedText>
            </View>
            <View style={styles.supportRows}>
              <SupportRow
                icon="call"
                title="Tổng đài khuyến nông miễn phí"
                description="1800 68xx (Nhánh 1)"
                accent
                onPress={() => void Linking.openURL('tel:18006800')}
              />
              <SupportRow
                icon="menu_book"
                title="Cẩm nang kỹ thuật canh tác vụ 2024"
                description="Phòng trị rệp sáp, mọt đục cành mùa mưa"
                onPress={showGuideFeedback}
              />
              <SupportRow
                icon="policy"
                title="Điều khoản bảo vệ giá sàn nông hộ"
                description="Hợp đồng mua bán minh bạch theo luật HTX"
                isLast
                onPress={showPolicyFeedback}
              />
            </View>
          </Card>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đăng xuất tài khoản"
              onPress={confirmLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
              <Icon name="logout" size={20} color={COLORS.error} />
              <ThemedText type="titleMd" style={styles.logoutText}>
                Đăng xuất tài khoản
              </ThemedText>
            </Pressable>
            <View style={styles.versionBlock}>
              <ThemedText type="bodySm" style={styles.versionText}>
                NôngSản Pro v2.4.1
              </ThemedText>
              <ThemedText type="labelSm" style={styles.legalText}>
                Bản chuẩn cho Nông hộ & Hợp tác xã Việt Nam
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function FarmStat({
  label,
  value,
  description,
  valueStyle,
}: {
  label: string;
  value: string;
  description: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.statCard}>
      <ThemedText type="labelSm" style={styles.statLabel} numberOfLines={1}>
        {label}
      </ThemedText>
      <ThemedText type={value === 'Cà & Tiêu' ? 'titleMd' : 'numericLg'} style={[styles.statValue, valueStyle]} numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText type="bodySm" style={styles.statDescription} numberOfLines={1}>
        {description}
      </ThemedText>
    </View>
  );
}

const cardShadow = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 1,
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  loadingScreen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  header: {
    zIndex: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    height: 64,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: Radius.base,
  },
  brandCopy: {
    flexShrink: 1,
    minWidth: 0,
  },
  brandTitle: {
    color: COLORS.primary,
    fontFamily: PROFILE_FONTS.manropeSemiBold,
    lineHeight: 20,
  },
  regionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minWidth: 0,
  },
  regionText: {
    color: COLORS.onSurfaceVariant,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.container,
    backgroundColor: COLORS.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  avatarButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.sheet,
  },
  titleRow: {
    minHeight: 28,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.half,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  screenTitle: {
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.manropeSemiBold,
  },
  onlineBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: COLORS.secondaryContainer,
  },
  onlineText: {
    color: COLORS.onSecondaryContainer,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: '100%',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  card: {
    width: '100%',
    borderRadius: Radius.container,
    padding: Spacing.three,
    backgroundColor: COLORS.surfaceLowest,
    ...cardShadow,
    gap: 12,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  profileAvatarWrap: {
    width: 80,
    height: 80,
    flexShrink: 0,
    position: 'relative',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.sheet,
    backgroundColor: COLORS.surfaceContainer,
  },
  verifiedBadge: {
    position: 'absolute',
    width: 24,
    height: 24,
    right: -2,
    bottom: -2,
    borderRadius: Radius.full,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  identityContent: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
  },
  identityName: {
    flex: 1,
    minWidth: 0,
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.manropeSemiBold,
  },
  nicknameBadge: {
    flexShrink: 0,
    maxWidth: 72,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: COLORS.surfaceContainer,
  },
  nicknameText: {
    color: COLORS.onSurfaceVariant,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  detailLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minWidth: 0,
  },
  detailText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.onSurfaceVariant,
    fontFamily: PROFILE_FONTS.publicSansRegular,
  },
  farmerIdPanel: {
    minHeight: 60,
    padding: 10,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  farmerIdCopy: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  mutedText: {
    color: COLORS.onSurfaceVariant,
    fontFamily: PROFILE_FONTS.publicSansRegular,
  },
  farmerId: {
    color: COLORS.primary,
    fontFamily: PROFILE_FONTS.publicSansBold,
  },
  verifiedChip: {
    maxWidth: '58%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: COLORS.secondaryContainer,
    flexShrink: 1,
  },
  verifiedText: {
    color: COLORS.onSecondaryContainer,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
    flexShrink: 1,
  },
  sectionCard: {
    gap: 12,
  },
  sectionHeader: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sectionHeadingWithIcon: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionTitle: {
    flexShrink: 1,
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  seasonLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  seasonText: {
    color: COLORS.secondary,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  statGrid: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  statLabel: {
    color: COLORS.onSurfaceVariant,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  statValue: {
    color: COLORS.primary,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  cropValue: {
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  secondaryValue: {
    color: COLORS.secondary,
  },
  statDescription: {
    color: COLORS.outline,
    fontFamily: PROFILE_FONTS.publicSansRegular,
  },
  changeButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  changeText: {
    color: COLORS.secondary,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  bankPanel: {
    padding: 12,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceLow,
    gap: Spacing.two,
  },
  bankTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  bankIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  bankIconWell: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: Radius.sheet,
    backgroundColor: COLORS.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  bankCopy: {
    flex: 1,
    minWidth: 0,
  },
  bankName: {
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  accountNumberChip: {
    flexShrink: 0,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceHighest,
  },
  accountNumber: {
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
    letterSpacing: 1,
  },
  linkedCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.base,
    backgroundColor: COLORS.gainContainer,
  },
  linkedText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.publicSansRegular,
  },
  linkedId: {
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  preferenceRows: {
    gap: 10,
  },
  preferenceRow: {
    minHeight: 68,
    padding: 10,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  preferenceCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: Spacing.one,
    gap: Spacing.half,
  },
  preferenceTitle: {
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  valueChip: {
    minHeight: 40,
    maxWidth: '44%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    flexShrink: 0,
  },
  primaryChipText: {
    color: COLORS.primary,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  unitText: {
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  switchHitbox: {
    minWidth: 48,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  switchTrack: {
    width: 44,
    height: 24,
    padding: 2,
    borderRadius: Radius.full,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: COLORS.secondary,
    alignItems: 'flex-end',
  },
  switchTrackOff: {
    backgroundColor: COLORS.surfaceHighest,
    alignItems: 'flex-start',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: COLORS.onPrimary,
    ...cardShadow,
  },
  supportRows: {
    width: '100%',
  },
  supportRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  supportRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  supportIconWell: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: Radius.sheet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  supportTitle: {
    color: COLORS.onSurface,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  supportDescription: {
    color: COLORS.onSurfaceVariant,
    fontFamily: PROFILE_FONTS.publicSansRegular,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.one,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  logoutButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: Radius.container,
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  logoutText: {
    color: COLORS.error,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
  },
  versionBlock: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  versionText: {
    color: COLORS.onSurfaceVariant,
    fontFamily: PROFILE_FONTS.publicSansMedium,
  },
  legalText: {
    color: COLORS.outline,
    fontFamily: PROFILE_FONTS.publicSansSemiBold,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
