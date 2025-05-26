import { MiddlewareFn, ErrorHandlerFn } from "./resolver";

export interface GetDefinitionsForClassParams {
  resolvers: any[];
  middlewares?: MiddlewareFn[];
  errorHandler?: ErrorHandlerFn;
}
