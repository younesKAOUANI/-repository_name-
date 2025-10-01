import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || '', // fallback to empty string if no text provided
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Generate verification token (simple random string)
export const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Email templates
export const getVerificationEmailHtml = (userName: string, verificationUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification de votre adresse e-mail</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .verification-button {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .verification-button:hover {
                background-color: #1d4ed8;
            }
            .alternative-link {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                font-size: 14px;
                word-break: break-all;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
                text-align: center;
            }
            .warning {
                background-color: #fef3c7;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                border-left: 4px solid #f59e0b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Pharmapedia</div>
                <h1 class="title">Vérifiez votre adresse e-mail</h1>
            </div>
            
            <div class="content">
                <p>Bonjour ${userName},</p>
                
                <p>Merci de vous être inscrit sur Pharmapedia ! Pour finaliser votre inscription et commencer à utiliser notre plateforme éducative, nous devons vérifier votre adresse e-mail.</p>
                
                <p>Cliquez sur le bouton ci-dessous pour vérifier votre compte :</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="verification-button">
                        Vérifier mon adresse e-mail
                    </a>
                </div>
                
                <div class="warning">
                    <strong>Important :</strong> Ce lien de vérification expirera dans 24 heures pour des raisons de sécurité.
                </div>
                
                <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
                
                <div class="alternative-link">
                    ${verificationUrl}
                </div>
                
                <p>Si vous n'avez pas créé de compte sur Pharmapedia, vous pouvez ignorer cet e-mail en toute sécurité.</p>
            </div>
            
            <div class="footer">
                <p>Cet e-mail a été envoyé par Pharmapedia</p>
                <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Plain text version of the verification email
export const getVerificationEmailText = (userName: string, verificationUrl: string): string => {
  return `
Bonjour ${userName},

Merci de vous être inscrit sur Pharmapedia !

Pour finaliser votre inscription, veuillez vérifier votre adresse e-mail en visitant le lien suivant :

${verificationUrl}

Ce lien expirera dans 24 heures.

Si vous n'avez pas créé de compte sur Pharmapedia, vous pouvez ignorer cet e-mail.

Cordialement,
L'équipe Pharmapedia
  `;
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  userName: string,
  token: string
): Promise<boolean> => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  
  const html = getVerificationEmailHtml(userName, verificationUrl);
  const text = getVerificationEmailText(userName, verificationUrl);

  return await sendEmail({
    to: email,
    subject: 'Vérifiez votre adresse e-mail - Pharmapedia',
    html,
    text,
  });
};