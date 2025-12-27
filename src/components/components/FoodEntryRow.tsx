import type { FoodEntry } from '../../models/FoodEntry';

interface FoodEntryRowProps {
  entry: FoodEntry;
}

export default function FoodEntryRow({ entry }: FoodEntryRowProps) {
  const date = new Date(entry.timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 capitalize">
            {entry.foodName}
          </h3>
          <p className="text-sm text-gray-600">
            {entry.quantity} {entry.unit} • {timeString}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-blue-600">{Math.round(entry.calories)} kcal</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Protein</p>
          <p className="text-sm font-medium">{Math.round(entry.protein)}g</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Carbs</p>
          <p className="text-sm font-medium">{Math.round(entry.carbs)}g</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Fats</p>
          <p className="text-sm font-medium">{Math.round(entry.fats)}g</p>
        </div>
      </div>
    </div>
  );
}

