import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: ['email_sent', 'calendar_created', 'reminder_sent', 'meeting_cancelled', 'error']
  },
  message: { type: String, required: true },
  error: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
