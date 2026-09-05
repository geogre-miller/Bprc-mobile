import type { Unit } from '@/types/domain';

/** Bare grouped digits, for layouts that render the ₫ symbol as its own element. */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('vi-VN');
}

/** DESIGN.md: the currency symbol follows the value after a non-breaking space. */
export function formatVnd(amount: number): string {
  return `${formatAmount(amount)} ₫`;
}

export function formatPricePerUnit(amount: number, unit: Unit): string {
  return `${formatVnd(amount)}/${unit}`;
}
