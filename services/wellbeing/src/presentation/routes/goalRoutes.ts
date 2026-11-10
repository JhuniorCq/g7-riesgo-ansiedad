import { RequestHandler, Router } from "express";
import { GoalController } from "../controllers/GoalController.js";
import { createRoleMiddleware } from "../middlewares/roleMiddleware.js";

export const createGoalRouter = (
  goalController: GoalController,
  authMiddleware: RequestHandler,
): Router => {
  const router = Router();
  const onlyStudents = createRoleMiddleware("ESTUDIANTE");

  router.post("/", authMiddleware, onlyStudents, (req, res) =>
    goalController.create(req, res),
  );

  router.get("/", authMiddleware, onlyStudents, (req, res) =>
    goalController.getMine(req, res),
  );

  router.get("/:goalId", authMiddleware, onlyStudents, (req, res) =>
    goalController.getMineById(req, res),
  );

  router.post("/:goalId/actions", authMiddleware, onlyStudents, (req, res) =>
    goalController.addAction(req, res),
  );

  router.post(
    "/:goalId/actions/:actionId/completions",
    authMiddleware,
    onlyStudents,
    (req, res) => goalController.registerCompletion(req, res),
  );

  return router;
};
