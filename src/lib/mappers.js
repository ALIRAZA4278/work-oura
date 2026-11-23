/**
 * Postgres (snake_case) <-> Frontend (camelCase) mapping.
 * DB columns snake_case hain, UI camelCase expect karta hai — sab conversion yahan hoti hai.
 */

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringArray(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

/** jobs row -> API/UI object */
export function jobRowToApi(row) {
  if (!row) return null;

  const recruiter = Array.isArray(row.recruiter) ? row.recruiter[0] : row.recruiter;

  return {
    id: row.id,
    recruiterId: row.recruiter_id,
    recruiter: recruiter
      ? { id: recruiter.id, name: recruiter.full_name, email: recruiter.email }
      : row.recruiter_id,
    companyId: row.company_id || null,
    jobTitle: row.job_title,
    companyName: row.company_name,
    companyLogo: row.company_logo || '',
    jobDescription: row.job_description,
    jobType: row.job_type,
    experienceLevel: row.experience_level,
    category: row.category,
    requiredSkills: row.required_skills || [],
    location: row.location,
    salaryMin: row.salary_min ?? 0,
    salaryMax: row.salary_max ?? 0,
    deadline: row.deadline || null,
    isTestRequired: !!row.is_test_required,
    openings: row.openings ?? null,
    contactEmail: row.contact_email,
    applyLink: row.apply_link || '',
    status: row.status,
    views: row.views ?? 0,
    applicationsCount: row.applications?.[0]?.count ?? row.applications_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** UI payload -> jobs row (insert/update ke liye) */
export function jobApiToRow(body, { recruiterId, partial = false } = {}) {
  const row = {
    job_title: body.jobTitle,
    company_name: body.companyName,
    company_logo: body.companyLogo || null,
    job_description: body.jobDescription,
    job_type: body.jobType,
    experience_level: body.experienceLevel,
    category: body.category,
    required_skills: toStringArray(body.requiredSkills),
    location: body.location,
    salary_min: toNumberOrNull(body.salaryMin) ?? 0,
    salary_max: toNumberOrNull(body.salaryMax) ?? 0,
    deadline: body.deadline ? String(body.deadline).slice(0, 10) : null,
    is_test_required: !!body.isTestRequired,
    openings: toNumberOrNull(body.openings),
    contact_email: body.contactEmail,
    apply_link: body.applyLink || null,
  };

  if (recruiterId) row.recruiter_id = recruiterId;
  if (body.status) row.status = body.status;
  if (body.companyId) row.company_id = body.companyId;

  if (partial) {
    // Sirf wohi keys rakho jo body me actually aayi hain
    const provided = {};
    const keyMap = {
      job_title: 'jobTitle',
      company_name: 'companyName',
      company_logo: 'companyLogo',
      job_description: 'jobDescription',
      job_type: 'jobType',
      experience_level: 'experienceLevel',
      category: 'category',
      required_skills: 'requiredSkills',
      location: 'location',
      salary_min: 'salaryMin',
      salary_max: 'salaryMax',
      deadline: 'deadline',
      is_test_required: 'isTestRequired',
      openings: 'openings',
      contact_email: 'contactEmail',
      apply_link: 'applyLink',
      status: 'status',
      company_id: 'companyId',
    };
    for (const [column, uiKey] of Object.entries(keyMap)) {
      if (body[uiKey] !== undefined) provided[column] = row[column];
    }
    return provided;
  }

  return row;
}

/** applications row -> API/UI object */
export function applicationRowToApi(row) {
  if (!row) return null;

  const job = Array.isArray(row.job) ? row.job[0] : row.job;
  const applicant = Array.isArray(row.applicant) ? row.applicant[0] : row.applicant;
  const applicantProfile = Array.isArray(applicant?.profiles)
    ? applicant.profiles[0]
    : applicant?.profiles;

  return {
    id: row.id,
    jobId: row.job_id,
    applicantId: row.applicant_id,
    job: job
      ? {
          id: job.id,
          jobTitle: job.job_title,
          companyName: job.company_name,
          companyLogo: job.company_logo || '',
          location: job.location,
          jobType: job.job_type,
          salaryMin: job.salary_min ?? 0,
          salaryMax: job.salary_max ?? 0,
        }
      : row.job_id,
    applicant: applicant
      ? {
          id: applicant.id,
          name: applicant.full_name,
          email: applicant.email,
          profile: {
            phone: applicantProfile?.phone || '',
            bio: applicantProfile?.bio || '',
            skills: applicantProfile?.skills || [],
            location: applicantProfile?.location || '',
          },
        }
      : row.applicant_id,
    coverLetter: row.cover_letter || '',
    resume: row.resume || '',
    customFields: row.custom_fields || {},
    applicantScore: row.applicant_score ?? null,
    status: row.status,

    // Snapshot fields (UI directly inhe padhta hai)
    name: row.name || applicant?.full_name || '',
    email: row.email || applicant?.email || '',
    phone: row.phone || '',
    skills: row.skills || '',
    bio: row.bio || '',
    education: row.education || '',
    jobTitle: job?.job_title || row.job_title || 'Job Title Not Available',
    companyName: job?.company_name || row.company_name || 'Company Name Not Available',
    location: job?.location || row.location || 'Location Not Available',
    jobType: job?.job_type || 'Full-time',
    companyLogo: job?.company_logo || '',
    salaryMin: job?.salary_min ?? 0,
    salaryMax: job?.salary_max ?? 0,

    appliedAt: row.applied_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** companies row -> API/UI object */
export function companyRowToApi(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    industry: row.industry || '',
    location: row.location || '',
    logo: row.logo_url || '',
    size: row.size || '',
    website: row.website || '',
    createdAt: row.created_at,
  };
}

export { toStringArray, toNumberOrNull };
