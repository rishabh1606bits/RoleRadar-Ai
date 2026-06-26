import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Header from '../components/layout/Header';
import FilterSidebar from '../components/internship/FilterSidebar';
import ListingCard from '../components/internship/ListingCard';
import SearchBar from '../components/ui/Searchbar';
import { Loader2, Sparkles } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = ({ isDarkMode, toggleTheme, currentPage, setCurrentPage, savedJobs, toggleSave, user }) => {
  const { getToken } = useAuth();

  const [searchTerm, setSearchTerm]             = useState('');
  const [listingType, setListingType]           = useState('Internship');
  const [selectedDomain, setSelectedDomain]     = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('Anywhere');
  const [selectedCountry, setSelectedCountry]   = useState('India');
  const [salaryRange, setSalaryRange]           = useState(0);
  const [listings, setListings]                 = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState(null);
  const [bookmarks, setBookmarks]               = useState(new Set());
  const [meta, setMeta]                         = useState({ total: 0, page: 1, totalPages: 1 });
  const [showRecommended, setShowRecommended]   = useState(false);
  const [recLoading, setRecLoading]             = useState(false);
  const [explanations, setExplanations]         = useState({});
  const [explanationLoading, setExplanationLoading] = useState({});

  const domains = ['All', 'Frontend', 'Backend', 'Fullstack', 'AI/ML'];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setShowRecommended(false);

    try {
      const params = new URLSearchParams();
      if (selectedDomain !== 'All') params.set('domain', selectedDomain);
      if (selectedLocation !== 'Anywhere') params.set('location', selectedLocation);
      if (salaryRange > 0) params.set('minStipend', salaryRange);
      if (searchTerm) params.set('search', searchTerm);
      if (selectedCountry !== 'All') params.set('country', selectedCountry);
      params.set('type', listingType);

      const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');

      const json = await res.json();
      setListings(json.data.map(normalizeJob));
      setMeta(json.meta);
    } catch (err) {
      setError('Could not load jobs. Make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, selectedLocation, salaryRange, searchTerm, selectedCountry, listingType]);

  const fetchRecommendations = async () => {
    setRecLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/recommendations?userId=${user.id}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setListings(json.data.map(normalizeJob));
      setShowRecommended(true);
      setMeta({ total: json.data.length, page: 1, totalPages: 1 });
    } catch {
      setError('Could not load recommendations. Upload your resume first.');
    } finally {
      setRecLoading(false);
    }
  };

  const getExplanation = async (jobId) => {
    setExplanationLoading(prev => ({ ...prev, [jobId]: true }));
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/recommendations/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, jobId }),
      });
      const data = await res.json();
      setExplanations(prev => ({ ...prev, [jobId]: data.explanation }));
    } catch (err) {
      console.error('Explanation error:', err);
    } finally {
      setExplanationLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchJobs, searchTerm ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchJobs, searchTerm]);

  const toggleBookmark = async (jobId) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/jobs/${jobId}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setBookmarks(prev => {
        const next = new Set(prev);
        next.has(jobId) ? next.delete(jobId) : next.add(jobId);
        return next;
      });
    }
  };

  function normalizeJob(job) {
    return {
      id: job.id,
      title: job.title,
      company: job.company?.name || 'Unknown',
      location: job.isRemote ? 'Remote' : job.location,
      country: job.country || 'India',
      type: 'Internship',
      domain: job.domain || 'Fullstack',
      salary: job.stipend ? `₹${job.stipend.toLocaleString('en-IN')}/mo` : 'Not disclosed',
      tags: job.skills?.slice(0, 3) || [],
      posted: timeAgo(job.postedAt),
      applyUrl: job.applyUrl,
      matchScore: job.score || null,
      matchedSkills: job.matchedSkills || [],
    };
  }

  function timeAgo(dateStr) {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 14) return '1 week ago';
    return `${Math.floor(days / 7)} weeks ago`;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        <FilterSidebar
          listingType={listingType} setListingType={setListingType}
          selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain}
          selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
          selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
          salaryRange={salaryRange} setSalaryRange={setSalaryRange}
          domains={domains}
        />

        <div className="flex-1 space-y-6">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} type={listingType} />

          <div className="flex items-center gap-3">
            <button
              onClick={showRecommended ? fetchJobs : fetchRecommendations}
              disabled={recLoading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                showRecommended
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100'
              }`}
            >
              {recLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {showRecommended ? 'Show All Jobs' : 'Show Recommended for Me'}
            </button>
            {showRecommended && <span className="text-xs text-purple-500">Ranked by your resume skills</span>}
          </div>

          {!loading && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{listings.length}</span> of {meta.total} results
              {selectedCountry !== 'All' && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  {selectedCountry === 'India' ? '🇮🇳 India' : '🌍 Global'}
                </span>
              )}
            </p>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          )}

          {error && (
            <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-red-500">{error}</p>
              <button onClick={fetchJobs} className="mt-3 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg">Retry</button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isBookmarked={bookmarks.has(listing.id)}
                    onBookmark={toggleBookmark}
                    explanation={explanations[listing.id]}
                    explanationLoading={explanationLoading[listing.id]}
                    onGetExplanation={getExplanation}
                    showMatchScore={showRecommended}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No results found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;