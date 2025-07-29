import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        globals: true, // allows us to use vitest library methods in unit test without explicit imports
        environment: 'jsdom',
        setupFiles: './tests/setup.ts', // path to setup file
    },
});
