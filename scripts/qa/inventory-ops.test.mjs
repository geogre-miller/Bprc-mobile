import assert from 'node:assert/strict';
import { test } from 'node:test';

import { addStock, parseAmount, removeStock, setStock } from '../../src/screens/inventory/inventory-ops.ts';

test('adding a new commodity appends a row', () => {
  const next = addStock([], { commodity: 'coffee', quantity: 500, unitCost: 78000 });
  assert.deepEqual(next, [{ commodity: 'coffee', quantity: 500, unit: 'kg', unitCost: 78000 }]);
});

test('adding a held commodity merges quantity and averages cost by weight', () => {
  const start = [{ commodity: 'coffee' , quantity: 1000, unit: 'kg' , unitCost: 70000 }];
  const next = addStock(start, { commodity: 'coffee', quantity: 1000, unitCost: 80000 });
  assert.equal(next.length, 1);
  assert.equal(next[0].quantity, 2000);
  assert.equal(next[0].unitCost, 75000);
});

test('a missing cost keeps the known one', () => {
  const start = [{ commodity: 'pepper' , quantity: 100, unit: 'kg' , unitCost: 110000 }];
  assert.equal(addStock(start, { commodity: 'pepper', quantity: 100 })[0].unitCost, 110000);
  const noCost = [{ commodity: 'pepper' , quantity: 100, unit: 'kg'  }];
  assert.equal(addStock(noCost, { commodity: 'pepper', quantity: 100, unitCost: 90000 })[0].unitCost, 90000);
});

test('setStock replaces and removeStock deletes by index', () => {
  const items = [
    { commodity: 'coffee' , quantity: 10, unit: 'kg'  },
    { commodity: 'pepper' , quantity: 20, unit: 'kg'  },
  ];
  assert.equal(setStock(items, 1, { quantity: 5, unitCost: 1 })[1].quantity, 5);
  assert.deepEqual(removeStock(items, 0).map((item) => item.commodity), ['pepper']);
});

test('parseAmount accepts grouped digits and rejects junk', () => {
  assert.equal(parseAmount('1,200'), 1200);
  assert.equal(parseAmount(''), undefined);
  assert.ok(Number.isNaN(parseAmount('12a')));
  assert.ok(Number.isNaN(parseAmount('-5')));
});
