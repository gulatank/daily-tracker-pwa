import type { ParsedFoodItem } from '../models/FoodEntry';
import type { ParsedWorkout } from '../models/WorkoutEntry';
import type { DuplicateWarning } from '../services/storageService';

interface PreviewSheetProps {
  foodItems: ParsedFoodItem[];
  workouts: ParsedWorkout[];
  duplicateWarnings: DuplicateWarning[];
  itemsToDelete: Set<number>;
  onItemsToDeleteChange: (items: Set<number>) => void;
  onSave: () => void;
  onCancel: () => void;
  onVoiceCorrection?: (index: number) => void;
  transcription: string;
  onEditTranscription?: () => void;
}

export default function PreviewSheet({
  foodItems,
  workouts,
  duplicateWarnings,
  itemsToDelete,
  onItemsToDeleteChange,
  onSave,
  onCancel,
  onVoiceCorrection,
  transcription,
  onEditTranscription
}: PreviewSheetProps) {
  const toggleDelete = (index: number) => {
    const newSet = new Set(itemsToDelete);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    onItemsToDeleteChange(newSet);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Review Entries</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Transcription section */}
          {transcription && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Transcription</h3>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-900 mb-2">{transcription}</p>
                {onEditTranscription && (
                  <button
                    onClick={onEditTranscription}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    ✏️ Edit & Re-parse
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Food items */}
          {foodItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Food Items</h3>
              <div className="space-y-2">
                {foodItems.map((item, index) => {
                  const warning = duplicateWarnings.find(w => w.itemIndex === index);
                  const isDeleted = itemsToDelete.has(index);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => toggleDelete(index)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isDeleted
                          ? 'bg-red-50 border-red-300'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {item.foodName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                          </p>
                          {warning && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ {warning.message}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {onVoiceCorrection && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onVoiceCorrection(index);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              title="Voice correction"
                            >
                              🎤
                            </button>
                          )}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isDeleted ? 'bg-red-500 border-red-500' : 'border-gray-300'
                          }`}>
                            {isDeleted && <span className="text-white text-xs">✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Workouts */}
          {workouts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Workouts</h3>
              <div className="space-y-2">
                {workouts.map((workout, index) => {
                  const workoutIndex = foodItems.length + index;
                  const warning = duplicateWarnings.find(w => w.itemIndex === workoutIndex);
                  const isDeleted = itemsToDelete.has(workoutIndex);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => toggleDelete(workoutIndex)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isDeleted
                          ? 'bg-red-50 border-red-300'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {workout.activityType}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {Math.round(workout.duration)} min - {workout.intensity} intensity
                          </p>
                          {warning && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ {warning.message}
                            </p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isDeleted ? 'bg-red-500 border-red-500' : 'border-gray-300'
                        }`}>
                          {isDeleted && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

