import type { DailySummary, StatisticsSummary } from '../models/DailySummary';
import type { FoodEntry } from '../models/FoodEntry';
import type { WorkoutEntry } from '../models/WorkoutEntry';
import { storageService } from './storageService';

export class StatisticsService {
  private static instance: StatisticsService;
  
  static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }
  
  async getDailySummary(forDate: Date): Promise<DailySummary> {
    // Fetch food entries
    const foodEntries = await storageService.getFoodEntries(forDate);
    
    // Fetch workout entries
    const workoutEntries = await storageService.getWorkoutEntries(forDate);
    
    // Calculate totals
    const totalCaloriesConsumed = foodEntries.reduce((sum: number, entry: FoodEntry) => sum + entry.calories, 0);
    const totalCaloriesBurnt = workoutEntries.reduce((sum: number, entry: WorkoutEntry) => sum + entry.caloriesBurnt, 0);
    const netCalories = totalCaloriesConsumed - totalCaloriesBurnt;
    
    const totalProtein = foodEntries.reduce((sum: number, entry: FoodEntry) => sum + entry.protein, 0);
    const totalCarbs = foodEntries.reduce((sum: number, entry: FoodEntry) => sum + entry.carbs, 0);
    const totalFats = foodEntries.reduce((sum: number, entry: FoodEntry) => sum + entry.fats, 0);
    const totalFiber = foodEntries.reduce((sum: number, entry: FoodEntry) => sum + entry.fiber, 0);
    const totalSugar = foodEntries.reduce((sum: number, entry: FoodEntry) => sum + entry.sugar, 0);
    const totalSodium = foodEntries.reduce((sum: number, entry: FoodEntry) => sum + entry.sodium, 0);
    
    return {
      date: forDate,
      totalCaloriesConsumed,
      totalCaloriesBurnt,
      netCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      totalFiber,
      totalSugar,
      totalSodium,
      workoutCount: workoutEntries.length,
      foodEntryCount: foodEntries.length
    };
  }
  
  async getStatisticsSummary(period: string, startDate: Date, endDate: Date): Promise<StatisticsSummary> {
    const calendar = new Date(startDate);
    calendar.setHours(0, 0, 0, 0);
    const start = new Date(calendar);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const dailySummaries: DailySummary[] = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      dailySummaries.push(await this.getDailySummary(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const count = dailySummaries.length;
    if (count === 0) {
      return {
        period,
        startDate,
        endDate,
        averageCaloriesConsumed: 0,
        averageCaloriesBurnt: 0,
        averageNetCalories: 0,
        averageProtein: 0,
        averageCarbs: 0,
        averageFats: 0,
        totalWorkouts: 0,
        totalFoodEntries: 0,
        dailySummaries: []
      };
    }
    
    const averageCaloriesConsumed = dailySummaries.reduce((sum, s) => sum + s.totalCaloriesConsumed, 0) / count;
    const averageCaloriesBurnt = dailySummaries.reduce((sum, s) => sum + s.totalCaloriesBurnt, 0) / count;
    const averageNetCalories = dailySummaries.reduce((sum, s) => sum + s.netCalories, 0) / count;
    const averageProtein = dailySummaries.reduce((sum, s) => sum + s.totalProtein, 0) / count;
    const averageCarbs = dailySummaries.reduce((sum, s) => sum + s.totalCarbs, 0) / count;
    const averageFats = dailySummaries.reduce((sum, s) => sum + s.totalFats, 0) / count;
    const totalWorkouts = dailySummaries.reduce((sum, s) => sum + s.workoutCount, 0);
    const totalFoodEntries = dailySummaries.reduce((sum, s) => sum + s.foodEntryCount, 0);
    
    return {
      period,
      startDate,
      endDate,
      averageCaloriesConsumed,
      averageCaloriesBurnt,
      averageNetCalories,
      averageProtein,
      averageCarbs,
      averageFats,
      totalWorkouts,
      totalFoodEntries,
      dailySummaries
    };
  }
  
  async getWeeklySummary(forDate: Date): Promise<StatisticsSummary> {
    const calendar = new Date(forDate);
    const weekday = calendar.getDay();
    const startOfWeek = new Date(calendar);
    startOfWeek.setDate(calendar.getDate() - weekday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return await this.getStatisticsSummary("weekly", startOfWeek, endOfWeek);
  }
  
  async getMonthlySummary(forDate: Date): Promise<StatisticsSummary> {
    const startOfMonth = new Date(forDate.getFullYear(), forDate.getMonth(), 1);
    const endOfMonth = new Date(forDate.getFullYear(), forDate.getMonth() + 1, 0);
    
    return await this.getStatisticsSummary("monthly", startOfMonth, endOfMonth);
  }
  
  async getYearlySummary(forDate: Date): Promise<StatisticsSummary> {
    const startOfYear = new Date(forDate.getFullYear(), 0, 1);
    const endOfYear = new Date(forDate.getFullYear(), 11, 31);
    
    return await this.getStatisticsSummary("yearly", startOfYear, endOfYear);
  }
}

export const statisticsService = StatisticsService.getInstance();

