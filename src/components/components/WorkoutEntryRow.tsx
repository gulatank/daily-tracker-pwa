import type { WorkoutEntry } from '../../models/WorkoutEntry';

interface WorkoutEntryRowProps {
  entry: WorkoutEntry;
}

export default function WorkoutEntryRow({ entry }: WorkoutEntryRowProps) {
  const date = new Date(entry.timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-900 capitalize mb-1">
            {entry.activityType}
          </h3>
          <p className="text-sm text-gray-600 font-medium">
            {Math.round(entry.duration)} min • {entry.intensity} intensity • {timeString}
          </p>
        </div>
        <div className="text-right ml-4">
          <p className="font-bold text-2xl text-orange-600">{Math.round(entry.caloriesBurnt)}</p>
          <p className="text-xs text-gray-500 font-medium">kcal burnt</p>
        </div>
      </div>
    </div>
  );
}

