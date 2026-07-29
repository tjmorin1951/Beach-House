// Notifies invitees that they've been included in a reservation.

const FROM = "Uncle John's Beach House <noreply@unclejohnsbeachhouse.com>";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const b = JSON.parse(event.body || "{}");
    const invitees = (b.invitees || []).filter(iv => iv && iv.email);
    if (!invitees.length) return { statusCode: 400, body: "No invitees" };
    const organizer = b.organizerName || "A family member";
    const replyTo = (b.organizerEmail || "").trim();
    let sent = 0;
    for (const iv of invitees) {
      const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#2A2522;background:#FBF6EE;">
        <div style="text-align:center;font-size:40px;">&#127958;</div>
        <h1 style="font-size:24px;color:#1B4965;text-align:center;margin:8px 0 4px;">You're invited!</h1>
        <p style="text-align:center;font-style:italic;color:#C8553D;margin-top:0;">Uncle John's Beach House</p>
        <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 12px;">Hi ${iv.name || "there"},</p>
          <p style="margin:0 0 16px;"><strong>${organizer}</strong> has invited you to join them at the beach house. Here are the dates:</p>
          <table style="width:100%;font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#1B4965;"><strong>Check in</strong></td><td style="padding:6px 0;text-align:right;">${b.startDate || ""}</td></tr>
            <tr><td style="padding:6px 0;color:#1B4965;"><strong>Check out</strong></td><td style="padding:6px 0;text-align:right;">${b.endDate || ""}</td></tr>
            <tr><td style="padding:6px 0;color:#1B4965;"><strong>Nights</strong></td><td style="padding:6px 0;text-align:right;">${b.nights || ""}</td></tr>
          </table>
        </div>
        <div style="background:#ffffff;border:1px solid #E5D4B5;border-radius:16px;padding:20px;margin:20px 0;text-align:center;">
          <p style="font-family:Arial,sans-serif;font-size:14px;margin:0;">Questions, or need to let them know if you can make it? Just reply to this email &mdash; it goes straight to ${organizer}.</p>
        </div>
        <p style="font-family:Arial,sans-serif;font-size:13px;text-align:center;opacity:0.7;">
          Sent from Uncle John's Beach House booking calendar.
        </p>
      </div>`;
      const payload = {
        from: FROM,
        to: [iv.email],
        subject: `${organizer} invited you to the beach house`,
        html
      };
      if (replyTo) payload.reply_to = replyTo;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) console.error("Resend error for", iv.email, await res.text());
      else sent++;
    }
    console.log(`Invites sent: ${sent} of ${invitees.length}`);
    return { statusCode: 200, body: `Sent ${sent}` };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: "Server error" };
  }
};
