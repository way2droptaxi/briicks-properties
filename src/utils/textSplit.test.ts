import test from 'node:test';
import assert from 'node:assert/strict';
import { splitHeadingSegments } from './textSplit';

test('splitHeadingSegments preserves words, characters, and accent classes', () => {
  const tokens = splitHeadingSegments([
    { text: 'Constructing ' },
    { text: 'Your Future', className: 'text-[#F05228]' },
    { text: ' With Care' },
  ]);

  assert.equal(tokens.length, 5);
  assert.deepEqual(tokens[0], {
    word: 'Constructing',
    chars: ['C', 'o', 'n', 's', 't', 'r', 'u', 'c', 't', 'i', 'n', 'g'],
    className: undefined,
    hasTrailingSpace: true,
  });
  assert.equal(tokens[1].word, 'Your');
  assert.equal(tokens[1].className, 'text-[#F05228]');
  assert.equal(tokens[1].hasTrailingSpace, true);
  assert.equal(tokens[2].word, 'Future');
  assert.equal(tokens[2].className, 'text-[#F05228]');
  assert.equal(tokens[2].hasTrailingSpace, true);
  assert.equal(tokens[4].word, 'Care');
  assert.equal(tokens[4].hasTrailingSpace, false);
});

test('splitHeadingSegments handles ₹ currency symbols and slashes cleanly', () => {
  const tokens = splitHeadingSegments([
    { text: 'Starts From ' },
    { text: '₹2,350', className: 'text-[#D43F17]' },
    { text: ' / sq.ft' },
  ]);

  assert.equal(tokens.map((t) => t.word).join(' '), 'Starts From ₹2,350 / sq.ft');
  assert.equal(tokens[2].chars[0], '₹');
  assert.equal(tokens[2].className, 'text-[#D43F17]');
});
