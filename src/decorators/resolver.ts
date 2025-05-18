import { ResolverConfig } from "../types";
import _ from "../constants";

/**
 * Resolver decorator for defining resolvers.
 * @param ResolverConfig - Configuration object for the resolver.
 * @returns any - A function that takes a constructor as an argument.
 * @example
 * ```typescript
 * @Resolver()
 * class MyResolver {
 *   // ...
 * }
 * ```
 */
export function Resolver(config: ResolverConfig = {}) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    constructor.prototype[_.RESOLVER_CONFIG] = config;
  };
}
