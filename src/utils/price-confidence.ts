import type { Confidence } from '@/types/domain';

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: 'Độ tin cậy cao',
  recently_verified: 'Vừa xác nhận',
  should_confirm: 'Nên xác nhận lại',
  outdated: 'Giá cũ',
};
