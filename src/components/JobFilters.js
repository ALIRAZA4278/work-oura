"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Filter, 
  X, 
  ChevronDown,
  DollarSign,
  Building,
  Calendar,
  Zap,
  CheckCircle,
  Globe
} from "lucide-react";

export default function JobFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    level: "",
    category: "",
    salaryMin: "",
    salaryMax: "",
    remote: false,
    verified: false,
    recentlyPosted: false,
    postedDate: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Count active filters
    const count = Object.entries(newFilters).filter(([k, v]) => {
      if (k === 'search' || k === 'location') return v !== "";
      if (typeof v === 'boolean') return v === true;
      return v !== "";
    }).length;
    
    setActiveFiltersCount(count);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      location: "",
      type: "",
      level: "",
      category: "",
      salaryMin: "",
      salaryMax: "",
      remote: false,
      verified: false,
      recentlyPosted: false,
      postedDate: "",
    };
    setFilters(clearedFilters);
    setActiveFiltersCount(0);
    onFilterChange(clearedFilters);
  };

  const quickFilters = [
    { key: 'remote', label: 'Remote', icon: Globe },
    { key: 'verified', label: 'Verified Companies', icon: CheckCircle },
    { key: 'recentlyPosted', label: 'Posted This Week', icon: Calendar },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-black flex items-center gap-2">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <span className="hidden sm:inline">Find Your Dream Job</span>
          <span className="inline sm:hidden">Search Jobs</span>
        </h2>
        <div className="text-xs sm:text-sm text-black">
          {activeFiltersCount > 0 && `${activeFiltersCount} active`}
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Search Input */}
        <div className="lg:col-span-6 relative text-black">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-black" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-black bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        {/* Location Input */}
        <div className="lg:col-span-4 relative text-black">
          <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            placeholder="Location"
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 bg-white/70 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          />
        </div>

        {/* Filters Toggle */}
        <div className="lg:col-span-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
              showFilters || activeFiltersCount > 0
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 sm:ml-2 bg-white text-blue-600 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
        {quickFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <motion.button
              key={filter.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterChange(filter.key, !filters[filter.key])}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                filters[filter.key]
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">{filter.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Extended Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 pt-4 sm:pt-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Job Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Job Type
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200"
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Zap className="w-4 h-4 text-green-600" />
                  Experience Level
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200"
                  value={filters.level}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Building className="w-4 h-4 text-purple-600" />
                  Category
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200"
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Management">Management</option>
                  <option value="Business">Business</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales</option>
                  <option value="Media">Media</option>
                  <option value="Content">Content</option>
                </select>
              </div>

              {/* Posted Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  Posted
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200"
                  value={filters.postedDate}
                  onChange={(e) => handleFilterChange("postedDate", e.target.value)}
                >
                  <option value="">Any time</option>
                  <option value="today">Today</option>
                  <option value="3days">Last 3 days</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="mb-4 sm:mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <DollarSign className="w-4 h-4 text-green-600" />
                Salary Range (per month)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Minimum salary"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200"
                    value={filters.salaryMin}
                    onChange={(e) => handleFilterChange("salaryMin", e.target.value)}
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Maximum salary"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200"
                    value={filters.salaryMax}
                    onChange={(e) => handleFilterChange("salaryMax", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {activeFiltersCount > 0 ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied` : 'No filters applied'}
              </div>
              {activeFiltersCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
