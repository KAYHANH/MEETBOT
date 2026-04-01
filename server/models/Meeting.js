import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  recipientName: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  scheduledAt: { type: Date, required: true, index: true },
  timezone: { type: String, default: 'UTC' },
  durationMinutes: { type: Number, default: 60 },
  googleCalendarEventId: { type: String },
  googleMeetLink: { type: String },
  googleMeetCode: { type: String, index: true },
  conferenceRecordName: { type: String },
  emailMessageId: { type: String },
  actualStartedAt: { type: Date },
  actualEndedAt: { type: Date },
  attendanceLastSyncedAt: { type: Date },
  attendanceParticipants: [{
    participantName: { type: String, required: true },
    participantType: { type: String, enum: ['signed_in', 'anonymous', 'phone'], default: 'signed_in' },
    participantUser: { type: String },
    participantResourceName: { type: String, required: true },
    earliestStartTime: { type: Date },
    latestEndTime: { type: Date },
    totalDurationMinutes: { type: Number, default: 0 },
    sessions: [{
      sessionName: { type: String, required: true },
      startTime: { type: Date, required: true },
      endTime: { type: Date },
      durationMinutes: { type: Number, default: 0 }
    }]
  }],
  status: { 
    type: String, 
    enum: ['scheduled', 'email_sent', 'reminders_sent', 'completed', 'failed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  reminders: [{
    type: { type: String },
    minutesBefore: { type: Number },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
    error: { type: String }
  }],
  cancelledAt: { type: Date },
  cancelReason: { type: String }
}, { timestamps: true });

meetingSchema.index({ userId: 1, scheduledAt: -1 });

meetingSchema.virtual('isPast').get(function() {
  return this.scheduledAt < new Date();
});

meetingSchema.methods.getNextUnsentReminder = function(now) {
  return this.reminders.findIndex(r => {
    if (r.sent || r.error) return false;
    const triggerTime = new Date(this.scheduledAt.getTime() - r.minutesBefore * 60000);
    return now >= triggerTime;
  });
};

export const Meeting = mongoose.model('Meeting', meetingSchema);
