import express from "express";
import { PORT } from "./config/config.js";
import { errorHandler } from "./presentation/middlewares/errorHandler.js";
import { MySqlUserRepository } from "./infrastructure/repositories/MySqlUserRepository.js";
import { CreateUser } from "./application/useCases/CreateUser.js";
import { BcryptPasswordHasher } from "./infrastructure/services/BcryptPasswordHasher.js";
import { UserController } from "./presentation/controllers/UserController.js";
import { createUserRouter } from "./presentation/routes/userRoutes.js";

const app = express();

app.use(express.json());

const userRepository = new MySqlUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const createUser = new CreateUser(userRepository, passwordHasher);
const userController = new UserController(createUser);
const userRouter = createUserRouter(userController);

app.use("/users", userRouter);

app.get("/health", (_req, res) => {
  res.json({
    service: "users",
    stastus: "OK",
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Books Service corriendo en el puerto ${PORT}`);
});
