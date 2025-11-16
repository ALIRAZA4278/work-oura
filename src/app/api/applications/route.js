import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/mongodb";
import Application from "@/models/Application";
import User from "@/models/User";
import Job from "@/models/Job";

export async function GET(request) {
  try {
    const { userId } = await auth();

    console.log('[Applications API] 🔍 Fetching applications for Clerk User ID:', userId);

    if (!userId) {
      console.log('[Applications API] ❌ No userId found - unauthorized');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    console.log('[Applications API] ✅ Database connected');

    const user = await User.findOne({ clerkId: userId });

    console.log('[Applications API] 👤 User lookup result:', user ? {
      _id: user._id.toString(),
      clerkId: user.clerkId,
      email: user.email,
      role: user.role
    } : 'NULL');

    if (!user) {
      console.log('[Applications API] ⚠️ User not found, creating new user...');
      // Create user if not found
      const newUser = await User.create({
        clerkId: userId,
        email: '',
        name: 'User',
        role: 'job_seeker',
      });
      console.log('[Applications API] ✅ New user created:', newUser._id);
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    let query = {};

    if (user.role === "job_seeker") {
      query.applicant = user._id;
      console.log('[Applications API] 🔍 Querying applications for job seeker:', user._id);
    } else if (user.role === "recruiter") {
      // Get applications for recruiter's jobs
      if (jobId) {
        const job = await Job.findById(jobId);
        if (job.recruiter.toString() !== user._id.toString()) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 403 }
          );
        }
        query.job = jobId;
      } else {
        const recruiterJobs = await Job.find({ recruiter: user._id });
        query.job = { $in: recruiterJobs.map(job => job._id) };
        console.log('[Applications API] 🔍 Querying applications for recruiter jobs:', recruiterJobs.length);
      }
    }

    const applications = await Application.find(query)
      .populate("job", "jobTitle companyName location jobType companyLogo salaryMin salaryMax")
      .populate("applicant", "name email profile")
      .sort({ appliedAt: -1 })
      .lean();

    console.log('[Applications API] 📊 Applications found:', applications.length);

    if (applications.length > 0) {
      console.log('[Applications API] 📋 Sample applications:');
      applications.slice(0, 3).forEach((app, idx) => {
        console.log(`  ${idx + 1}. Job: ${app.job?.jobTitle || app.jobTitle || 'N/A'}`);
        console.log(`     Company: ${app.job?.companyName || app.companyName || 'N/A'}`);
        console.log(`     Status: ${app.status}`);
        console.log(`     Applied: ${new Date(app.appliedAt).toLocaleDateString()}`);
      });
    }

    // Ensure all applications have the required fields
    const formattedApplications = applications.map(app => ({
      ...app,
      jobTitle: app.job?.jobTitle || app.jobTitle || 'Job Title Not Available',
      companyName: app.job?.companyName || app.companyName || 'Company Name Not Available',
      location: app.job?.location || app.location || 'Location Not Available',
      jobType: app.job?.jobType || 'Full-time',
      companyLogo: app.job?.companyLogo || '',
      salaryMin: app.job?.salaryMin || 0,
      salaryMax: app.job?.salaryMax || 0,
    }));

    return NextResponse.json(formattedApplications);
  } catch (error) {
    console.error("[Applications API] ❌ Error fetching applications:", error);
    console.error("[Applications API] Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to fetch applications", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    console.log("[Applications POST] 🔍 Auth userId:", userId);

    if (!userId) {
      console.log("[Applications POST] ❌ No userId - unauthorized");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    console.log("[Applications POST] ✅ Database connected");

    let user = await User.findOne({ clerkId: userId });
    console.log("[Applications POST] 👤 User lookup result:", user ? {
      _id: user._id.toString(),
      clerkId: user.clerkId,
      role: user.role
    } : 'NULL');

    // If user doesn't exist, create a new one with job_seeker role
    if (!user) {
      console.log("[Applications POST] ⚠️ User not found, creating new user as job_seeker...");
      try {
        user = await User.create({
          clerkId: userId,
          email: '',
          name: 'User',
          role: 'job_seeker',
        });
        console.log("[Applications POST] ✅ New user created:", user._id);
      } catch (createError) {
        console.error("[Applications POST] ❌ Failed to create user:", createError);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }
    }

    // Check if user role is job_seeker
    if (user.role !== "job_seeker") {
      console.log("[Applications POST] ⚠️ User is not a job seeker, role:", user.role);
      return NextResponse.json(
        { error: "Only job seekers can apply to jobs" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("[Applications POST] 📦 Request body:", {
      jobId: body.jobId,
      hasCustomFields: !!body.customFields,
      hasCoverLetter: !!body.coverLetter,
      hasResume: !!body.resume
    });

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: body.jobId,
      applicant: user._id,
    });

    if (existingApplication) {
      console.log("[Applications POST] ⚠️ User already applied to this job");
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Get job details to store with application
    const jobDetails = await Job.findById(body.jobId);
    console.log("[Applications POST] 💼 Job details:", jobDetails ? {
      jobTitle: jobDetails.jobTitle,
      companyName: jobDetails.companyName
    } : 'NULL');

    if (!jobDetails) {
      console.log("[Applications POST] ❌ Job not found with ID:", body.jobId);
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const application = new Application({
      job: body.jobId,
      applicant: user._id,
      coverLetter: body.coverLetter,
      resume: body.resume,
      customFields: body.customFields,
      // Store application details for easy access
      name: body.customFields?.name || user.name,
      email: body.customFields?.email || user.email,
      phone: body.customFields?.phone,
      skills: body.customFields?.skills,
      bio: body.customFields?.bio,
      education: body.customFields?.education,
      jobTitle: jobDetails?.jobTitle,
      companyName: jobDetails?.companyName,
      location: jobDetails?.location,
    });

    await application.save();
    console.log("[Applications POST] ✅ Application saved with ID:", application._id);

    // Add application to job
    await Job.findByIdAndUpdate(body.jobId, {
      $push: { applications: application._id },
    });
    console.log("[Applications POST] ✅ Application added to job");

    const populatedApplication = await Application.findById(application._id)
      .populate("job", "jobTitle companyName location jobType")
      .populate("applicant", "name email profile");

    console.log("[Applications POST] 🎉 Application created successfully");
    return NextResponse.json(populatedApplication, { status: 201 });
  } catch (error) {
    console.error("[Applications POST] ❌ Error creating application:", error);
    console.error("[Applications POST] Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to create application", details: error.message },
      { status: 500 }
    );
  }
}
