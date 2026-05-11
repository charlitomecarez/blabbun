type RuntimeEnv = Record<string, string | undefined>;

export function getAppEnv(runtimeEnv: RuntimeEnv): "staging" | "live" {
  const val = runtimeEnv.APP_ENV ?? import.meta.env.APP_ENV;
  return val === "live" ? "live" : "staging";
}
