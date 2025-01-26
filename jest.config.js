module.exports = {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["**/?(*.)+(spec|test).ts"],
  setupFiles: ["./jest.setup.js"], 
  transformIgnorePatterns: [
    "/node_modules/(?!nanoid|shortid)/",  
  ],
};
