import { z } from 'zod';

export const meetingSchema = z.object({
  recipientName: z.string().min(1).max(200).trim(),
  recipientEmail: z.string().email(),
  subject: z.string().min(1).max(500).trim(),
  message: z.string().min(1).max(5000).trim(),
  scheduledAt: z.string().refine(val => {
    const date = new Date(val);
    return date > new Date(Date.now() + 5 * 60000); // Allow 5 mins buffer
  }, "Must be 5+ minutes in future"),
  durationMinutes: z.number().int().min(15).max(480).default(60),
  timezone: z.string().max(100).default('UTC'),
});

export const settingsSchema = z.object({
  emailReminderMinutes: z.array(z.number().int().min(0).max(10080)).max(10).optional(),
  defaultTimezone: z.string().max(100).optional(),
  defaultMeetingDuration: z.number().int().min(15).max(480).optional(),
  automationMode: z.enum(['smart', 'universal']).optional(),
});

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: result.error.errors
    });
  }
  req.body = result.data;
  next();
};
