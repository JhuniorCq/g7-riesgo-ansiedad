import { RequestHandler, Router } from "express";
import { RiskEvaluationController } from "../controllers/RiskEvaluationController.js";

export const createRiskEvaluationRouter = (
  riskEvaluationController: RiskEvaluationController,
  authMiddleware: RequestHandler,
): Router => {
  const router = Router();

  router.post("/", authMiddleware, (req, res) =>
    riskEvaluationController.create(req, res),
  );

  return router;
};
