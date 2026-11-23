'use client';

/**
 * DB CONNECTION MAP
 *
 * Companies page (/companies). Data:
 *   GET /api/companies -> companies table + har company ki active jobs
 *   (jobs.company_id = companies.id)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Briefcase, ExternalLink, Search, Filter, X, ChevronDown, Globe, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    size: '',
    minPositions: 0
  });
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchAllCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies.filter(company => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || (
        (typeof company.name === 'string' && company.name.toLowerCase().includes(search)) ||
        (typeof company.industry === 'string' && company.industry.toLowerCase().includes(search)) ||
        (typeof company.location === 'string' && company.location.toLowerCase().includes(search)) ||
        (typeof company.description === 'string' && company.description.toLowerCase().includes(search))
      );
      
      const matchesIndustry = !filters.industry || company.industry === filters.industry;
      const matchesLocation = !filters.location || company.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesSize = !filters.size || company.size === filters.size;
      const matchesPositions = company.openPositions >= filters.minPositions;
      
      return matchesSearch && matchesIndustry && matchesLocation && matchesSize && matchesPositions;
    });

    // Sort companies
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'positions':
          return b.openPositions - a.openPositions;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          const sizeOrder = { 'Startup': 1, 'Small': 2, 'Medium': 3, 'Large': 4, 'Enterprise': 5 };
          return (sizeOrder[b.size] || 0) - (sizeOrder[a.size] || 0);
        default:
          return 0;
      }
    });
    
    setFilteredCompanies(filtered);
  }, [searchTerm, companies, filters, sortBy]);

  // Get unique values for filter options
  const getFilterOptions = () => {
    const allCompanies = companies;
    const industries = [...new Set(allCompanies.map(c => c.industry).filter(Boolean))];
    const locations = [...new Set(allCompanies.map(c => c.location).filter(Boolean))];
    const sizes = [...new Set(allCompanies.map(c => c.size).filter(Boolean))];
    
    return { industries, locations, sizes };
  };

  const { industries, locations, sizes } = getFilterOptions();

  const clearFilters = () => {
    setFilters({
      industry: '',
      location: '',
      size: '',
      minPositions: 0
    });
    setSearchTerm('');
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 0
  ).length + (searchTerm ? 1 : 0);

  // /api/companies ab har company ke saath uski active jobs aur openPositions deta hai
  const fetchAllCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(Array.isArray(data) ? data : []);
      } else {
        console.error('Error fetching companies:', res.statusText);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="text-center mb-12">
              <div className="h-12 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-2/3 mx-auto"></div>
            </div>
            
            {/* Search and Filters Skeleton */}
            <div className="mb-8 space-y-4">
              <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto"></div>
              <div className="flex gap-4 justify-center">
                <div className="h-10 bg-gray-300 rounded w-32"></div>
                <div className="h-10 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            
            {/* Companies Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-xl mr-4"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Explore Companies
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover amazing companies that are hiring. Find your next opportunity
            with top employers across various industries.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search companies, industries, locations, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="name">Company Name</option>
                <option value="positions">Open Positions</option>
                <option value="size">Company Size</option>
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}

            <div className="text-gray-600 font-medium">
              {filteredCompanies.length} companies found
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Industries</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Company Size Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                  <select
                    value={filters.size}
                    onChange={(e) => setFilters({...filters, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Sizes</option>
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                {/* Minimum Positions Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Open Positions ({filters.minPositions})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.minPositions}
                    onChange={(e) => setFilters({...filters, minPositions: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Companies Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 group border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
            >
              {/* Company Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center flex-1">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
                    {company.logo ? (
                      <Image
                        src={company.logo}
                        alt={`${company.name} logo`}
                        width={64}
                        height={64}
                        className="object-cover rounded-xl"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 truncate">
                      {company.name}
                    </h3>
                    <p className="text-blue-600 font-medium text-sm">{company.industry}</p>
                  </div>
                </div>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Company Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3">
                  <div className="flex items-center text-blue-600 mb-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-xs font-medium">Location</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm truncate">{company.location || 'Not specified'}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3">
                  <div className="flex items-center text-green-600 mb-1">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-xs font-medium">Size</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">{company.size || 'Not specified'}</p>
                </div>
              </div>

              {/* Open Positions Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl px-3 py-2">
                  <Briefcase className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-purple-900 font-bold text-sm">
                    {company.openPositions} Open Positions
                  </span>
                </div>
                {company.openPositions > 10 && (
                  <div className="flex items-center text-orange-600 bg-orange-50 rounded-lg px-2 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">Hiring!</span>
                  </div>
                )}
              </div>

              {/* Company Description */}
              {company.description && (
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {company.description}
                </p>
              )}

              {/* Recent Jobs Preview */}
              {Array.isArray(company.jobs) && company.jobs.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                    Recent Openings
                  </h4>
                  <div className="space-y-2">
                    {company.jobs.slice(0, 3).map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors group/job"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900 text-sm truncate block group-hover/job:text-blue-600">
                            {job.jobTitle}
                          </span>
                          <span className="text-xs text-gray-500">{job.jobType} • {job.location}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-400 group-hover/job:text-blue-600 transition-colors" />
                      </Link>
                    ))}
                    {company.jobs.length > 3 && (
                      <p className="text-xs text-gray-500 text-center py-1">
                        +{company.jobs.length - 3} more positions
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href={`/jobs?company=${encodeURIComponent(company.name)}`}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-center text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 flex items-center justify-center"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  View All Jobs 
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredCompanies.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No companies found
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {searchTerm || Object.values(filters).some(f => f !== '' && f !== 0)
                  ? "No companies match your current search criteria. Try adjusting your filters or search terms."
                  : 'No companies are currently listed in our database.'}
              </p>
              {(searchTerm || Object.values(filters).some(f => f !== '' && f !== 0)) && (
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Enhanced Stats Section */}
        {filteredCompanies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Platform Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {filteredCompanies.length}
                </div>
                <div className="text-gray-700 font-medium">Total Companies</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {filteredCompanies.reduce((sum, company) => sum + (company.openPositions || 0), 0)}
                </div>
                <div className="text-gray-700 font-medium">Open Positions</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {new Set(filteredCompanies.map(company => company.industry).filter(Boolean)).size}
                </div>
                <div className="text-gray-700 font-medium">Industries</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {new Set(filteredCompanies.map(company => company.location).filter(Boolean)).size}
                </div>
                <div className="text-gray-700 font-medium">Locations</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
