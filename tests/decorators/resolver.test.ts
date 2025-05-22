import { describe, test, expect } from "vitest";
import { Resolver } from "@/decorators/resolver";
import { ResolverConfig } from "@/types";
import _ from "@/constants";

describe("@Resolver()", () => {
  test("Config must be empty if @Resolver was called without arguments", () => {
    @Resolver()
    class TestResolver {}

    const instance: TestResolver = new TestResolver();
    const config = instance[_.RESOLVER_CONFIG];

    expect(config).toEqual({});
  });

  test("Config must be empty if @Resolver was called with empty object", () => {
    @Resolver({})
    class TestResolver {}

    const instance: TestResolver = new TestResolver();
    const config = instance[_.RESOLVER_CONFIG];

    expect(config).toEqual({});
  });

  test("Config must have middlewares if @Resolver was called with middlewares", () => {
    const middlewares: ResolverConfig["middlewares"] = [
      () => {
        console.log("Middleware 1");
      },
      () => {
        console.log("Middleware 2");
      }
    ];

    @Resolver({ middlewares })
    class TestResolver {}

    const instance: TestResolver = new TestResolver();
    const config = instance[_.RESOLVER_CONFIG];

    expect(config).toEqual({ middlewares });
  });

  test("Config must have errorHandler if @Resolver was called with errorHandler", () => {
    const errorHandler = () => {
      console.log("Error handler");
    };

    @Resolver({ errorHandler })
    class TestResolver {}

    const instance: TestResolver = new TestResolver();
    const config = instance[_.RESOLVER_CONFIG];

    expect(config).toEqual({ errorHandler });
  });

  test("Config must have middlewares and errorHandler if @Resolver was called with both", () => {
    const middlewares: ResolverConfig["middlewares"] = [
      () => {
        console.log("Middleware 1");
      },
      () => {
        console.log("Middleware 2");
      }
    ];

    const errorHandler: ResolverConfig["errorHandler"] = () => {
      console.log("Error handler");
    };

    @Resolver({ middlewares, errorHandler })
    class TestResolver {}

    const instance: TestResolver = new TestResolver();
    const config = instance[_.RESOLVER_CONFIG];

    expect(config).toEqual({ middlewares, errorHandler });
  });
});
