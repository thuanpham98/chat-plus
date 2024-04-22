export class ErrorApi extends Error {
  public code: number | string;
  public message: string;
  public cause: unknown;
  constructor({
    code,
    message,
    cause,
  }: {
    code?: number | string;
    message?: string;
    cause?: unknown;
  }) {
    super(message);
    this.code = code ?? -1;
    this.message = message ?? "";
    this.cause = cause ?? null;
  }
}
