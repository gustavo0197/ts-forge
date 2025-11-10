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

  test("If middlewares is not an array should throw an error", () => {
    const errorMessage: string = "Middlewares must be an array";
    const testResolver = new TestResolver();
    const resolvers = [testResolver];

    const fn = () => {
      getDefinitionsForClass({
        resolvers,
        middlewares: "not an array"
      });
    };

    expect(fn).toThrow(errorMessage);
  });

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

  test("If 2 or more instances of the same resolver are passed to several getDefinitionsForClass() fn calls, error handler must not be overwritten", async () => {
    const request1 = { context: { extension: { project: { id: 1234 } } }, payload: { testing: true } };
    const request2 = { context: { extension: { project: { id: 9876 } } }, payload: { testing: false } };
    const testError = new Error("Test error");
    const errorHandler1 = vi.fn();
    const errorHandler2 = vi.fn();

    @Resolver()
    class TestingResolver {
      @ResolverFn("testFunction")
      async testFunction(req: any) {
        throw testError;
      }
    }

    const testResolver1 = new TestingResolver();
    const testResolver2 = new TestingResolver();

    getDefinitionsForClass({
      resolvers: [testResolver1],
      middlewares: [],
      errorHandler: errorHandler1
    });

    getDefinitionsForClass({
      resolvers: [testResolver2],
      middlewares: [],
      errorHandler: errorHandler2
    });

    // Get the resolver config for each instance
    const config1: ResolverClassConfig = testResolver1[_.RESOLVER_CONFIG];
    const config2: ResolverClassConfig = testResolver2[_.RESOLVER_CONFIG];

    // Should have the provided global error handlers
    expect(config1).toEqual({
      globalMiddlewares: [],
      middlewares: [],
      errorHandler: undefined,
      globalErrorHandler: errorHandler1
    });
    expect(config2).toEqual({
      globalMiddlewares: [],
      middlewares: [],
      errorHandler: undefined,
      globalErrorHandler: errorHandler2
    });

    await testResolver1.testFunction(request1);
    await testResolver2.testFunction(request2);

    // Error handlers should be called once for each resolver instance
    expect(errorHandler1).toHaveBeenCalledTimes(1);
    expect(errorHandler1).toHaveBeenCalledWith(testError, request1);
    expect(errorHandler2).toHaveBeenCalledTimes(1);
    expect(errorHandler2).toHaveBeenCalledWith(testError, request2);
  });

  test("If 2 or more instances of the same resolver are passed to several getDefinitionsForClass() fn calls, middlewares must not be overwritten", async () => {
    const middleware1 = vi.fn();
    const middleware2 = vi.fn();

    @Resolver()
    class TestingResolver {
      @ResolverFn("testFunction")
      async testFunction() {
        return { message: "Hello, World!" };
      }
    }

    const testResolver1 = new TestingResolver();
    const testResolver2 = new TestingResolver();

    getDefinitionsForClass({
      resolvers: [testResolver1],
      middlewares: [middleware1]
    });

    getDefinitionsForClass({
      resolvers: [testResolver2],
      middlewares: [middleware2]
    });

    const config1: ResolverClassConfig = testResolver1[_.RESOLVER_CONFIG];
    const config2: ResolverClassConfig = testResolver2[_.RESOLVER_CONFIG];

    // Should have the provided global middlewares
    expect(config1).toEqual({
      globalMiddlewares: [middleware1],
      middlewares: [],
      errorHandler: undefined,
      globalErrorHandler: undefined
    });
    expect(config2).toEqual({
      globalMiddlewares: [middleware2],
      middlewares: [],
      errorHandler: undefined,
      globalErrorHandler: undefined
    });

    await testResolver1.testFunction();
    await testResolver2.testFunction();

    // Middlewares should be called once for each resolver instance
    expect(middleware1).toHaveBeenCalledTimes(1);
    expect(middleware2).toHaveBeenCalledTimes(1);
  });

  test("If resolver config's middlewares is not provided, it should use a default empty array", () => {
    @Resolver()
    class TestingResolver {
      @ResolverFn("testFunction")
      async testFunction() {
        return { message: "Hello, World!" };
      }
    }

    const testResolver = new TestingResolver();

    testResolver[_.RESOLVER_CONFIG].middlewares = undefined;

    const config: ResolverClassConfig = testResolver[_.RESOLVER_CONFIG];

    // Should have a default empty array for middlewares

    expect(config).toEqual({
      middlewares: undefined,
      errorHandler: undefined
    });

    getDefinitionsForClass({ resolvers: [testResolver] });

    expect(testResolver[_.RESOLVER_CONFIG]).toEqual({
      globalMiddlewares: [],
      middlewares: [],
      errorHandler: undefined,
      globalErrorHandler: undefined
    });
  });

  test("If resolver config is not provided, it should not throw an error", () => {
    @Resolver()
    class TestingResolver {
      @ResolverFn("testFunction")
      async testFunction() {
        return { message: "Hello, World!" };
      }
    }

    const testResolver = new TestingResolver();

    // Delete the resolver config
    testResolver[_.RESOLVER_CONFIG] = undefined;

    const fn = () => {
      getDefinitionsForClass({ resolvers: [testResolver] });
    };

    expect(fn).not.toThrow();
  });
});
