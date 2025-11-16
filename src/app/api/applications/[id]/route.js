import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/mongodb";
import Application from "@/models/Application";
import User from "@/models/User";
import Job from "@/models/Job";

export async function PATCH(request, context) {
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

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const params = await context.params;
    const applicationId = params.id;
    const body = await request.json();

    console.log('[PATCH /api/applications/[id]] Updating application:', applicationId);
    console.log('[PATCH /api/applications/[id]] New status:', body.status);

    const application = await Application.findById(applicationId);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify that the user is the recruiter who posted this job
    const job = await Job.findById(application.job);

    if (!job || job.recruiter.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You can only update applications for your own jobs" },
        { status: 403 }
      );
    }

    // Update the status
    application.status = body.status;
    await application.save();

    console.log('[PATCH /api/applications/[id]] ✅ Application updated successfully');

    return NextResponse.json(application);
  } catch (error) {
    console.error("[PATCH /api/applications/[id]] ❌ Error:", error);
    return NextResponse.json(
      { error: "Failed to update application", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, context) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const params = await context.params;
    const applicationId = params.id;

    const application = await Application.findById(applicationId)
      .populate("job", "jobTitle companyName location jobType companyLogo salaryMin salaryMax")
      .populate("applicant", "name email profile");

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("[GET /api/applications/[id]] ❌ Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch application", details: error.message },
      { status: 500 }
    );
  }
}
