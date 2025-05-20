import { ResolverFunction, Request } from "@forge/resolver";

interface InvokePayload {
  call: {
    functionKey: string;
    payload?: {
      [key in number | string]: any;
    };
    jobId?: string;
  };
  context: {
    [key: string]: any;
  };
}

export type DefinitionsHandler = (
  payload: InvokePayload,
  backendRuntimePayload?: Request["payload"]
) => Promise<ReturnType<ResolverFunction>>;
