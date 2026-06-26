import React, { useState } from 'react';
import { MapPin,  ExternalLink, Bookmark, BookmarkCheck, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const ListingCard = ({ listing, isBookmarked = false, onBookmark, explanation, explanationLoading, onGetExplanation, showMatchScore }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const handleApply = (e) => {
    e.stopPropagation();
    if (listing.applyUrl) window.open(listing.applyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    onBookmark?.(listing.id);
  };

  const handleExplanation = (e) => {
    e.stopPropagation();
    if (!explanation) onGetExplanation?.(listing.id);
    setShowExplanation(!showExplanation);
  };

  const scoreColor = (score) => {
    if (score >= 75) return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 50) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md group">

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {listing.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">{listing.company}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Match Score Badge */}
          {showMatchScore && listing.matchScore !== null && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreColor(listing.matchScore)}`}>
              {listing.matchScore}% match
            </span>
          )}

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg transition-all ${
              isBookmarked
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>

          {/* Posted Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {listing.posted}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1"><MapPin size={16} /> {listing.location}</div>
        <div className="flex items-center gap-1">{listing.salary}</div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2 flex-wrap">
          {listing.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {/* Why this matches you */}
          {showMatchScore && (
            <button
              onClick={handleExplanation}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 text-xs font-medium rounded-lg transition-all"
            >
              {explanationLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Why this?
              {showExplanation ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          {/* Apply */}
          <button
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
          >
            Apply <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Explanation panel */}
      {showMatchScore && showExplanation && (
        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          {explanationLoading ? (
            <p className="text-xs text-purple-500 animate-pulse">Generating explanation...</p>
          ) : explanation ? (
            <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
              <Sparkles size={12} className="inline mr-1" />{explanation}
            </p>
          ) : (
            <p className="text-xs text-purple-500">Click "Why this?" to generate explanation</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ListingCard;