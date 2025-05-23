import { describe, test, expect, vi, beforeEach } from "vitest";
import { ResolverFn } from "@/decorators/resolverFn";
import { Resolver } from "@/decorators/resolver";
import { TargetResolverFnConfig } from "@/types";
import _ from "@/constants";

describe("@Resolver()", () => {
  test("Instance should have resolver function config", () => {
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

    const resolverFnConfig: TargetResolverFnConfig[] = instance[_.RESOLVER_NAMES];

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

    const resolverFnConfig: TargetResolverFnConfig[] = instance[_.RESOLVER_NAMES];

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

    const resolverFnConfig: TargetResolverFnConfig[] = instance[_.RESOLVER_NAMES];

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

  test("Should run middlewares in the correct order", async () => {
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
});
