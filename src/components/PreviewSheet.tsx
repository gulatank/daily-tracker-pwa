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
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-900">Review Entries</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 hover:bg-white rounded-full p-2 transition-all"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Transcription section */}
          {transcription && (
            <div className="animate-slide-up">
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Transcription</h3>
              <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
                <p className="text-gray-900 mb-3 leading-relaxed">{transcription}</p>
                {onEditTranscription && (
                  <button
                    onClick={onEditTranscription}
                    className="text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline transition-colors"
                  >
                    ✏️ Edit & Re-parse
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Food items */}
          {foodItems.length > 0 && (
            <div className="animate-slide-up">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Food Items</h3>
              <div className="space-y-3">
                {foodItems.map((item, index) => {
                  const warning = duplicateWarnings.find(w => w.itemIndex === index);
                  const isDeleted = itemsToDelete.has(index);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => toggleDelete(index)}
                      className={`card cursor-pointer transition-all duration-200 ${
                        isDeleted
                          ? 'bg-red-50 border-red-300 opacity-60'
                          : 'card-hover border-2'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 capitalize mb-1">
                            {item.foodName}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium mb-2">
                            {item.quantity} {item.unit}
                          </p>
                          {warning && (
                            <div className="badge badge-warning mt-2">
                              ⚠️ {warning.message}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          {onVoiceCorrection && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onVoiceCorrection(index);
                              }}
                              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all hover:scale-110"
                              title="Voice correction"
                              aria-label="Voice correction"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            </button>
                          )}
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isDeleted 
                              ? 'bg-red-500 border-red-500 scale-110' 
                              : 'border-gray-300 hover:border-blue-400'
                          }`}>
                            {isDeleted && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
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
            <div className="animate-slide-up">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Workouts</h3>
              <div className="space-y-3">
                {workouts.map((workout, index) => {
                  const workoutIndex = foodItems.length + index;
                  const warning = duplicateWarnings.find(w => w.itemIndex === workoutIndex);
                  const isDeleted = itemsToDelete.has(workoutIndex);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => toggleDelete(workoutIndex)}
                      className={`card cursor-pointer transition-all duration-200 ${
                        isDeleted
                          ? 'bg-red-50 border-red-300 opacity-60'
                          : 'card-hover border-2'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 capitalize mb-1">
                            {workout.activityType}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium mb-2">
                            {Math.round(workout.duration)} min - {workout.intensity} intensity
                          </p>
                          {warning && (
                            <div className="badge badge-warning mt-2">
                              ⚠️ {warning.message}
                            </div>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ml-4 ${
                          isDeleted 
                            ? 'bg-red-500 border-red-500 scale-110' 
                            : 'border-gray-300 hover:border-blue-400'
                        }`}>
                          {isDeleted && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t-2 border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="btn-success flex-1"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

