import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'PathConnect <noreply@pathconnect.app>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export function isEmailConfigured(): boolean {
  return !!resend;
}

export async function sendConnectionRequestEmail(opts: {
  to: string;
  menteeName: string;
  mentorName?: string;
  reason?: string;
}): Promise<void> {
  if (!resend) {
    console.log('[email] Resend not configured — skipping connection request email to', opts.to);
    return;
  }

  const greeting = opts.mentorName ? `Hi ${opts.mentorName}` : 'Hi';
  const dashboardLink = `${FRONTEND_URL}/dashboard`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: opts.to,
    subject: `${opts.menteeName} wants to connect with you on PathConnect`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
        <h2 style="color: #111827; margin-bottom: 16px;">New mentorship request!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          ${greeting},<br><br>
          <strong>${opts.menteeName}</strong> would like you to be their mentor on
          <strong>PathConnect</strong>.
        </p>
        ${opts.reason ? `
        <div style="margin: 16px 0; padding: 12px 16px; background: #f0f7f4; border-radius: 8px;">
          <p style="color: #31614f; font-size: 14px; line-height: 1.5; margin: 0;">
            <em>"${opts.reason}"</em>
          </p>
        </div>
        ` : ''}
        <p style="color: #4b5563; line-height: 1.6;">
          Log in to your dashboard to accept or decline this request.
        </p>
        <div style="margin: 32px 0;">
          <a href="${dashboardLink}"
             style="display: inline-block; padding: 12px 32px; background: #4a9476; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600;">
            View Request
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">
          If you didn't expect this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendConnectionAcceptedEmail(opts: {
  to: string;
  menteeName: string;
  mentorName: string;
}): Promise<void> {
  if (!resend) {
    console.log('[email] Resend not configured — skipping acceptance email to', opts.to);
    return;
  }

  const dashboardLink = `${FRONTEND_URL}/dashboard`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: opts.to,
    subject: `${opts.mentorName} accepted your mentorship request!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
        <h2 style="color: #111827; margin-bottom: 16px;">You're connected!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Hi ${opts.menteeName},<br><br>
          Great news! <strong>${opts.mentorName}</strong> has accepted your mentorship request.
          You can now schedule your first session.
        </p>
        <div style="margin: 32px 0;">
          <a href="${dashboardLink}"
             style="display: inline-block; padding: 12px 32px; background: #4a9476; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600;">
            Go to Dashboard
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendInviteEmail(opts: {
  to: string;
  inviterName: string;
  inviteeName?: string;
  inviteLink: string;
}): Promise<void> {
  if (!resend) {
    console.log('[email] Resend not configured — skipping invite email to', opts.to);
    console.log('[email] Invite link:', opts.inviteLink);
    return;
  }

  const greeting = opts.inviteeName ? `Hi ${opts.inviteeName}` : 'Hi';

  await resend.emails.send({
    from: FROM_EMAIL,
    to: opts.to,
    subject: `${opts.inviterName} invited you to be a mentor on PathConnect`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
        <h2 style="color: #111827; margin-bottom: 16px;">You've been invited to mentor!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          ${greeting},<br><br>
          <strong>${opts.inviterName}</strong> thinks you'd be a great mentor and has invited you to join
          <strong>PathConnect</strong> — a platform that connects mentors with mentees for career growth.
        </p>
        <div style="margin: 32px 0;">
          <a href="${opts.inviteLink}"
             style="display: inline-block; padding: 12px 32px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">
          This invitation expires in 30 days.<br>
          If you didn't expect this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
