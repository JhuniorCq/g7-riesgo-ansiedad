import { Action } from "../../domain/entities/Action.js";
import { Goal } from "../../domain/entities/Goal.js";

const toActionResponse = (action: Action, today: string) => ({
  id: action.getId(),
  description: action.getDescription(),
  frequency: action.getFrequency(),
  startDate: action.getStartDate(),
  endDate: action.getEndDate(),
  completedDates: action.getCompletedDates(),
  progress: action.getProgress(today),
  createdAt: action.getCreatedAt(),
});

export const toGoalResponse = (goal: Goal, today: string) => ({
  id: goal.getId(),
  title: goal.getTitle(),
  description: goal.getDescription(),
  status: goal.getStatus(),
  targetDate: goal.getTargetDate(),
  progress: goal.getProgress(today),
  actions: goal.getActions().map((action) => toActionResponse(action, today)),
  createdAt: goal.getCreatedAt(),
});
