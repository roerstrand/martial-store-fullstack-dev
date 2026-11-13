export function resolveApiBaseUrl(env) {
  if (env.PROD) return "/api";
  return env.VITE_API_URL || "/api";
}
