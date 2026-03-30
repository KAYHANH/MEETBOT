import express from 'express';
import { ActivityLog } from '../models/ActivityLog.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { userId } = req.user;
  const { meetingId, type, page = 1, limit = 50 } = req.query;

  const query = { userId };
  if (meetingId) query.meetingId = meetingId;
  if (type) query.type = type;

  const logs = await ActivityLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ActivityLog.countDocuments(query);

  res.json({
    logs,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

export default router;
