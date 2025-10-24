import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      'next/navigation': path.resolve(__dirname, './__mocks__/next-navigation.ts'),
      'next-intl/navigation': path.resolve(__dirname, './__mocks__/next-intl-navigation.ts')
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest-setup.ts",
    mockReset: true,
    restoreMocks: true,
    coverage: {
      reporter: ["text"]
    }
  },
})