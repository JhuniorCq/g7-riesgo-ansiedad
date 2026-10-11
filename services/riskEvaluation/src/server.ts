import express from "express";
import { PORT } from "./config/config.js";
import { HttpAiPredictionClient } from "./infrastructure/clients/HttpAiPredictionClient.js";
import { MySqlRiskEvaluationRepository } from "./infrastructure/repositories/MySqlRiskEvaluationRepository.js";
import { MySqlRiskRecommendationRepository } from "./infrastructure/repositories/MySqlRiskRecommendationRepository.js";
import { JwtTokenService } from "./infrastructure/services/JwtTokenService.js";
import { CreateRiskEvaluation } from "./application/useCases/CreateRiskEvaluation.js";
import { RiskEvaluationController } from "./presentation/controllers/RiskEvaluationController.js";
import { createAuthMiddleware } from "./presentation/middlewares/authMiddleware.js";
import { createRiskEvaluationRouter } from "./presentation/routes/riskEvaluationRoutes.js";
import { errorHandler } from "./presentation/middlewares/errorHandler.js";
import { FakeAiPredictionClient } from "./infrastructure/clients/FakeAiPredictionClient.js";

const app = express();

app.use(express.json());

// const aiPredictionClient = new HttpAiPredictionClient();
const aiPredictionClient = new FakeAiPredictionClient();
const riskEvaluationRepository = new MySqlRiskEvaluationRepository();
const riskRecommendationRepository = new MySqlRiskRecommendationRepository();
const tokenService = new JwtTokenService();

const createRiskEvaluation = new CreateRiskEvaluation(
  riskEvaluationRepository,
  riskRecommendationRepository,
  aiPredictionClient,
);

const riskEvaluationController = new RiskEvaluationController(
  createRiskEvaluation,
);

const authMiddleware = createAuthMiddleware(tokenService);

const riskEvaluationRouter = createRiskEvaluationRouter(
  riskEvaluationController,
  authMiddleware,
);

app.use("/risk-evaluations", riskEvaluationRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    service: "riskEvaluation",
    status: "OK",
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Risk Evaluation Service corriendo en el puerto ${PORT}`);
});
