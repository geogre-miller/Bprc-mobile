import assert from 'node:assert/strict';
import { test } from 'node:test';

import { freshnessMessage } from '../../src/screens/home-dashboard/freshness.ts';

test('no label means no price data', () => {
  assert.equal(freshnessMessage(undefined, false), 'Chưa có dữ liệu giá');
  assert.equal(freshnessMessage(undefined, true), 'Chưa có dữ liệu giá');
});

test('fresh prices show the update time', () => {
  assert.equal(freshnessMessage('10 phút trước', false), 'Giá cập nhật 10 phút trước');
});

test('stale prices say so, give the last time, and tell the farmer to call before selling', () => {
  const message = freshnessMessage('64 ngày trước', true);
  assert.match(message, /chưa cập nhật hôm nay/);
  assert.match(message, /64 ngày trước/);
  assert.match(message, /gọi đầu mối/);
});

test('stale copy never offers a region change that does not exist', () => {
  assert.doesNotMatch(freshnessMessage('1 ngày trước', true), /Đổi vùng/);
});
