import nodemailer from "nodemailer";


// ======================================================
// SMTP TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,

  secure:
    Number(process.env.SMTP_PORT) === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});


// ======================================================
// VERIFY EMAIL CONFIGURATION
// ======================================================

export const verifyEmailConnection = async () => {

  try {

    await transporter.verify();

    console.log("Email service connected successfully");

  } catch (error) {

    console.error(
      "Email service connection failed:",
      error.message
    );

  }
};


// ======================================================
// SEND EMAIL
// ======================================================

const sendEmail = async ({
  to,
  subject,
  html,
}) => {

  if (!to) {
    throw new Error("Recipient email is required");
  }

  const info = await transporter.sendMail({

    from:
      process.env.MAIL_FROM ||
      process.env.SMTP_USER,

    to,

    subject,

    html,
  });

  console.log(
    `Email sent: ${info.messageId}`
  );

  return info;
};


// ======================================================
// PASSWORD RESET EMAIL
// ======================================================

export const sendPasswordResetEmail = async (
  email,
  resetUrl
) => {

  return sendEmail({

    to: email,

    subject:
      "Reset Your YE Condominium Password",

    html: `
      <!DOCTYPE html>

      <html>

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Password Reset</title>

      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f4f6f8;
          font-family: Arial, Helvetica, sans-serif;
        "
      >

        <div
          style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          "
        >

          <div
            style="
              padding: 30px;
              background: #1f2937;
              color: #ffffff;
              text-align: center;
            "
          >

            <h1 style="margin: 0;">
              YE Condominium
            </h1>

            <p style="margin-top: 8px;">
              Password Reset
            </p>

          </div>


          <div
            style="
              padding: 35px;
              color: #333333;
            "
          >

            <h2>
              Reset your password
            </h2>

            <p>
              We received a request to reset the password
              for your YE Condominium account.
            </p>

            <p>
              Click the button below to create a new password.
            </p>


            <div
              style="
                text-align: center;
                margin: 30px 0;
              "
            >

              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 14px 25px;
                  background: #2563eb;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>

            </div>


            <p>
              This password reset link will expire in
              <strong>15 minutes</strong>.
            </p>

            <p>
              If you did not request a password reset,
              you can safely ignore this email.
            </p>


            <hr
              style="
                border: none;
                border-top: 1px solid #eeeeee;
                margin: 30px 0;
              "
            />


            <p
              style="
                font-size: 12px;
                color: #777777;
              "
            >
              If the button doesn't work, copy and paste
              the following URL into your browser:
            </p>

            <p
              style="
                font-size: 12px;
                word-break: break-all;
                color: #555555;
              "
            >
              ${resetUrl}
            </p>

          </div>


          <div
            style="
              padding: 20px;
              background: #f8f8f8;
              text-align: center;
              font-size: 12px;
              color: #777777;
            "
          >

            © ${new Date().getFullYear()}
            YE Condominium Management System

          </div>

        </div>

      </body>

      </html>
    `,
  });
};