import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['server/tests/**/*.test.js', 'client/src/**/*.test.{js,jsx}'],
    setupFiles: ['./client/src/tests/setup.js'],
    clearMocks: true,
    restoreMocks: true
  }
});
