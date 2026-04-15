/**
 * Jest Setup File
 * ================
 * This file runs after the test framework is installed in the environment
 * but before any test suites are executed.
 *
 * Purpose:
 * - Extend Jest expect with DOM-specific matchers (toBeInTheDocument, etc.)
 * - Set up global mocks shared across all test suites
 */

import '@testing-library/jest-dom'

// Mock Hardware APIs
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
  writable: true,
});

// Mock HTMLMediaElement methods that are not implemented in JSDOM
window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();

// Mock Image loading (JSDOM doesn't load images, so onload never fires)
Object.defineProperty(global.Image.prototype, 'src', {
  set(src) {
    if (src) {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 0);
    }
  },
});
