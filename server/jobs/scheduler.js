import cron from 'node-cron';
import mongoose from 'mongoose';
import { Meeting } from '../models/Meeting.js';
import * as meetingService from '../services/meetingService.js';
import { logger } from '../utils/logger.js';

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const processReminders = async () => {
  if (!isDatabaseReady()) {
    return;
  }
  const now = new Date();
  try {
    const meetings = await Meeting.find({
      status: { $nin: ['cancelled', 'completed', 'failed'] },
      'reminders.sent': false
    }).limit(10);

    for (const meeting of meetings) {
      const reminderIndex = meeting.getNextUnsentReminder(now);
      if (reminderIndex !== -1) {
        logger.info(`Processing reminder for meeting ${meeting._id}`);
        await meetingService.sendReminder(meeting, reminderIndex);
      }
    }
  } catch (error) {
    logger.error('Error in processReminders job:', error);
  }
};

const syncAttendance = async () => {
  if (!isDatabaseReady()) {
    return;
  }

  const now = new Date();
  const lookback = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lookahead = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  try {
    const meetings = await Meeting.find({
      googleMeetLink: { $exists: true, $ne: null },
      scheduledAt: { $gte: lookback, $lte: lookahead },
      status: { $nin: ['cancelled', 'failed'] },
    }).limit(10);

    for (const meeting of meetings) {
      await meetingService.syncMeetingAttendance(meeting._id, meeting.userId);
    }
  } catch (error) {
    logger.error('Error in syncAttendance job:', error);
  }
};

const markCompleted = async () => {
  if (!isDatabaseReady()) {
    return;
  }
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
  try {
    const result = await Meeting.updateMany(
      {
        scheduledAt: { $lt: twoHoursAgo },
        status: { $nin: ['cancelled', 'completed', 'failed'] }
      },
      { $set: { status: 'completed' } }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Marked ${result.modifiedCount} meetings as completed`);
    }
  } catch (error) {
    logger.error('Error in markCompleted job:', error);
  }
};

export const initScheduler = () => {
  // Every minute
  cron.schedule('* * * * *', processReminders);
  cron.schedule('* * * * *', syncAttendance);
  
  // Every 5 minutes
  cron.schedule('*/5 * * * *', markCompleted);
  
  logger.info('✅ Scheduler initialized');
};
