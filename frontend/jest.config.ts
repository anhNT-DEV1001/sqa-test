import type { Config } from 'jest'

const config: Config = {
  // Use ts-jest to handle TypeScript files directly
  preset: 'ts-jest',

  // Simulate browser environment for DOM APIs (localStorage, document, etc.)
  testEnvironment: 'jsdom',

  // Root directory for test file discovery
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],

  // Match test files following the naming convention *.test.ts(x)
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],

  // Map the @/* path alias used throughout the project to src/*
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Setup files to run after Jest is initialized (extends expect matchers)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Transform TypeScript files with ts-jest using the project's tsconfig
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        // Disable type-checking in tests for speed — we rely on IDE/CI tsc
        diagnostics: false
      }
    ]
  },

  // File extensions Jest should resolve when importing modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/services/utils/**/*.ts',
    'src/services/helper.ts',
    'src/utils/**/*.ts',
    'src/stores/**/*.ts',
    'src/hooks/**/*.ts',
    'src/middleware.ts',
    'src/services/api/**/*.ts',
    // Exclude re-export index files and type-only files
    '!src/**/index.ts',
    '!src/**/types/**',
    '!src/**/*.d.ts'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 40,
      lines: 50,
      statements: 50
    }
  }
}

export default config
