import express from "express";
import { logger } from "./config/logger.js";
import { PORT } from "./config/config.js";
import { pool } from "./config/database.js";
import { MySqlCheckInRepository } from "./infrastructure/repositories/MySqlCheckInRepository.js";
import { JwtTokenService } from "./infrastructure/services/JwtTokenService.js";
import { RegisterCheckIn } from "./application/useCases/RegisterCheckIn.js";
import { GetCheckInHistory } from "./application/useCases/GetCheckInHistory.js";
import { CreateGoal } from "./application/useCases/CreateGoal.js";
import { GetMyGoals } from "./application/useCases/GetMyGoals.js";
import { GetMyGoalById } from "./application/useCases/GetMyGoalById.js";
import { AddActionToGoal } from "./application/useCases/AddActionToGoal.js";
import { RegisterActionCompletion } from "./application/useCases/RegisterActionCompletion.js";
import { MySqlGoalRepository } from "./infrastructure/repositories/MySqlGoalRepository.js";
import { LimaClock } from "./infrastructure/services/LimaClock.js";
import { GoalController } from "./presentation/controllers/GoalController.js";
import { createGoalRouter } from "./presentation/routes/goalRoutes.js";
import { CheckInController } from "./presentation/controllers/CheckInController.js";
import { createAuthMiddleware } from "./presentation/middlewares/authMiddleware.js";
import { createCheckInRouter } from "./presentation/routes/checkInRoutes.js";
import { errorHandler } from "./presentation/middlewares/errorHandler.js";
import { httpLoggingMiddleware } from "./presentation/middlewares/httpLogginMiddleware.js";

const app = express();

app.use(httpLoggingMiddleware);
app.use(express.json());

const checkInRepository = new MySqlCheckInRepository();
const goalRepository = new MySqlGoalRepository();
const tokenService = new JwtTokenService();
const clock = new LimaClock();

const registerCheckIn = new RegisterCheckIn(checkInRepository);
const getCheckInHistory = new GetCheckInHistory(checkInRepository);

const createGoal = new CreateGoal(goalRepository, clock);
const getMyGoals = new GetMyGoals(goalRepository);
const getMyGoalById = new GetMyGoalById(goalRepository);
const addActionToGoal = new AddActionToGoal(goalRepository, clock);
const registerActionCompletion = new RegisterActionCompletion(
  goalRepository,
  clock,
);

const checkInController = new CheckInController(
  registerCheckIn,
  getCheckInHistory,
);

const goalController = new GoalController(
  createGoal,
  getMyGoals,
  getMyGoalById,
  addActionToGoal,
  registerActionCompletion,
  clock,
);

const authMiddleware = createAuthMiddleware(tokenService);

const checkInRouter = createCheckInRouter(checkInController, authMiddleware);
const goalRouter = createGoalRouter(goalController, authMiddleware);

app.use("/wellbeing/check-ins", checkInRouter);
app.use("/wellbeing/goals", goalRouter);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      service: "wellbeing",
      status: "OK",
      database: "OK",
    });
  } catch (error) {
    logger.error({ err: error }, "Error consultando MySQL en /health");

    res.status(503).json({
      service: "wellbeing",
      status: "ERROR",
      database: "UNAVAILABLE",
    });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Wellbeing Service corriendo en el puerto ${PORT}`);

  logger.info({ port: PORT }, "Wellbeing Service iniciado");
});