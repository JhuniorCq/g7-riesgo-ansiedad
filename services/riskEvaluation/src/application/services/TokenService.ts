export interface AccessTokenPayload {
  userId: number;
}

export interface TokenService {
  verifyAccessToken(token: string): AccessTokenPayload;
}
