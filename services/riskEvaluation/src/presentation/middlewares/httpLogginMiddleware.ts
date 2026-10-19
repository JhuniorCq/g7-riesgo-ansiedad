import type { RequestHandler } from "express";
import { logger } from "../../config/logger.js";

export const httpLoggingMiddleware: RequestHandler = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      },
      "HTTP request completed",
    );
  });

  next();
};
