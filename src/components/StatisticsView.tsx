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
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-12 text-gray-500">No statistics available</div>
      </div>
    );
  }

  const chartData = statistics.dailySummaries.map(summary => ({
    date: new Date(summary.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    consumed: Math.round(summary.totalCaloriesConsumed),
    burnt: Math.round(summary.totalCaloriesBurnt)
  }));

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Statistics</h1>

      <div className="mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as StatisticsPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                selectedPeriod === period
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {selectedPeriod === 'custom' && (
        <div className="mb-4 space-y-3 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={customStartDate.toISOString().split('T')[0]}
              onChange={(e) => setCustomStartDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={customEndDate.toISOString().split('T')[0]}
              onChange={(e) => setCustomEndDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Average Macronutrients</h2>
          <div className="space-y-4">
            <MacroBar title="Protein" value={statistics.averageProtein} unit="g" color="red" />
            <MacroBar title="Carbs" value={statistics.averageCarbs} unit="g" color="blue" />
            <MacroBar title="Fats" value={statistics.averageFats} unit="g" color="yellow" />
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-around items-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{statistics.totalFoodEntries}</p>
              <p className="text-sm text-gray-500 mt-1">Food Entries</p>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{statistics.totalWorkouts}</p>
              <p className="text-sm text-gray-500 mt-1">Workouts</p>
            </div>
          </div>
        </div>

        {/* Daily Trend Chart */}
        {chartData.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Daily Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="consumed" stroke="#3b82f6" name="Consumed" />
                <Line type="monotone" dataKey="burnt" stroke="#f97316" name="Burnt" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, color }: { title: string; value: number; unit: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <div className={`${colorClasses[color] || 'bg-gray-50 text-gray-600'} rounded-lg p-4`}>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold">
        {value} <span className="text-sm font-normal">{unit}</span>
      </p>
    </div>
  );
}

function MacroBar({ title, value, unit, color }: { title: string; value: number; unit: string; color: string }) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500'
  };

  const maxValue = 200;
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-sm text-gray-600">
          {Math.round(value)} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`${colorClasses[color] || 'bg-gray-500'} h-4 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

