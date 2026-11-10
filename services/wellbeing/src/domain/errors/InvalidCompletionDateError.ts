export class InvalidCompletionDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCompletionDateError";
  }
}
