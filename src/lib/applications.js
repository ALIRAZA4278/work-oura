import { getSupabaseAdmin } from '@/lib/supabase';
import { applicationRowToApi } from '@/lib/mappers';

export const APPLICATION_SELECT = `
  id, job_id, applicant_id, cover_letter, resume, custom_fields,
  applicant_score, status, name, email, phone, skills, bio, education,
  job_title, company_name, location, applied_at, created_at, updated_at,
  job:jobs!applications_job_id_fkey (
    id, job_title, company_name, company_logo, location, job_type, salary_min, salary_max
  ),
  applicant:accounts!applications_applicant_id_fkey (
    id, full_name, email, profiles ( phone, bio, skills, location )
  )
`;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ek job pe application banata hai. `/api/applications` aur
 * `/api/jobs/[id]/apply` dono yahi function use karte hain.
 *
 * @returns {{status: number, body: object}}
 */
export async function createApplication({ account, jobId, body = {} }) {
  if (!account) {
    return { status: 401, body: { error: 'Apply karne ke liye login karein' } };
  }

  if (!jobId || !UUID_RE.test(jobId)) {
    return { status: 400, body: { error: 'Valid job id nahi mila' } };
  }

  const supabase = getSupabaseAdmin();

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, job_title, company_name, location, status, recruiter_id')
    .eq('id', jobId)
    .maybeSingle();

  if (jobError) {
    console.error('[applications] Job lookup failed:', jobError);
    return { status: 500, body: { error: 'Job load nahi ho saka' } };
  }

  if (!job) {
    return { status: 404, body: { error: 'Job not found' } };
  }

  if (job.status !== 'active') {
    return { status: 400, body: { error: 'Ye job ab applications accept nahi kar rahi' } };
  }

  if (job.recruiter_id === account.id) {
    return { status: 400, body: { error: 'Apni hi job pe apply nahi kar sakte' } };
  }

  const customFields = body.customFields || {};

  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      applicant_id: account.id,
      cover_letter: body.coverLetter || null,
      resume: body.resume || null,
      custom_fields: customFields,
      status: 'pending',
      name: customFields.name || account.full_name,
      email: customFields.email || account.email,
      phone: customFields.phone || null,
      skills: customFields.skills || null,
      bio: customFields.bio || null,
      education: customFields.education || null,
      job_title: job.job_title,
      company_name: job.company_name,
      location: job.location,
    })
    .select(APPLICATION_SELECT)
    .single();

  if (error) {
    // 23505 = unique (job_id, applicant_id)
    if (error.code === '23505') {
      return { status: 400, body: { error: 'Aap is job pe pehle hi apply kar chuke hain' } };
    }
    console.error('[applications] Insert failed:', error);
    return { status: 500, body: { error: 'Application submit nahi hui', details: error.message } };
  }

  return { status: 201, body: applicationRowToApi(application) };
}
