// Sends door codes 3 days before arrival. Runs daily at 13:00 UTC (9am ET).

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const FROM = "Uncle John's Beach House <noreply@unclejohnsbeachhouse.com>";
const CONTACT = "Tom Morin at (919) 757-2031";
const DAYS_AHEAD = 3;

// ---- EDIT HERE IF THE CODES EVER CHANGE ----
const GARAGE_CODE = "2604";
const DOOR_CODE = "4930";
const WIFI_NETWORK = "eero wifi";
const WIFI_PASSWORD = "MassExodus2026!";
// --------------------------------------------

function pretty(ymd) {
  const [y, m, d] = String(ymd).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function targetDate() {
  const t = new Date();
  t.setUTCDate(t.getUTCDate() + DAYS_AHEAD);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

function buildHtml(b) {
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#2A2522;background:#FBF6EE;">
    <div style="text-align:center;font-size:40px;">&#128273;</div>
    <h1 style="font-size:24px;color:#1B4965;text-align:center;margin:8px 0 4px;">Your door codes</h1>
    <p style="text-align:center;font-style:italic;color:#C8553D;margin-top:0;">Uncle John's Beach House</p>
    <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 12px;">Hi there},</p>
      <p style="margin:0 0 8px;">You arrive on <strong>${pretty(b.startDate)}</strong> &mdash; here's how to get in.</p>
    </div>
    <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;">
      <h2 style="font-size:17px;color:#1B4965;margin:0 0 12px;">Getting In</h2>
      <p style="font-family:Arial,sans-serif;font-size:14px;margin:0 0 14px;">
        <strong>1. Center garage door:</strong> enter <strong style="font-size:18px;letter-spacing:2px;">${GARAGE_CODE}</strong> then press <strong>Enter</strong>. The same code opens and closes the door.
      </p>
      <p style="font-family:Arial,sans-serif;font-size:14px;margin:0 0 14px;">
        <strong>2. House door inside the garage:</strong> enter <strong style="font-size:18px;letter-spacing:2px;">${DOOR_CODE}</strong>.
      </p>
      <p style="font-family:Arial,sans-serif;font-size:13px;margin:0;color:#C8553D;">
        This is the only way into the house &mdash; please don't count on any other entrance.
      </p>
    </div>
    <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;"><h2 style="font-size:17px;color:#1B4965;margin:0 0 12px;">Wi-Fi</h2><p style="font-family:Arial,sans-serif;font-size:14px;margin:0;">Network: <strong style="font-size:16px;">${WIFI_NETWORK}</strong><br>Password: <strong style="font-size:16px;letter-spacing:1px;">${WIFI_PASSWORD}</strong></p></div><p style="font-family:Arial,sans-serif;font-size:13px;text-align:center;">
      This mailbox isn't monitored &mdash; please don't reply.<br>
      Any problems, text ${CONTACT}.
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
    const due = items.filter(b => b && b.startDate === target);
    console.log(`Door codes: ${due.length} arrival(s) on ${target}`);
    for (const b of due) {
      const to = [...new Set([(b.createdBy || '').trim().toLowerCase(), (b.email || '').trim().toLowerCase()].filter(Boolean))];
      if (!to.length) { console.log('No recipient for booking', b.id); continue; }
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to, subject: 'Your beach house door codes', html: buildHtml(b) })
      });
      if (!res.ok) console.error('Resend error for', b.id, await res.text());
      else console.log('Sent door codes for', b.id, 'to', to.join(', '));
    }
    return new Response('OK');
  } catch (err) {
    console.error('Door code job failed:', err);
    return new Response('Error', { status: 500 });
  }
};

export const config = { schedule: '0 13 * * *' };
