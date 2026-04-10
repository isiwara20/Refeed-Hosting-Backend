export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["**/test-*/**/*.test.js", "**/tests-*/**/*.test.js"],
};
