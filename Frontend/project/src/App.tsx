import React, { useState } from 'react';
import { Heart, Activity, ArrowRight, Stethoscope } from 'lucide-react';
import LandingPage from './components/LandingPage';
import PredictionPage from './components/PredictionPage';
import AuthPage from './components/AuthPage';

type Page = 'landing' | 'auth' | 'prediction';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleGetStarted = () => {
    setCurrentPage('auth');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('prediction');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {currentPage === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      {currentPage === 'auth' && (
        <AuthPage onAuthSuccess={handleAuthSuccess} onBack={() => setCurrentPage('landing')} />
      )}
      {currentPage === 'prediction' && (
        <PredictionPage onBack={() => setCurrentPage('landing')} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;