"use client";
import "antd/dist/reset.css";
import { css } from '@emotion/css';
import JobPostModal from "@/components/JobPostModal";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  User, 
  Briefcase, 
  FileText, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,  
  XCircle,
  Search,
  Bell,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  Filter,
  Download,
  Share2,
  MoreVertical,
  ArrowUpRight,
  Zap,
  Target,
  Award,
  Heart,
  BookOpen
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [editJob, setEditJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showJobModal, setShowJobModal] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    profileVisibility: false,
    twoFactorAuth: false
  });
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "job_seeker",
    bio: "",
    location: "",
    phone: ""
  });
  const [saving, setSaving] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      console.log('[Dashboard Frontend] 🚀 Component mounted, loading data...');
      console.log('[Dashboard Frontend] User info:', {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName
      });

      fetchUserProfile();
      fetchDashboardData();
    } else {
      console.log('[Dashboard Frontend] ⏳ Waiting for user to load...');
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        // Load profile data into form
        setProfileData({
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          role: data.role || "job_seeker",
          bio: data.profile?.bio || "",
          location: data.profile?.location || "",
          phone: data.profile?.phone || ""
        });
        // Load settings
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      console.log('='.repeat(60));
      console.log('[Dashboard Frontend] 🔄 Fetching dashboard data...');
      console.log('[Dashboard Frontend] 👤 Current user:', {
        id: user?.id,
        email: user?.primaryEmailAddress?.emailAddress
      });

      // Fetch applications for job seekers or jobs for recruiters
      const [applicationsRes, jobsRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/dashboard") // Use dashboard API that filters by user ID
      ]);

      console.log('[Dashboard Frontend] 📡 API Responses:');
      console.log('  - Applications API:', applicationsRes.status);
      console.log('  - Dashboard API:', jobsRes.status);

      if (applicationsRes.ok) {
        const appData = await applicationsRes.json();
        console.log('[Dashboard Frontend] 📄 Applications fetched:', appData.length);
        setApplications(appData);
      } else {
        console.log('[Dashboard Frontend] ⚠️ Applications API failed:', applicationsRes.statusText);
      }

      if (jobsRes.ok) {
        const jobData = await jobsRes.json();
        console.log('[Dashboard Frontend] 💼 Jobs fetched:', jobData.length);

        if (jobData.length > 0) {
          console.log('[Dashboard Frontend] 📋 Jobs list:');
          jobData.forEach((job, idx) => {
            console.log(`  ${idx + 1}. ${job.jobTitle} at ${job.companyName}`);
            console.log(`     ID: ${job._id}`);
            console.log(`     Created: ${new Date(job.createdAt).toLocaleString()}`);
          });
        } else {
          console.log('[Dashboard Frontend] ⚠️ No jobs found. If you just posted a job:');
          console.log('  1. Check server logs for [POST /api/jobs] and [Dashboard API]');
          console.log('  2. Verify your Clerk ID matches in both places');
          console.log('  3. Check if User record was created in MongoDB');
        }

        setJobs(jobData || []); // Dashboard API returns jobs directly, not wrapped in 'jobs' property
      } else {
        console.log('[Dashboard Frontend] ⚠️ Dashboard API failed:', jobsRes.statusText);
        const errorData = await jobsRes.text();
        console.log('[Dashboard Frontend] Error details:', errorData);
      }

      console.log('='.repeat(60));
    } catch (error) {
      console.error("[Dashboard Frontend] ❌ Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleEditJob = (jobId) => {
    const jobToEdit = jobs.find(j => j._id === jobId);
    setEditJob(jobToEdit);
    setShowJobModal(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log('Job deleted successfully:', jobId);

          // Immediately remove from state
          setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));

          toast.success("✅ Job deleted successfully!");
        } else {
          const errorText = await response.text();
          console.error('Job delete failed:', errorText);
          toast.error("Failed to delete job");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job");
      }
    }
  };

  const toggleSetting = async (settingKey) => {
    const newSettings = {
      ...settings,
      [settingKey]: !settings[settingKey]
    };
    setSettings(newSettings);

    // Save to database
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings })
      });

      if (response.ok) {
        const settingNames = {
          emailNotifications: "Email Notifications",
          jobAlerts: "Job Alerts",
          profileVisibility: "Profile Visibility",
          twoFactorAuth: "Two-Factor Authentication"
        };
        toast.success(`${settingNames[settingKey]} ${newSettings[settingKey] ? 'enabled' : 'disabled'}`);
      } else {
        toast.error("Failed to update setting");
        // Revert on error
        setSettings(settings);
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      toast.error("Failed to update setting");
      setSettings(settings);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: profileData.role,
          profile: {
            bio: profileData.bio,
            location: profileData.location,
            phone: profileData.phone
          }
        })
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        fetchUserProfile();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelProfile = () => {
    // Reset to original values
    if (userProfile) {
      setProfileData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        role: userProfile.role || "job_seeker",
        bio: userProfile.profile?.bio || "",
        location: userProfile.profile?.location || "",
        phone: userProfile.profile?.phone || ""
      });
    }
    toast.info("Changes cancelled");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-400 to-orange-400";
      case "reviewing":
        return "bg-gradient-to-r from-blue-400 to-blue-600";
      case "interview":
        return "bg-gradient-to-r from-purple-400 to-purple-600";
      case "rejected":
        return "bg-gradient-to-r from-red-400 to-red-600";
      case "hired":
        return "bg-gradient-to-r from-green-400 to-green-600";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "reviewing":
        return <Eye className="h-4 w-4" />;
      case "interview":
        return <User className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "hired":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleJobFormSubmit = async (e, data) => {
    let payload;
    if (e && e.preventDefault) {
      // Create
      e.preventDefault();
      const formData = new FormData(e.target);

      // Get Clerk user ID - this is crucial for linking jobs to the user
      const clerkUserId = user?.id;

      if (!clerkUserId) {
        toast.error('User not authenticated. Please log in again.');
        return;
      }

      console.log('Creating job with Clerk User ID:', clerkUserId);

      let requiredSkillsRaw = formData.get('requiredSkills');
      let requiredSkills = [];
      if (requiredSkillsRaw && typeof requiredSkillsRaw === 'string') {
        requiredSkills = requiredSkillsRaw.split(',').map(s => s.trim()).filter(Boolean);
      } else if (Array.isArray(requiredSkillsRaw)) {
        requiredSkills = requiredSkillsRaw;
      } else {
        requiredSkills = [];
      }

      // Get and validate companyLogo
      let companyLogo = formData.get('companyLogo') || '';
      // If logo is empty or N/A, set to empty string
      if (!companyLogo || companyLogo === 'N/A' || companyLogo.trim() === '') {
        companyLogo = '';
      }

      payload = {
        userId: clerkUserId,
        jobTitle: formData.get('jobTitle'),
        companyName: formData.get('companyName'),
        companyLogo: companyLogo,
        jobDescription: formData.get('jobDescription'),
        jobType: formData.get('jobType'),
        experienceLevel: formData.get('experienceLevel'),
        category: formData.get('category'),
        requiredSkills,
        location: formData.get('location'),
        salaryMin: Number(formData.get('salaryMin')),
        salaryMax: Number(formData.get('salaryMax')),
        deadline: formData.get('deadline'),
        isTestRequired: formData.get('isTestRequired') === 'on',
        openings: formData.get('openings'),
        contactEmail: formData.get('contactEmail'),
        recruiter: clerkUserId,  // Send Clerk User ID as recruiter
        applyLink: formData.get('applyLink'),
      };

      console.log('Job payload:', payload);

      try {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const result = await res.json();
          console.log('✅ Job created successfully:', result);
          console.log('📋 Job data:', result.data);

          toast.success('✅ Job posted successfully! Loading your jobs...');
          setShowJobModal(false);
          setEditJob(null);

          // Wait a moment for database to process
          await new Promise(resolve => setTimeout(resolve, 500));

          // Refresh data from server to get updated list
          console.log('🔄 Refreshing dashboard data after job creation...');
          await fetchDashboardData();

          // Switch to "My Jobs" tab to show the newly created job
          setActiveTab('jobs');
        } else {
          const errorText = await res.text();
          console.error('Job post failed:', errorText);
          toast.error('Failed to post job');
        }
      } catch (err) {
        console.error('Error posting job:', err);
        toast.error('Error posting job');
      }
    } else if (data) {
      // Edit
      const userId = user?.id || "";
      payload = {
        ...data,
        userId,
        // Do NOT overwrite recruiter, keep original MongoDB _id
      };
      try {
        const res = await fetch(`/api/jobs/${data._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const result = await res.json();
          console.log('Job updated successfully:', result);

          // Update the job in the jobs list
          setJobs(prevJobs =>
            prevJobs.map(job =>
              job._id === data._id ? { ...job, ...payload } : job
            )
          );

          toast.success('✅ Job updated successfully!');
          setShowJobModal(false);
          setEditJob(null);

          // Refresh data from server
          await fetchDashboardData();
        } else {
          const errorText = await res.text();
          console.error('Job update failed:', errorText);
          toast.error('Failed to update job');
        }
      } catch (err) {
        console.error('Error updating job:', err);
        toast.error('Error updating job');
      }
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <motion.div
            
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-8"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
                    Welcome back, {user.firstName}! 👋
                  </h1>
                  <p className="text-black text-sm sm:text-base lg:text-lg mt-0.5 sm:mt-1">
                    Ready to manage your career journey?
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md text-sm sm:text-base"
                  onClick={() => setShowJobModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Post Job</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4 sm:mb-8"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-1.5 sm:p-2 overflow-x-auto">
            <div className="flex space-x-1 min-w-max sm:min-w-0">
              {[
                { id: "overview", label: "Overview", icon: TrendingUp },
                { id: "applications", label: "Applications", icon: FileText },
                { id: "jobs", label: "My Jobs", icon: Briefcase },
                { id: "profile", label: "Profile", icon: User }
              ].map((tab, index) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 !text-white shadow-md"
                      : "text-black hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="inline sm:hidden">{tab.label.split(' ')[0]}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  {
                    label: "Total Applications",
                    value: applications.length,
                    icon: FileText,
                    gradient: "from-blue-500 to-blue-600",
                    subtitle: `${applications.filter(app => app.status === 'pending').length} pending`
                  },
                  {
                    label: "In Review",
                    value: applications.filter(app => app.status === 'reviewing').length,
                    icon: Eye,
                    gradient: "from-emerald-500 to-emerald-600",
                    subtitle: "Being evaluated"
                  },
                  {
                    label: "Interviews",
                    value: applications.filter(app => app.status === 'interview').length,
                    icon: Users,
                    gradient: "from-purple-500 to-purple-600",
                    subtitle: "Scheduled & completed"
                  },
                  {
                    label: "My Jobs",
                    value: jobs.length,
                    icon: Briefcase,
                    gradient: "from-orange-500 to-orange-600",
                    subtitle: `${jobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0)} total applicants`
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-black mb-2">{stat.value}</p>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-600">{stat.subtitle}</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-black mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Post New Job",
                      description: "Create a new job posting",
                      icon: Plus,
                      gradient: "from-blue-500 to-blue-600",
                      action: () => setShowJobModal(true)
                    },
                    {
                      title: "Find Candidates",
                      description: "Search for potential candidates",
                      icon: Search,
                      gradient: "from-purple-500 to-purple-600",
                      action: () => { router.push("/jobs")}
                    },
                    {
                      title: "Analytics",
                      description: "View detailed reports",
                      icon: TrendingUp,
                      gradient: "from-emerald-500 to-emerald-600",
                      action: () => { router.push("/about")}
                    }
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={action.action}
                      className={`p-6 bg-gradient-to-r ${action.gradient} text-white rounded-xl hover:shadow-lg transition-all duration-300 text-left group`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <action.icon className="h-6 w-6" />
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="font-semibold mb-1">{action.title}</h4>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === "applications" && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black">My Applications</h2>
              <div className="flex items-center space-x-3 relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <Filter className="h-4 w-4 mr-2 text-black" />
                  <span className="text-black">Filter</span>
                </motion.button>

                {/* Filter Dropdown */}
                <AnimatePresence>
                  {showFilterMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-10 min-w-[180px]"
                    >
                      {[
                        { label: "All Applications", value: "all" },
                        { label: "Pending", value: "pending" },
                        { label: "Reviewing", value: "reviewing" },
                        { label: "Interview", value: "interview" },
                        { label: "Hired", value: "hired" },
                        { label: "Rejected", value: "rejected" }
                      ].map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => {
                            setApplicationFilter(filter.value);
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                            applicationFilter === filter.value ? "bg-blue-50 text-blue-600 font-medium" : "text-black"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid gap-6">
              {(() => {
                const filteredApplications = applicationFilter === "all"
                  ? applications
                  : applications.filter(app => app.status === applicationFilter);

                return filteredApplications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-12 text-center border border-gray-200"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">No applications yet</h3>
                  <p className="text-black mb-6">Start applying to jobs to see them here!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Browse Jobs
                  </motion.button>
                </motion.div>
              ) : (
                filteredApplications.map((application, index) => (
                  <motion.div 
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-black mb-1">{application.jobTitle}</h3>
                            <p className="text-black mb-3">{application.companyName}</p>
                            <div className="flex items-center space-x-4 text-sm text-black">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {application.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(application.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status}</span>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-black" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              );
              })()}
            </div>
          </motion.div>
        )}

        {activeTab === "jobs" && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black">My Jobs</h2>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowJobModal(true)} 
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </motion.button>
            </div>

            <div className="grid gap-6">
              {jobs.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-12 text-center border border-gray-200"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">No jobs posted yet</h3>
                  <p className="text-black mb-6">Create your first job posting to get started!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowJobModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Post Your First Job
                  </motion.button>
                </motion.div>
              ) : (
                jobs.map((job, index) => (
                  <motion.div 
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-black mb-1">{job.jobTitle || job.title}</h3>
                            <p className="text-black mb-3">{job.companyName}</p>
                            <div className="flex items-center space-x-4 text-sm text-black mb-3">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                              {job.salaryMin && job.salaryMax && (
                                <span className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                   {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                                {job.applications?.length || 0} applications
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewJob(job._id)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors group"
                          title="View Job"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditJob(job._id)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
                          title="Edit Job"
                        >
                          <Edit className="h-4 w-4 text-black" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors group"
                          title="Delete Job"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-black mb-6">Profile Information</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-black">
                        <label className="block text-sm font-medium text-black mb-2">First Name</label>
                        <input
                          type="text"
                          value={user?.firstName || ""}
                          disabled
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-black placeholder-gray-500 cursor-not-allowed"
                          title="Managed by Clerk - cannot be changed here"
                        />
                        <p className="text-xs text-gray-500 mt-1">Managed by your account settings</p>
                      </div>
                      <div className="text-black">
                        <label className="block text-sm font-medium text-black mb-2">Last Name</label>
                        <input
                          type="text"
                          value={user?.lastName || ""}
                          disabled
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-black placeholder-gray-500 cursor-not-allowed"
                          title="Managed by Clerk - cannot be changed here"
                        />
                        <p className="text-xs text-gray-500 mt-1">Managed by your account settings</p>
                      </div>
                    </div>

                    <div className="text-black">
                      <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                      <input
                        type="email"
                        value={user?.primaryEmailAddress?.emailAddress || ""}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-black placeholder-gray-500 cursor-not-allowed"
                        title="Managed by Clerk - cannot be changed here"
                      />
                      <p className="text-xs text-gray-500 mt-1">Managed by your account settings</p>
                    </div>

                    <div className="text-black">
                      <label className="block text-sm font-medium text-black mb-2">Role</label>
                      <select
                        value={profileData.role}
                        onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                      >
                        <option value="job_seeker">Job Seeker</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="text-black">
                      <label className="block text-sm font-medium text-black mb-2">Professional Bio</label>
                      <textarea
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="Tell us about your professional background, skills, and career goals..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-black placeholder-gray-500"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Location</label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          placeholder="City, Country"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black placeholder-gray-500"
                        />
                      </div>
                      <div className="text-black">
                        <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {saving ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancelProfile}
                        disabled={saving}
                        className="px-6 py-3 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Sidebar */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-black">{user.fullName}</h3>
                  <p className="text-black text-sm mb-4">{user.primaryEmailAddress?.emailAddress}</p>
                  <p className="text-xs text-gray-500">
                    Profile photo is managed through your Clerk account settings
                  </p>
                </div>

                {/* Account Stats */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-black mb-4">Account Stats</h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Applications",
                        value: applications.length,
                        icon: FileText,
                        color: "text-emerald-600"
                      },
                      {
                        label: "Jobs Posted",
                        value: jobs.length,
                        icon: Briefcase,
                        color: "text-purple-600"
                      },
                      {
                        label: "Hired",
                        value: applications.filter(app => app.status === 'hired').length,
                        icon: CheckCircle,
                        color: "text-green-600"
                      },
                      {
                        label: "Success Rate",
                        value: applications.length > 0
                          ? `${Math.round((applications.filter(app => app.status === 'hired').length / applications.length) * 100)}%`
                          : "0%",
                        icon: Target,
                        color: "text-orange-600"
                      }
                    ].map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 bg-gray-100 rounded-lg`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                          <span className="text-black text-sm">{stat.label}</span>
                        </div>
                        <span className="font-semibold text-black">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Settings */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-black mb-4">Quick Settings</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Email Notifications", key: "emailNotifications", enabled: settings.emailNotifications },
                      { label: "Job Alerts", key: "jobAlerts", enabled: settings.jobAlerts },
                      { label: "Profile Visibility", key: "profileVisibility", enabled: settings.profileVisibility },
                      { label: "Two-Factor Auth", key: "twoFactorAuth", enabled: settings.twoFactorAuth }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-black text-sm">{setting.label}</span>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSetting(setting.key)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                            setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                            setting.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <JobPostModal
          open={showJobModal}
          onClose={() => { setShowJobModal(false); setEditJob(null); }}
          onSubmit={handleJobFormSubmit}
          recruiterId={user?.id || ''}
          userId={user?.id || ''}
          editJob={editJob}
        />
      </div>
      <Footer />
    </div>
  );
}
