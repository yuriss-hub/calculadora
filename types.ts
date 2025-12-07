export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum UnitSystem {
  Metric = 'metric',
  Imperial = 'imperial',
}

export enum ActivityLevel {
  Sedentary = 'sedentary',
  LightlyActive = 'lightly_active',
  ModeratelyActive = 'moderately_active',
  VeryActive = 'very_active',
  ExtraActive = 'extra_active',
}

export enum GoalType {
  TargetDate = 'target_date',
  WeeklyRate = 'weekly_rate',
}

export interface UserStats {
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  targetDate?: string;
  weeklyLossKg?: number;
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  daysToGoal: number;
  completionDate: Date;
  weeklyDeficit: number;
  projectedData: { day: number; weight: number; dateStr: string }[];
  warning?: string;
}
