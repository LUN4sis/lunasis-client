import { act, renderHook } from '@testing-library/react';

import { useAnimatedSection } from '../use-animated-section';

// ─── Tests ────────────────────────────────────────────────────────────
describe('useAnimatedSection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with visible=false and exiting=false when show=false', () => {
    const { result } = renderHook(() => useAnimatedSection(false));

    expect(result.current.visible).toBe(false);
    expect(result.current.exiting).toBe(false);
  });

  it('starts with visible=true and exiting=false when show=true (rehydration)', () => {
    // On initial render with show=true, visible is initialized to true.
    // prev.current also starts as true, so neither transition branch fires.
    const { result } = renderHook(() => useAnimatedSection(true));

    expect(result.current.visible).toBe(true);
    expect(result.current.exiting).toBe(false);
  });

  it('sets visible=true when show transitions from false to true', () => {
    const { result, rerender } = renderHook(({ show }) => useAnimatedSection(show), {
      initialProps: { show: false },
    });

    rerender({ show: true });

    expect(result.current.visible).toBe(true);
    expect(result.current.exiting).toBe(false);
  });

  it('sets exiting=true immediately when show transitions from true to false', () => {
    const { result, rerender } = renderHook(({ show }) => useAnimatedSection(show), {
      initialProps: { show: false },
    });

    // First transition: false -> true
    rerender({ show: true });
    expect(result.current.visible).toBe(true);

    // Second transition: true -> false
    rerender({ show: false });
    expect(result.current.exiting).toBe(true);
    expect(result.current.visible).toBe(true); // Still visible during exit animation
  });

  it('sets visible=false after exitDuration when show transitions to false', () => {
    const { result, rerender } = renderHook(({ show }) => useAnimatedSection(show, 300), {
      initialProps: { show: false },
    });

    rerender({ show: true });
    rerender({ show: false });

    // Before timeout
    expect(result.current.visible).toBe(true);

    // After timeout
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.visible).toBe(false);
    expect(result.current.exiting).toBe(true);
  });

  it('uses default exitDuration of 200ms', () => {
    const { result, rerender } = renderHook(({ show }) => useAnimatedSection(show), {
      initialProps: { show: false },
    });

    rerender({ show: true });
    rerender({ show: false });

    // Before default timeout
    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(result.current.visible).toBe(true);

    // At default timeout
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.visible).toBe(false);
  });

  it('clears timeout on unmount to prevent memory leaks', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { rerender, unmount } = renderHook(({ show }) => useAnimatedSection(show), {
      initialProps: { show: false },
    });

    rerender({ show: true });
    rerender({ show: false });

    unmount();

    // clearTimeout should have been called during cleanup
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('cancels pending exit when show transitions back to true', () => {
    const { result, rerender } = renderHook(({ show }) => useAnimatedSection(show), {
      initialProps: { show: false },
    });

    // false -> true
    rerender({ show: true });
    expect(result.current.visible).toBe(true);

    // true -> false (starts exit)
    rerender({ show: false });
    expect(result.current.exiting).toBe(true);

    // false -> true again (cancels exit)
    rerender({ show: true });
    expect(result.current.visible).toBe(true);
    expect(result.current.exiting).toBe(false);

    // Advance past exit duration - should still be visible
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.visible).toBe(true);
  });
});
