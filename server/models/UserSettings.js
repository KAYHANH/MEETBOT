import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  googleAccessToken: { type: String }, // AES encrypted
  googleRefreshToken: { type: String }, // AES encrypted
  googleTokenExpiry: { type: Date },
  emailReminderMinutes: { type: [Number], default: [1440, 60] },
  defaultTimezone: { type: String, default: 'UTC' },
  defaultMeetingDuration: { type: Number, default: 60 },
  automationMode: { type: String, enum: ['smart', 'universal'], default: 'smart' },
}, { timestamps: true });

export const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
