import React, { useState, useRef } from 'react';
import Header from '../components/layout/Header';
import { 
  Upload, FileText, Sparkles, Brain, 
  CheckCircle, Loader2, User, ExternalLink 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

// Hardcoded for now — replace with real auth userId later
const TEMP_USER_ID = 'cmq2gier20000wh3b0eh8clhe';

const Profile = ({ isDarkMode, toggleTheme, currentPage, setCurrentPage }) => {
  const fileInputRef = useRef(null);

  const [file, setFile]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile]     = useState(null);
  const [error, setError]         = useState(null);
  const [dragOver, setDragOver]   = useState(false);

  // Match scores: { [jobId]: { score, reasons, jobTitle } }
  const [matchScores, setMatchScores]   = useState({});
  const [matchLoading, setMatchLoading] = useState({});

  // ── File selection ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
    } else {
      setError('Please select a PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') {
      setFile(dropped);
      setError(null);
    } else {
      setError('Only PDF files are supported.');
    }
  };

  // ── Upload & process resume ────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch(`${API_BASE}/resume/upload?userId=${TEMP_USER_ID}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Get match score for a job ──────────────────────────────────────────────
  const getMatchScore = async (jobId, jobTitle) => {
    setMatchLoading(prev => ({ ...prev, [jobId]: true }));

    try {
      const res = await fetch(`${API_BASE}/resume/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: TEMP_USER_ID, jobId }),
      });

      const data = await res.json();
      setMatchScores(prev => ({ ...prev, [jobId]: { ...data, jobTitle } }));
    } catch (err) {
      console.error('Match score error:', err);
    } finally {
      setMatchLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  // ── Score color ────────────────────────────────────────────────────────────
  const scoreColor = (score) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-400';
  };

  const scoreBg = (score) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-400';
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <Header
  isDarkMode={isDarkMode}
  toggleTheme={toggleTheme}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
/>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Page Title ── */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <User size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload your resume to get AI-powered insights</p>
          </div>
        </div>

        {/* ── Resume Upload Card ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-500" /> Resume Upload
          </h2>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
          >
            <Upload size={32} className="mx-auto mb-3 text-gray-400" />
            {file ? (
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Drag & drop your resume here
                </p>
                <p className="text-xs text-gray-400 mt-1">or click to browse — PDF only, max 5MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
          >
            {uploading ? (
              <><Loader2 size={18} className="animate-spin" /> Analyzing with AI...</>
            ) : (
              <><Sparkles size={18} /> Upload & Analyze Resume</>
            )}
          </button>
        </div>

        {/* ── AI Results ── */}
        {profile && (
          <>
            {/* Profile Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" /> AI Profile Summary
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{profile.summary}</p>

              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink size={14} /> View uploaded resume
                </a>
              )}
            </div>

            {/* Extracted Skills */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Brain size={18} className="text-green-500" /> Extracted Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium flex items-center gap-1"
                  >
                    <CheckCircle size={12} /> {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Match Scores */}
            {Object.keys(matchScores).length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Brain size={18} className="text-yellow-500" /> AI Job Match Scores
                </h2>
                <div className="space-y-4">
                  {Object.entries(matchScores).map(([jobId, match]) => (
                    <div key={jobId} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{match.jobTitle}</p>
                        <span className={`text-2xl font-bold ${scoreColor(match.score)}`}>
                          {match.score}%
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full transition-all ${scoreBg(match.score)}`}
                          style={{ width: `${match.score}%` }}
                        />
                      </div>
                      {/* Reasons */}
                      <ul className="space-y-1">
                        {(match.reasons || []).map((r, i) => (
                          <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                            <span className="mt-0.5">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;