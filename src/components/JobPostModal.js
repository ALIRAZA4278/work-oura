import React, { useState, useEffect } from "react";

export default function JobPostModal({ open, onClose, onSubmit, recruiterId, userId, editJob }) {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [category, setCategory] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isTestRequired, setIsTestRequired] = useState(false);
  const [openings, setOpenings] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [applyLink, setApplyLink] = useState("");

  useEffect(() => {
    if (editJob) {
      setJobTitle(editJob.jobTitle || "");
      setCompanyName(editJob.companyName || "");
      setCompanyLogo(editJob.companyLogo || "");
      setJobDescription(editJob.jobDescription || "");
      setJobType(editJob.jobType || "");
      setExperienceLevel(editJob.experienceLevel || "");
      setCategory(editJob.category || "");
      setRequiredSkills(Array.isArray(editJob.requiredSkills) ? editJob.requiredSkills.join(", ") : (editJob.requiredSkills || ""));
      setLocation(editJob.location || "");
      setSalaryMin(editJob.salaryMin || "");
      setSalaryMax(editJob.salaryMax || "");
      setDeadline(editJob.deadline ? editJob.deadline.slice(0,10) : "");
      setIsTestRequired(!!editJob.isTestRequired);
      setOpenings(editJob.openings || "");
      setContactEmail(editJob.contactEmail || "");
      setApplyLink(editJob.applyLink || "");
    } else {
      setJobTitle("");
      setCompanyName("");
      setCompanyLogo("");
      setJobDescription("");
      setJobType("");
      setExperienceLevel("");
      setCategory("");
      setRequiredSkills("");
      setLocation("");
      setSalaryMin("");
      setSalaryMax("");
      setDeadline("");
      setIsTestRequired(false);
      setOpenings("");
      setContactEmail("");
      setApplyLink("");
    }
  }, [editJob, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editJob) {
      // Edit mode: pass updated job object
      onSubmit({
        ...editJob,
        jobTitle,
        companyName,
        companyLogo,
        jobDescription,
        jobType,
        experienceLevel,
        category,
        requiredSkills,
        location,
        salaryMin,
        salaryMax,
        deadline,
        isTestRequired,
        openings,
        contactEmail,
        applyLink,
      });
    } else {
      // Create mode: submit as form
      e.target.jobTitle.value = jobTitle;
      e.target.companyName.value = companyName;
      e.target.companyLogo.value = companyLogo;
      e.target.jobDescription.value = jobDescription;
      e.target.jobType.value = jobType;
      e.target.experienceLevel.value = experienceLevel;
      e.target.category.value = category;
      e.target.requiredSkills.value = requiredSkills;
      e.target.location.value = location;
      e.target.salaryMin.value = salaryMin;
      e.target.salaryMax.value = salaryMax;
      e.target.deadline.value = deadline;
      e.target.isTestRequired.checked = isTestRequired;
      e.target.openings.value = openings;
      e.target.contactEmail.value = contactEmail;
      e.target.applyLink.value = applyLink;
      onSubmit(e);
    }
  };

  return (
    <div className="text-white fixed inset-0 z-50 overflow-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="text-white relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Decorative background elements */}
        <div className="text-white absolute top-0 left-0 w-full h-full opacity-10">
          <div className="text-white absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="text-white absolute bottom-20 right-20 w-24 h-24 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        {/* Header */}
        <div className="text-white relative flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
          <div className="text-white flex items-center gap-3 sm:gap-4">
            <div className="text-white w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                {editJob ? "Edit Job Posting" : "Create New Job"}
              </h2>
              <p className="text-white text-xs sm:text-sm hidden sm:block">
                {editJob ? "Update your job posting details" : "Fill in the details to post a new job"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all duration-200 hover:scale-110 shrink-0"
          >
            <svg className="text-white w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="text-white relative overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(95vh-140px)]">
          <div className="text-white p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Basic Information Section */}
            <div className="text-white space-y-6">
              <div className="text-white flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="text-white w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">1</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">Basic Information</h3>
              </div>

              <div className="text-white grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">Job Title *</label>
                  <input 
                    name="jobTitle" 
                    placeholder="e.g. Senior Frontend Developer" 
                    required 
                    value={jobTitle} 
                    onChange={e => setJobTitle(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                
                <div className="text-white space-y-2">
                  <label className="e text-sm font-medium text-slate-300">Company Name *</label>
                  <input 
                    name="companyName" 
                    placeholder="e.g. TechCorp Inc." 
                    required 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                    className=" w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">Clerk User ID</label>
                  <input 
                    name="userId" 
                    placeholder="Clerk User ID" 
                    value={userId || ''} 
                    disabled 
                    className="text-white w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl  cursor-not-allowed"
                  />
                </div>
                
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">Company Logo URL</label>
                  <input 
                    name="companyLogo" 
                    placeholder="https://example.com/logo.png" 
                    value={companyLogo} 
                    onChange={e => setCompanyLogo(e.target.value)} 
                    className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="text-white space-y-2">
                <label className="text-white text-sm font-medium ">Job Description *</label>
                <textarea 
                  name="jobDescription" 
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..." 
                  required 
                  rows={5} 
                  value={jobDescription} 
                  onChange={e => setJobDescription(e.target.value)} 
                  className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Job Details Section */}
            <div className="text-white space-y-6">
              <div className="text-white flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="text-white w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">2</span>
                </div>
                <h3 className="text-white text-lg sm:text-xl font-semibold">Job Details</h3>
              </div>

              <div className="text-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-mediu">Job Type *</label>
                  <select 
                    name="jobType" 
                    required 
                    value={jobType} 
                    onChange={e => setJobType(e.target.value)} 
                    className=" w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  >
                    <option value="">Select Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Remote">Remote</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">Experience Level *</label>
                  <select 
                    name="experienceLevel" 
                    required 
                    value={experienceLevel} 
                    onChange={e => setExperienceLevel(e.target.value)} 
                    className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
                
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">Category *</label>
                  <input 
                    name="category" 
                    placeholder="e.g. Software Development" 
                    required 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="text-white grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">Required Skills</label>
                  <input 
                    name="requiredSkills" 
                    placeholder="React, JavaScript, Node.js, etc." 
                    value={requiredSkills} 
                    onChange={e => setRequiredSkills(e.target.value)} 
                    className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">Location *</label>
                  <input 
                    name="location" 
                    placeholder="e.g. San Francisco, CA or Remote" 
                    required 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Compensation & Requirements Section */}
            <div className="text-white space-y-6">
              <div className="text-white flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="text-white w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">3</span>
                </div>
                <h3 className="text-white text-lg sm:text-xl font-semibold">Compensation & Requirements</h3>
              </div>

              <div className="text-white grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-white grid grid-cols-2 gap-4">
                  <div className="text-white space-y-2">
                    <label className="text-white text-sm font-medium">Min Salary *</label>
                    <div className="text-white relative">
                      <span className="text-white absolute left-3 top-1/2 transform -translate-y-1/2 ">$</span>
                      <input 
                        name="salaryMin" 
                        type="number" 
                        min={0} 
                        placeholder="50000" 
                        required 
                        value={salaryMin} 
                        onChange={e => setSalaryMin(e.target.value)} 
                        className="text-white w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="text-white space-y-2">
                    <label className="text-white text-sm font-medium ">Max Salary *</label>
                    <div className="text-white relative">
                      <span className="text-white absolute left-3 top-1/2 transform -translate-y-1/2 ">$</span>
                      <input 
                        name="salaryMax" 
                        type="number" 
                        min={0} 
                        placeholder="80000" 
                        required 
                        value={salaryMax} 
                        onChange={e => setSalaryMax(e.target.value)} 
                        className="text-white w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium 00">Application Deadline</label>
                  <input 
                    name="deadline" 
                    type="date" 
                    value={deadline} 
                    onChange={e => setDeadline(e.target.value)} 
                    className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="text-white grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">Number of Openings</label>
                  <input 
                    name="openings" 
                    type="number" 
                    min={1} 
                    placeholder="1" 
                    value={openings} 
                    onChange={e => setOpenings(e.target.value)} 
                    className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                
                <div className="text-white flex items-center space-x-4 pt-8">
                  <input 
                    name="isTestRequired" 
                    type="checkbox" 
                    id="testRequired"
                    checked={isTestRequired} 
                    onChange={e => setIsTestRequired(e.target.checked)} 
                    className="text-white w-5 h-5 rounded bg-slate-800 border-slate-600  focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="testRequired" className="text-white text-sm font-medium ">
                    Technical assessment required
                  </label>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="text-white space-y-6">
              <div className="text-white flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="text-white w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">4</span>
                </div>
                <h3 className="text-white text-lg sm:text-xl font-semibold">Contact Information</h3>
              </div>

              <div className="text-white grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">Contact Email *</label>
                  <input 
                    name="contactEmail" 
                    placeholder="hiring@company.com" 
                    type="email" 
                    required 
                    value={contactEmail} 
                    onChange={e => setContactEmail(e.target.value)} 
                    className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                
                <div className="text-white space-y-2">
                  <label className="text-white text-sm font-medium ">External Apply Link</label>
                  <input 
                    name="applyLink" 
                    placeholder="https://company.com/apply" 
                    type="url" 
                    value={applyLink} 
                    onChange={e => setApplyLink(e.target.value)} 
                    className="text-white w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl  placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-white border-t border-slate-700/50 bg-slate-800/30 p-4 sm:p-6">
            <div className="text-white flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="text-white w-full sm:w-auto px-6 sm:px-8 py-3 bg-slate-700 hover:bg-slate-600 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-white w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {editJob ? "Update Job" : "Post Job"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}