**Warning:** The first version of this library is ready, however documentation is still in progress

This library allows you to define resolvers for your Atlassian Forge addon using decorators. It uses the `@forge/resolver` library under the hood to define resolvers, but it provides a more convenient way to define them using decorators.

## Table of contents

- [Introduction](#introduction)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [@Resolver](#resolver)
- [@ResolverFn](#resolverfn)
- [getDefinitionsForClass](#getdefinitionsforclass)
- [Middlewares](#middlewares)
- [Error handler](#error-handler)

[![npm version](https://badge.fury.io/js/ts-forge.svg)](https://badge.fury.io/js/ts-forge)
[![npm downloads](https://img.shields.io/npm/dm/ts-forge.svg)](https://www.npmjs.com/package/ts-forge)

## Introduction

This library is designed to make it easier to define resolvers in your Atlassian Forge addon using TypeScript decorators. It allows you to define resolvers, middlewares, and error handlers in a more structured and readable way, while still leveraging the power of the `@forge/resolver` library.

It provides two main decorators: `@Resolver` and `@ResolverFn`, which can be used to define resolvers and their configurations. Additionally, it provides a function `getDefinitionsForClass` to get the definitions of the resolvers you created.

When you create a resolver, you typically would do something like this:

```ts
import Resolver "@forge/resolver";

const resolver = new Resolver();

resolver.define("hello", async (req) => {
  try {
    return { message: "Hello world!" };
  } catch(error)  {
    console.error("An error occurred:", error);

    return { status: "error", message: "An error occurred" };
  }
});

resolver.define("update-user", async (req) => {
  try {
    // Update user logic...

    return { status: "success", message: "User updated successfully" };
  } catch(error) {
    console.error("An error occurred:", error);

    return { status: "error", message: "An error occurred" };
  }
});

export const definitions = resolver.getDefinitions();
```

With this library, you can achieve the same functionality using decorators, which makes your code more organized and easier to read:

```ts
import { getDefinitionsForClass, Resolver, ResolverFn } from "ts-forge";

@Resolver()
class UserResolver {
  @ResolverFn("hello")
  async hello(req) {
    return { message: "Hello world!" };
  }

  @ResolverFn("update-user")
  async updateUser(req) {
    // Update user logic...
  }
    return { status: "success", message: "User updated successfully" };
  }
}

export const definitions = getDefinitionsForClass({
  resolvers: [
    UserResolver
    // You can add more resolvers here
  ]
});
```

## Installation

This is a Node.js module available on npm. Make sure you have `@forge/resolver` installed as well, since this library uses it under the hood. The minimum version of `@forge/resolver` required is `^1.6.0`.

```bash
npm install ts-forge
```

## @Resolver

```ts
import { Resolver, ResolverFn } from "ts-forge";

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
import { Resolver, ResolverFn } from "ts-forge";

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
import { getDefinitionsForClass } from "ts-forge";

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

An error handler is a function that allows you to handle errors thrown in your resolver functions or middlewares. It can be defined in `@ResolverFn()`, `@Resolver()` and `getDefinitionsForClass()`.

When an error is thrown, the error handler will be called with the error and the request object, allowing you to handle the error and return a response to the frontend.

When an error is thrown, the error handler will be called in the following order:

1. If an error handler is defined in the `@ResolverFn()` decorator, it will be called
2. Error handler defined in `@Resolver()`, will be called when an error handler was not defined in `@ResolverFn()`
3. If no error handler was defined in `@ResolverFn()` and `@Resolver()`, the error handler defined in `getDefinitionsForClass()` will be called
4. If no error handler was defined in any of the above, the error will be logged to the console and will be returned to the frontend

#### Usage

This is an example of an error handler function

```ts
import { Request } from "@forge/resolver";

function myErrorHandler(error: any, request: Request): any | Promise<any> {
  // Handle the error and return a response
  console.error("An error occurred:", error);

  return { status: "error", message: "An error occurred" };
}
```

Then you can use this error handler in `@ResolverFn()`, `@Resolver()` or `getDefinitionsForClass()`
In the following example the `myErrorHandler` error handler is used in `@ResolverFn()`. This is useful when you want certain error handler to be called for some resolver functions

```ts
@Resolver()
class HelloWorldResolver {
  @ResolverFn({
    key: "hello-world",
    errorHandler: myErrorHandler
  })
  async helloWorld() {
    // Do whatever this resolver should do
  }

  // myErrorHandler won't be called when an error is thrown in this resolver function
  @ResolverFn("get-current-user")
  async getCurrentUser() {
    // Return current user
  }
}
```

In this example the `myErrorHandler` error handler is used in `@Resolver()`. Error handlers defined in this decorator will be called for all resolver functions defined in the class.

```ts
@Resolver({
  // Error handler defined in this function will be called if an error is thrown in any of the resolver functions defined in this class
  errorHandler: myErrorHandler
})
class HelloWorldResolver {
  // There's no need to add the same error handler in @ResolverFn()
  @ResolverFn("hello-world")
  async helloWorld() {
    // Do whatever this resolver should do
  }

  // myErrorHandler will also be called if an error is thrown in this resolver function
  @ResolverFn("get-current-user")
  async getCurrentUser() {
    // Return current user
  }
}
```

Last but not least, you can define an error handler in the `getDefinitionsForClass` function. Error handlers defined here will be called if an error is thrown in any of the resolvers that you pass to the `resolvers` array.

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
  errorHandler: myErrorHandler,
  // Error handler will be called if an error is thrown in any of the resolver functions
  // You don't need to add the myErrorHandler error handler in @Resolver or @ResolverFn decorators
  resolvers: [HelloWorldResolver, UserResolver]
});
```
