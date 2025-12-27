import { useState, useEffect } from 'react';
import type { FoodEntry } from '../models/FoodEntry';
import type { WorkoutEntry } from '../models/WorkoutEntry';
import { storageService } from '../services/storageService';
import FoodEntryRow from './components/FoodEntryRow';
import WorkoutEntryRow from './components/WorkoutEntryRow';

export default function HistoryView() {
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const foods = await storageService.getAllFoodEntries();
      const workouts = await storageService.getAllWorkoutEntries();
      setFoodEntries(foods);
      setWorkoutEntries(workouts);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedFoodEntries = foodEntries.reduce((acc, entry) => {
    const date = new Date(entry.timestamp);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const groupedWorkoutEntries = workoutEntries.reduce((acc, entry) => {
    const date = new Date(entry.timestamp);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDeleteFood = async (entry: FoodEntry) => {
    if (confirm('Delete this food entry?')) {
      await storageService.deleteFoodEntry(entry);
      loadEntries();
    }
  };

  const handleDeleteWorkout = async (entry: WorkoutEntry) => {
    if (confirm('Delete this workout entry?')) {
      await storageService.deleteWorkoutEntry(entry);
      loadEntries();
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">History</h1>

      <div className="mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedSegment(0)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedSegment === 0
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Food
          </button>
          <button
            onClick={() => setSelectedSegment(1)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedSegment === 1
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Workouts
          </button>
        </div>
      </div>

      {selectedSegment === 0 ? (
        <div className="space-y-6">
          {Object.keys(groupedFoodEntries)
            .sort((a, b) => b.localeCompare(a))
            .map((dateKey) => (
              <div key={dateKey}>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  {formatDate(dateKey)}
                </h2>
                <div className="space-y-3">
                  {groupedFoodEntries[dateKey].map((entry) => (
                    <div key={entry.id} className="relative group">
                      <FoodEntryRow entry={entry} />
                      <button
                        onClick={() => handleDeleteFood(entry)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {Object.keys(groupedFoodEntries).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No food entries yet
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedWorkoutEntries)
            .sort((a, b) => b.localeCompare(a))
            .map((dateKey) => (
              <div key={dateKey}>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  {formatDate(dateKey)}
                </h2>
                <div className="space-y-3">
                  {groupedWorkoutEntries[dateKey].map((entry) => (
                    <div key={entry.id} className="relative group">
                      <WorkoutEntryRow entry={entry} />
                      <button
                        onClick={() => handleDeleteWorkout(entry)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {Object.keys(groupedWorkoutEntries).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No workout entries yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

