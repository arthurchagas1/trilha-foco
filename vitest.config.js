import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      thresholds: { lines: 80, statements: 80, branches: 80, functions: 80 },
    },
  },
})
