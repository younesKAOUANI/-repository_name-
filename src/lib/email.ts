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
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #374151;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .email-wrapper {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .header {
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
            }
            .logo-container {
                margin-bottom: 20px;
            }
            .logo {
                max-width: 200px;
                height: auto;
                display: inline-block;
            }
            .title {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .subtitle {
                font-size: 16px;
                opacity: 0.9;
                font-weight: 300;
            }
            .content {
                padding: 40px;
            }
            .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 20px;
                line-height: 1.8;
            }
            .cta-container {
                text-align: center;
                margin: 40px 0;
                color: white;
            }
            .verification-button {
                display: inline-block;
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
                transition: all 0.3s ease;
                letter-spacing: 0.5px;
            }
            .verification-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 20px -3px rgba(79, 70, 229, 0.5);
            }
            .warning {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid #f59e0b;
                padding: 20px;
                border-radius: 12px;
                margin: 30px 0;
                position: relative;
                overflow: hidden;
            }
            .warning::before {
                content: '⚠️';
                font-size: 20px;
                margin-right: 10px;
            }
            .warning-text {
                font-weight: 600;
                color: #92400e;
            }
            .alternative-link {
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                border: 1px solid #d1d5db;
                padding: 20px;
                border-radius: 12px;
                margin: 30px 0;
                font-size: 14px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                word-break: break-all;
                color: #374151;
                position: relative;
            }
            .alternative-link::before {
                content: '🔗';
                margin-right: 8px;
            }
            .footer {
                background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                padding: 30px 40px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
            }
            .footer-text {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
            }
            .footer-brand {
                font-weight: 600;
                color: #4f46e5;
            }
            .features {
                display: flex;
                justify-content: space-evenly;
                margin: 30px 0;
                padding: 20px;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border-radius: 12px;
                border: 1px solid #e2e8f0;
            }
            .feature {
                text-align: center;
                flex: 1;
                padding: 0 10px;
            }
            .feature-icon {
                font-size: 24px;
                margin-bottom: 8px;
            }
            .feature-text {
                font-size: 12px;
                color: #64748b;
                font-weight: 500;
            }
            @media (max-width: 600px) {
                .email-wrapper {
                    margin: 10px;
                }
                .header, .content {
                    padding: 30px 20px;
                }
                .features {
                    flex-direction: column;
                    gap: 15px;
                }
                .title {
                    font-size: 24px;
                }
                .verification-button {
                    padding: 14px 28px;
                    font-size: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <div class="logo-container">
                    <img src="${process.env.NEXTAUTH_URL}/pharmapedia-logo.png" alt="Pharmapedia Logo" class="logo" />
                </div>
                <h1 class="title">Vérifiez votre adresse e-mail</h1>
                <p class="subtitle">Bienvenue dans la communauté Pharmapedia ! 🎓</p>
            </div>
            
            <div class="content">
                <div class="greeting">Bonjour ${userName} ! 👋</div>
                
                <p class="message">
                    Nous sommes ravis de vous accueillir sur <strong>Pharmapedia</strong>, votre plateforme éducative dédiée à la pharmacie ! 
                    Pour finaliser votre inscription et débloquer l'accès à tous nos cours et ressources pédagogiques, 
                    nous devons d'abord vérifier votre adresse e-mail.
                </p>
                
                <div class="features">
                    <div class="feature">
                        <div class="feature-icon">📚</div>
                        <div class="feature-text">Cours et ressources pédagogiques</div>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🎯</div>
                        <div class="feature-text">Quiz personnalisés</div>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🏆</div>
                        <div class="feature-text">Suivi des progrès</div>
                    </div>
                </div>
                
                <p class="message">
                    Cliquez sur le bouton ci-dessous pour vérifier votre compte et commencer votre parcours d'apprentissage :
                </p>
                
                <div class="cta-container">
                    <a href="${verificationUrl}" class="verification-button">
                        ✅ Vérifier mon adresse e-mail
                    </a>
                </div>
                
                <div class="warning">
                    <span class="warning-text">Important :</span> Ce lien de vérification expirera dans 24 heures pour des raisons de sécurité.
                </div>
                
                <p class="message">
                    Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :
                </p>
                
                <div class="alternative-link">
                    ${verificationUrl}
                </div>
                
                <p class="message">
                    Si vous n'avez pas créé de compte sur Pharmapedia, vous pouvez ignorer cet e-mail en toute sécurité.
                </p>
            </div>
            
            <div class="footer">
                <p class="footer-text">
                    Cet e-mail a été envoyé par <span class="footer-brand">Pharmapedia</span>
                </p>
                <p class="footer-text">
                    Des questions ? N'hésitez pas à nous contacter ! 💬
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Plain text version of the verification email
export const getVerificationEmailText = (userName: string, verificationUrl: string): string => {
  return `
🎓 Bienvenue sur Pharmapedia, ${userName} !

Nous sommes ravis de vous accueillir dans notre communauté d'apprentissage dédiée à la pharmacie !

Pour finaliser votre inscription et débloquer l'accès à tous nos contenus pédagogiques (cours interactifs, quiz personnalisés, suivi des progrès), veuillez vérifier votre adresse e-mail en visitant le lien suivant :

🔗 Lien de vérification :
${verificationUrl}

⚠️  IMPORTANT : Ce lien expirera dans 24 heures pour des raisons de sécurité.

Ce que vous attend sur Pharmapedia :
📚 Cours et ressources pédagogiques
🎯 Quiz et examens personnalisés  
🏆 Suivi détaillé de vos progrès
👥 Communauté d'étudiants et enseignants

Si vous n'avez pas créé de compte sur Pharmapedia, vous pouvez ignorer cet e-mail en toute sécurité.

Des questions ? N'hésitez pas à nous contacter !

Cordialement,
L'équipe Pharmapedia 💊
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