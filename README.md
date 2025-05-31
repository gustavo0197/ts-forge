## @Resolver

```ts
import { Resolver, ResolverFn } from "type-forge";

@Resolver({
  middlewares: [authMiddleware, adminMiddleware],
  errorHandler: myErrorHandler
})
class HelloWorldResolver {}
```

#### Parameters

Parameter 1 (Resolver config) - Optional

- `errorHandler: (error: any, request: RequestError) => any | Promise<any>`
  - Optional
  - If an error is thrown in your resolver function, the error handler function will be called so that you can handle the error and return a response
- `middlewares: ((request: Request) => any | Promise<any>)[]`
  - Optional
  - This is an array of middleware functions, each function will be called before the resolver function
  - If you return a value it will be sent to the frontend, pending middlewares and resolver function won't be called

## @ResolverFn

```ts
import { Request } from "@forge/resolver";
import { Resolver, ResolverFn } from "type-forge";

@Resolver()
class HelloWorldResolver {
  @ResolverFn("my-resolver")
  public async hello(req: Request) {
    return { message: "Hello world!" };
  }
}
```

#### Parameters

**Parameter 1 (Resolver key or resolver function config) - Required**

You could use either, a string or an object

**Resolver key**

- `string`
  - This is the resolver key that you will use when you call `invoke()` method in your addon's UI

**Resolver function config**

- `{ middlewares: MiddlewareFn[], errorHandler: ErrorHandlerFn }`
  - `MiddlewareFn = (request: Request) => any | Promise<any>`
    - Optional
    - This is an array of middleware functions, each function will be called before the resolver function
    - If you return a value it will be sent to the frontend, pending middlewares and resolver function won't be called
  - `ErrorHandlerFn = (error: any, request: Request) => any | Promise<any>`
    - Optional
    - If an error is thrown in your resolver function, the error handler function will be called so that you can handle the error and return a response

The `@ResolverFn()` decorator takes only one argument, which can be either a string or an object
If you don't need to define middlewares or an error handler, you could just pass the resolver key

```ts
@Resolver()
class HelloWorldResolver {
  @ResolverFn("my-resolver")
  async hello(req: Request) {}
}
```

or, if you need to define middlewares or an error handler for that resolver function, you could pass a config object like this:

```ts
@Resolver()
class HelloWorldResolver {
  @ResolverFn({
    key: "my-resolver",
    middlewares: [authMiddleware, adminMiddleware],
    errorHandler: myErrorHandler
  })
  async hello(req: Request) {}
}
```

## getDefinitionsForClass

## Middlewares

## Error handler
