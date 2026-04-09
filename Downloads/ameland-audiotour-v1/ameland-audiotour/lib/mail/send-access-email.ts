import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAccessEmail(input: { to: string; tourTitle: string; accessUrl: string }) {
  const from = process.env.MAIL_FROM;
  if (!from) throw new Error('Missing MAIL_FROM');

  await resend.emails.send({
    from,
    to: input.to,
    subject: `Je tour staat klaar: ${input.tourTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Je tour staat klaar</h2>
        <p>Bedankt voor je aankoop van <strong>${input.tourTitle}</strong>.</p>
        <p><a href="${input.accessUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:10px;">Open mijn tour</a></p>
        <ol>
          <li>Open de link op je telefoon</li>
          <li>Sta locatie toe</li>
          <li>Ga naar het startpunt en druk op start</li>
        </ol>
      </div>
    `,
  });
}
