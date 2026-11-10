export class ActionAlreadyCompletedError extends Error {
  constructor(
    message: string = "La acción ya fue registrada como cumplida en esa fecha",
  ) {
    super(message);
    this.name = "ActionAlreadyCompletedError";
  }
}
