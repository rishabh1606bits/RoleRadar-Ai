import React, { useState, useEffect } from 'react';
import { useAuth, useUser, RedirectToSignIn } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Saved from './pages/Saved';

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode]   = useState(true);
  const [savedJobs, setSavedJobs]     = useState([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const toggleSave = (job) => {
    setSavedJobs(prev =>
      prev.find(j => j.id === job.id)
        ? prev.filter(j => j.id !== job.id)
        : [...prev, job]
    );
  };

  // Still loading Clerk
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not signed in — redirect to Clerk's hosted sign-in
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  const commonProps = {
    isDarkMode,
    toggleTheme,
    currentPage,
    setCurrentPage,
    savedJobs,
    toggleSave,
    user: {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      fullName: user.fullName,
      avatar: user.imageUrl,
    },
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {currentPage === 'dashboard' && <Dashboard {...commonProps} />}
      {currentPage === 'profile'   && <Profile   {...commonProps} />}
      {currentPage === 'saved'     && <Saved      {...commonProps} />}
    </div>
  );
}

export default App;