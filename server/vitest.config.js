import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 30000,
    hookTimeout: 120000,
    setupFiles: ['./tests/setup.js'],
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test_jwt_secret_that_is_definitely_long_enough',
      COOKIE_SECRET: 'test_cookie_secret_value',
      CLIENT_ORIGIN: 'http://localhost:5173',
    },
  },
});
