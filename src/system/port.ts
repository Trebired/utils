import fs from "node:fs";
import { platform } from "node:process";

function toPortNumber(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) return null;
  return parsed;
}

function createListenHandlers(
  server: any,
  state: {
    host?: string;
    requestedPort: number | null;
    targetPort: number;
  },
  resolve: (value: unknown) => void,
  reject: (reason?: unknown) => void,
) {
  function cleanup() {
    server.off("listening", onListening);
    server.off("error", onError);
  }

  function bind() {
    server.once("listening", onListening);
    server.once("error", onError);
    server.listen(state.targetPort, state.host);
  }

  function onListening() {
    cleanup();
    const address =
    typeof server.address === "function" ? server.address() : null;
    const actualPort =
    address && typeof address === "object" && typeof address.port === "number"
    ? address.port
    : state.targetPort;
    resolve({
        ok: true,
        requested_port: state.requestedPort,
        port: actualPort,
        host: state.host || "",
    });
  }

  function onError(error: unknown) {
    cleanup();
    reject(error);
  }

  return { bind };
}

function listenOnConfiguredPort(server: any, options: any = {}) {
  const requestedPort = toPortNumber(options.port);
  const state = {
    host: String(options.host == null ? "" : options.host).trim() || undefined,
    requestedPort,
    targetPort: requestedPort == null ? 0 : requestedPort,
  };
  return new Promise((resolve, reject) => {
      createListenHandlers(server, state, resolve, reject).bind();
  });
}

function parseListeningPortsFromProcNet(filePath: string): Set<number> {
  try {
    const content = String(fs.readFileSync(filePath, "utf8") || "");
    const lines = content.split("\n").slice(1);
    const ports = new Set<number>();

    for (const line of lines) {
      const trimmed = String(line || "").trim();
      if (!trimmed) continue;
      const parts = trimmed.split(/\s+/);
      const localAddress = String(parts[1] || "");
      const state = String(parts[3] || "").toUpperCase();
      if (!localAddress || state !== "0A") continue;

      const addressParts = localAddress.split(":");
      const portHex = String(addressParts[1] || "");
      const port = Number.parseInt(portHex, 16);
      if (Number.isInteger(port) && port >= 1 && port <= 65535) {
        ports.add(port);
      }
    }

    return ports;
  } catch {
    return new Set();
  }
}

function parseListeningSocketInodesFromProcNet(
  filePath: string,
  targetPort: unknown,
): Set<string> {
  const port = toPortNumber(targetPort);
  if (port == null) return new Set();

  try {
    const content = String(fs.readFileSync(filePath, "utf8") || "");
    const lines = content.split("\n").slice(1);
    const inodes = new Set<string>();

    for (const line of lines) {
      const trimmed = String(line || "").trim();
      if (!trimmed) continue;
      const parts = trimmed.split(/\s+/);
      const localAddress = String(parts[1] || "");
      const state = String(parts[3] || "").toUpperCase();
      const inode = String(parts[9] || "");
      if (!localAddress || state !== "0A" || !inode) continue;

      const addressParts = localAddress.split(":");
      const portHex = String(addressParts[1] || "");
      const parsedPort = Number.parseInt(portHex, 16);
      if (parsedPort === port) inodes.add(inode);
    }

    return inodes;
  } catch {
    return new Set();
  }
}

function readPidDirectories(): string[] {
  try {
    return fs
    .readdirSync("/proc", { withFileTypes: true })
    .filter(
      (entry) =>
      entry &&
        entry.isDirectory &&
        entry.isDirectory() &&
        /^\d+$/.test(String(entry.name || "")),
    )
    .map((entry) => String(entry.name || ""));
  } catch {
    return [];
  }
}

function getLocalListeningPortPids(value: unknown): number[] {
  const port = toPortNumber(value);
  if (port == null || platform !== "linux") return [];

  const inodes = new Set([
      ...parseListeningSocketInodesFromProcNet("/proc/net/tcp", port),
      ...parseListeningSocketInodesFromProcNet("/proc/net/tcp6", port),
  ]);
  if (!inodes.size) return [];

  const pids = new Set<number>();
  for (const pid of readPidDirectories()) {
    const fdDir = `/proc/${pid}/fd`;
    let fdEntries: string[] = [];
    try {
      fdEntries = fs.readdirSync(fdDir);
    } catch {
      continue;
    }

    for (const fdEntry of fdEntries) {
      try {
        const target = String(fs.readlinkSync(`${fdDir}/${fdEntry}`) || "");
        const match = /^socket:\[(\d+)\]$/.exec(target);
        if (!match || !inodes.has(String(match[1] || ""))) continue;
        pids.add(Number(pid));
        break;
      } catch {}
    }
  }

  return Array.from(pids).filter((pid) => Number.isInteger(pid) && pid > 0);
}

function isLocalPortListening(value: unknown): boolean {
  const port = toPortNumber(value);
  if (port == null || platform !== "linux") return false;

  const ipv4 = parseListeningPortsFromProcNet("/proc/net/tcp");
  if (ipv4.has(port)) return true;
  return parseListeningPortsFromProcNet("/proc/net/tcp6").has(port);
}

export {
  getLocalListeningPortPids,
  isLocalPortListening,
  listenOnConfiguredPort,
  toPortNumber,
};
