import { RequestHandler, Router } from "express";
import { RiskEvaluationController } from "../controllers/RiskEvaluationController.js";
import { createRoleMiddleware } from "../middlewares/roleMiddleware.js";

export const createRiskEvaluationRouter = (
  riskEvaluationController: RiskEvaluationController,
  authMiddleware: RequestHandler,
): Router => {
  const router = Router();

  router.post(
    "/",
    authMiddleware,
    createRoleMiddleware("ESTUDIANTE"),
    (req, res) => riskEvaluationController.create(req, res),
  );

  return router;
};
