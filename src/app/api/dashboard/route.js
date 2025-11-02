import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET() {
  try {
    const { userId } = await auth();

    console.log('='.repeat(60));
    console.log('[Dashboard API] 🔍 Fetching jobs for Clerk User ID:', userId);

    if (!userId) {
      console.log('[Dashboard API] ❌ No userId found - unauthorized');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();
    console.log('[Dashboard API] ✅ Database connected');

    // Find or create the user by Clerk ID
    const User = (await import('@/models/User')).default;
    let recruiter = await User.findOne({ clerkId: userId });

    console.log('[Dashboard API] 👤 User lookup result:', recruiter ? {
      _id: recruiter._id.toString(),
      clerkId: recruiter.clerkId,
      email: recruiter.email,
      role: recruiter.role
    } : 'NULL');

    if (!recruiter) {
      console.log('[Dashboard API] ⚠️ No user found with Clerk ID:', userId);
      console.log('[Dashboard API] 📝 Note: User will be created when they post their first job');
      return NextResponse.json([], { status: 200 });
    }

    // Find jobs where recruiter matches user _id OR userId matches clerkId (for backward compatibility)
    const jobs = await Job.find({
      $or: [
        { recruiter: recruiter._id },
        { userId: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    console.log('[Dashboard API] 📊 Jobs query result:');
    console.log('  - Total jobs found:', jobs.length);

    if (jobs.length > 0) {
      console.log('  - First 3 jobs:');
      jobs.slice(0, 3).forEach((job, idx) => {
        console.log(`    ${idx + 1}. ${job.jobTitle} (ID: ${job._id})`);
        console.log(`       recruiter: ${job.recruiter}, userId: ${job.userId}`);
      });
    } else {
      console.log('  - No jobs found for this user');
      console.log('  - User MongoDB _id:', recruiter._id.toString());
      console.log('  - User Clerk ID:', userId);
    }

    console.log('='.repeat(60));

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("[Dashboard API] ❌ Error fetching dashboard jobs:", error);
    console.error("[Dashboard API] Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error.message },
      { status: 500 }
    );
  }
}
// ALI RAZA