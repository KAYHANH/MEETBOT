import express from 'express';
import { UserSettings } from '../models/UserSettings.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate, settingsSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const settings = await UserSettings.findOne({ userId: req.user.userId })
    .select('-googleAccessToken -googleRefreshToken -googleTokenExpiry');
  
  if (!settings) {
    return res.json({
      emailReminderMinutes: [1440, 60],
      defaultTimezone: 'UTC',
      defaultMeetingDuration: 60,
      automationMode: 'smart',
    });
  }
  
  res.json(settings);
});

router.put('/', validate(settingsSchema), async (req, res) => {
  const settings = await UserSettings.findOneAndUpdate(
    { userId: req.user.userId },
    { $set: req.body },
    { upsert: true, new: true }
  ).select('-googleAccessToken -googleRefreshToken -googleTokenExpiry');

  res.json(settings);
});

export default router;
