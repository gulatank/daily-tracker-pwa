import { useState, useEffect } from 'react';
import type { UserProfile } from '../models/UserProfile';
import { UserProfileService } from '../models/UserProfile';

export default function SettingsView() {
  const [profile, setProfile] = useState<UserProfile>({
    age: parseInt(localStorage.getItem('userAge') || '37'),
    gender: localStorage.getItem('userGender') || 'male',
    weight: parseFloat(localStorage.getItem('userWeight') || '70.0'),
    height: parseFloat(localStorage.getItem('userHeight') || '170.0'),
    activityLevel: localStorage.getItem('userActivityLevel') || 'moderately_active'
  });
  
  const [showBMRInfo, setShowBMRInfo] = useState(false);

  useEffect(() => {
    localStorage.setItem('userAge', profile.age.toString());
    localStorage.setItem('userGender', profile.gender);
    localStorage.setItem('userWeight', profile.weight.toString());
    localStorage.setItem('userHeight', profile.height.toString());
    localStorage.setItem('userActivityLevel', profile.activityLevel);
  }, [profile]);

  const bmr = UserProfileService.calculateBMR(profile);
  const tdee = UserProfileService.calculateTDEE(profile);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Activity Level</h2>
          <select
            value={profile.activityLevel}
            onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sedentary">Sedentary</option>
            <option value="lightly_active">Lightly Active</option>
            <option value="moderately_active">Moderately Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Metabolic Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">BMR</span>
              <span className="text-gray-900 font-medium">{Math.round(bmr)} kcal/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">TDEE</span>
              <span className="text-gray-900 font-medium">{Math.round(tdee)} kcal/day</span>
            </div>
            <button
              onClick={() => setShowBMRInfo(true)}
              className="text-blue-600 text-sm hover:underline"
            >
              What is BMR/TDEE?
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Version</span>
              <span>1.0.0</span>
            </div>
            <p className="text-xs">
              This app helps you track your food intake and workouts using voice recordings. 
              All data is stored locally on your device.
            </p>
          </div>
        </section>
      </div>

      {showBMRInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">BMR & TDEE</h3>
            <p className="text-gray-700 mb-4">
              <strong>BMR (Basal Metabolic Rate)</strong> is the number of calories your body burns at rest.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>TDEE (Total Daily Energy Expenditure)</strong> is your total daily calorie burn including all activities.
            </p>
            <button
              onClick={() => setShowBMRInfo(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

