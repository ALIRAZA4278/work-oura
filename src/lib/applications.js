/**
 * File: src/lib/applications.js
 *
 * Apply-to-job logic for POST /api/applications.
 * Tables:
 *   jobs          SELECT (is the job active? who is the recruiter?)
 *   applications  INSERT job_id (FK -> jobs.id), applicant_id (FK -> accounts.id),
 *                 cover_letter, status = 'pending', plus snapshot fields
 *                 (name, email, phone, skills, bio, education, job_title,
 *                  company_name, location)
 * APPLICATION_SELECT joins:
 *   job:jobs!applications_job_id_fkey                  applications.job_id = jobs.id
 *   applicant:accounts!applications_applicant_id_fkey  applications.applicant_id = accounts.id
 *     -> profiles                                      accounts.id = profiles.account_id
 * The unique index (job_id, applicant_id) blocks applying twice (error 23505).
 */
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
 * Creates an application for a job. Used by `POST /api/applications`.
 *
 * @returns {{status: number, body: object}}
 */
export async function createApplication({ account, jobId, body = {} }) {
  if (!account) {
    return { status: 401, body: { error: 'Please sign in to apply' } };
  }

  if (!jobId || !UUID_RE.test(jobId)) {
    return { status: 400, body: { error: 'Invalid job id' } };
  }

  const supabase = getSupabaseAdmin();

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, job_title, company_name, location, status, recruiter_id')
    .eq('id', jobId)
    .maybeSingle();

  if (jobError) {
    console.error('[applications] Job lookup failed:', jobError);
    return { status: 500, body: { error: 'Could not load the job' } };
  }

  if (!job) {
    return { status: 404, body: { error: 'Job not found' } };
  }

  if (job.status !== 'active') {
    return { status: 400, body: { error: 'This job is no longer accepting applications' } };
  }

  if (job.recruiter_id === account.id) {
    return { status: 400, body: { error: 'You cannot apply to your own job' } };
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
      return { status: 400, body: { error: 'You have already applied to this job' } };
    }
    console.error('[applications] Insert failed:', error);
    return { status: 500, body: { error: 'Could not submit the application', details: error.message } };
  }

  return { status: 201, body: applicationRowToApi(application) };
}
