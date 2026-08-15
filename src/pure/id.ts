function generateId(kind: string, value?: unknown): string {
  if (kind === "numeric") return generateNumericId();
  if (kind === "token") return generateTokenId(value);
  if (kind === "text") return generateTextId(value);
  throw new Error(`Unsupported id kind: ${String(kind)}`);
}

function generateNumericId(): string {
  const bytes = randomBytes(30);
  return Array.from(bytes, (entry) => String(entry % 10)).join("");
}

function generateTokenId(value: unknown): string {
  const length =
  Number.isFinite(Number(value)) && Number(value) > 0
  ? Math.trunc(Number(value))
  : 11;
  const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
  const bytes = randomBytes(length);
  return Array.from(bytes, (entry) => chars.charAt(entry % chars.length)).join(
    "",
  );
}

function generateTextId(value: unknown): string {
  return String(value || "")
  .replace(/[^a-zA-Z0-9]/gu, "")
  .toLowerCase();
}

function randomToken(bytes = 24): string {
  const size =
  Number.isFinite(Number(bytes)) && Number(bytes) > 0
  ? Math.trunc(Number(bytes))
  : 24;
  return bytesToBase64Url(randomBytes(size));
}

function generateNumericCode(length = 6): string {
  const size =
  Number.isFinite(Number(length)) && Number(length) > 0
  ? Math.trunc(Number(length))
  : 6;
  let code = "";
  for (let index = 0; index < size; index += 1) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

function randomBytes(size: number): Uint8Array {
  const values = new Uint8Array(size);
  const cryptoLike = (globalThis as {
      crypto?: { getRandomValues?: <T extends Uint8Array > (array: T) => T };
  }).crypto;
  if (cryptoLike && typeof cryptoLike.getRandomValues === "function") {
    cryptoLike.getRandomValues(values);
    return values;
  }

  for (let index = 0; index < values.length; index += 1) {
    values[index] = Math.floor(Math.random() * 256);
  }
  return values;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    output += encodeBase64Chunk(
      bytes[index] || 0,
      bytes[index + 1],
      bytes[index + 2],
    );
  }
  return output.replace(/=+$/u, "").replace(/\+/gu, "-").replace(/\//gu, "_");
}

const BASE64_ALPHABET =
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function encodeBase64Chunk(
  first: number,
  second: number | undefined,
  third: number | undefined,
): string {
  const hasSecond = second != null;
  const hasThird = third != null;
  const value = (first<<16) | ((second || 0)<<8) | (third || 0);
  return [
    BASE64_ALPHABET[(value >> 18)&63],
    BASE64_ALPHABET[(value >> 12)&63],
    hasSecond ? BASE64_ALPHABET[(value >> 6)&63] : "=",
    hasThird ? BASE64_ALPHABET[value&63] : "=",
  ].join("");
}

export { generateId, generateNumericCode, randomToken };
