import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import mapListPlugin from './plugins/mapListPlugin'

export default defineConfig({
  plugins: [react(), mapListPlugin()],
  server: {
    port: 5122,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
    },
  },
})
