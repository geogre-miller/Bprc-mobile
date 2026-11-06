/**
 * The sentence under Home's top bar about how fresh the prices are. Stale prices are called out
 * and never shown as current. Pure on purpose, so `npm test` can load it.
 */
export function freshnessMessage(updatedLabel: string | undefined, stale: boolean): string {
  if (!updatedLabel) return 'Chưa có dữ liệu giá';
  if (stale) return `Giá chưa cập nhật hôm nay (lần cuối ${updatedLabel}). Hãy gọi đầu mối hỏi giá trước khi bán.`;
  return `Giá cập nhật ${updatedLabel}`;
}
