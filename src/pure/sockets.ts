function disconnectSocketHard(socket: unknown): void {
  try {
    (socket as { disconnect: (close: boolean) => void }).disconnect(true);
  } catch {}
}

export { disconnectSocketHard };
