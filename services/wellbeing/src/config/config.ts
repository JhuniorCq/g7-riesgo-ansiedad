import "dotenv/config";

export const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SSL,
  JWT_SECRET,
} = process.env;

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3003;