import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { companyRowToApi, jobRowToApi } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

/**
 * Companies + har company ki active jobs.
 * Jin jobs ka company_id null hai (purana data), unhe company_name se
 * group karke alag entry bana di jati hai taake page pe koi job miss na ho.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const [companiesResult, jobsResult] = await Promise.all([
      supabase
        .from('companies')
        .select('id, name, slug, description, industry, location, logo_url, size, website, created_at')
        .order('name', { ascending: true }),
      supabase
        .from('jobs')
        .select(
          `id, company_id, job_title, company_name, company_logo, job_type, location,
           category, salary_min, salary_max, created_at, status,
           job_description, experience_level, required_skills, contact_email,
           deadline, is_test_required, openings, apply_link, views, updated_at, recruiter_id`
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
    ]);

    if (companiesResult.error) {
      console.error('[GET /api/companies] Companies query failed:', companiesResult.error);
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }
    if (jobsResult.error) {
      console.error('[GET /api/companies] Jobs query failed:', jobsResult.error);
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }

    const jobs = jobsResult.data || [];
    const byCompanyId = new Map();
    const orphanJobsByName = new Map();

    for (const job of jobs) {
      if (job.company_id) {
        if (!byCompanyId.has(job.company_id)) byCompanyId.set(job.company_id, []);
        byCompanyId.get(job.company_id).push(job);
      } else if (job.company_name) {
        const key = job.company_name.trim().toLowerCase();
        if (!orphanJobsByName.has(key)) orphanJobsByName.set(key, []);
        orphanJobsByName.get(key).push(job);
      }
    }

    const companies = (companiesResult.data || []).map((row) => {
      const companyJobs = byCompanyId.get(row.id) || [];

      // Same naam ki orphan jobs bhi isi company ke saath jod do
      const nameKey = row.name.trim().toLowerCase();
      const orphans = orphanJobsByName.get(nameKey);
      if (orphans) {
        companyJobs.push(...orphans);
        orphanJobsByName.delete(nameKey);
      }

      return {
        ...companyRowToApi(row),
        jobs: companyJobs.map(jobRowToApi),
        openPositions: companyJobs.length,
      };
    });

    // Jin company names ka koi companies row hi nahi hai
    for (const [, orphanJobs] of orphanJobsByName) {
      const first = orphanJobs[0];
      companies.push({
        id: `job-company-${first.company_name}`,
        name: first.company_name,
        slug: null,
        description: '',
        industry: first.category || '',
        location: first.location || '',
        logo: first.company_logo || '',
        size: '',
        website: '',
        createdAt: first.created_at,
        jobs: orphanJobs.map(jobRowToApi),
        openPositions: orphanJobs.length,
      });
    }

    return NextResponse.json(companies);
  } catch (error) {
    console.error('[GET /api/companies] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}
