import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html, attachments = []) => {
  const transporter = nodemailer.createTransport({
    //da el configration bta3t el email el hab3t mno
    // fe port bykon 587 law secure b false w 456 law secure b true
    // secure btkon btrue law el service el ana bab3t beha email bt support tls
    service: "gmail",
    auth: {
      user: process.env.emailsender,
      pass: process.env.passwordsender,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.emailsender,
    to: to ? to : "shahdh673@gmail.com",
    subject: subject ? subject : "hello",
    html: html ? html : "hello world",
    attachments,
  });
  if (info.accepted.length) {
    return true;
  }
  return false;
};
