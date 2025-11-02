import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/mongodb";
import Job from "@/models/Job";
import User from "@/models/User";
import Application from "@/models/Application";

export async function GET(request, context) {
  try {
    await connectToDB();

    const params = await context.params;
    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await Job.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    // Map backend fields to frontend expectations
    const mappedJob = {
      _id: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      jobDescription: job.jobDescription,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      category: job.category,
      requiredSkills: job.requiredSkills,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      deadline: job.deadline,
      isTestRequired: job.isTestRequired,
      openings: job.openings,
      contactEmail: job.contactEmail,
      recruiter: job.recruiter,
      applications: job.applications,
      createdAt: job.createdAt,
      views: job.views || 0,
    };

    return NextResponse.json(mappedJob);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    
    const user = await User.findOne({ clerkId: userId });
    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.recruiter.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You can only edit your own jobs" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const updatedJob = await Job.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    ).populate("recruiter", "name email company");

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();

    console.log('[DELETE /api/jobs/[id]] Request to delete job:', params.id, 'by user:', userId);

    if (!userId) {
      console.log('[DELETE /api/jobs/[id]] Unauthorized - no userId');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ clerkId: userId });
    console.log('[DELETE /api/jobs/[id]] User found:', user ? user._id : null);

    const job = await Job.findById(params.id);

    if (!job) {
      console.log('[DELETE /api/jobs/[id]] Job not found');
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    console.log('[DELETE /api/jobs/[id]] Job owner:', job.recruiter, 'Current user:', user._id);

    if (job.recruiter.toString() !== user._id.toString()) {
      console.log('[DELETE /api/jobs/[id]] Permission denied - not job owner');
      return NextResponse.json(
        { error: "You can only delete your own jobs" },
        { status: 403 }
      );
    }

    await Job.findByIdAndDelete(params.id);

    console.log('[DELETE /api/jobs/[id]] Job deleted successfully:', params.id);

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/jobs/[id]] Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
