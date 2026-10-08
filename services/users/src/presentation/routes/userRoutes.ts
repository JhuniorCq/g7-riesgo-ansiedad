import { Router } from "express";
import { UserController } from "../controllers/UserController.js";

export const createUserRouter = (userController: UserController) => {
  const router = Router();

  router.get("/", (req, res) => userController.getAll(req, res));
  router.get("/:id", (req, res) => userController.getById(req, res));
  router.post("/", (req, res) => userController.create(req, res));
  router.post("/login", (req, res) => userController.login(req, res));

  return router;
};
