import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['job_seeker', 'recruiter', 'admin'],
    default: 'job_seeker',
  },
  profile: {
    phone: String,
    bio: String,
    skills: [String],
    experience: String,
    education: String,
    resume: String, // URL to uploaded resume
    location: String,
    website: String,
    linkedin: String,
    github: String,
  },
  company: {
    name: String,
    description: String,
    website: String,
    logo: String,
    location: String,
    industry: String,
    size: String,
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  }],
  settings: {
    emailNotifications: { type: Boolean, default: true },
    jobAlerts: { type: Boolean, default: true },
    profileVisibility: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);


// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVuaWVudC1sb2N1c3QtODQuY2xlcmsuYWNjb3VudHMuZGV2JA
// CLERK_SECRET_KEY=sk_test_CfctJy4eW0ALcFd8Zjg4u3riOaEiVsfj3aP1xTOlPL
// MONGODB_URI=mongodb+srv://vercel-admin-user-68820b55978bec55145dcb11:CGt8zEyTsT1ny5is@cluster0.xe5w4tt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// RESEND_API_KEY=re_8J2r3Jgz_P3xJUWgHqHJSsGzCx1zmUCdD
// NM_EMAIL_USER=af912923@gmail.com
// NM_EMAIL_PW=jembijnnztiomkmz