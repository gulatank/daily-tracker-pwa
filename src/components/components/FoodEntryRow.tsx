import type { FoodEntry } from '../../models/FoodEntry';

interface FoodEntryRowProps {
  entry: FoodEntry;
}

export default function FoodEntryRow({ entry }: FoodEntryRowProps) {
  const date = new Date(entry.timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-900 capitalize mb-1">
            {entry.foodName}
          </h3>
          <p className="text-sm text-gray-600 font-medium">
            {entry.quantity} {entry.unit} • {timeString}
          </p>
        </div>
        <div className="text-right ml-4">
          <p className="font-bold text-2xl text-blue-600">{Math.round(entry.calories)}</p>
          <p className="text-xs text-gray-500 font-medium">kcal</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t-2 border-gray-100">
        <div className="text-center p-2 bg-red-50 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-1">Protein</p>
          <p className="text-base font-bold text-red-600">{Math.round(entry.protein)}g</p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-1">Carbs</p>
          <p className="text-base font-bold text-blue-600">{Math.round(entry.carbs)}g</p>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-1">Fats</p>
          <p className="text-base font-bold text-yellow-600">{Math.round(entry.fats)}g</p>
        </div>
      </div>
    </div>
  );
}

