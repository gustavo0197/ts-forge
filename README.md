**Warning:** The first version of this library is ready, however documentation is still in progress

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

- `errorHandler: (error: any, request: Request) => any | Promise<any>`
  - Optional
  - If an error is thrown in your resolver function or middlewares, this function will be called so that you can handle the error and return a response
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
  - Required
  - This is the resolver key that you will use when you call `invoke()` method in your addon's UI

**Resolver function config**

- `{ key: string, middlewares?: MiddlewareFn[], errorHandler?: ErrorHandlerFn }`
  - `key: string`
    - Required
    - This is the resolver key that you will use when you call `invoke()` method in your addon's UI
  - `middlewares: ((request: Request) => any | Promise<any>)[]`
    - Optional
    - This is an array of middleware functions, each function will be called before the resolver function
    - If you return a value it will be sent to the frontend, pending middlewares and resolver function won't be called
  - `errorHandler: (error: any, request: Request) => any | Promise<any>`
    - Optional
    - If an error is thrown in your resolver function or middlewares, this function will be called so that you can handle the error and return a response

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

This function is used to get definitions of the resolvers that you created, it uses `@forge/resolver` under the hood to define resolvers then calls `getDefinitions()` method and returns its result

```ts
import { getDefinitionsForClass } from "type-forge";

getDefinitionsForClass({
  resolvers: [HelloWorldResolver, GetJiraProjectResolver],
  errorHandler: ErrorHandlerFn,
  middlewares: MiddlewareFn[]
});
```

#### Parameters

**Parameter 1 (Config) - Required**

- `{ resolvers: [], middlewares: MiddlewareFn[], errorHandler: ErrorHandlerFn }`
  - `resolvers`
    - Required
    - This is an array of class instances in which you used the `@Resolver()` decorator
    - Must have at least one element
  - `middlewares: ((request: Request) => any | Promise<any>)[]`
    - Optional
    - This is an array of middleware functions, each function will be called before the resolver function
    - If you return a value it will be sent to the frontend, pending middlewares and resolver function won't be called
    - Those middlewares will be called before each resolver function defined in `resolvers`
    - **Note:** Middlewares defined here will be the last to be called, in case you have defined middlewares in `@Resolver()` or `@ResolverFn()`
  - `errorHandler: (error: any, request: Request) => any | Promise<any>`
    - Optional
    - If an error is thrown in your resolver function or middlewares, this function will be called so that you can handle the error and return a response
    - This function will handle errors for all the resolver functions defined in `resolvers`
    - **Note:** This function will be called only when an error handler was not defined in `@Resolver()` and `@ResolverFn()`

## Middlewares

You can define middlewares in `@ResolverFn()`, `@Resolver()` and `getDefinitionsForClass()`. It only takes one parameter which is the same request object you have access to in resolver functions

Middleware functions have priority depending where they were defined. When a resolver function is invoked, the middlewares will be called in the following order:

1. `@ResolverFn()`: Middlewares defined in this decorator's config will be the first to be called
2. `@Resolver()`: Middlewares defined in this decorator's config will run after `@ResolverFn()`'s middlewares are called. If no middlewares were defined in `@ResolverFn()`, middlewares defined in `@Resolver()` would be the first to be called
3. `getDefinitionsForClass()`: Middlewares defined in this function will be the last to be called. If no middlewares were defined in `@ResolverFn()` and `@Resolver()`, middlewares defined in `getDefinitionsForClass()` would be the first to be called, this is useful when you want the same middlewares to be called for all of your resolver functions, so that you don't have to define the same middlewares in each `@ResolverFn()` or `@Resolver()`

#### Usage

This is an example of a middleware function

```ts
import { Request } from "@forge/resolver";

// Request is the same object you have access to in your resolver functions
function verifyUserIsJiraAdmin(request: Request): any | Promise<any> {
  // Verify that the current user is a jira admin ...
}
```

Then you can use this middleware in `@ResolverFn()`, `@Resolver()` or `getDefinitionsForClass()`

In the following example the `verifyUserIsJiraAdmin` middleware is used in `@ResolverFn()`. This is useful when you want certain middleware to be called for some resolver functions

```ts
@Resolver()
class HelloWorldResolver {
  @ResolverFn({
    key: "hello-world",
    middlewares: [verifyUserIsJiraAdmin]
  })
  async helloWorld() {
    // Do whatever this resolver should do
  }

  // verifyUserIsJiraAdmin won't be called when this resolver function is invoked
  @ResolverFn({
    key: "get-current-user",
    middlewares: []
  })
  async getCurrentUser() {
    // Return current user
  }
}
```

In this example the `verifyUserIsJiraAdmin` middleware is used in `@Resolver()`. Middlewares defined in this decorator will be called for all resolver functions defined in the class.

```ts
@Resolver({
  // Middlewares defined in this array will be called in each resolver function defined in this class
  middlewares: [verifyUserIsJiraAdmin]
})
class HelloWorldResolver {
  // There's no need to add the same middleware in @ResolverFn()
  @ResolverFn("hello-world")
  async helloWorld() {
    // Do whatever this resolver should do
  }

  // verifyUserIsJiraAdmin will also be called before this resolver function
  @ResolverFn("get-current-user")
  async getCurrentUser() {
    // Return current user
  }
}
```

Last but not least, you can define middlewares in the `getDefinitionsForClass` function. Middlewares defined here will be called in all resolvers that you pass to the `resolvers` array

```ts
@Resolver()
class HelloWorldResolver {
  @ResolverFn("hello-world")
  helloWorld(request: Request) {
    return { message: "Hello world!" };
  }
}

@Resolver()
class UserResolver {
  @ResolverFn("get-user")
  getUser(request: Request) {
    return {...};
  }
}

const definitions = getDefinitionsForClass({
  middlewares: [verifyUserIsJiraAdmin],
  // Middlewares will be called before each resolver function, you don't need to add the verifyUserIsJiraAdmin middleware
  // in @Resolver or @ResolverFn decorators
  resolvers: [HelloWorldResolver, UserResolver]
})
```

## Error handler

An error handler is a function that is called when an error is thrown in a resolver function
