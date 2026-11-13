module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/helpers/env.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/helpers/db.js"],
  testTimeout: 30000,
};
