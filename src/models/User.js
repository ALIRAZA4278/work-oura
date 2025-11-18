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


