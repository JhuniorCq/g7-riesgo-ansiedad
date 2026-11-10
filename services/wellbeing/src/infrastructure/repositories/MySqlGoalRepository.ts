import { PoolConnection } from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/database.js";
import { Action, ActionFrequency } from "../../domain/entities/Action.js";
import { Goal, GoalStatus } from "../../domain/entities/Goal.js";
import { ActionAlreadyCompletedError } from "../../domain/errors/ActionAlreadyCompletedError.js";
import { GoalRepository } from "../../domain/repositories/GoalRepository.js";

interface GoalRow extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: GoalStatus;
  target_date: string | null;
  created_at: Date;
}

interface ActionRow extends RowDataPacket {
  id: number;
  goal_id: number;
  description: string;
  frequency: ActionFrequency;
  start_date: string;
  end_date: string | null;
  created_at: Date;
}

interface CompletionRow extends RowDataPacket {
  action_id: number;
  completed_on: string;
}

const GOAL_COLUMNS =
  "id, user_id, title, description, status, target_date, created_at";

export class MySqlGoalRepository implements GoalRepository {
  async save(goal: Goal): Promise<Goal> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute<ResultSetHeader>(
        `
          INSERT INTO wellbeing_goals (
            user_id,
            title,
            description,
            status,
            target_date,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          goal.getUserId(),
          goal.getTitle(),
          goal.getDescription(),
          goal.getStatus(),
          goal.getTargetDate(),
          goal.getCreatedAt(),
        ],
      );

      for (const action of goal.getActions()) {
        await this.insertAction(connection, result.insertId, action);
      }

      await connection.commit();

      goal.assignId(result.insertId);

      return goal;
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  }

  async findByUserId(userId: number): Promise<Goal[]> {
    const [rows] = await pool.execute<GoalRow[]>(
      `
        SELECT ${GOAL_COLUMNS}
        FROM wellbeing_goals
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
      `,
      [userId],
    );

    return this.hydrate(rows);
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Goal | null> {
    const [rows] = await pool.execute<GoalRow[]>(
      `
        SELECT ${GOAL_COLUMNS}
        FROM wellbeing_goals
        WHERE id = ? AND user_id = ?
      `,
      [id, userId],
    );

    const goals = await this.hydrate(rows);

    return goals[0] ?? null;
  }

  async addAction(goalId: number, action: Action): Promise<Action> {
    const connection = await pool.getConnection();

    try {
      await this.insertAction(connection, goalId, action);

      return action;
    } finally {
      connection.release();
    }
  }

  async addCompletion(actionId: number, completedOn: string): Promise<void> {
    try {
      await pool.execute(
        `
          INSERT INTO wellbeing_action_completions (action_id, completed_on)
          VALUES (?, ?)
        `,
        [actionId, completedOn],
      );
    } catch (error) {
      // UNIQUE (action_id, completed_on): cubre solicitudes simultáneas duplicadas
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
        throw new ActionAlreadyCompletedError();
      }

      throw error;
    }
  }

  private async insertAction(
    connection: PoolConnection,
    goalId: number,
    action: Action,
  ): Promise<void> {
    const [result] = await connection.execute<ResultSetHeader>(
      `
        INSERT INTO wellbeing_actions (
          goal_id,
          description,
          frequency,
          start_date,
          end_date,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        goalId,
        action.getDescription(),
        action.getFrequency(),
        action.getStartDate(),
        action.getEndDate(),
        action.getCreatedAt(),
      ],
    );

    action.assignId(result.insertId);
  }

  // Carga las acciones y los cumplimientos de varios objetivos con solo 2 consultas
  private async hydrate(goalRows: GoalRow[]): Promise<Goal[]> {
    if (goalRows.length === 0) {
      return [];
    }

    const [actionRows] = await pool.query<ActionRow[]>(
      `
        SELECT id, goal_id, description, frequency, start_date, end_date, created_at
        FROM wellbeing_actions
        WHERE goal_id IN (?)
        ORDER BY id ASC
      `,
      [goalRows.map((row) => row.id)],
    );

    const completedDatesByAction = new Map<number, string[]>();

    if (actionRows.length > 0) {
      const [completionRows] = await pool.query<CompletionRow[]>(
        `
          SELECT action_id, completed_on
          FROM wellbeing_action_completions
          WHERE action_id IN (?)
          ORDER BY completed_on ASC
        `,
        [actionRows.map((row) => row.id)],
      );

      for (const row of completionRows) {
        const dates = completedDatesByAction.get(row.action_id) ?? [];

        dates.push(row.completed_on);
        completedDatesByAction.set(row.action_id, dates);
      }
    }

    const actionsByGoal = new Map<number, Action[]>();

    for (const row of actionRows) {
      const actions = actionsByGoal.get(row.goal_id) ?? [];

      actions.push(
        new Action({
          id: row.id,
          description: row.description,
          frequency: row.frequency,
          startDate: row.start_date,
          endDate: row.end_date,
          createdAt: row.created_at,
          completedDates: completedDatesByAction.get(row.id) ?? [],
        }),
      );

      actionsByGoal.set(row.goal_id, actions);
    }

    return goalRows.map(
      (row) =>
        new Goal({
          id: row.id,
          userId: row.user_id,
          title: row.title,
          description: row.description,
          status: row.status,
          targetDate: row.target_date,
          createdAt: row.created_at,
          actions: actionsByGoal.get(row.id) ?? [],
        }),
    );
  }
}
