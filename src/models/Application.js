import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String },
  resume: { type: String },
  customFields: { type: Object },
  appliedAt: { type: Date, default: Date.now },
  applicantScore: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'interview', 'rejected', 'hired'],
    default: 'pending'
  },
  // Store application details
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  skills: { type: String },
  bio: { type: String },
  education: { type: String },
  jobTitle: { type: String },
  companyName: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
