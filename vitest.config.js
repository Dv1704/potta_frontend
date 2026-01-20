import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/game-engine/__tests__/setup.js'],
        globals: true,
    },
});
