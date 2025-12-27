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
    <div className="min-h-screen pb-24 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Voice Tracker</h1>
          <p className="text-gray-600 text-lg">Record your meals and workouts</p>
        </div>

        {/* Transcription display */}
        <div className="card mb-6 animate-slide-up">
          {isEditingTranscription ? (
            <textarea
              value={transcriptionText}
              onChange={(e) => setTranscriptionText(e.target.value)}
              className="input-field h-40 resize-none"
              placeholder="Edit transcription..."
              autoFocus
            />
          ) : (
            <div className="min-h-[150px] p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
              <p className={`text-lg leading-relaxed ${transcriptionText ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                {transcriptionText || 'Your transcription will appear here...'}
              </p>
            </div>
          )}
        </div>

        {/* Record button */}
        <div className="flex flex-col items-center mb-8 animate-slide-up">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!hasPermission || isProcessing}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl transition-all transform ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse-glow shadow-2xl scale-110'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl hover:scale-105'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? '⏹' : '🎤'}
          </button>
          <p className="mt-6 text-gray-700 font-semibold text-lg">
            {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Tap to Record'}
          </p>
          {!hasPermission && (
            <p className="mt-2 text-sm text-red-600 font-medium">Microphone permission required</p>
          )}
        </div>

        {/* Voice correction mode */}
        {isVoiceCorrectionMode && (
          <div className="card mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 animate-slide-up">
            <p className="font-semibold text-gray-900 mb-3 text-lg">Recording correction...</p>
            {correctionText && (
              <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-900">{correctionText}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={applyVoiceCorrection}
                disabled={!correctionText.trim()}
                className="btn-primary flex-1"
              >
                Apply Correction
              </button>
              <button
                onClick={cancelVoiceCorrection}
                className="btn-secondary px-6"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit/Re-record buttons */}
        {transcriptionText && !isProcessing && !isVoiceCorrectionMode && (
          <div className="space-y-4 animate-slide-up">
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditingTranscription(!isEditingTranscription)}
                className="btn-secondary flex-1"
              >
                {isEditingTranscription ? '✓ Done' : '✏️ Edit'}
              </button>
              <button
                onClick={() => {
                  setTranscriptionText('');
                  setIsEditingTranscription(false);
                }}
                className="btn-secondary flex-1 bg-orange-100 text-orange-700 hover:bg-orange-200"
              >
                🔄 Re-record
              </button>
            </div>
            <button
              onClick={processTranscription}
              className="btn-success w-full"
            >
              Save Entry
            </button>
          </div>
        )}

        {/* Alert */}
        {showAlert && (
          <div className="modal-backdrop animate-fade-in">
            <div className="modal-content max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Alert</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">{alertMessage}</p>
                <button
                  onClick={() => setShowAlert(false)}
                  className="btn-primary w-full"
                >
                  OK
                </button>
              </div>
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
    </div>
  );
}

