import Dexie, { type Table } from 'dexie';
import type { FoodEntry } from './FoodEntry';
import type { WorkoutEntry } from './WorkoutEntry';

export class DailyTrackerDB extends Dexie {
  foodEntries!: Table<FoodEntry, string>;
  workoutEntries!: Table<WorkoutEntry, string>;

  constructor() {
    super('DailyTrackerDB');
    
    this.version(1).stores({
      foodEntries: 'id, timestamp, foodName',
      workoutEntries: 'id, timestamp, activityType'
    });
  }
}

export const db = new DailyTrackerDB();

