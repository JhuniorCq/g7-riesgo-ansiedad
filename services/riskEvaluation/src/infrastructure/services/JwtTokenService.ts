import {
  AccessTokenPayload,
  TokenService,
} from "../../application/services/TokenService.js";
import { JWT_SECRET } from "../../config/config.js";
import jwt from "jsonwebtoken";

export class JwtTokenService implements TokenService {
  verifyAccessToken(token: string): AccessTokenPayload {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado");
    }

    const payload = jwt.verify(token, JWT_SECRET);

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "number" ||
      !Number.isInteger(payload.userId) ||
      payload.userId <= 0
    ) {
      throw new Error("Token inválido");
    }

    return {
      userId: payload.userId,
    };
  }
}
