// Sends booking confirmation emails via Resend.

const FROM = "Uncle John's Beach House <noreply@unclejohnsbeachhouse.com>";
const CONTACT = "Tom Morin at (919) 757-2031";

// ---- EDIT THESE LATER ----
const HOUSE_RULES = [
  "House rules coming soon."
];
const DOOR_CODES = "Door codes will be sent before your arrival.";
// --------------------------

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const b = JSON.parse(event.body || "{}");
    const recipients = (b.to || []).filter(Boolean);
    if (!recipients.length) {
      return { statusCode: 400, body: "No recipient" };
    }
    const rooms = (b.rooms || []).join(", ") || "—";
    const rulesHtml = HOUSE_RULES.map(r => `<li style="margin-bottom:6px;">${r}</li>`).join("");
    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#2A2522;background:#FBF6EE;">
        <div style="text-align:center;font-size:40px;">&#127958;</div>
        <h1 style="font-size:24px;color:#1B4965;text-align:center;margin:8px 0 4px;">You're booked!</h1>
        <p style="text-align:center;font-style:italic;color:#C8553D;margin-top:0;">Uncle John's Beach House</p>
        <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 12px;">Hi ${b.guestName || "there"},</p>
          <p style="margin:0 0 16px;">Your stay is confirmed. Here are the details:</p>
          <table style="width:100%;font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#1B4965;"><strong>Check in</strong></td><td style="padding:6px 0;text-align:right;">${b.startDate || ""}</td></tr>
            <tr><td style="padding:6px 0;color:#1B4965;"><strong>Check out</strong></td><td style="padding:6px 0;text-align:right;">${b.endDate || ""}</td></tr>
            <tr><td style="padding:6px 0;color:#1B4965;"><strong>Nights</strong></td><td style="padding:6px 0;text-align:right;">${b.nights || ""}</td></tr>
            <tr><td style="padding:6px 0;color:#1B4965;"><strong>Guests</strong></td><td style="padding:6px 0;text-align:right;">${b.numGuests || ""}</td></tr>
            <tr><td style="padding:6px 0;color:#1B4965;vertical-align:top;"><strong>Rooms</strong></td><td style="padding:6px 0;text-align:right;">${rooms}</td></tr>
          </table>
        </div>
        <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;">
          <h2 style="font-size:17px;color:#1B4965;margin:0 0 10px;">The Rules of the House</h2>
          <ul style="font-family:Arial,sans-serif;font-size:14px;padding-left:20px;margin:0;">${rulesHtml}</ul>
        </div>
        <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;">
          <h2 style="font-size:17px;color:#1B4965;margin:0 0 10px;">Getting In</h2>
          <p style="font-family:Arial,sans-serif;font-size:14px;margin:0;">${DOOR_CODES}</p>
        </div>
        <p style="font-family:Arial,sans-serif;font-size:13px;text-align:center;">
          This mailbox isn't monitored &mdash; please don't reply.<br>
          Any problems or changes, text ${CONTACT}.
        </p>
      </div>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM,
        to: recipients,
        subject: `Your beach house stay — ${b.startDate || ""}`,
        html
      })
    });
    if (!res.ok) {
      console.error("Resend error:", await res.text());
      return { statusCode: 502, body: "Email provider error" };
    }
    return { statusCode: 200, body: "Sent" };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
