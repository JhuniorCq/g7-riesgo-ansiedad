import { ResultSetHeader, RowDataPacket } from "mysql2";
import { User } from "../../domain/entities/User.js";
import { UserRepository } from "../../domain/repositories/UserRepository.js";
import { pool } from "../../config/database.js";

interface UserRow extends RowDataPacket {
  id: number;
  names: string;
  surnames: string;
  code: string;
  email: string;
  password: string;
  created_at: Date;
}

export class MySqlUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const [result] = await pool.execute<ResultSetHeader>(
      `
        INSERT INTO users (
          names,
          surnames,
          code,
          email,
          password,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        user.getNames(),
        user.getSurnames(),
        user.getCode(),
        user.getEmail(),
        user.getPassword(),
        user.getCreatedAt(),
      ],
    );

    user.assignId(result.insertId);

    return user;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      `
        SELECT
          id,
          names,
          surnames,
          code,
          email,
          password,
          created_at
        FROM users
        WHERE id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return new User({
      id: row.id,
      names: row.names,
      surnames: row.surnames,
      code: row.code,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      `
        SELECT
          id,
          names,
          surnames,
          code,
          email,
          password,
          created_at
        FROM users
        WHERE email = ?
      `,
      [email],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return new User({
      id: row.id,
      names: row.names,
      surnames: row.surnames,
      code: row.code,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
    });
  }

  async findByCode(code: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      `
        SELECT
          id,
          names,
          surnames,
          code,
          email,
          password,
          created_at
        FROM users
        WHERE code = ?
      `,
      [code],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return new User({
      id: row.id,
      names: row.names,
      surnames: row.surnames,
      code: row.code,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
    });
  }
}
