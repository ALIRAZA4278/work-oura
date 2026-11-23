/**
 * File: src/app/api/jobs/route.js
 *
 * GET /api/jobs  <- jobs page (list, search, filters, sorting, paging)
 *   SELECT FROM jobs WHERE status = 'active'
 *     search  -> job_title / company_name / job_description ILIKE
 *     filters -> location, job_type, experience_level, category, salary_min
 *   JOIN accounts via jobs.recruiter_id (recruiter name / email)
 * POST /api/jobs  <- dashboard + jobs page (Post Job form)
 *   find or create the company by slug -> company_id
 *   INSERT INTO jobs (lib/mappers.js jobApiToRow: jobTitle -> job_title ...)
 *   recruiter_id = the logged-in account
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentAccount } from '@/lib/auth';
import { jobRowToApi, jobApiToRow } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

const JOB_SELECT = `
  id, recruiter_id, company_id, job_title, company_name, company_logo,
  job_description, job_type, experience_level, category, required_skills,
  location, salary_min, salary_max, deadline, is_test_required, openings,
  contact_email, apply_link, status, views, created_at, updated_at,
  recruiter:accounts!jobs_recruiter_id_fkey ( id, full_name, email )
`;

/** Remove characters that would break a PostgREST `or()` filter string. */
function sanitizeSearch(value) {
  return String(value).replace(/[,()*%\\]/g, ' ').trim();
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function postedDateCutoff(postedDate) {
  const date = new Date();
  switch (postedDate) {
    case 'today':
      date.setHours(0, 0, 0, 0);
      return date;
    case '3days':
      date.setDate(date.getDate() - 3);
      return date;
    case 'week':
      date.setDate(date.getDate() - 7);
      return date;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      return date;
    default:
      return null;
  }
}

export async function GET(request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit'), 10) || 10, 1), 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('jobs')
      .select(JOB_SELECT, { count: 'exact' })
      .eq('status', 'active');

    const search = searchParams.get('search');
    if (search) {
      const term = sanitizeSearch(search);
      if (term) {
        query = query.or(
          `job_title.ilike.*${term}*,company_name.ilike.*${term}*,job_description.ilike.*${term}*`
        );
      }
    }

    const location = searchParams.get('location');
    if (location) query = query.ilike('location', `%${location}%`);

    if (searchParams.get('remote') === 'true') query = query.ilike('location', '%remote%');

    const type = searchParams.get('type');
    if (type) query = query.eq('job_type', type);

    const level = searchParams.get('level');
    if (level) query = query.eq('experience_level', level);

    const category = searchParams.get('category');
    if (category) query = query.eq('category', category);

    const salaryMin = searchParams.get('salaryMin');
    if (salaryMin) query = query.gte('salary_min', parseInt(salaryMin, 10));

    const salaryMax = searchParams.get('salaryMax');
    if (salaryMax) query = query.lte('salary_max', parseInt(salaryMax, 10));

    if (searchParams.get('recentlyPosted') === 'true') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query = query.gte('created_at', oneWeekAgo.toISOString());
    }

    const cutoff = postedDateCutoff(searchParams.get('postedDate'));
    if (cutoff) query = query.gte('created_at', cutoff.toISOString());

    switch (searchParams.get('sort') || 'recent') {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'salary_high':
        query = query
          .order('salary_max', { ascending: false })
          .order('salary_min', { ascending: false });
        break;
      case 'salary_low':
        query = query
          .order('salary_min', { ascending: true })
          .order('salary_max', { ascending: true });
        break;
      case 'alphabetical':
        query = query.order('job_title', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('[GET /api/jobs] Query failed:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    return NextResponse.json({
      jobs: (data || []).map(jobRowToApi),
      pagination: {
        page,
        limit,
        total: count ?? 0,
        pages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/jobs] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const account = await getCurrentAccount();

    if (!account) {
      return NextResponse.json({ error: 'Please sign in to post a job' }, { status: 401 });
    }

    const body = await request.json();

    const required = [
      'jobTitle',
      'companyName',
      'jobDescription',
      'jobType',
      'experienceLevel',
      'category',
      'location',
      'contactEmail',
    ];
    const missing = required.filter((field) => !String(body[field] || '').trim());
    if (missing.length) {
      return NextResponse.json(
        { error: `These fields are required: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Whoever posts a job automatically becomes a recruiter
    if (account.role === 'job_seeker') {
      await supabase.from('accounts').update({ role: 'recruiter' }).eq('id', account.id);
    }

    // Find or create the company (so it also shows on the /companies page)
    const companySlug = slugify(body.companyName);
    let companyId = null;

    if (companySlug) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', companySlug)
        .maybeSingle();

      if (company) {
        companyId = company.id;
      } else {
        const { data: created } = await supabase
          .from('companies')
          .insert({
            owner_id: account.id,
            name: body.companyName,
            slug: companySlug,
            location: body.location || null,
            logo_url: body.companyLogo || null,
          })
          .select('id')
          .maybeSingle();
        companyId = created?.id ?? null;
      }
    }

    const row = jobApiToRow(body, { recruiterId: account.id });
    row.company_id = companyId;

    if (row.salary_max < row.salary_min) {
      return NextResponse.json(
        { error: 'Maximum salary cannot be lower than minimum salary' },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .insert(row)
      .select(JOB_SELECT)
      .single();

    if (error) {
      console.error('[POST /api/jobs] Insert failed:', error);
      return NextResponse.json(
        { error: 'Failed to create job', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Job created', data: jobRowToApi(job) }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/jobs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create job', details: error.message },
      { status: 500 }
    );
  }
}
