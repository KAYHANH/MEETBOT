const fmtDate = (date, timezone) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: timezone || 'UTC'
  }).format(new Date(date));
};

const timeUntil = (minutesBefore) => {
  if (minutesBefore === 0) return "starting now";
  if (minutesBefore >= 1440) return `in ${Math.floor(minutesBefore / 1440)} days`;
  if (minutesBefore >= 60) return `in ${Math.floor(minutesBefore / 60)} hours`;
  return `in ${minutesBefore} minutes`;
};

const layout = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; background: #f9f9f9; }
    .btn { display: inline-block; padding: 12px 24px; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
    .details-box { background: #f8f9fa; border-left: 4px solid #ddd; padding: 20px; margin: 20px 0; }
    .details-row { margin-bottom: 10px; }
    .label { font-weight: bold; color: #555; }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      Sent by <strong>MeetBot</strong> &bull; Automated Meeting Management
    </div>
  </div>
</body>
</html>
`;

export const meetingInvite = ({ senderName, senderEmail, recipientName, subject, message, scheduledAt, durationMinutes, meetLink, timezone, isResend }) => {
  const title = isResend ? `[Resent] Meeting Invitation: ${subject}` : `Meeting Invitation: ${subject}`;
  const content = `
    <div class="header" style="background-color: #1a73e8;">
      <h1 style="margin:0; font-size: 24px;">📅 ${isResend ? 'Resent: ' : ''}Meeting Invitation</h1>
    </div>
    <div class="content">
      <p>Hi ${recipientName},</p>
      <p><strong>${senderName}</strong> (${senderEmail}) has invited you to a meeting.</p>
      <div style="background: #e8f0fe; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin:0; font-style: italic;">"${message}"</p>
      </div>
      <div class="details-box">
        <div class="details-row"><span class="label">Subject:</span> ${subject}</div>
        <div class="details-row"><span class="label">When:</span> ${fmtDate(scheduledAt, timezone)}</div>
        <div class="details-row"><span class="label">Duration:</span> ${durationMinutes} minutes</div>
      </div>
      ${meetLink ? `<a href="${meetLink}" class="btn" style="background-color: #1a73e8; color: white;">Join Google Meet</a>` : ''}
      <p style="font-size: 14px; color: #666; margin-top: 20px;">You will receive automated reminders before the meeting starts.</p>
    </div>
  `;
  return layout(title, content);
};

export const reminder = ({ recipientName, subject, scheduledAt, minutesBefore, meetLink, timezone }) => {
  const content = `
    <div class="header" style="background-color: #f59e0b;">
      <h1 style="margin:0; font-size: 24px;">⏰ Meeting Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${recipientName},</p>
      <p>This is a friendly reminder that your meeting <strong>"${subject}"</strong> is starting <strong>${timeUntil(minutesBefore)}</strong>.</p>
      <div class="details-box">
        <div class="details-row"><span class="label">When:</span> ${fmtDate(scheduledAt, timezone)}</div>
      </div>
      ${meetLink ? `<a href="${meetLink}" class="btn" style="background-color: #f59e0b; color: white;">Join Google Meet</a>` : ''}
    </div>
  `;
  return layout('Meeting Reminder', content);
};

export const meetingNow = ({ recipientName, subject, meetLink, scheduledAt, timezone, isOrganizer }) => {
  const content = `
    <div class="header" style="background-color: #22c55e;">
      <h1 style="margin:0; font-size: 24px;">🔔 Your Meeting is Starting!</h1>
    </div>
    <div class="content">
      <p>Hi ${recipientName},</p>
      <p>${isOrganizer ? 'Your meeting' : 'The meeting'} <strong>"${subject}"</strong> is starting now.</p>
      <div class="details-box">
        <div class="details-row"><span class="label">Subject:</span> ${subject}</div>
        <div class="details-row"><span class="label">Time:</span> ${fmtDate(scheduledAt, timezone)}</div>
      </div>
      ${meetLink ? `<a href="${meetLink}" class="btn" style="background-color: #22c55e; color: white;">Join Now</a>` : ''}
    </div>
  `;
  return layout('Meeting Starting Now', content);
};

export const cancellation = ({ recipientName, subject, reason }) => {
  const content = `
    <div class="header" style="background-color: #ef4444;">
      <h1 style="margin:0; font-size: 24px;">❌ Meeting Cancelled</h1>
    </div>
    <div class="content">
      <p>Hi ${recipientName},</p>
      <p>The meeting <strong>"${subject}"</strong> has been cancelled.</p>
      ${reason ? `<div class="details-box"><span class="label">Reason:</span> ${reason}</div>` : ''}
      <p>We apologize for any inconvenience.</p>
    </div>
  `;
  return layout('Meeting Cancelled', content);
};
