export const GLOBAL =
  typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : {};
