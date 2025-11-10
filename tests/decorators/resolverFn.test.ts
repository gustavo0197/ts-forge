import { describe, test, expect, vi, beforeEach } from "vitest";
import { Resolver, ResolverFn } from "@/index";
import { TargetResolverFnConfig } from "@/types";
import _ from "@/constants";

const mockError = vi.fn();
const mockFns = vi.hoisted(() => ({
  isResolverFnConfig: vi.fn(() => true)
}));

vi.stubGlobal("console", {
  ...console,
  error: mockError
});

vi.mock("../../src/utils/isResolverFnConfig", () => ({ default: mockFns.isResolverFnConfig }));

describe("@Resolver()", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("Instance should have resolver function config", () => {
    mockFns.isResolverFnConfig.mockReturnValue(false);

    const resolverKey1 = "testing-resolver";
    const resolverKey2: string = "testing-resolver-2";
    const resolverMethodName1: string = "testMethod";
    const resolverMethodName2: string = "testMethod2";

    @Resolver()
    class TestResolver {
      @ResolverFn(resolverKey1)
      [resolverMethodName1]() {
        return "test";
      }

      @ResolverFn(resolverKey2)
      [resolverMethodName2]() {
        return "test2";
      }
    }

    const instance = new TestResolver();

    const resolverFnConfig: TargetResolverFnConfig[] = instance[_.RESOLVER_FUNCTIONS];

    expect(resolverFnConfig).toEqual([
      {
        config: {
          key: resolverKey1,
          errorHandler: undefined,
          middlewares: []
        },
        methodName: resolverMethodName1
      },
      {
        config: {
          key: resolverKey2,
          errorHandler: undefined,
          middlewares: []
        },
        methodName: resolverMethodName2
      }
    ]);
  });

  test("Should include middlewares in the resolver function config", () => {
    const resolverKey = "testing-resolver";
    const resolverMethodName = "testMethod";

    const middleware1 = vi.fn();
    const middleware2 = vi.fn();

    @Resolver()
    class TestResolver {
      @ResolverFn({
        key: resolverKey,
        middlewares: [middleware1, middleware2]
      })
      [resolverMethodName]() {
        return "test";
      }
    }

    const instance = new TestResolver();

    const resolverFnConfig: TargetResolverFnConfig[] = instance[_.RESOLVER_FUNCTIONS];

    expect(resolverFnConfig).toEqual([
      {
        config: {
          key: resolverKey,
          errorHandler: undefined,
          middlewares: [middleware1, middleware2]
        },
        methodName: resolverMethodName
      }
    ]);
  });

  test("Should include error handler in the resolver function config", () => {
    const resolverKey: string = "testing-resolver";
    const resolverMethodName: string = "testMethod";
    const errorHandler = vi.fn();

    @Resolver()
    class TestResolver {
      @ResolverFn({
        key: resolverKey,
        errorHandler
      })
      [resolverMethodName]() {}
    }

    const instance = new TestResolver();

    const resolverFnConfig: TargetResolverFnConfig[] = instance[_.RESOLVER_FUNCTIONS];

    expect(resolverFnConfig).toEqual([
      {
        config: {
          key: resolverKey,
          errorHandler,
          middlewares: []
        },
        methodName: resolverMethodName
      }
    ]);
  });

  describe("ResolverFn's method", () => {
    test("If @@resolver__config@@ is not an object it must be assigned to an empty object when calling a method. Method should not throw an error", async () => {
      mockFns.isResolverFnConfig.mockReturnValue(false);

      @Resolver()
      class TestResolver {
        @ResolverFn()
        async testMethod() {}
      }

      const instance = new TestResolver();

      // Manually set @@resolver__config@@ to null
      instance[_.RESOLVER_CONFIG] = null;

      const response = await instance.testMethod.call(instance);

      expect(response).not.toBeInstanceOf(Error);
      expect(instance[_.RESOLVER_CONFIG]).toEqual(null);
    });

    test("If middlewares property in resolver's config is not an array, it must be assigned to an empty array when calling a method. Method should not throw an error", async () => {
      const resolverResponse = "success";
      const isArraySpy = vi.spyOn(Array, "isArray");

      isArraySpy.mockImplementationOnce(() => true);
      mockFns.isResolverFnConfig.mockReturnValue(true);

      @Resolver()
      class TestResolver {
        @ResolverFn({})
        async testMethod() {
          return resolverResponse;
        }
      }

      const instance = new TestResolver();

      const response = await instance.testMethod();

      expect(response).not.toBeInstanceOf(Error);
      expect(response).toBe(resolverResponse);
    });
  });

  describe("Middlewares", () => {
    test("Should run resolver function middlewares", async () => {
      const req = { context: { project: { id: "1234" } } };
      const resolverKey: string = "testing-resolver";
      const resolverMethodName: string = "testMethod";
      const resolverFnResult = { message: "Hello world!" };

      const middleware1 = vi.fn();
      const middleware2 = vi.fn();

      @Resolver()
      class TestResolver {
        @ResolverFn({
          key: resolverKey,
          middlewares: [middleware1, middleware2]
        })
        async [resolverMethodName](req: any) {
          return resolverFnResult;
        }
      }

      const instance = new TestResolver();

      const result = await instance[resolverMethodName](req);

      expect(middleware1).toHaveBeenCalledTimes(1);
      expect(middleware2).toHaveBeenCalledTimes(1);

      expect(middleware1).toHaveBeenCalledWith(req);
      expect(middleware2).toHaveBeenCalledWith(req);

      expect(result).toBe(resolverFnResult);
    });

    test("If there are middlewares in the resolver function and the resolver, the resolver function middlewares should be called first", async () => {
      const req = { context: { project: { id: "1234" } } };
      const resolverKey: string = "testing-resolver";
      const resolverMethodName: string = "testMethod";
      const resolverFnResult = { message: "Hello world!" };
      const middleware1 = vi.fn();
      const middleware2 = vi.fn();

      @Resolver({
        middlewares: [middleware2]
      })
      class TestResolver {
        @ResolverFn({
          key: resolverKey,
          middlewares: [middleware1]
        })
        async [resolverMethodName](req: any) {
          return resolverFnResult;
        }
      }
      const instance = new TestResolver();
      const result = await instance[resolverMethodName](req);

      expect(middleware1).toHaveBeenCalledTimes(1);
      expect(middleware2).toHaveBeenCalledTimes(1);

      expect(middleware1).toHaveBeenCalledWith(req);
      expect(middleware2).toHaveBeenCalledWith(req);

      expect(result).toBe(resolverFnResult);
    });

    test("If the middleware function returns a value, the resolver function should not be called", async () => {
      const req = { context: { project: { id: "1234" } } };
      const resolverKey: string = "testing-resolver";
      const resolverMethodName: string = "testMethod";
      const middlewareError = { ok: false, message: "There has been an error" };
      const middleware = vi.fn(() => {
        return middlewareError;
      });

      @Resolver()
      class TestResolver {
        @ResolverFn({
          key: resolverKey,
          middlewares: [middleware]
        })
        async [resolverMethodName](req: any) {
          return "test";
        }
      }

      const instance = new TestResolver();
      const result = await instance[resolverMethodName](req);

      expect(middleware).toHaveBeenCalledTimes(1);
      expect(result).toEqual(middlewareError);
    });
  });

  describe("Error handler", () => {
    test("If no error handler is provided, should print and return the error", async () => {
      const req = { context: { project: { id: "1234" } } };
      const resolverKey: string = "testing-resolver";
      const resolverMethodName: string = "testMethod";
      const error = new Error("Test error");

      @Resolver()
      class TestResolver {
        @ResolverFn({
          key: resolverKey
        })
        async [resolverMethodName](req: any) {
          throw error;
        }
      }

      const instance = new TestResolver();
      const result = await instance[resolverMethodName](req);

      expect(mockError).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledWith(error);
      expect(result).toEqual(error);
    });

    test("If the resolver function has an error handler and there is an error, error handler function should be called", async () => {
      const req = { context: { project: { id: "1234" } } };
      const resolverKey: string = "testing-resolver";
      const resolverMethodName: string = "testMethod";
      const errorHandler = vi.fn();
      const error = new Error("Test error");

      @Resolver()
      class TestResolver {
        @ResolverFn({
          key: resolverKey,
          errorHandler
        })
        async [resolverMethodName](req: any) {
          throw error;
        }
      }

      const instance = new TestResolver();
      await instance[resolverMethodName](req);

      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(errorHandler).toHaveBeenCalledWith(error, req);
    });

    test("If the resolver has an error handler and there is an error, error handler function should be called", async () => {
      const req = { context: { project: { id: "1234" } } };
      const resolverKey: string = "testing-resolver";
      const resolverMethodName: string = "testMethod";
      const errorHandler = vi.fn();
      const error = new Error("Test error");

      const middleware1 = vi.fn(() => {
        throw error;
      });

      @Resolver({ errorHandler })
      class TestResolver {
        @ResolverFn({
          key: resolverKey,
          middlewares: [middleware1]
        })
        async [resolverMethodName](req: any) {
          return "test";
        }
      }

      const instance = new TestResolver();
      await instance[resolverMethodName](req);

      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(errorHandler).toHaveBeenCalledWith(error, req);
    });

    test("If there are error handlers in the resolver function and the resolver, the resolver function error handler should be called", async () => {
      const req = { context: { project: { id: "1234" } } };
      const resolverKey: string = "testing-resolver";
      const resolverMethodName: string = "testMethod";
      const resolverErrorHandler = vi.fn();
      const resolverFnErrorHandler = vi.fn();
      const error = new Error("Test error");

      @Resolver({ errorHandler: resolverErrorHandler })
      class TestResolver {
        @ResolverFn({
          key: resolverKey,
          errorHandler: resolverFnErrorHandler
        })
        async [resolverMethodName](req: any) {
          throw error;
        }
      }

      const instance = new TestResolver();
      await instance[resolverMethodName](req);

      expect(resolverErrorHandler).toHaveBeenCalledTimes(0);
      expect(resolverFnErrorHandler).toHaveBeenCalledTimes(1);
      expect(resolverFnErrorHandler).toHaveBeenCalledWith(error, req);
    });

    test("If an error is thrown in the error handler, it should be printed and returned", async () => {
      const req = { context: { project: { id: "1234" } } };
      const resolverKey: string = "testing-resolver";
      const resolverMethodName: string = "testMethod";
      const error = new Error("Error in error handler");
      const errorHandler = vi.fn(() => {
        throw error;
      });

      @Resolver()
      class TestResolver {
        @ResolverFn({
          key: resolverKey,
          errorHandler
        })
        async [resolverMethodName](req: any) {
          throw error;
        }
      }

      const instance = new TestResolver();
      const result = await instance[resolverMethodName](req);

      expect(mockError).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledWith(error);
      expect(result).toEqual(error);
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(errorHandler).toHaveBeenCalledWith(error, req);
    });
  });
});
