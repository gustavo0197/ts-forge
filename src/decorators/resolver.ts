import { ResolverConfig } from "../types";
import _ from "../constants";

/**
 * Decorator for defining forge resolvers.
 * @param ResolverConfig - Configuration object for the resolver.
 * @param ResolverConfig.middlewares - Array of middleware functions to be applied to the resolver functions.
 * @param ResolverConfig.errorHandler - Custom error handler function for the resolver functions.
 * @returns A modified class with resolver configuration.
 *
 * @example
 * ```ts
 * \@Resolver({
 *   middlewares: [myMiddleware],
 *   errorHandler: myErrorHandler,
 * })
 * class MyResolver{}
 * ```
 */
export function Resolver(config: ResolverConfig = { middlewares: [], errorHandler: undefined }) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    constructor.prototype[_.RESOLVER_CONFIG] = {
      middlewares: Array.from(config.middlewares || []),
      errorHandler: config.errorHandler
    };
  };
}
