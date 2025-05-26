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

  if (errorHandler && typeof errorHandler !== "function") {
    throw new Error("Error handler must be a function");
  }

  for (const instance of resolvers) {
    if (instance[_.RESOLVER_CONFIG]) {
      // Set global middlewares and error handler for the resolver class
      const instanceConfig: ResolverClassConfig = instance[_.RESOLVER_CONFIG];

      if (!Array.isArray(instanceConfig.globalMiddlewares)) {
        instanceConfig.globalMiddlewares = [];
      }

      instanceConfig.globalMiddlewares.push(...middlewares);

      // If the instance already has an error handler, it will not be overwritten
      if (!instanceConfig.errorHandler && errorHandler) {
        instanceConfig.errorHandler = errorHandler;
      }

      // Set the updated config on the instance
      instance[_.RESOLVER_CONFIG] = instanceConfig;
    }

    for (const resolver of instance[_.RESOLVER_FUNCTIONS]) {
      forgeResolver.define(resolver.config.key, instance[resolver.methodName].bind(instance));
    }
  }

  return forgeResolver.getDefinitions();
}
