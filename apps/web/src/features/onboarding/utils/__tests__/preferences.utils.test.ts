import { toggle, toOptions } from '../preferences.utils';

// ─── toOptions ────────────────────────────────────────────────────────
describe('toOptions', () => {
  it('converts items with id/label to key/display format', () => {
    const items = [
      { id: 'A', label: 'Alpha' },
      { id: 'B', label: 'Beta' },
    ];

    expect(toOptions(items)).toEqual([
      { key: 'A', display: 'Alpha' },
      { key: 'B', display: 'Beta' },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(toOptions([])).toEqual([]);
  });

  it('preserves order of items', () => {
    const items = [
      { id: 'C', label: 'Charlie' },
      { id: 'A', label: 'Alpha' },
      { id: 'B', label: 'Beta' },
    ];

    const result = toOptions(items);
    expect(result.map((o) => o.key)).toEqual(['C', 'A', 'B']);
  });

  it('handles items with special characters in label', () => {
    const items = [{ id: 'SPECIAL', label: '여성 의학 궁금증 해결' }];
    const result = toOptions(items);
    expect(result[0].display).toBe('여성 의학 궁금증 해결');
  });

  it('does not mutate the original array', () => {
    const items = [{ id: 'A', label: 'Alpha' }];
    const original = [...items];
    toOptions(items);
    expect(items).toEqual(original);
  });
});

// ─── toggle ───────────────────────────────────────────────────────────
describe('toggle', () => {
  it('appends value when not present', () => {
    expect(toggle([], 'A')).toEqual(['A']);
    expect(toggle(['B'], 'A')).toEqual(['B', 'A']);
  });

  it('removes value when already present', () => {
    expect(toggle(['A', 'B'], 'A')).toEqual(['B']);
    expect(toggle(['A'], 'A')).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const original = ['A', 'B'];
    const copy = [...original];
    toggle(original, 'A');
    expect(original).toEqual(copy);
  });

  it('handles duplicate values in source array (removes all matches)', () => {
    // filter removes all matching values
    expect(toggle(['A', 'A', 'B'], 'A')).toEqual(['B']);
  });

  it('handles empty string value', () => {
    expect(toggle([], '')).toEqual(['']);
    expect(toggle([''], '')).toEqual([]);
  });

  it('is idempotent - toggling twice returns original', () => {
    const arr = ['A', 'B'];
    const afterAdd = toggle(arr, 'C');
    const afterRemove = toggle(afterAdd, 'C');
    expect(afterRemove).toEqual(arr);
  });
});
