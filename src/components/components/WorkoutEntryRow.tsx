import type { WorkoutEntry } from '../../models/WorkoutEntry';

interface WorkoutEntryRowProps {
  entry: WorkoutEntry;
}

export default function WorkoutEntryRow({ entry }: WorkoutEntryRowProps) {
  const date = new Date(entry.timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 capitalize">
            {entry.activityType}
          </h3>
          <p className="text-sm text-gray-600">
            {Math.round(entry.duration)} min • {entry.intensity} intensity • {timeString}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-orange-600">{Math.round(entry.caloriesBurnt)} kcal</p>
          <p className="text-xs text-gray-500">burnt</p>
        </div>
      </div>
    </div>
  );
}

