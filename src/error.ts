class LexerError extends Error {
  constructor(line: number, index: number, message: string) {
    super(`${line}:${index}: ${message}`);
  }
}

export { LexerError };
