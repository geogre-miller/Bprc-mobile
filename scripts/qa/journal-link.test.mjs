import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildJournalHref, readJournalPrefill } from '../../src/screens/selling-journal/journal-link.ts';

test('build keeps only valid fields and stringifies numbers', () => {
  const href = buildJournalHref({
    commodity: 'coffee',
    stock: 1400,
    price: 114500,
    unitCost: 78000,
    weight: 500,
    buyerId: 'b1',
    buyerName: '  Đại lý Toàn Thắng ',
  });
  assert.equal(href.pathname, '/journal');
  assert.deepEqual(href.params, {
    commodity: 'coffee',
    stock: '1400',
    price: '114500',
    unitCost: '78000',
    weight: '500',
    buyerId: 'b1',
    buyerName: 'Đại lý Toàn Thắng',
  });
});

test('build drops NaN, negative, zero price and zero weight', () => {
  const { params } = buildJournalHref({ commodity: 'pepper', stock: -1, price: 0, unitCost: Number.NaN, weight: 0 });
  assert.deepEqual(params, { commodity: 'pepper' });
});

test('a buyer without a name or an id is left out entirely', () => {
  assert.deepEqual(buildJournalHref({ buyerId: 'b1' }).params, {});
  assert.deepEqual(buildJournalHref({ buyerName: 'X' }).params, {});
  assert.deepEqual(buildJournalHref({ buyerId: 'b1', buyerName: '   ' }).params, {});
});

test('read round trips what build produced', () => {
  const link = { commodity: 'coffee', stock: 10, price: 119200, unitCost: 78000, weight: 2000, buyerId: 'b1', buyerName: 'A' };
  const read = readJournalPrefill(buildJournalHref(link).params);
  assert.deepEqual(read, {
    commodity: 'coffee',
    stock: 10,
    price: 119200,
    unitCost: 78000,
    weight: 2000,
    buyer: { id: 'b1', name: 'A' },
  });
});

test('read ignores junk, empty strings and array values', () => {
  const read = readJournalPrefill({ commodity: '', stock: 'abc', price: '-5', weight: '0', buyerId: ['b1'], buyerName: 'A' });
  assert.deepEqual(read, {
    commodity: undefined,
    stock: undefined,
    price: undefined,
    unitCost: undefined,
    weight: undefined,
    buyer: undefined,
  });
});
