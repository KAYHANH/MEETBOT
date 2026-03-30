import express from 'express';
import { Meeting } from '../models/Meeting.js';
import * as meetingService from '../services/meetingService.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate, meetingSchema } from '../utils/validators.js';
import { meetingCreateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/stats/summary', async (req, res) => {
  const { userId } = req.user;
  const now = new Date();

  const [total, upcoming, completed, failed, cancelled] = await Promise.all([
    Meeting.countDocuments({ userId }),
    Meeting.countDocuments({ userId, scheduledAt: { $gt: now }, status: { $nin: ['cancelled', 'failed'] } }),
    Meeting.countDocuments({ userId, status: 'completed' }),
    Meeting.countDocuments({ userId, status: 'failed' }),
    Meeting.countDocuments({ userId, status: 'cancelled' })
  ]);

  const pending = total - completed - failed - cancelled;

  res.json({ total, upcoming, pending, completed, failed, cancelled });
});

router.post('/', meetingCreateLimiter, validate(meetingSchema), async (req, res, next) => {
  try {
    const meeting = await meetingService.scheduleMeeting({
      ...req.body,
      userId: req.user.userId,
      userEmail: req.user.email
    });
    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res) => {
  const { userId } = req.user;
  const { page = 1, limit = 20, status } = req.query;

  const query = { userId };
  if (status) query.status = status;

  const meetings = await Meeting.find(query)
    .sort({ scheduledAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Meeting.countDocuments(query);

  res.json({
    meetings,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

router.get('/:id', async (req, res) => {
  const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  res.json(meeting);
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { reason } = req.body;
    const meeting = await meetingService.cancelMeeting(req.params.id, req.user.userId, reason);
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/resend', async (req, res, next) => {
  try {
    const result = await meetingService.resendInvite(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
