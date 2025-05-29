import ForgeResolver from "@forge/resolver";
import _ from "../constants";
import { DefinitionsHandler, GetDefinitionsForClassParams, ResolverClassConfig } from "@/types";

export function getDefinitionsForClass({
  resolvers,
  middlewares = [],
  errorHandler
}: GetDefinitionsForClassParams): DefinitionsHandler {
  const forgeResolver = new ForgeResolver();

  if (!Array.isArray(middlewares)) {
    throw new Error("Middlewares must be an array");
  }

  if (middlewares.length > 0 && !middlewares.every((m) => typeof m === "function")) {
    throw new Error("All middlewares must be functions");
  }

  if (errorHandler && typeof errorHandler !== "function") {
    throw new Error("Error handler must be a function");
  }

  for (const instance of resolvers) {
    if (instance[_.RESOLVER_CONFIG]) {
      // Set global middlewares and error handler for the resolver class
      const instanceConfig: ResolverClassConfig = {
        middlewares: Array.from(instance[_.RESOLVER_CONFIG].middlewares || []),
        errorHandler: instance[_.RESOLVER_CONFIG].errorHandler
      };

      instanceConfig.globalMiddlewares = Array.from(middlewares);

      // Set the global error handler
      instanceConfig.globalErrorHandler = errorHandler;

      // Set the updated config on the instance
      instance[_.RESOLVER_CONFIG] = instanceConfig;
    }

    for (const resolver of instance[_.RESOLVER_FUNCTIONS]) {
      forgeResolver.define(resolver.config.key, instance[resolver.methodName].bind(instance));
    }
  }

  return forgeResolver.getDefinitions();
}
