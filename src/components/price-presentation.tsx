import type { ReactNode } from 'react';

import { ThemedText, type ThemedTextProps } from '@/components/themed-text';
import type { Unit } from '@/types/domain';

export type PriceTrendDirection = 'flat' | 'up' | 'down';

export function getPriceTrendDirection(changePercent?: number): PriceTrendDirection {
  if (changePercent == null || changePercent === 0) return 'flat';
  return changePercent > 0 ? 'up' : 'down';
}

export function formatPriceAmount(amount: number, locale = 'vi-VN'): string {
  return amount.toLocaleString(locale);
}

type PriceAmountProps = {
  amount: number;
  locale?: string;
  unit?: Unit;
  amountStyle?: ThemedTextProps['style'];
  unitStyle?: ThemedTextProps['style'];
  unitThemeColor?: ThemedTextProps['themeColor'];
};

/** Layout-neutral price fragments for rows that supply their own container. */
export function PriceAmount({
  amount,
  locale,
  unit,
  amountStyle,
  unitStyle,
  unitThemeColor = 'textSecondary',
}: PriceAmountProps) {
  return (
    <>
      <ThemedText type="numericLg" style={amountStyle}>
        {formatPriceAmount(amount, locale)}
      </ThemedText>
      {unit && (
        <ThemedText type="bodySm" themeColor={unitThemeColor} style={unitStyle}>
          {' '}
          ₫/{unit}
        </ThemedText>
      )}
    </>
  );
}

type PriceChangePercentProps = Omit<ThemedTextProps, 'children'> & {
  changePercent?: number;
  flatLabel: string;
  suffix?: ReactNode;
};

/** Shared signed-percent presentation; callers retain control of layout and context text. */
export function PriceChangePercent({
  changePercent,
  flatLabel,
  suffix,
  type = 'labelSm',
  ...textProps
}: PriceChangePercentProps) {
  const direction = getPriceTrendDirection(changePercent);
  const label =
    direction === 'flat' ? flatLabel : `${direction === 'up' ? '+' : ''}${changePercent!.toFixed(1)}%`;

  return (
    <ThemedText type={type} {...textProps}>
      {label}
      {direction !== 'flat' && suffix}
    </ThemedText>
  );
}
