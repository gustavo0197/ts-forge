import { describe, test, expect, vi, beforeEach } from "vitest";
import isResolverFnConfig from "@/utils/isResolverFnConfig";

describe("isResolverFnConfig", () => {
  test("If provided config is not an object, it should return false", () => {
    const values: any = [123, "something", null, undefined, true, false, Symbol("sym")];

    for (const value of values) {
      // All these values are not a valid object
      expect(isResolverFnConfig(value)).toBe(false);
    }
  });

  test("If provided config is an object but 'key' property is not a string, it should return false", () => {
    const values: any = [123, null, undefined, true, false, Symbol("sym"), {}, []];

    for (const value of values) {
      const config = { key: value };
      expect(isResolverFnConfig(config)).toBe(false);
    }
  });

  test("If provided config is an object with valid 'key' but invalid 'middlewares', it should return false", () => {
    const values: any = [123, "string", null, true, false, Symbol("sym"), {}];

    for (const value of values) {
      const config = { key: "validKey", middlewares: value };
      expect(isResolverFnConfig(config)).toBe(false);
    }
  });

  test("If provided config is an object with valid 'key' and 'middlewares' but invalid 'errorHandler', it should return false", () => {
    const values: any = [123, "string", null, true, false, Symbol("sym"), {}, []];

    for (const value of values) {
      const config = { key: "validKey", middlewares: [], errorHandler: value };
      expect(isResolverFnConfig(config)).toBe(false);
    }
  });

  test("If provided config is a valid ResolverFnConfig object, it should return true", () => {
    const validConfigs = [
      { key: "validKey" },
      { key: "validKey", middlewares: [] },
      { key: "validKey", errorHandler: vi.fn() },
      { key: "validKey", middlewares: [], errorHandler: vi.fn() }
    ];

    for (const config of validConfigs) {
      expect(isResolverFnConfig(config)).toBe(true);
    }
  });
});
