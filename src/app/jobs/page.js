"use client";

/**
 * File: src/app/jobs/page.js
 *
 * Jobs list page (/jobs): search, filters, sorting, pagination, bookmarks.
 * Data:
 *   GET  /api/jobs?search=&location=&type=...  -> jobs table (status = 'active')
 *   POST/DELETE /api/jobs/:id/save              -> saved_jobs table
 *   POST /api/jobs                              -> jobs table (new job)
 * The UI uses camelCase fields (jobTitle, companyName, salaryMin...) that map to
 * the DB columns job_title, company_name, salary_min... (see lib/mappers.js).
 */
import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import JobFilters from "@/components/JobFilters";
import { 
  Loader2, 
  Briefcase, 
  MapPin, 
  Users, 
  TrendingUp, 
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  DollarSign,
  Eye,
  Star
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

function JobsPageContent() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
  });

  const searchParams = useSearchParams();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "") {
          if (typeof value === 'boolean') {
            params.append(key, value.toString());
          } else {
            params.append(key, value.toString());
          }
        }
      });

      // Add sort parameter
      params.append('sort', sortBy);

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs);
        // If pagination is missing, set default values
        setPagination(data.pagination || {
          page: 1,
          limit: data.jobs ? data.jobs.length : 0,
          total: data.jobs ? data.jobs.length : 0,
          pages: 1
        });
      } else {
        toast.error(data.error || "Failed to fetch jobs");
      }
    } catch (error) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sortBy]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    // Update filters from URL params
    const urlFilters = {
      search: searchParams.get("search") || "",
      location: searchParams.get("location") || "",
      type: searchParams.get("type") || "",
      level: searchParams.get("level") || "",
      category: searchParams.get("category") || "",
      salaryMin: searchParams.get("salaryMin") || "",
      salaryMax: searchParams.get("salaryMax") || "",
      remote: searchParams.get("remote") === "true",
      verified: searchParams.get("verified") === "true",
      recentlyPosted: searchParams.get("recentlyPosted") === "true",
      postedDate: searchParams.get("postedDate") || "",
    };
    setFilters(urlFilters);
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'salary_high':
      case 'recent':
        return <SortDesc className="w-4 h-4" />;
      case 'salary_low':
      case 'oldest':
        return <SortAsc className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'recent': return 'Most Recent';
      case 'oldest': return 'Oldest First';
      case 'relevant': return 'Most Relevant';
      case 'salary_high': return 'Salary: High to Low';
      case 'salary_low': return 'Salary: Low to High';
      case 'alphabetical': return 'Alphabetical';
      default: return 'Most Recent';
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Job saved successfully!");
      } else {
        toast.error("Failed to save job");
      }
    } catch (error) {
      toast.error("Failed to save job");
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success("Job posted successfully!");
        setFormData({ title: "", description: "", location: "", type: "" });
        fetchJobs(); // Refresh job list
      } else {
        toast.error("Failed to post job.");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Failed to post job.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-blue-100 rounded-full p-4">
                <Image
                  src="/Workoura Icon.png"
                  alt="Workoura"
                  width={65}
                  height={65}
                />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-4 text-gray-900"
            >
              Find Your Dream Job
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Discover thousands of opportunities from top companies worldwide
            </motion.p>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-center mb-2">
                  <Briefcase className="w-8 h-8 text-blue-600 mr-2" />
                  <span className="text-3xl font-bold text-gray-900">{pagination.total}+</span>
                </div>
                <p className="text-gray-600">Active Jobs</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-purple-600 mr-2" />
                  <span className="text-3xl font-bold text-gray-900">500+</span>
                </div>
                <p className="text-gray-600">Companies</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600 mr-2" />
                  <span className="text-3xl font-bold text-gray-900">98%</span>
                </div>
                <p className="text-gray-600">Success Rate</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <JobFilters onFilterChange={handleFilterChange} />
        </motion.div>

        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center py-20"
          >
            <div className="bg-white rounded-full p-8 shadow-xl mb-6">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <p className="text-gray-600 text-lg">Finding the perfect jobs for you...</p>
          </motion.div>
        ) : (
          <>
            {/* Results Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Results Info */}
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {jobs.length} of {pagination.total} jobs found
                    </p>
                    <p className="text-gray-600 text-sm">
                      {pagination.total > 0 && `Page ${pagination.page} of ${pagination.pages}`}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                       <List className="w-4 h-4" />
                     
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="relevant">Most Relevant</option>
                      <option value="salary_high">Salary: High to Low</option>
                      <option value="salary_low">Salary: Low to High</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {getSortIcon()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {jobs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-20"
              >
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-lg mx-auto">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No jobs found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn&apos;t find any jobs matching your current criteria. 
                    Try adjusting your filters or search terms.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Refresh Jobs
                    </button>
                    <button 
                      onClick={() => setFilters({
                        search: "", location: "", type: "", level: "", category: "",
                        salaryMin: "", salaryMax: "", remote: false, verified: false,
                        recentlyPosted: false, postedDate: ""
                      })}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`grid gap-6 mb-8 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1' 
                    : 'grid-cols-1 lg:grid-cols-2'
                }`}
              >
                <AnimatePresence mode="wait">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <JobCard
                        job={job}
                        onSaveJob={handleSaveJob}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex justify-center items-center space-x-2"
              >
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <SortAsc className="w-4 h-4 mr-2 rotate-90" />
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(pagination.pages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          page === pagination.page
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <SortDesc className="w-4 h-4 ml-2 rotate-90" />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}
