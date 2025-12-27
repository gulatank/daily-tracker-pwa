import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { statisticsService } from '../services/statisticsService';
import type { StatisticsSummary } from '../models/DailySummary';

type StatisticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export default function StatisticsView() {
  const [selectedPeriod, setSelectedPeriod] = useState<StatisticsPeriod>('daily');
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [statistics, setStatistics] = useState<StatisticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod, customStartDate, customEndDate]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const date = new Date();
      let stats: StatisticsSummary;

      switch (selectedPeriod) {
        case 'daily': {
          const dailyStats = await statisticsService.getDailySummary(date);
          const summary: StatisticsSummary = {
            period: 'daily',
            startDate: date,
            endDate: date,
            averageCaloriesConsumed: dailyStats.totalCaloriesConsumed,
            averageCaloriesBurnt: dailyStats.totalCaloriesBurnt,
            averageNetCalories: dailyStats.netCalories,
            averageProtein: dailyStats.totalProtein,
            averageCarbs: dailyStats.totalCarbs,
            averageFats: dailyStats.totalFats,
            totalWorkouts: dailyStats.workoutCount,
            totalFoodEntries: dailyStats.foodEntryCount,
            dailySummaries: [dailyStats]
          };
          setStatistics(summary);
          break;
        }
        case 'weekly':
          stats = await statisticsService.getWeeklySummary(date);
          setStatistics(stats);
          break;
        case 'monthly':
          stats = await statisticsService.getMonthlySummary(date);
          setStatistics(stats);
          break;
        case 'yearly':
          stats = await statisticsService.getYearlySummary(date);
          setStatistics(stats);
          break;
        case 'custom':
          stats = await statisticsService.getStatisticsSummary('custom', customStartDate, customEndDate);
          setStatistics(stats);
          break;
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
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

  if (!statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No statistics available</h3>
          <p className="text-gray-600">Start recording entries to see statistics!</p>
        </div>
      </div>
    );
  }

  const chartData = statistics.dailySummaries.map(summary => ({
    date: new Date(summary.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    consumed: Math.round(summary.totalCaloriesConsumed),
    burnt: Math.round(summary.totalCaloriesBurnt)
  }));

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Statistics</h1>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-xl p-1 overflow-x-auto shadow-inner">
            {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as StatisticsPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-md scale-105'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Picker */}
        {selectedPeriod === 'custom' && (
          <div className="card mb-6 animate-slide-up">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate.toISOString().split('T')[0]}
                  onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate.toISOString().split('T')[0]}
                  onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 animate-slide-up">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Avg Calories Consumed"
              value={Math.round(statistics.averageCaloriesConsumed)}
              unit="kcal"
              color="blue"
            />
            <StatCard
              title="Avg Calories Burnt"
              value={Math.round(statistics.averageCaloriesBurnt)}
              unit="kcal"
              color="orange"
            />
            <StatCard
              title="Avg Net Calories"
              value={Math.round(statistics.averageNetCalories)}
              unit="kcal"
              color={statistics.averageNetCalories > 0 ? 'red' : 'green'}
            />
          </div>

          {/* Macro Breakdown */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Average Macronutrients</h2>
            <div className="space-y-5">
              <MacroBar title="Protein" value={statistics.averageProtein} unit="g" color="red" />
              <MacroBar title="Carbs" value={statistics.averageCarbs} unit="g" color="blue" />
              <MacroBar title="Fats" value={statistics.averageFats} unit="g" color="yellow" />
            </div>
          </div>

          {/* Activity Summary */}
          <div className="card">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 mb-1">{statistics.totalFoodEntries}</p>
                <p className="text-sm text-gray-600 font-medium">Food Entries</p>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 mb-1">{statistics.totalWorkouts}</p>
                <p className="text-sm text-gray-600 font-medium">Workouts</p>
              </div>
            </div>
          </div>

          {/* Daily Trend Chart */}
          {chartData.length > 1 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Daily Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="consumed" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Consumed"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="burnt" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    name="Burnt"
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, color }: { title: string; value: number; unit: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'stat-card-blue',
    orange: 'stat-card-orange',
    red: 'stat-card-red',
    green: 'stat-card-green'
  };

  return (
    <div className={`stat-card ${colorClasses[color] || 'bg-gray-50 text-gray-600'}`}>
      <p className="text-sm font-semibold mb-2 opacity-90">{title}</p>
      <p className="text-3xl font-bold">
        {value} <span className="text-lg font-normal opacity-75">{unit}</span>
      </p>
    </div>
  );
}

function MacroBar({ title, value, unit, color }: { title: string; value: number; unit: string; color: string }) {
  const colorClasses: Record<string, string> = {
    red: 'bg-gradient-to-r from-red-400 to-red-600',
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
    yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-600'
  };

  const maxValue = 200;
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-base font-semibold text-gray-900">{title}</span>
        <span className="text-base font-bold text-gray-700">
          {Math.round(value)} <span className="text-sm font-normal text-gray-600">{unit}</span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-5 shadow-inner">
        <div
          className={`${colorClasses[color] || 'bg-gray-500'} h-5 rounded-full transition-all duration-500 shadow-md`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

