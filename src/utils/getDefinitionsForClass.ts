import ForgeResolver from "@forge/resolver";
import _ from "../constants";
import { DefinitionsHandler } from "@/types";

export function getDefinitionsForClass(...classes: any[]): DefinitionsHandler {
  const forgeResolver = new ForgeResolver();

  for (const ResolverClass of classes) {
    const instance = new ResolverClass();

    for (const resolver of instance[_.RESOLVER_NAMES]) {
      forgeResolver.define(resolver.config.key, instance[resolver.methodName].bind(instance));
    }
  }

  return forgeResolver.getDefinitions();
}
