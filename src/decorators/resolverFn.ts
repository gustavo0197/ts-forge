import { Request } from "@forge/resolver";
import { ResolverFnConfig } from "../types";
import _ from "../constants";

export function ResolverFn(config: ResolverFnConfig) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Check if the target has the resolverNames symbol
    if (!target[_.RESOLVER_NAMES]) {
      target[_.RESOLVER_NAMES] = [];
    }

    // Add the resolver's data to the target
    target[_.RESOLVER_NAMES].push({
      config,
      methodName: propertyKey
    });

    const method = descriptor.value;

    descriptor.value = async function (req: Request) {
      try {
        // Merge middlewares from the resolver function and the resolver class
        // Method middlewares are always executed first
        const middlewares = config.middlewares || [];
        middlewares.push(...(target[_.RESOLVER_CONFIG]?.middlewares || []));

        // Run provided middlewares
        for (const middleware of middlewares) {
          const response = await middleware(req);

          // If response is provided, send it to the frontend
          // This means that the resolver or next middleware will not be called
          if (response) {
            return response;
          }
        }

        // Call the original method
        return await method.call(this, req);
      } catch (error) {
        // Resolver function error handler has priority over the resolver error handler
        const errorHandlerFn = config.errorHandler || target[_.RESOLVER_CONFIG]?.errorHandler;

        // If an error handler is provided, call it with the request data and error object
        // This allows the error handler to handle the error and return a response
        if (errorHandlerFn) {
          try {
            req.context.resolver = {
              key: config.key,
              className: target.constructor.name,
              methodName: propertyKey
            };

            return await errorHandlerFn(error, req);
          } catch (error) {
            // If the error handler throws an error, log it and return the original error
            console.error(error);

            return error;
          }
        }

        // If no error handler is provided, log the error, then return it
        console.error(error);

        return error;
      }
    };
  };
}
