import { NextResponse } from "next/server";

type JsonInit = number | ResponseInit | undefined;

export function json<T>(data: T, init?: JsonInit) {
  if (typeof init === "number")
    return NextResponse.json(data, { status: init });
  return NextResponse.json(data as any, init);
}

export function error(
  message: string,
  status = 500,
  extras?: Record<string, unknown>
) {
  return json({ error: message, ...(extras ?? {}) }, status);
}

export function methodNotAllowed(method?: string, allowed: string[] = ["GET"]) {
  const res = error(`Method ${method ?? ""} Not Allowed`, 405);
  res.headers.set("Allow", allowed.join(", "));
  return res;
}

export function badRequest(message: string, extras?: Record<string, unknown>) {
  return error(message, 400, extras);
}

export function notFound(message = "Not Found") {
  return error(message, 404);
}

export function withErrorHandling<Args extends any[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err: any) {
      console.error(err);
      return error("Internal Server Error");
    }
  };
}
