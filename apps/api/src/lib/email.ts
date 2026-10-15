import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'PathConnect <noreply@pathconnect.app>';

export function isEmailConfigured(): boolean {
  return !!resend;
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
