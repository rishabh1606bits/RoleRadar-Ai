import React from 'react';
import { Filter, Globe, MapPin } from 'lucide-react';

const FilterSidebar = ({
  listingType, setListingType,
  selectedDomain, setSelectedDomain,
  selectedLocation, setSelectedLocation,
  selectedCountry, setSelectedCountry,
  salaryRange, setSalaryRange,
  domains,
}) => {
  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Filter size={18} /> Filters
        </h2>

        {/* Type Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Looking for</label>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['Internship', 'Job'].map((type) => (
              <button
                key={type}
                onClick={() => setListingType(type)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  listingType === type
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Country Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <Globe size={14} /> Job Location
          </label>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { label: '🇮🇳 India', value: 'India' },
              { label: '🌍 Global', value: 'Global' },
              { label: 'All', value: 'All' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedCountry(opt.value)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedCountry === opt.value
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {selectedCountry === 'India' && 'Showing India-based jobs'}
            {selectedCountry === 'Global' && 'Showing remote/global jobs'}
            {selectedCountry === 'All' && 'Showing all jobs worldwide'}
          </p>
        </div>

        {/* Domain Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Domain</label>
          <div className="space-y-2">
            {domains.map(domain => (
              <label key={domain} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="domain"
                  value={domain}
                  checked={selectedDomain === domain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{domain}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <MapPin size={14} /> Work Type
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="Anywhere">Anywhere</option>
            <option value="Remote">Remote only</option>
            <option value="On-site">On-site only</option>
          </select>
        </div>

        {/* Salary / Stipend Filter */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {listingType === 'Internship' ? 'Stipend' : 'Salary'} (per month)
          </label>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>₹0</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              ₹{(salaryRange / 1000).toFixed(0)}k+
            </span>
            <span>₹3L</span>
          </div>
          <input
            type="range"
            min={0}
            max={300000}
            step={5000}
            value={salaryRange}
            onChange={(e) => setSalaryRange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Showing roles with ₹{(salaryRange / 1000).toFixed(0)}k+ per month
          </p>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;