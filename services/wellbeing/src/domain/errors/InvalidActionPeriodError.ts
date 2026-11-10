export class InvalidActionPeriodError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidActionPeriodError";
  }
}
