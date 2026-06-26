import React from 'react';
import { useClerk } from '@clerk/clerk-react';
import { Briefcase, Moon, Sun, User, Bookmark, Search, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Header = ({ isDarkMode, toggleTheme, currentPage, setCurrentPage, user }) => {
  const { signOut } = useClerk();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

        {/* Logo */}
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="bg-blue-600 text-white p-1 rounded-lg"><Briefcase size={24} /></span>
          RoleRadar
        </button>

        {/* Nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Search size={15} /> Jobs
          </button>

          <button
            onClick={() => setCurrentPage('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 'saved'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Bookmark size={15} /> Saved
          </button>

          <button
            onClick={() => setCurrentPage('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 'profile'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <User size={15} /> Profile
          </button>

          {/* User dropdown */}
          {user && (
            <div className="relative ml-1">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block max-w-[100px] truncate">
                  {user.fullName || user.email}
                </span>
                <ChevronDown size={14} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors ml-1"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;