import { Router } from "express";
import { UserController } from "../controllers/UserController.js";

export const createUserRouter = (userController: UserController) => {
  const router = Router();

  router.post("/", async (req, res) => await userController.create(req, res));

  return router;
};
