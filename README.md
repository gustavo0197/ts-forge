# ts-forge

This library allows you to define resolvers for your Atlassian Forge addon using decorators. It uses the `@forge/resolver` library under the hood to define resolvers, but it provides a more convenient way to define them using decorators.

## Table of contents

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [TypeScript Configuration](#typescript-configuration)
- [@Resolver](#resolver)
- [@ResolverFn](#resolverfn)
- [getDefinitionsForClass](#getdefinitionsforclass)
- [Middlewares](#middlewares)
- [Error handler](#error-handler)
- [Frontend Usage](#frontend-usage)
- [Complete Example](#complete-example)
- [License](#license)

## Introduction

This library is designed to make it easier to define resolvers in your Atlassian Forge addon using TypeScript decorators. It allows you to define resolvers, middlewares, and error handlers in a more structured and readable way, while still leveraging the power of the `@forge/resolver` library.

It provides two main decorators: `@Resolver` and `@ResolverFn`, which can be used to define resolvers and their configurations. Additionally, it provides a function `getDefinitionsForClass` to get the definitions of the resolvers you created.

When you create a resolver, you typically would do something like this:

```ts
import Resolver from "@forge/resolver";

const resolver = new Resolver();

resolver.define("hello", async (req) => {
  try {
    return { message: "Hello world!" };
  } catch (error) {
    console.error("An error occurred:", error);

    return { status: "error", message: "An error occurred" };
  }
});

resolver.define("update-user", async (req) => {
  try {
    // Update user logic...

    return { status: "success", message: "User updated successfully" };
  } catch (error) {
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

## Quick Start

1. Install the library and its peer dependency:

```bash
npm install ts-forge @forge/resolver
```

1. Configure TypeScript (see [TypeScript Configuration](#typescript-configuration))
2. Create a resolver class:

```ts
import { Resolver, ResolverFn } from "ts-forge";
import { Request } from "@forge/resolver";

@Resolver()
class MyResolver {
  @ResolverFn("say-hello")
  async sayHello(req: Request) {
    return { message: "Hello from ts-forge!" };
  }
}
```

1. Export definitions in any file you want, for example `src/resolvers/index.ts`:

```ts
import { getDefinitionsForClass } from "ts-forge";
import MyResolver from "./MyResolver";

export const handler = getDefinitionsForClass({
  resolvers: [MyResolver]
});
```

1. Define your Forge function in your manifest.yml:

```yml
modules:
  function:
    - key: resolver-function
      handler: resolvers/index.handler
```

1. Use in your Forge app's UI by invoking the resolver function:

```ts
import { invoke } from "@forge/bridge";

async function callHelloResolver() {
  const response = await invoke("resolver-function", {
    key: "say-hello"
  });

  console.log(response.message); // "Hello from ts-forge!"
}
```

## Installation

This is a Node.js module available on npm. Make sure you have `@forge/resolver` installed as well, since this library uses it under the hood. The minimum version of `@forge/resolver` required is `^1.6.0`.

```bash
npm install ts-forge @forge/resolver
```

Or if you're using yarn:

```bash
yarn add ts-forge @forge/resolver
```

Or if you're using pnpm:

```bash
pnpm add ts-forge @forge/resolver
```

## TypeScript Configuration

To use decorators in TypeScript, you need to enable experimental decorators in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## @Resolver

The `@Resolver` decorator is used to mark a class as a resolver. You can optionally provide configuration for middlewares and error handlers that will apply to all resolver functions in the class.

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
  - If a middleware returns a value, it will be sent to the frontend and pending middlewares and the resolver function won't be called

## @ResolverFn

The `@ResolverFn` decorator is used to mark a method as a resolver function. Each decorated method will be registered as a resolver that can be invoked from your Forge app's frontend.

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

You can use either a string or an object.

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
    - If a middleware returns a value, it will be sent to the frontend and pending middlewares and the resolver function won't be called
  - `errorHandler: (error: any, request: Request) => any | Promise<any>`
    - Optional
    - If an error is thrown in your resolver function or middlewares, this function will be called so that you can handle the error and return a response

The `@ResolverFn()` decorator takes only one argument, which can be either a string or an object.
If you don't need to define middlewares or an error handler, you can just pass the resolver key:

```ts
@Resolver()
class HelloWorldResolver {
  @ResolverFn("my-resolver")
  async hello(req: Request) {
    return { message: "Hello!" };
  }
}
```

Or, if you need to define middlewares or an error handler for that resolver function, you can pass a config object like this:

```ts
@Resolver()
class HelloWorldResolver {
  @ResolverFn({
    key: "my-resolver",
    middlewares: [authMiddleware, adminMiddleware],
    errorHandler: myErrorHandler
  })
  async hello(req: Request) {
    return { message: "Hello!" };
  }
}
```

## getDefinitionsForClass

This function is used to get definitions of the resolvers that you created. It uses `@forge/resolver` under the hood to define resolvers, then calls `getDefinitions()` method and returns its result. The returned value should be exported as the `handler` for your Forge function.

```ts
import { getDefinitionsForClass } from "ts-forge";

const handler = getDefinitionsForClass({
  resolvers: [HelloWorldResolver, GetJiraProjectResolver],
  errorHandler: myErrorHandler,
  middlewares: [authMiddleware]
});

export { handler };
```

#### Parameters

**Parameter 1 (Config) - Required**

- `{ resolvers: [], middlewares?: MiddlewareFn[], errorHandler?: ErrorHandlerFn }`
  - `resolvers`
    - Required
    - This is an array of classes (not instances) that have been decorated with `@Resolver()`
    - Must have at least one element
  - `middlewares: ((request: Request) => any | Promise<any>)[]`
    - Optional
    - This is an array of middleware functions, each function will be called before the resolver function
    - If a middleware returns a value, it will be sent to the frontend and pending middlewares and the resolver function won't be called
    - These middlewares will be called before each resolver function defined in `resolvers`
    - **Note:** Middlewares defined here will be the last to be called, in case you have defined middlewares in `@Resolver()` or `@ResolverFn()`
  - `errorHandler: (error: any, request: Request) => any | Promise<any>`
    - Optional
    - If an error is thrown in your resolver function or middlewares, this function will be called so that you can handle the error and return a response
    - This function will handle errors for all the resolver functions defined in `resolvers`
    - **Note:** This function will be called only when an error handler was not defined in `@Resolver()` and `@ResolverFn()`

#### Return Value

Returns the definitions object that should be exported for use in your Forge manifest. This object contains all the resolver function definitions that can be invoked from your Forge app's frontend.

## Middlewares

You can define middlewares in `@ResolverFn()`, `@Resolver()` and `getDefinitionsForClass()`. Each middleware takes one parameter which is the same request object you have access to in resolver functions.

Middleware functions have priority depending on where they were defined. When a resolver function is invoked, the middlewares will be called in the following order:

1. `@ResolverFn()`: Middlewares defined in this decorator's config will be the first to be called
2. `@Resolver()`: Middlewares defined in this decorator's config will run after `@ResolverFn()`'s middlewares are called. If no middlewares were defined in `@ResolverFn()`, middlewares defined in `@Resolver()` would be the first to be called
3. `getDefinitionsForClass()`: Middlewares defined in this function will be the last to be called. If no middlewares were defined in `@ResolverFn()` and `@Resolver()`, middlewares defined in `getDefinitionsForClass()` would be the first to be called. This is useful when you want the same middlewares to be called for all of your resolver functions, so that you don't have to define the same middlewares in each `@ResolverFn()` or `@Resolver()`

**Important**: If a middleware returns a value, that value will be sent to the frontend immediately and any pending middlewares and the resolver function will not be executed. If a middleware should just perform checks or logging without stopping execution, it should not return anything.

#### Usage

This is an example of a middleware function that returns early (blocking execution):

```ts
import { Request } from "@forge/resolver";

// This middleware returns a value, stopping execution if user is not admin
function verifyUserIsJiraAdmin(request: Request): any | Promise<any> {
  const isAdmin = checkIfUserIsAdmin(request.context.accountId);

  if (!isAdmin) {
    // Returning a value stops execution
    return { error: "Unauthorized", message: "Admin access required" };
  }

  // Not returning anything allows execution to continue
}
```

Example of a middleware that doesn't return (passes through):

```ts
import { Request } from "@forge/resolver";

// This middleware logs but doesn't return, so execution continues
function loggingMiddleware(request: Request): void {
  console.log(`Resolver called: ${request.payload?.action}`);
  // No return statement - execution continues to next middleware/resolver
}
```

Then you can use these middlewares in `@ResolverFn()`, `@Resolver()` or `getDefinitionsForClass()`.

In the following example the `verifyUserIsJiraAdmin` middleware is used in `@ResolverFn()`. This is useful when you want certain middleware to be called for specific resolver functions:

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
  @ResolverFn("get-current-user")
  async getCurrentUser() {
    // Return current user
  }
}
```

In this example the `verifyUserIsJiraAdmin` middleware is used in `@Resolver()`. Middlewares defined in this decorator will be called for all resolver functions defined in the class:

```ts
@Resolver({
  // Middlewares defined in this array will be called for each resolver function defined in this class
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

Last but not least, you can define middlewares in the `getDefinitionsForClass` function. Middlewares defined here will be called for all resolvers that you pass to the `resolvers` array:

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

const handler = getDefinitionsForClass({
  middlewares: [verifyUserIsJiraAdmin],
  // Middlewares will be called before each resolver function, you don't need to add the verifyUserIsJiraAdmin middleware
  // in @Resolver or @ResolverFn decorators
  resolvers: [HelloWorldResolver, UserResolver]
});
```

## Error handler

An error handler is a function that allows you to handle errors thrown in your resolver functions or middlewares. It can be defined in `@ResolverFn()`, `@Resolver()` and `getDefinitionsForClass()`.

When an error is thrown, the error handler will be called with the error and the request object, allowing you to handle the error and return a response to the frontend.

When an error is thrown, the error handler will be called in the following order:

1. If an error handler is defined in the `@ResolverFn()` decorator, it will be called
2. Error handler defined in `@Resolver()` will be called when an error handler was not defined in `@ResolverFn()`
3. If no error handler was defined in `@ResolverFn()` and `@Resolver()`, the error handler defined in `getDefinitionsForClass()` will be called
4. If no error handler was defined in any of the above, the error will be logged to the console and will be returned to the frontend

#### Usage

This is an example of an error handler function:

```ts
import { Request } from "@forge/resolver";

function myErrorHandler(error: any, request: Request): any | Promise<any> {
  // Handle the error and return a response
  console.error("An error occurred:", error);

  return { status: "error", message: "An error occurred" };
}
```

Then you can use this error handler in `@ResolverFn()`, `@Resolver()` or `getDefinitionsForClass()`.

In the following example the `myErrorHandler` error handler is used in `@ResolverFn()`. This is useful when you want a specific error handler to be called for some resolver functions:

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

In this example the `myErrorHandler` error handler is used in `@Resolver()`. Error handlers defined in this decorator will be called for all resolver functions defined in the class:

```ts
@Resolver({
  // Error handler defined in this decorator will be called if an error is thrown in any of the resolver functions defined in this class
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

Last but not least, you can define an error handler in the `getDefinitionsForClass` function. Error handlers defined here will be called if an error is thrown in any of the resolvers that you pass to the `resolvers` array:

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

const handler = getDefinitionsForClass({
  errorHandler: myErrorHandler,
  // Error handler will be called if an error is thrown in any of the resolver functions
  // You don't need to add the myErrorHandler error handler in @Resolver or @ResolverFn decorators
  resolvers: [HelloWorldResolver, UserResolver]
});
```

## Frontend Usage

After defining your resolvers and exporting the handler, you can invoke them from your Forge app's frontend using the `invoke()` method from `@forge/bridge`.

**Backend (src/resolvers/index.ts):**

```ts
import { getDefinitionsForClass, Resolver, ResolverFn } from "ts-forge";
import { Request } from "@forge/resolver";

@Resolver()
class UserResolver {
  @ResolverFn("get-user")
  async getUser(req: Request) {
    const userId = req.payload.userId;
    // Fetch user logic...
    return { id: userId, name: "John Doe" };
  }

  @ResolverFn("update-user")
  async updateUser(req: Request) {
    const { userId, name } = req.payload;
    // Update user logic...
    return { success: true, message: "User updated" };
  }
}

export const handler = getDefinitionsForClass({
  resolvers: [UserResolver]
});
```

**Frontend (src/index.tsx or src/index.jsx):**

```tsx
import React, { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Invoke the "get-user" resolver
    invoke("get-user", { userId: "123" })
      .then((response) => {
        setUser(response);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }, []);

  const handleUpdateUser = async () => {
    try {
      // Invoke the "update-user" resolver
      const response = await invoke("update-user", {
        userId: "123",
        name: "Jane Doe"
      });
      console.log(response.message);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div>
      {user && (
        <>
          <h1>{user.name}</h1>
          <button onClick={handleUpdateUser}>Update User</button>
        </>
      )}
    </div>
  );
}

export default App;
```

## Complete Example

Here's a complete example showing all features together:

**src/middlewares/auth.ts:**

```ts
import { Request } from "@forge/resolver";

export function authMiddleware(request: Request) {
  const accountId = request.context.accountId;

  if (!accountId) {
    return { error: "Unauthorized", message: "User not authenticated" };
  }
  // Don't return anything to continue execution
}

export function adminMiddleware(request: Request) {
  // Check if user is admin
  const isAdmin = checkIfUserIsAdmin(request.context.accountId);

  if (!isAdmin) {
    return { error: "Forbidden", message: "Admin access required" };
  }
}
```

**src/handlers/errorHandler.ts:**

```ts
import { Request } from "@forge/resolver";

export function globalErrorHandler(error: any, request: Request) {
  console.error("Error in resolver:", error);

  // Log to external service
  logErrorToService(error, request.context);

  return {
    success: false,
    error: "An unexpected error occurred",
    message: error.message
  };
}
```

**src/resolvers/UserResolver.ts:**

```ts
import { Resolver, ResolverFn } from "ts-forge";
import { Request } from "@forge/resolver";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";

@Resolver({
  middlewares: [authMiddleware]
})
class UserResolver {
  @ResolverFn("get-current-user")
  async getCurrentUser(req: Request) {
    const accountId = req.context.accountId;
    // Fetch user from API
    return { id: accountId, name: "John Doe" };
  }

  @ResolverFn({
    key: "delete-user",
    middlewares: [adminMiddleware] // Additional middleware for this resolver
  })
  async deleteUser(req: Request) {
    const userId = req.payload.userId;
    // Delete user logic
    return { success: true, message: `User ${userId} deleted` };
  }
}

export default UserResolver;
```

**src/resolvers/ProjectResolver.ts:**

```ts
import { Resolver, ResolverFn } from "ts-forge";
import { Request } from "@forge/resolver";

@Resolver()
class ProjectResolver {
  @ResolverFn("get-projects")
  async getProjects(req: Request) {
    // Fetch projects
    return { projects: [] };
  }
}

export default ProjectResolver;
```

**src/resolvers/index.ts:**

```ts
import { getDefinitionsForClass } from "ts-forge";
import UserResolver from "./UserResolver";
import ProjectResolver from "./ProjectResolver";
import { globalErrorHandler } from "../handlers/errorHandler";

export const handler = getDefinitionsForClass({
  resolvers: [UserResolver, ProjectResolver],
  errorHandler: globalErrorHandler
});
```

**manifest.yml:**

```yml
modules:
  function:
    - key: resolver-function
      handler: resolvers/index.handler
  jira:issuePanel:
    - key: my-issue-panel
      function: resolver-function
      title: My Issue Panel
      icon: https://example.com/icon.png
```

## License

MIT
