import { Request } from "@forge/resolver";

export interface ResolverConfig {
  middlewares?: MiddlewareFn[];
  errorHandler?: ErrorHandlerFn;
}

export type MiddlewareFn = (req: Request) => Promise<any> | any;

export type ErrorHandlerFn = (error: any, req: RequestError) => any;

export type RequestError = Request & {
  context: Request["context"] & {
    resolver: {
      key: string;
      className: string;
      methodName: string;
    };
  };
};

export interface ResolverFnConfig {
  key: string;
  middlewares?: MiddlewareFn[];
  errorHandler?: ErrorHandlerFn;
}
