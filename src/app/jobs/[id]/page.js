"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin,
  Clock,
  Building,
  DollarSign,
  Calendar,
  Eye,
  Share2,
  Bookmark,
  ExternalLink,
  ArrowLeft,
  Users,
  CheckCircle,
  X,
  Send,
  FileText,
  Mail,
  Phone,
  User,
  Briefcase,
  GraduationCap,
  Edit3
} from "lucide-react";
import toast from "react-hot-toast";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const { isSignedIn } = useAuth();
  const [showLoginError, setShowLoginError] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    bio: "",
    education: "",
    coverLetter: "",
    resume: null
  });

  // Form errors state
  const [formErrors, setFormErrors] = useState({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || ""
      }));
    }
  }, [user]);

  const handleApplyJob = (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      setShowLoginError(true);
      setTimeout(() => setShowLoginError(false), 3000);
    } else {
      setShowApplyModal(true);
    }
  };

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${id}`);
      const data = await response.json();

      if (response.ok) {
        setJob(data);
      } else {
        toast.error(data.error || "Failed to fetch job");
      }
    } catch (error) {
      toast.error("Failed to fetch job");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.skills.trim()) errors.skills = "Skills are required";
    if (!formData.coverLetter.trim()) errors.coverLetter = "Cover letter is required";
    if (!formData.resume) errors.resume = "Resume is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        setFormData(prev => ({ ...prev, resume: file }));
        if (formErrors.resume) {
          setFormErrors(prev => ({ ...prev, resume: "" }));
        }
      } else {
        toast.error("Please upload a PDF, DOC, or DOCX file");
      }
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setApplying(true);
    try {
      // First, save the application to the database
      const applicationData = {
        jobId: job._id,
        coverLetter: formData.coverLetter,
        resume: formData.resume?.name || "resume.pdf",
        customFields: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          skills: formData.skills,
          bio: formData.bio,
          education: formData.education
        }
      };

      const applicationRes = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      });

      if (!applicationRes.ok) {
        const errorData = await applicationRes.json();
        toast.error(errorData.error || "Failed to submit application");
        setApplying(false);
        return;
      }

      const savedApplication = await applicationRes.json();

      // Then, send the email notification
      const companyEmail = job?.contactEmail || job?.companyEmail || job?.company?.email || job?.recruiterEmail || "";

      if (companyEmail) {
        const messageHtml = `
          <h2>New Job Application</h2>
          <p><strong>Job Title:</strong> ${job?.jobTitle}</p>
          <p><strong>Job ID:</strong> ${job?._id}</p>
          <p><strong>Applicant Name:</strong> ${formData.name}</p>
          <p><strong>Applicant Email:</strong> ${formData.email}</p>
          <p><strong>Clerk User ID:</strong> ${user?.id || ""}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
          <p><strong>Skills:</strong> ${formData.skills}</p>
          <p><strong>Bio:</strong> ${formData.bio}</p>
          <p><strong>Education:</strong> ${formData.education}</p>
          <p><strong>Cover Letter:</strong><br/>${formData.coverLetter}</p>
        `;

        await fetch("/api/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: `New Application for ${job?.jobTitle}`,
            from_name: formData.name,
            from_email: formData.email,
            to: companyEmail,
            message: messageHtml,
          }),
        });
      }

      toast.success("Application submitted successfully!");
      setShowApplyModal(false);
      setSubmittedData(formData);
      setShowConfirmation(true);

      // Reset form
      setFormData({
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        phone: "",
        skills: "",
        bio: "",
        education: "",
        coverLetter: "",
        resume: null
      });
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error("Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white rounded-2xl shadow-xl p-12"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-8">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link 
              href="/jobs" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/jobs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Jobs
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-start space-x-6">
                  {job.companyLogo && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0"
                    >
                      <Image
                        src={job.companyLogo}
                        alt={job.companyName}
                        width={80}
                        height={80}
                        className="rounded-xl shadow-md"
                      />
                    </motion.div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {job.jobTitle}
                    </h1>
                    <p className="text-xl text-gray-700 mb-4 font-medium">
                      {job.companyName}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        {job.location}
                      </span>
                      <span className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        {job.jobType?.replace("-", " ") || "N/A"}
                      </span>
                      <span className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                        <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                         {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}
                      </span>
                      <span className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                        <Eye className="h-4 w-4 mr-2 text-purple-500" />
                        {job.views} views
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                  >
                    <Bookmark className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Skills */}
              {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm px-4 py-2 rounded-full font-medium"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {job.jobDescription}
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-10 flex justify-center">
                {showLoginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-medium"
                  >
                    Please log in or sign up before applying to this job.
                  </motion.div>
                )}
                <motion.button
                  onClick={handleApplyJob}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Apply Now</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Job Details</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">Job Type</span>
                    <p className="font-semibold text-gray-900 capitalize">
                      {job.jobType?.replace("-", " ") || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">Experience Level</span>
                    <p className="font-semibold text-gray-900 capitalize">
                      {job.experienceLevel || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Building className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">Category</span>
                    <p className="font-semibold text-gray-900">{job.category}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">Posted</span>
                    <p className="font-semibold text-gray-900">{formatDate(job.createdAt)}</p>
                  </div>
                </div>

                {job.applicationDeadline && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 font-medium">Application Deadline</span>
                      <p className="font-semibold text-gray-900">{formatDate(job.applicationDeadline)}</p>
                    </div>
                  </div>
                )}

                {job.contactEmail && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {job.contactEmail}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-4xl max-h-[95vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-500 rounded-full blur-3xl"></div>
              </div>

              {/* Header */}
              <div className="relative flex items-center justify-between p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Apply for {job.jobTitle}</h2>
                    <p className="text-slate-300 text-sm">Fill in your details to submit your application</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleApplySubmit} className="relative overflow-y-auto max-h-[calc(95vh-140px)]">
                <div className="p-8 space-y-8">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          <User className="h-4 w-4 inline mr-2" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                            formErrors.name ? 'border-red-500' : 'border-slate-600'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {formErrors.name && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                            formErrors.email ? 'border-red-500' : 'border-slate-600'
                          }`}
                          placeholder="Enter your email address"
                        />
                        {formErrors.email && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          <Phone className="h-4 w-4 inline mr-2" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                            formErrors.phone ? 'border-red-500' : 'border-slate-600'
                          }`}
                          placeholder="Enter your phone number"
                        />
                        {formErrors.phone && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>
                        )}
                      </div>

                      {/* Education */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          <GraduationCap className="h-4 w-4 inline mr-2" />
                          Education
                        </label>
                        <input
                          type="text"
                          value={formData.education}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          placeholder="Your highest education"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">Professional Information</h3>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        <Briefcase className="h-4 w-4 inline mr-2" />
                        Skills *
                      </label>
                      <input
                        type="text"
                        value={formData.skills}
                        onChange={(e) => handleInputChange('skills', e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                          formErrors.skills ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="e.g. React, Node.js, MongoDB, Python"
                      />
                      {formErrors.skills && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.skills}</p>
                      )}
                    </div>

                    {/* Resume */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        <FileText className="h-4 w-4 inline mr-2" />
                        Resume (PDF, DOC, DOCX) *
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 ${
                          formErrors.resume ? 'border-red-500' : 'border-slate-600'
                        }`}
                      />
                      {formErrors.resume && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.resume}</p>
                      )}
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        <User className="h-4 w-4 inline mr-2" />
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                        placeholder="Short bio about yourself and your experience"
                      />
                    </div>
                  </div>

                  {/* Application Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">Application Details</h3>
                    </div>

                    {/* Cover Letter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        <Edit3 className="h-4 w-4 inline mr-2" />
                        Cover Letter *
                      </label>
                      <textarea
                        value={formData.coverLetter}
                        onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                        rows={6}
                        className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none ${
                          formErrors.coverLetter ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="Write your cover letter here. Explain why you're interested in this role and what makes you a good fit..."
                      />
                      {formErrors.coverLetter && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.coverLetter}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={applying}
                      whileHover={{ scale: applying ? 1 : 1.02 }}
                      whileTap={{ scale: applying ? 1 : 0.98 }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {applying ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-8 w-8 text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Your application for <strong>{job.jobTitle}</strong> has been successfully submitted. 
                The employer will review your application and get back to you soon.
              </p>
              <button
                onClick={() => setShowConfirmation(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
