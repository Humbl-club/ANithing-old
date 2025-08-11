import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'tests/**/*.{test,unit}.ts'
    ],
    exclude: [
      // Exclude Playwright specs and any e2e-style specs from Vitest collection
      'tests/**/*.spec.ts',
      'tests/**/?(*.)+(spec|e2e).[jt]s?(x)',
      'e2e/**',
      '**/node_modules/**',
      '**/dist/**'
    ],
    environment: 'node',
    testTimeout: 20000
  }
});
