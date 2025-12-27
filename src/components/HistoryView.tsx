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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">History</h1>

        {/* Segment Selector */}
        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setSelectedSegment(0)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedSegment === 0
                  ? 'bg-white text-blue-600 shadow-md scale-105'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Food
            </button>
            <button
              onClick={() => setSelectedSegment(1)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedSegment === 1
                  ? 'bg-white text-blue-600 shadow-md scale-105'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Workouts
            </button>
          </div>
        </div>

        {selectedSegment === 0 ? (
          <div className="space-y-8 animate-slide-up">
            {Object.keys(groupedFoodEntries)
              .sort((a, b) => b.localeCompare(a))
              .map((dateKey) => (
                <div key={dateKey} className="animate-slide-up">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                    {formatDate(dateKey)}
                  </h2>
                  <div className="space-y-4">
                    {groupedFoodEntries[dateKey].map((entry) => (
                      <div key={entry.id} className="relative group card card-hover">
                        <FoodEntryRow entry={entry} />
                        <button
                          onClick={() => handleDeleteFood(entry)}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 text-red-500 hover:text-red-700 hover:scale-110 p-2 rounded-lg hover:bg-red-50"
                          aria-label="Delete entry"
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
              <div className="card text-center py-16 animate-fade-in">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No food entries yet</h3>
                <p className="text-gray-600">Start recording your meals to see them here!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            {Object.keys(groupedWorkoutEntries)
              .sort((a, b) => b.localeCompare(a))
              .map((dateKey) => (
                <div key={dateKey} className="animate-slide-up">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                    {formatDate(dateKey)}
                  </h2>
                  <div className="space-y-4">
                    {groupedWorkoutEntries[dateKey].map((entry) => (
                      <div key={entry.id} className="relative group card card-hover">
                        <WorkoutEntryRow entry={entry} />
                        <button
                          onClick={() => handleDeleteWorkout(entry)}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 text-red-500 hover:text-red-700 hover:scale-110 p-2 rounded-lg hover:bg-red-50"
                          aria-label="Delete entry"
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
              <div className="card text-center py-16 animate-fade-in">
                <div className="text-6xl mb-4">💪</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No workout entries yet</h3>
                <p className="text-gray-600">Start recording your workouts to see them here!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

