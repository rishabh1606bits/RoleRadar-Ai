import React from 'react';
import Header from '../components/layout/Header';
import { Bookmark, ArrowLeft, MapPin, BadgeDollarSign, Clock, Globe } from 'lucide-react';

export default function Saved({
  isDarkMode,
  toggleTheme,
  currentPage,
  setCurrentPage,
  savedJobs,
  toggleSave,
}) {
  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page heading */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bookmark size={22} className="text-blue-500" />
              Saved Roles
              <span className="text-blue-500">({savedJobs.length})</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Your shortlisted internships and jobs
            </p>
          </div>
        </div>

        {/* Empty state */}
        {savedJobs.length === 0 ? (
          <div className="text-center py-24">
            <Bookmark size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              No saved roles yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 mb-6">
              Click the bookmark icon on any role to save it here
            </p>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Browse Roles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedJobs.map((role) => (
              <div
                key={role.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Top section */}
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
                        {role.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {role.company}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSave(role)}
                      className="text-blue-500 hover:text-red-400 transition-colors"
                      title="Remove from saved"
                    >
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {role.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe size={11} />
                      {role.country}
                    </span>
                    <span className="flex items-center gap-1 text-green-500 font-medium">
                      <BadgeDollarSign size={11} />
                      {role.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {role.posted}
                    </span>
                  </div>

                  {/* Domain badge */}
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3">
                    {role.domain}
                  </span>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {role.tags && role.tags.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Apply button */}
                <div>
                  {role.applyUrl ? (
                    <a
                      href={role.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold text-center transition-colors"
                    >
                      Apply Now
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-semibold cursor-not-allowed"
                    >
                      No Apply Link
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}