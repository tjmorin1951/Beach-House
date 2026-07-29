// Builds calendar links and the .ics attachment for a booking.

// ---- CHECK THIS ADDRESS ----
const LOCATION = "604 New River Inlet Road, North Topsail Beach, NC";
// ----------------------------

const TITLE = "Uncle John's Beach House";
const compact = ymd => String(ymd).replace(/-/g, '');

// Calendars treat the end of an all-day event as exclusive, so add a day
// to make the stay display through the check-out date itself.
function dayAfter(ymd) {
  const [y, m, d] = String(ymd).split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

export function buildIcs(start, end, uid) {
  const endEx = dayAfter(end);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Uncle Johns Beach House//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid || Date.now()}@unclejohnsbeachhouse.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(start)}`,
    `DTEND;VALUE=DATE:${compact(endEx)}`,
    `SUMMARY:${TITLE}`,
    `LOCATION:${LOCATION}`,
    'DESCRIPTION:Your stay at Uncle Johns Beach House.',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function calendarButtonsHtml(start, end) {
  if (!start || !end) return '';
  const endEx = dayAfter(end);
  const t = encodeURIComponent(TITLE);
  const loc = encodeURIComponent(LOCATION);
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${t}&dates=${compact(start)}/${compact(endEx)}&location=${loc}`;
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${t}&startdt=${start}&enddt=${endEx}&allday=true&location=${loc}`;
  const office = `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${t}&startdt=${start}&enddt=${endEx}&allday=true&location=${loc}`;
  const btn = 'display:inline-block;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;text-decoration:none;padding:9px 18px;border-radius:999px;margin:4px;background:#1B4965;color:#FBF6EE;';
  return `
    <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;text-align:center;">
      <h2 style="font-size:17px;color:#1B4965;margin:0 0 6px;">Add it to your calendar</h2>
      <p style="font-family:Arial,sans-serif;font-size:13px;margin:0 0 12px;opacity:0.75;">Using Apple Calendar? Open the attached file instead.</p>
      <a href="${google}" style="${btn}">Google</a>
      <a href="${outlook}" style="${btn}">Outlook.com</a>
      <a href="${office}" style="${btn}">Outlook 365</a>
    </div>`;
}
