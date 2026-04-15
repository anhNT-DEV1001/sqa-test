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
