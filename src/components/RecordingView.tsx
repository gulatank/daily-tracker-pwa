import { useState, useEffect } from 'react';
import { recordingService } from '../services/recordingService';
import { speechService } from '../services/speechService';
import { FoodParser } from '../services/foodParser';
import { WorkoutParser } from '../services/workoutParser';
import { foodDatabase } from '../services/foodDatabase';
import { workoutCalculator } from '../services/workoutCalculator';
import { storageService } from '../services/storageService';
import type { DuplicateWarning } from '../services/storageService';
import type { ParsedFoodItem } from '../models/FoodEntry';
import type { ParsedWorkout } from '../models/WorkoutEntry';
import type { FoodEntry } from '../models/FoodEntry';
import type { WorkoutEntry } from '../models/WorkoutEntry';
import PreviewSheet from './PreviewSheet';

export default function RecordingView() {
  const [transcriptionText, setTranscriptionText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showingPreview, setShowingPreview] = useState(false);
  const [previewFoodItems, setPreviewFoodItems] = useState<ParsedFoodItem[]>([]);
  const [previewWorkouts, setPreviewWorkouts] = useState<ParsedWorkout[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<DuplicateWarning[]>([]);
  const [itemsToDelete, setItemsToDelete] = useState<Set<number>>(new Set());
  const [isEditingTranscription, setIsEditingTranscription] = useState(false);
  const [isVoiceCorrectionMode, setIsVoiceCorrectionMode] = useState(false);
  const [correctionText, setCorrectionText] = useState('');
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const userWeight = parseFloat(localStorage.getItem('userWeight') || '70.0');
  const foodParser = new FoodParser();
  const workoutParser = new WorkoutParser();

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const permission = await recordingService.requestPermission();
    setHasPermission(permission);
  };

  const startRecording = async () => {
    try {
      await recordingService.startRecording();
      setIsRecording(true);
      setTranscriptionText('');
      
      // Start speech recognition
      if (speechService.isAvailable) {
        try {
          const transcript = await speechService.startLiveRecognition();
          setTranscriptionText(transcript);
        } catch (error) {
          console.error('Speech recognition error:', error);
        }
      }
    } catch (error: any) {
      setAlertMessage(`Failed to start recording: ${error.message}`);
      setShowAlert(true);
    }
  };

  const stopRecording = async () => {
    try {
      await recordingService.stopRecording();
      setIsRecording(false);
      speechService.stopRecognition();
      
      // If we don't have transcription from live recognition, try to get it
      if (!transcriptionText && speechService.isAvailable) {
        setIsProcessing(true);
        try {
          const transcript = await speechService.startLiveRecognition();
          setTranscriptionText(transcript);
        } catch (error) {
          console.error('Transcription error:', error);
          setAlertMessage('Transcription failed. You can edit the text manually.');
          setShowAlert(true);
        } finally {
          setIsProcessing(false);
        }
      }
    } catch (error: any) {
      setIsRecording(false);
      setAlertMessage(`Failed to stop recording: ${error.message}`);
      setShowAlert(true);
    }
  };

  const processTranscription = () => {
    if (!transcriptionText.trim()) return;

    setIsProcessing(true);

    // Parse both food and workout from the same transcription
    const foodItems = foodParser.parse(transcriptionText);
    const workouts = workoutParser.parse(transcriptionText);

    // Check if we found anything
    if (foodItems.length === 0 && workouts.length === 0) {
      setAlertMessage('Could not identify food or workout. Please try re-recording with more details.');
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }

    // Check for duplicates
    checkDuplicates(foodItems, workouts);
  };

  const checkDuplicates = async (foodItems: ParsedFoodItem[], workouts: ParsedWorkout[]) => {
    const warnings: DuplicateWarning[] = [];
    
    if (foodItems.length > 0) {
      const foodWarnings = await storageService.checkForDuplicates(foodItems);
      warnings.push(...foodWarnings);
    }

    for (let i = 0; i < workouts.length; i++) {
      const workout = workouts[i];
      const warning = await storageService.checkForDuplicatesWorkout(workout);
      if (warning) {
        warnings.push({
          ...warning,
          itemIndex: foodItems.length + i
        });
      }
    }

    setPreviewFoodItems(foodItems);
    setPreviewWorkouts(workouts);
    setDuplicateWarnings(warnings);
    setItemsToDelete(new Set());
    setIsProcessing(false);
    setShowingPreview(true);
  };

  const saveFromPreview = async () => {
    setIsProcessing(true);

    // Filter out deleted items
    const foodItemsToSave = previewFoodItems.filter((_, index) => !itemsToDelete.has(index));
    const workoutsToSave = previewWorkouts.filter((_, index) => !itemsToDelete.has(previewFoodItems.length + index));

    let savedFoodCount = 0;
    let savedWorkoutCount = 0;

    // Save food items
    for (const item of foodItemsToSave) {
      const nutrients = foodDatabase.getNutrients(item.foodName, item.quantity, item.unit);
      
      const entry: FoodEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        foodName: nutrients ? nutrients.name : item.foodName,
        quantity: item.quantity,
        unit: item.unit,
        calories: nutrients ? nutrients.calories : 0,
        protein: nutrients ? nutrients.protein : 0,
        carbs: nutrients ? nutrients.carbs : 0,
        fats: nutrients ? nutrients.fats : 0,
        fiber: nutrients ? nutrients.fiber : 0,
        sugar: nutrients ? nutrients.sugar : 0,
        sodium: nutrients ? nutrients.sodium : 0,
        transcription: transcriptionText
      };

      await storageService.saveFoodEntry(entry);
      savedFoodCount++;
    }

    // Save workouts
    for (const workout of workoutsToSave) {
      const calories = workoutCalculator.calculateCalories(
        workout.activityType,
        workout.duration,
        workout.intensity,
        userWeight
      );

      const entry: WorkoutEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        activityType: workout.activityType,
        duration: workout.duration,
        intensity: workout.intensity,
        caloriesBurnt: calories.calories,
        metValue: calories.metValue,
        transcription: transcriptionText
      };

      await storageService.saveWorkoutEntry(entry);
      savedWorkoutCount++;
    }

    const messages: string[] = [];
    if (savedFoodCount > 0) {
      messages.push(`Saved ${savedFoodCount} food item(s)`);
    }
    if (savedWorkoutCount > 0) {
      messages.push(`Saved ${savedWorkoutCount} workout(s)`);
    }
    setAlertMessage(messages.join(' and '));
    setShowAlert(true);

    // Clear and close
    setShowingPreview(false);
    setItemsToDelete(new Set());
    setTimeout(() => {
      setTranscriptionText('');
      setIsProcessing(false);
    }, 1000);
  };

  const startVoiceCorrection = async (index: number) => {
    setEditingItemIndex(index);
    setIsVoiceCorrectionMode(true);
    setCorrectionText('');
    setShowingPreview(false);
    
    try {
      await recordingService.startRecording();
      setIsRecording(true);
      
      if (speechService.isAvailable) {
        try {
          const transcript = await speechService.startLiveRecognition();
          setCorrectionText(transcript);
        } catch (error) {
          console.error('Speech recognition error:', error);
        }
      }
    } catch (error: any) {
      setAlertMessage(`Failed to start recording: ${error.message}`);
      setShowAlert(true);
      setIsVoiceCorrectionMode(false);
    }
  };

  const applyVoiceCorrection = async () => {
    if (editingItemIndex === null || !correctionText.trim()) return;

    await recordingService.stopRecording();
    setIsRecording(false);
    speechService.stopRecognition();

    // Parse the correction text for quantity and unit
    const correctionItems = foodParser.parse(correctionText);

    if (correctionItems.length > 0 && editingItemIndex < previewFoodItems.length) {
      const correction = correctionItems[0];
      const updatedItems = [...previewFoodItems];
      updatedItems[editingItemIndex] = {
        foodName: updatedItems[editingItemIndex].foodName,
        quantity: correction.quantity,
        unit: correction.unit
      };
      setPreviewFoodItems(updatedItems);

      // Re-check for duplicates
      const warnings = await storageService.checkForDuplicates(updatedItems);
      const workoutWarnings: DuplicateWarning[] = [];
      for (let i = 0; i < previewWorkouts.length; i++) {
        const warning = await storageService.checkForDuplicatesWorkout(previewWorkouts[i]);
        if (warning) {
          workoutWarnings.push({
            ...warning,
            itemIndex: updatedItems.length + i
          });
        }
      }
      setDuplicateWarnings([...warnings, ...workoutWarnings]);
    }

    cancelVoiceCorrection();
    setTimeout(() => {
      setShowingPreview(true);
    }, 300);
  };

  const cancelVoiceCorrection = () => {
    setIsVoiceCorrectionMode(false);
    setEditingItemIndex(null);
    setCorrectionText('');
    if (isRecording) {
      recordingService.stopRecording();
      setIsRecording(false);
    }
    speechService.stopRecognition();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Voice Tracker</h1>

      {/* Transcription display */}
      <div className="mb-6">
        {isEditingTranscription ? (
          <textarea
            value={transcriptionText}
            onChange={(e) => setTranscriptionText(e.target.value)}
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Edit transcription..."
            autoFocus
          />
        ) : (
          <div className="w-full min-h-[150px] p-4 bg-gray-100 rounded-lg border border-gray-200">
            <p className={transcriptionText ? 'text-gray-900' : 'text-gray-400'}>
              {transcriptionText || 'Your transcription will appear here...'}
            </p>
          </div>
        )}
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!hasPermission || isProcessing}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? '⏹' : '🎤'}
        </button>
        <p className="mt-4 text-gray-600 font-medium">
          {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Tap to Record'}
        </p>
        {!hasPermission && (
          <p className="mt-2 text-sm text-red-600">Microphone permission required</p>
        )}
      </div>

      {/* Voice correction mode */}
      {isVoiceCorrectionMode && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-medium text-gray-900 mb-2">Recording quantity/unit correction...</p>
          {correctionText && (
            <div className="mb-3 p-3 bg-white rounded border border-gray-200">
              <p>{correctionText}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={applyVoiceCorrection}
              disabled={!correctionText.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Correction
            </button>
            <button
              onClick={cancelVoiceCorrection}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit/Re-record buttons */}
      {transcriptionText && !isProcessing && !isVoiceCorrectionMode && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditingTranscription(!isEditingTranscription)}
              className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 font-medium"
            >
              {isEditingTranscription ? '✓ Done' : '✏️ Edit'}
            </button>
            <button
              onClick={() => {
                setTranscriptionText('');
                setIsEditingTranscription(false);
              }}
              className="flex-1 bg-orange-100 text-orange-700 py-2 px-4 rounded-lg hover:bg-orange-200 font-medium"
            >
              🔄 Re-record
            </button>
          </div>
          <button
            onClick={processTranscription}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
          >
            Save Entry
          </button>
        </div>
      )}

      {/* Alert */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold mb-2">Alert</h3>
            <p className="text-gray-700 mb-4">{alertMessage}</p>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Preview Sheet */}
      {showingPreview && (
        <PreviewSheet
          foodItems={previewFoodItems}
          workouts={previewWorkouts}
          duplicateWarnings={duplicateWarnings}
          itemsToDelete={itemsToDelete}
          onItemsToDeleteChange={setItemsToDelete}
          onSave={saveFromPreview}
          onCancel={() => {
            setShowingPreview(false);
            setItemsToDelete(new Set());
          }}
          onVoiceCorrection={startVoiceCorrection}
          transcription={transcriptionText}
          onEditTranscription={() => {
            setShowingPreview(false);
            setIsEditingTranscription(true);
          }}
        />
      )}
    </div>
  );
}

