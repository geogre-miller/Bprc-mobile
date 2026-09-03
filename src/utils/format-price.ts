import type { Unit } from '@/types/domain';

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}₫`;
}

export function formatPricePerUnit(amount: number, unit: Unit): string {
  return `${formatVnd(amount)}/${unit}`;
}
