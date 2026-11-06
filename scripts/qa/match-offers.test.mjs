import assert from 'node:assert/strict';
import { test } from 'node:test';

import { rankOffers } from '../../src/screens/match/offers.ts';

const now = new Date('2026-11-06T00:00:00Z');
const buyers = [
  { id: 'b1', name: 'A', commodities: ['coffee'], verified: true },
  { id: 'b2', name: 'B', commodities: ['coffee', 'pepper'], verified: false },
  { id: 'b3', name: 'C', commodities: ['rubber'], verified: true },
];
const intent = { commodity: 'coffee', quantity: 1000 };

test('only buyers of the commodity, best price first, with the estimated value', () => {
  const observations = [
    { buyerId: 'b1', commodity: 'coffee', pricePerUnit: 114000 },
    { buyerId: 'b2', commodity: 'coffee', pricePerUnit: 118000 },
  ];
  const offers = rankOffers(intent, buyers, observations, [], now);
  assert.deepEqual(offers.map((o) => o.buyer.id), ['b2', 'b1']);
  assert.equal(offers[0].estimatedValue, 118000 * 1000);
});

test('a buyer with no quote and no post is skipped', () => {
  assert.deepEqual(rankOffers(intent, buyers, [], [], now), []);
});

test('an open buying post is used when there is no quote', () => {
  const demands = [{ buyerId: 'b1', commodity: 'coffee', pricePerUnit: 116000, unit: 'kg', remainingQuantity: 500 }];
  const offers = rankOffers(intent, buyers, [], demands, now);
  assert.equal(offers.length, 1);
  assert.equal(offers[0].price, 116000);
  assert.equal(offers[0].demand.remainingQuantity, 500);
});

test('a quote wins over a post', () => {
  const observations = [{ buyerId: 'b1', commodity: 'coffee', pricePerUnit: 114500 }];
  const demands = [{ buyerId: 'b1', commodity: 'coffee', pricePerUnit: 116000, unit: 'kg' }];
  assert.equal(rankOffers(intent, buyers, observations, demands, now)[0].price, 114500);
});

test('an expired or used up post is ignored', () => {
  const expired = { buyerId: 'b1', commodity: 'coffee', pricePerUnit: 116000, unit: 'kg', periodEnd: '2026-09-15T00:00:00Z' };
  const usedUp = { buyerId: 'b2', commodity: 'coffee', pricePerUnit: 117000, unit: 'kg', remainingQuantity: 0 };
  assert.deepEqual(rankOffers(intent, buyers, [], [expired, usedUp], now), []);
});
