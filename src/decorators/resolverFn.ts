import { Request } from "@forge/resolver";
import { ResolverFnConfig, ResolverClassConfig } from "../types";
import _ from "../constants";

function isResolverFnConfig(config: ResolverFnConfig | string): config is ResolverFnConfig {
  return (
    typeof config === "object" &&
    typeof config.key === "string" &&
    (typeof config.middlewares === "undefined" || Array.isArray(config.middlewares)) &&
    (typeof config.errorHandler === "undefined" || typeof config.errorHandler === "function")
  );
}

export function ResolverFn(resolverFnConfig: ResolverFnConfig | string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Handle the case where resolverFnConfig is a string
    const config: ResolverFnConfig = isResolverFnConfig(resolverFnConfig)
      ? resolverFnConfig
      : { key: resolverFnConfig, middlewares: [], errorHandler: undefined };

    // If the middlewares property is not an array, initialize it as an empty array
    if (!Array.isArray(config.middlewares)) {
      config.middlewares = [];
    }

    // Check if the target has the resolverNames property
    if (!target[_.RESOLVER_FUNCTIONS]) {
      target[_.RESOLVER_FUNCTIONS] = [];
    }

    // Add the resolver's data to the target
    target[_.RESOLVER_FUNCTIONS].push({
      config,
      methodName: propertyKey
    });

    const method = descriptor.value;

    descriptor.value = async function (req: Request) {
      const targetConfig: ResolverClassConfig = this[_.RESOLVER_CONFIG] || {};

      try {
        // Merge middlewares from the resolver function and the resolver class
        // Method middlewares are always executed first
        const middlewares = Array.from(config.middlewares || []);

        // If there are middlewares defined in the resolver class, add them to the middlewares array
        if (Array.isArray(targetConfig.middlewares)) {
          middlewares.push(...targetConfig.middlewares);
        }

        // If there are middlewares defined in the getDefinitionsForClass config, add them to the middlewares array
        if (Array.isArray(targetConfig.globalMiddlewares)) {
          middlewares.push(...targetConfig.globalMiddlewares);
        }

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
        const errorHandlerFn = config.errorHandler || targetConfig?.errorHandler;

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
          } catch (err) {
            // If the error handler throws an error, log it and return the original error
            console.error(err);

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
