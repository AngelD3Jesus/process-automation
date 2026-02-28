import nodemailer from "nodemailer";

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD;

if (!user || !pass) {
  throw new Error("Faltan GMAIL_USER o GMAIL_APP_PASSWORD en .env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

export async function sendRealEmail(params: {
  to: string;
  subject: string;
  text: string;
}) {
  const info = await transporter.sendMail({
    from: `Process Automation <${user}>`, // correo fijo (tu gmail)
    to: params.to,
    subject: params.subject,
    text: params.text,
  });

  return info; // trae messageId, etc.
}