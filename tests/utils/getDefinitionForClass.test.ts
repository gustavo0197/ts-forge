import { describe, test, expect, vi, beforeEach } from "vitest";
import { ResolverFn, Resolver, getDefinitionsForClass } from "@/index";
import { ResolverClassConfig } from "@/types";
import _ from "@/constants";

const middlewares = [vi.fn(), vi.fn()];

@Resolver()
class TestResolver {
  @ResolverFn("testFunction")
  async testFunction() {
    return { message: "Hello, World!" };
  }
}

@Resolver()
class HelloResolver {
  @ResolverFn("helloFn")
  async helloFn() {
    return { message: "Hello resolver" };
  }
}

describe("getDefinitionsForClass()", () => {
  beforeEach(() => {
    middlewares.forEach((m) => m.mockReset());
  });

  test("If middlewares is not an array should throw an error");

  test("Class should have middlewares array if it is provided", async () => {
    const testResolver = new TestResolver();
    const helloResolver = new HelloResolver();
    const resolvers = [testResolver, helloResolver];

    getDefinitionsForClass({ resolvers, middlewares });

    for (const resolver of resolvers) {
      const config: ResolverClassConfig = resolver[_.RESOLVER_CONFIG];

      expect(config).toEqual({
        globalMiddlewares: middlewares,
        middlewares: [],
        errorHandler: undefined,
        globalErrorHandler: undefined
      });
    }
  });

  test("If middlewares are provided all of them must be a function", () => {
    const testResolver = new TestResolver();
    const resolvers = [testResolver];

    const fn = () => {
      getDefinitionsForClass({
        resolvers,
        middlewares: [() => {}, "not a function"]
      });
    };

    expect(fn).toThrow("All middlewares must be functions");
  });

  test("If error handler is not a function it should throw an error", () => {
    const testResolver = new TestResolver();
    const resolvers = [testResolver];

    const fn = () => {
      getDefinitionsForClass({
        resolvers,
        middlewares,
        errorHandler: 12
      });
    };

    expect(fn).toThrow("Error handler must be a function");
  });

  test("If a error handler is provided in getDefinitionForClass config, it should be in the resolver config", () => {
    const testResolver = new TestResolver();
    const resolvers = [testResolver];
    const errorHandler = vi.fn();

    getDefinitionsForClass({
      resolvers,
      middlewares,
      errorHandler
    });

    const config: ResolverClassConfig = testResolver[_.RESOLVER_CONFIG];

    expect(config.globalErrorHandler).toEqual(errorHandler);
  });

  test("If 2 or more instances of the same resolver are passed to several getDefinitionsForClass() fn calls, error handler must not be overwritten", async () => {});

  test("If 2 or more instances of the same resolver are passed to several getDefinitionsForClass() fn calls, middlewares must not be overwritten", async () => {});
});
