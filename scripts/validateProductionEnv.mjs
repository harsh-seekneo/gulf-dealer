export function validateProductionUrls(env, keys) {
  for (const key of keys) {
    let url;
    try { url = new URL(env[key]); } catch {
      throw new Error(`${key} is required and must be a valid production HTTPS URL`);
    }
    if (url.protocol !== "https:" || url.username || url.password ||
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new Error(`${key} must be a production HTTPS URL`);
    }
    const isApi = key.endsWith("API_BASE_URL");
    if (url.search || url.hash ||
        (isApi ? url.pathname.replace(/\/$/, "") !== "/api/v1" : url.pathname !== "/")) {
      throw new Error(`${key} must be ${isApi ? "an API URL ending in /api/v1" : "a site origin without a path"}`);
    }
  }
  for (const key of ["VITE_API_WITH_CREDENTIALS", "NEXT_PUBLIC_API_WITH_CREDENTIALS"]) {
    if (env[key] === "false") throw new Error(`${key} must be true for production login sessions`);
  }
}
