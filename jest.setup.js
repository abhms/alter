global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;


jest.mock("shortid", () => ({
  generate: () => "mocked-id",
}));

jest.mock("nanoid", () => ({
  nanoid: () => "mocked-nanoid-id",
}));
