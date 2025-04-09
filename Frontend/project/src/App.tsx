import React from 'react';
import LandingPage from './components/LandingPage';
import PredictionPage from './components/PredictionPage';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';

type Page = 'landing' | 'auth' | 'prediction';

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<Page>('landing');

  React.useEffect(() => {
    if (user) {
      setCurrentPage('prediction');
    }
  }, [user]);

  const handleGetStarted = () => {
    setCurrentPage('auth');
  };

  const handleAuthSuccess = () => {
    setCurrentPage('prediction');
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;