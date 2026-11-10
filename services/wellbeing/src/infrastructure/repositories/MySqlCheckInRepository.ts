import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/database.js";
import { CheckIn, WellbeingContext } from "../../domain/entities/CheckIn.js";
import {
  CheckInHistoryFilters,
  CheckInRepository,
} from "../../domain/repositories/CheckInRepository.js";

interface CheckInRow extends RowDataPacket {
  id: number;
  user_id: number;
  level: number;
  context: WellbeingContext | null;
  created_at: Date;
}

export class MySqlCheckInRepository implements CheckInRepository {
  async save(checkIn: CheckIn): Promise<CheckIn> {
    const [result] = await pool.execute<ResultSetHeader>(
      `
        INSERT INTO wellbeing_checkins (
          user_id,
          level,
          context,
          created_at
        ) VALUES (?, ?, ?, ?)
      `,
      [
        checkIn.getUserId(),
        checkIn.getScore(),
        checkIn.getContext(),
        checkIn.getCreatedAt(),
      ],
    );

    checkIn.assignId(result.insertId);

    return checkIn;
  }

  async findByUserId(
    userId: number,
    filters: CheckInHistoryFilters = {},
  ): Promise<CheckIn[]> {
    const conditions: string[] = ["user_id = ?"];
    const params: Array<number | Date> = [userId];

    if (filters.from) {
      conditions.push("created_at >= ?");
      params.push(filters.from);
    }

    if (filters.to) {
      conditions.push("created_at <= ?");
      params.push(filters.to);
    }

    const [rows] = await pool.execute<CheckInRow[]>(
      `
        SELECT id, user_id, level, context, created_at
        FROM wellbeing_checkins
        WHERE ${conditions.join(" AND ")}
        ORDER BY created_at ASC, id ASC
      `,
      params,
    );

    return rows.map(
      (row) =>
        new CheckIn({
          id: row.id,
          userId: row.user_id,
          level: CheckIn.scoreToLevel(row.level),
          context: row.context,
          createdAt: row.created_at,
        }),
    );
  }
}