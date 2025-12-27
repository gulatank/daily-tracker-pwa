import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import RecordingView from './components/RecordingView';
import HistoryView from './components/HistoryView';
import StatisticsView from './components/StatisticsView';
import SettingsView from './components/SettingsView';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t-2 border-gray-200/50 shadow-2xl z-50">
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-2">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
            isActive('/') ? 'text-blue-600' : 'text-gray-500'
          }`}
          aria-label="Record"
        >
          <div className={`p-3 rounded-2xl transition-all duration-200 ${
            isActive('/') ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'
          }`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className={`text-xs mt-1 font-medium transition-all ${
            isActive('/') ? 'text-blue-600' : 'text-gray-500'
          }`}>Record</span>
        </Link>
        <Link
          to="/history"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
            isActive('/history') ? 'text-blue-600' : 'text-gray-500'
          }`}
          aria-label="History"
        >
          <div className={`p-3 rounded-2xl transition-all duration-200 ${
            isActive('/history') ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'
          }`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className={`text-xs mt-1 font-medium transition-all ${
            isActive('/history') ? 'text-blue-600' : 'text-gray-500'
          }`}>History</span>
        </Link>
        <Link
          to="/statistics"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
            isActive('/statistics') ? 'text-blue-600' : 'text-gray-500'
          }`}
          aria-label="Statistics"
        >
          <div className={`p-3 rounded-2xl transition-all duration-200 ${
            isActive('/statistics') ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'
          }`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className={`text-xs mt-1 font-medium transition-all ${
            isActive('/statistics') ? 'text-blue-600' : 'text-gray-500'
          }`}>Stats</span>
        </Link>
        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
            isActive('/settings') ? 'text-blue-600' : 'text-gray-500'
          }`}
          aria-label="Settings"
        >
          <div className={`p-3 rounded-2xl transition-all duration-200 ${
            isActive('/settings') ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'
          }`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className={`text-xs mt-1 font-medium transition-all ${
            isActive('/settings') ? 'text-blue-600' : 'text-gray-500'
          }`}>Settings</span>
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen pb-20">
        <Routes>
          <Route path="/" element={<RecordingView />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/statistics" element={<StatisticsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
