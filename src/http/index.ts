type HeaderMap = Record<string, unknown>;

type CookieOptions = {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: string;
  secure?: boolean;
};

type ServerRequestLike = {
  body?: unknown;
  cookies?: Record<string, unknown>;
  get?: (name: string) => unknown;
  headers?: HeaderMap;
  originalUrl?: unknown;
  path?: unknown;
  protocol?: unknown;
  query?: Record<string, unknown>;
  secure?: boolean;
  url?: unknown;
};

type ServerResponseLike = {
  cookie?: (name: string, value: string, options?: CookieOptions) => unknown;
  end?: (body?: unknown) => unknown;
  json?: (body: unknown) => unknown;
  locals?: Record<string, unknown>;
  redirect?: (status: number, url: string) => unknown;
  send?: (body: unknown) => unknown;
  set?: (name: string, value: string) => unknown;
  setHeader?: (name: string, value: string) => unknown;
  status?: (status: number) => ServerResponseLike;
};

function serverString(value: unknown) {
  return String(value == null ? "" : value);
}

function serverObject(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function requestBody(req: ServerRequestLike | null | undefined) {
  return serverObject(req && req.body);
}

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseCookieHeader(header: string) {
  const cookies: Record<string, unknown> = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 1) continue;
    const name = part.slice(0, index).trim();
    if (name && !(name in cookies)) cookies[name] = decodeCookieValue(part.slice(index + 1).trim());
  }
  return cookies;
}

function requestCookies(req: ServerRequestLike | null | undefined) {
  if (req && req.cookies && typeof req.cookies === "object") return req.cookies;
  return parseCookieHeader(requestHeader(req, "cookie"));
}

function requestQuery(req: ServerRequestLike | null | undefined) {
  return serverObject(req && req.query);
}

function requestHeader(req: ServerRequestLike | null | undefined, name: string) {
  const headers = serverObject(req && req.headers);
  const target = name.trim().toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.trim().toLowerCase() === target) return serverString(value);
  }
  return "";
}

function responseSecure(req: ServerRequestLike | null | undefined, forced?: boolean) {
  return typeof forced === "boolean" ? forced : Boolean(req && req.secure);
}

function setResponseHeader(
  res: ServerResponseLike | null | undefined,
  name: string,
  value: string,
) {
  if (res && typeof res.setHeader === "function") return res.setHeader(name, value);
  if (res && typeof res.set === "function") return res.set(name, value);
  return undefined;
}

function sendJson(res: ServerResponseLike | null | undefined, body: unknown, status = 200) {
  if (res && typeof res.status === "function") res.status(status);
  if (res && typeof res.json === "function") return res.json(body);
  setResponseHeader(res, "Content-Type", "application/json; charset=utf-8");
  const payload = JSON.stringify(body == null ? {} : body);
  if (res && typeof res.send === "function") return res.send(payload);
  if (res && typeof res.end === "function") return res.end(payload);
  return payload;
}

function sendText(
  res: ServerResponseLike | null | undefined,
  body: string,
  contentType: string,
  status = 200,
) {
  if (res && typeof res.status === "function") res.status(status);
  setResponseHeader(res, "Content-Type", contentType);
  if (res && typeof res.send === "function") return res.send(body);
  if (res && typeof res.end === "function") return res.end(body);
  return body;
}

function redirectResponse(
  res: ServerResponseLike | null | undefined,
  status: number,
  url: string,
) {
  if (res && typeof res.redirect === "function") return res.redirect(status, url);
  if (res && typeof res.status === "function") res.status(status);
  setResponseHeader(res, "Location", url);
  if (res && typeof res.end === "function") return res.end();
  return undefined;
}

export {
  redirectResponse,
  requestBody,
  requestCookies,
  requestHeader,
  requestQuery,
  responseSecure,
  sendJson,
  sendText,
  serverObject,
  serverString,
  setResponseHeader,
};
export type { CookieOptions, HeaderMap, ServerRequestLike, ServerResponseLike };
