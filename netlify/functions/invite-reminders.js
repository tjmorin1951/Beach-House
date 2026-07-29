// Reminds invitees 7 days before arrival. Runs daily at 13:00 UTC (9am ET).

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const FROM = "Uncle John's Beach House <noreply@unclejohnsbeachhouse.com>";
const DAYS_AHEAD = 7;

function pretty(ymd) {
  const [y, m, d] = String(ymd).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function targetDate() {
  const t = new Date();
  t.setUTCDate(t.getUTCDate() + DAYS_AHEAD);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

function buildHtml(b, iv, organizer) {
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#2A2522;background:#FBF6EE;">
    <div style="text-align:center;font-size:40px;">&#127958;</div>
    <h1 style="font-size:24px;color:#1B4965;text-align:center;margin:8px 0 4px;">One week to go!</h1>
    <p style="text-align:center;font-style:italic;color:#C8553D;margin-top:0;">Uncle John's Beach House</p>
    <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 12px;">Hi ${iv.name || 'there'},</p>
      <p style="margin:0 0 16px;">Just a reminder that <strong>${organizer}</strong> invited you to the beach house, and it's coming up in about a week.</p>
      <table style="width:100%;font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#1B4965;"><strong>Check in</strong></td><td style="padding:6px 0;text-align:right;">${pretty(b.startDate)}</td></tr>
        <tr><td style="padding:6px 0;color:#1B4965;"><strong>Check out</strong></td><td style="padding:6px 0;text-align:right;">${pretty(b.endDate)}</td></tr>
      </table>
    </div>
    <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;text-align:center;">
      <p style="font-family:Arial,sans-serif;font-size:14px;margin:0;">Questions, or need to let them know your plans? Just reply to this email &mdash; it goes straight to ${organizer}.</p>
    </div>
    <p style="font-family:Arial,sans-serif;font-size:13px;text-align:center;opacity:0.7;">
      Sent from Uncle John's Beach House booking calendar.
    </p>
  </div>`;
}

export default async () => {
  try {
    if (!getApps().length) {
      initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
    }
    const snap = await getFirestore().doc('beach-house/bookings').get();
    const items = snap.exists ? (snap.data().items || []) : [];
    const target = targetDate();
    const due = items.filter(b => b && b.startDate === target && Array.isArray(b.invitees) && b.invitees.length);
    console.log(`Invite reminders: ${due.length} booking(s) with invitees on ${target}`);
    for (const b of due) {
      const organizer = [b.firstName, b.lastName].filter(Boolean).join(' ') || 'A family member';
      const replyTo = (b.email || '').trim() || (b.createdBy || '').trim();
      for (const iv of b.invitees) {
        if (!iv || !iv.email) continue;
        const payload = {
          from: FROM,
          to: [iv.email],
          subject: 'One week until the beach house',
          html: buildHtml(b, iv, organizer)
        };
        if (replyTo) payload.reply_to = replyTo;
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) console.error('Resend error for', iv.email, await res.text());
        else console.log('Reminder sent to', iv.email);
      }
    }
    return new Response('OK');
  } catch (err) {
    console.error('Invite reminder job failed:', err);
    return new Response('Error', { status: 500 });
  }
};

export const config = { schedule: '0 13 * * *' };
