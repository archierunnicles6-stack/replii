const ALLOWED_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|replii\.ai|www\.replii\.ai|replii-lac\.vercel\.app)(:\d+)?$/;

export function corsHeaders(request: Request): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin");
  headers.set(
    "Access-Control-Allow-Origin",
    origin && ALLOWED_ORIGIN.test(origin) ? origin : "*",
  );
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}

export function jsonWithCors(
  request: Request,
  body: unknown,
  init?: ResponseInit,
): Response {
  const headers = corsHeaders(request);
  const responseHeaders = new Headers(init?.headers);
  headers.forEach((value, key) => responseHeaders.set(key, value));
  return Response.json(body, { ...init, headers: responseHeaders });
}

export function optionsResponse(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
