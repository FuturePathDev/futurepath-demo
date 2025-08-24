// src/api/shimFetch.js
// Globally patches window.fetch so legacy calls like "/resources"
// and "/bookmarks" hit your API Gateway base and include a dev user header.

function apiBase() {
  return (
    (typeof window !== "undefined" &&
      (window.__API_BASE_URL__ || window.API_BASE)) ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)) ||
    (typeof process !== "undefined" &&
      process.env &&
      (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE)) ||
    "https://lx147yqkva.execute-api.us-east-1.amazonaws.com/demo"
  );
}

const MATCH_PATHS = [
  "/resources",
  "/bookmarks",
  "/mentors",
  "/tutors",
  "/announcements",
  "/leaderboards",
  "/user",
];

const origFetch = (typeof window !== "undefined" && window.fetch)
  ? window.fetch.bind(window)
  : null;

if (origFetch) {
  window.fetch = (input, init = {}) => {
    let url = typeof input === "string" ? input : input.url;

    // Only rewrite if it starts with one of our API paths (and not already absolute)
    const needsRewrite =
      typeof url === "string" &&
      url.startsWith("/") &&
      MATCH_PATHS.some((p) => url === p || url.startsWith(p + "/"));

    if (needsRewrite) {
      url = apiBase() + url;
      // add x-demo-user so bookmarks work before Cognito
      const headers = new Headers(
        (typeof input !== "string" && input.headers) || init.headers || {}
      );
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      headers.set("x-demo-user", "demo-sub");
      return origFetch(url, { ...init, headers });
    }

    return origFetch(input, init);
  };
}
