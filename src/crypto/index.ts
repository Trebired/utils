import { createHash } from "node:crypto";

function sha256Hex(value: unknown): string {
  return createHash("sha256")
  .update(String(value == null ? "" : value))
  .digest("hex");
}

export { sha256Hex };
