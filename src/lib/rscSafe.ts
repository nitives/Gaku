export function rscSafe<T>(value: T): T {
  try {
    // dev-proof clone → new, extensible objects
    // @ts-ignore structuredClone exists in Node 18+/modern browsers
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}

// nice dev-only wrapper
export const rscSafeDev = <T>(v: T) =>
  process.env.NODE_ENV === "development" ? rscSafe(v) : v;
