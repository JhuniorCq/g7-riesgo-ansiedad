import { ResultSetHeader } from "mysql2";
import { pool } from "../../config/database.js";
import { CheckIn } from "../../domain/entities/CheckIn.js";
import { CheckInRepository } from "../../domain/repositories/CheckInRepository.js";

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
}
