export interface DailySummary {
  date: Date;
  totalCaloriesConsumed: number;
  totalCaloriesBurnt: number;
  netCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  workoutCount: number;
  foodEntryCount: number;
}

export interface StatisticsSummary {
  period: string;
  startDate: Date;
  endDate: Date;
  averageCaloriesConsumed: number;
  averageCaloriesBurnt: number;
  averageNetCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFats: number;
  totalWorkouts: number;
  totalFoodEntries: number;
  dailySummaries: DailySummary[];
}

