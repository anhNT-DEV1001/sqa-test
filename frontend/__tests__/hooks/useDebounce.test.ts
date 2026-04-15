/**
 * ============================================================================
 * UNIT TESTS: useDebounce Hook (hooks/useDebounce.ts)
 * ============================================================================
 * File under test: src/hooks/useDebounce.ts
 *
 * Tests for the useDebounce custom hook which delays updating a value
 * until a specified time has passed since the last change. Uses
 * jest.useFakeTimers() to control the setTimeout behavior.
 *
 * Mocking Strategy:
 * - jest.useFakeTimers() to control setTimeout/clearTimeout
 * ============================================================================
 */

import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

// Use fake timers for all tests in this suite
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

// ===========================================================================
// 1. Initial Value — Giá trị ban đầu
// ===========================================================================
describe('useDebounce - Initial Value', () => {
  // Test Case ID: TC_DEBOUNCE_01
  it('should_ReturnInitialValue_Immediately_When_HookFirstRenders', () => {
    // Arrange & Act
    const { result } = renderHook(() => useDebounce('hello', 500))

    // Assert — Should return the initial value right away
    expect(result.current).toBe('hello')
  })

  // Test Case ID: TC_DEBOUNCE_02
  it('should_ReturnInitialValue_ForNumericInput', () => {
    const { result } = renderHook(() => useDebounce(42, 300))

    expect(result.current).toBe(42)
  })
})

// ===========================================================================
// 2. Debounce Behavior — Trì hoãn cập nhật giá trị
// ===========================================================================
describe('useDebounce - Debounce Behavior', () => {
  // Test Case ID: TC_DEBOUNCE_03
  it('should_NotUpdateValue_Before_DelayExpires', () => {
    // Arrange — Start with 'initial'
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Act — Change the value
    rerender({ value: 'updated', delay: 500 })

    // Assert — Value should NOT have changed yet (only 0ms passed)
    expect(result.current).toBe('initial')

    // Advance time partially (not enough)
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Assert — Still should be the old value (300ms < 500ms delay)
    expect(result.current).toBe('initial')
  })

  // Test Case ID: TC_DEBOUNCE_04
  it('should_UpdateValue_After_DelayExpires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Act — Change value and wait full delay
    rerender({ value: 'updated', delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Assert — Value should now be updated
    expect(result.current).toBe('updated')
  })

  // Test Case ID: TC_DEBOUNCE_05
  it('should_ResetTimer_When_ValueChangesBeforeDelayExpires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    )

    // Act — Change value at t=0
    rerender({ value: 'second', delay: 500 })

    // Advance 300ms (not yet expired)
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Change again at t=300ms — this should reset the timer
    rerender({ value: 'third', delay: 500 })

    // Advance another 300ms (total 600ms, but timer was reset at 300ms)
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Assert — Should still be 'first' because new timer hasn't expired
    expect(result.current).toBe('first')

    // Advance remaining 200ms (total 500ms since last change)
    act(() => {
      jest.advanceTimersByTime(200)
    })

    // Assert — Now should show the latest value 'third'
    expect(result.current).toBe('third')
  })
})

// ===========================================================================
// 3. Cleanup — Timer cleanup khi unmount
// ===========================================================================
describe('useDebounce - Cleanup', () => {
  // Test Case ID: TC_DEBOUNCE_06
  it('should_ClearTimeout_When_ComponentUnmounts', () => {
    // Spy on clearTimeout to verify cleanup
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 500 } }
    )

    // Trigger a rerender to create a pending timer
    rerender({ value: 'changed', delay: 500 })

    // Act — Unmount the hook
    unmount()

    // Assert — clearTimeout should have been called (cleanup)
    expect(clearTimeoutSpy).toHaveBeenCalled()

    clearTimeoutSpy.mockRestore()
  })

  // Test Case ID: TC_DEBOUNCE_07
  it('should_HandleZeroDelay_Correctly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'start', delay: 0 } }
    )

    rerender({ value: 'instant', delay: 0 })

    // Even with 0ms delay, setTimeout(fn, 0) defers to next tick
    act(() => {
      jest.advanceTimersByTime(0)
    })

    expect(result.current).toBe('instant')
  })
})
