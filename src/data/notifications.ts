import type { IconName } from '@/screens/home-dashboard/icons';

export type NotificationCategory = 'price' | 'buyer' | 'system';

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  label: string;
  time: string;
  title: string;
  body: string;
  metric?: string;
  metricIcon?: IconName;
  verified?: string;
  status?: string;
  actions?: readonly string[];
  unread: boolean;
};

export const NOTIFICATIONS: readonly NotificationItem[] = [
  {
    id: 'urgent-price',
    category: 'price',
    icon: 'trending_up',
    iconBackground: '#AEEECB',
    iconColor: '#316E52',
    label: 'BIẾN ĐỘNG KHẨN CẤP',
    time: '15 phút trước',
    title: 'Cà phê Robusta đạt đỉnh mới 118,500 ₫/kg!',
    body: 'Giá tăng +3,200 ₫ so với hôm qua tại Đắk Lắk. Kho dự trữ 2,500 kg của nhà bạn tăng giá trị ước tính thêm:',
    metric: 'Lợi nhuận gia tăng: +8,000,000 ₫',
    metricIcon: 'trending_up',
    actions: ['Xem chi tiết giá sàn'],
    unread: true,
  },
  {
    id: 'buyer-inquiry',
    category: 'buyer',
    icon: 'handshake',
    iconBackground: '#FFDCC3',
    iconColor: '#2F1500',
    label: 'THƯƠNG LÁI HỎI MUA',
    time: '45 phút trước',
    title: 'Đại lý Toàn Thắng gửi báo giá thu mua',
    body: 'Đề nghị mua 2,000 kg (2 tấn) Robusta với đơn giá 119,200 ₫/kg. Xe tải bốc trực tiếp tại vườn.',
    verified: 'Đại lý Toàn Thắng • Đã xác minh uy tín • Trả tiền mặt ngay',
    actions: ['Xem đề nghị', 'Liên hệ ngay'],
    unread: true,
  },
  {
    id: 'payment-complete',
    category: 'system',
    icon: 'receipt_long',
    iconBackground: '#E5E9E4',
    iconColor: '#414844',
    label: 'THANH TOÁN HOÀN TẤT',
    time: '2 giờ trước',
    title: 'Đã nhận thanh toán 142,200,000 ₫',
    body: 'Giao dịch bán 1,200 kg cà phê cho Đại lý Toàn Thắng đã khớp lệnh thành công vào tài khoản Vietcombank (*4821). Mã GD: #TX-984218',
    status: 'Thành công',
    unread: false,
  },
  {
    id: 'storage-warning',
    category: 'system',
    icon: 'water_drop',
    iconBackground: '#FFDAD6',
    iconColor: '#93000A',
    label: 'CẢNH BÁO KHO BÃI',
    time: '1 ngày trước',
    title: 'Cảnh báo độ ẩm sau mưa bão',
    body: 'Độ ẩm không khí tại trạm Krông Búk đang vượt 88%. Nguy cơ cà phê hút ẩm lại làm giảm chuẩn chất lượng xuất khẩu. Hãy kiểm tra bạt phủ và chạy máy quạt sấy.',
    metric: 'Độ ẩm mục tiêu: <14.5% · Hiện tại: 16.2%',
    metricIcon: 'water_drop',
    unread: false,
  },
];
