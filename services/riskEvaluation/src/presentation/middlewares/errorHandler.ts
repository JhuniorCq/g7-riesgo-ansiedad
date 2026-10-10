import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (false) {
    return;
  }

  console.log((error as Error).message);

  res.status(500).json({
    message: "Error interno del servidor",
  });
};
