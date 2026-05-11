export function getAppEnv(
  runtimeEnv: Record<string, string | undefined>
): "staging" | "live" {
  const val = runtimeEnv.APP_ENV ?? import.meta.env.APP_ENV;
  return val === "live" ? "live" : "staging";
}
