import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRevenueSplit,
  canUnlockChapter,
  processChapterUnlock,
  formatNGN,
  calculateReadingTimeMinutes,
} from './monetization';

test('calculateRevenueSplit accurately computes 15% platform fee and 85% author net', () => {
  const result = calculateRevenueSplit(200);
  assert.equal(result.grossAmount, 200);
  assert.equal(result.platformFee, 30);
  assert.equal(result.authorNet, 170);
  assert.equal(result.platformFee + result.authorNet, 200);
});

test('calculateRevenueSplit handles fractional amounts cleanly', () => {
  const result = calculateRevenueSplit(150);
  assert.equal(result.platformFee, 22.5);
  assert.equal(result.authorNet, 127.5);
});

test('canUnlockChapter checks wallet balance against chapter cost', () => {
  assert.equal(canUnlockChapter(500, 200), true);
  assert.equal(canUnlockChapter(200, 200), true);
  assert.equal(canUnlockChapter(150, 200), false);
  assert.equal(canUnlockChapter(0, 0), true); // Free chapter
});

test('processChapterUnlock deducts price for premium chapters', () => {
  const chapter = { id: 'ch-3', priceNGN: 200, isPremium: true };
  const outcome = processChapterUnlock(1000, chapter);

  assert.equal(outcome.success, true);
  assert.equal(outcome.newBalance, 800);
});

test('processChapterUnlock rejects when balance is insufficient', () => {
  const chapter = { id: 'ch-3', priceNGN: 200, isPremium: true };
  const outcome = processChapterUnlock(100, chapter);

  assert.equal(outcome.success, false);
  assert.equal(outcome.newBalance, 100);
  assert.match(outcome.error ?? '', /Insufficient wallet balance/);
});

test('calculateReadingTimeMinutes returns at least 1 minute', () => {
  assert.equal(calculateReadingTimeMinutes(0), 1);
  assert.equal(calculateReadingTimeMinutes(150), 1);
  assert.equal(calculateReadingTimeMinutes(450, 200), 3);
});

test('formatNGN formats currency numbers properly', () => {
  const formatted = formatNGN(1500);
  assert.ok(formatted.includes('1,500') || formatted.includes('1500'));
});
