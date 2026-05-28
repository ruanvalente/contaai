export class ActionError extends Error {
  constructor(
    public readonly code: string,
    public readonly userMessage: string,
    cause?: unknown,
  ) {
    super(userMessage, { cause });
    this.name = "ActionError";
  }
}

export function toUserError(error: unknown): string {
  if (error instanceof ActionError) return error.userMessage;
  console.error("[ServerAction Error]", error);
  return "Ocorreu um erro inesperado. Tente novamente.";
}
