import { ResolverFnConfig } from "../types";

export default function isResolverFnConfig(config: ResolverFnConfig | string): config is ResolverFnConfig {
  return (
    typeof config === "object" &&
    typeof config?.key === "string" &&
    (typeof config.middlewares === "undefined" || Array.isArray(config.middlewares)) &&
    (typeof config.errorHandler === "undefined" || typeof config.errorHandler === "function")
  );
}
