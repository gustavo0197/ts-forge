import ForgeResolver from "@forge/resolver";
import _ from "../constants";
import { DefinitionsHandler } from "@/types";

export function getDefinitionsForClass(...instances: any[]): DefinitionsHandler {
  const forgeResolver = new ForgeResolver();

  for (const instance of instances) {
    for (const resolver of instance[_.RESOLVER_NAMES]) {
      forgeResolver.define(resolver.config.key, instance[resolver.methodName].bind(instance));
    }
  }

  return forgeResolver.getDefinitions();
}
