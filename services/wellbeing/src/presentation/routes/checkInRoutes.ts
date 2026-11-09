import { RequestHandler, Router } from "express";
import { CheckInController } from "../controllers/CheckInController.js";
import { createRoleMiddleware } from "../middlewares/roleMiddleware.js";

export const createCheckInRouter = (
  checkInController: CheckInController,
  authMiddleware: RequestHandler,
): Router => {
  const router = Router();

  router.post(
    "/",
    authMiddleware,
    createRoleMiddleware("ESTUDIANTE"),
    (req, res) => checkInController.register(req, res),
  );

  return router;
};
