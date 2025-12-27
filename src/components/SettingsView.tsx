import { useState, useEffect } from 'react';
import type { UserProfile } from '../models/UserProfile';
import { UserProfileService } from '../models/UserProfile';
import { loggerService } from '../services/loggerService';
import type { LogEntry } from '../services/loggerService';

export default function SettingsView() {
  const [profile, setProfile] = useState<UserProfile>({
    age: parseInt(localStorage.getItem('userAge') || '37'),
    gender: localStorage.getItem('userGender') || 'male',
    weight: parseFloat(localStorage.getItem('userWeight') || '70.0'),
    height: parseFloat(localStorage.getItem('userHeight') || '170.0'),
    activityLevel: localStorage.getItem('userActivityLevel') || 'moderately_active'
  });
  
  const [showBMRInfo, setShowBMRInfo] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    localStorage.setItem('userAge', profile.age.toString());
    localStorage.setItem('userGender', profile.gender);
    localStorage.setItem('userWeight', profile.weight.toString());
    localStorage.setItem('userHeight', profile.height.toString());
    localStorage.setItem('userActivityLevel', profile.activityLevel);
  }, [profile]);

  const bmr = UserProfileService.calculateBMR(profile);
  const tdee = UserProfileService.calculateTDEE(profile);

  const loadLogs = async () => {
    const allLogs = await loggerService.getAllLogs();
    setLogs(allLogs);
  };

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Settings</h1>
        
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="card animate-slide-up">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 border-gray-100">Personal Information</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  min="1"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="input-field"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div className="card animate-slide-up">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 border-gray-100">Activity Level</h2>
            <select
              value={profile.activityLevel}
              onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
              className="input-field"
            >
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>

          {/* Metabolic Information */}
          <div className="card animate-slide-up">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 border-gray-100">Metabolic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="stat-card stat-card-blue">
                <p className="text-sm font-semibold mb-2 opacity-90">BMR</p>
                <p className="text-2xl font-bold">
                  {Math.round(bmr)} <span className="text-base font-normal opacity-75">kcal/day</span>
                </p>
                <p className="text-xs mt-2 opacity-75">Basal Metabolic Rate</p>
              </div>
              <div className="stat-card stat-card-green">
                <p className="text-sm font-semibold mb-2 opacity-90">TDEE</p>
                <p className="text-2xl font-bold">
                  {Math.round(tdee)} <span className="text-base font-normal opacity-75">kcal/day</span>
                </p>
                <p className="text-xs mt-2 opacity-75">Total Daily Energy</p>
              </div>
            </div>
            <button
              onClick={() => setShowBMRInfo(true)}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 hover:underline transition-colors"
            >
              ℹ️ What is BMR/TDEE?
            </button>
          </div>

          {/* Debug Logs */}
          <div className="card animate-slide-up">
            <button
              onClick={async () => {
                setShowLogs(!showLogs);
                if (!showLogs) {
                  await loadLogs();
                }
              }}
              className="btn-secondary w-full"
            >
              {showLogs ? 'Hide' : 'Show'} Debug Logs
            </button>
          </div>

          {showLogs && (
            <div className="card animate-slide-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Debug Logs</h2>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await loggerService.downloadLogs();
                      loggerService.info('Logs downloaded', 'SettingsView');
                    }}
                    className="btn-secondary"
                  >
                    Download Logs
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Clear all logs? This cannot be undone.')) {
                        await loggerService.clearLogs();
                        await loadLogs();
                        loggerService.info('Logs cleared', 'SettingsView');
                      }
                    }}
                    className="btn-danger"
                  >
                    Clear Logs
                  </button>
                  <button
                    onClick={() => setShowLogs(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No logs available</p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        log.level === 'error' ? 'bg-red-50 border border-red-200' :
                        log.level === 'warn' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-xs">
                          [{new Date(log.timestamp).toLocaleString()}] [{log.level.toUpperCase()}]
                          {log.context && ` [${log.context}]`}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-1">{log.message}</p>
                      {log.error && (
                        <div className="text-xs text-red-700 mt-1">
                          <p><strong>Error:</strong> {log.error.name}: {log.error.message}</p>
                          {log.error.stack && (
                            <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">{log.error.stack}</pre>
                          )}
                        </div>
                      )}
                      {log.metadata && (
                        <pre className="text-xs text-gray-600 mt-1 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* About */}
          <div className="card animate-slide-up">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 border-gray-100">About</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 font-medium">Version</span>
                <span className="text-gray-900 font-semibold">1.0.0</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed pt-2">
                This app helps you track your food intake and workouts using voice recordings. 
                All data is stored locally on your device.
              </p>
            </div>
          </div>
        </div>

        {/* BMR Info Modal */}
        {showBMRInfo && (
          <div className="modal-backdrop animate-fade-in">
            <div className="modal-content max-w-md">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">BMR & TDEE</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">BMR (Basal Metabolic Rate)</p>
                    <p className="text-gray-700 leading-relaxed">
                      The number of calories your body burns at rest to maintain basic physiological functions.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">TDEE (Total Daily Energy Expenditure)</p>
                    <p className="text-gray-700 leading-relaxed">
                      Your total daily calorie burn including all activities, exercise, and daily movement.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBMRInfo(false)}
                  className="btn-primary w-full"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

