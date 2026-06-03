const nodemailer = require('nodemailer');
let transporter = null;

const initializeEmailService = () => {
  if (!transporter) {
    const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD;
    
    if (!emailUser || !emailPassword) {
      console.warn('⚠️ Email service not configured. Email notifications will be disabled.');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword, // Use app password for Gmail
      },
      // Add connection timeout settings for Render/production environments
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
      socketTimeout: 10000, // 10 seconds
    });

    // Skip verification entirely to avoid timeout issues in production
    // In production environments like Render, SMTP verification can timeout
    // Email sending will be attempted when needed, and errors will be handled gracefully
    // We skip verification to prevent blocking server startup
    console.log('✅ Email service transporter created (verification skipped to prevent timeout issues)');
  }
  return transporter;
};

// Initialize on module load (non-blocking)
if ((process.env.EMAIL_USER || process.env.SMTP_USER) && (process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD)) {
  // Don't block - initialize asynchronously
  setTimeout(() => {
    initializeEmailService();
  }, 0);
}

const sendEmail = async (to, subject, html, text = '') => {
  try {
    if (!transporter) {
      transporter = initializeEmailService();
    }

    const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD;
    
    if (!emailUser || !emailPassword) {
      console.warn('⚠️ Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"Medifit AI" <${emailUser}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

const sendWorkoutReminder = async (userEmail, userName, workoutName, scheduledTime) => {
  const subject = `Workout Reminder: ${workoutName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💪 Workout Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Just a friendly reminder that you have a workout scheduled:</p>
          <h2>${workoutName}</h2>
          <p><strong>Scheduled Time:</strong> ${scheduledTime}</p>
          <p>Time to get moving and achieve your fitness goals! 🚀</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/workouts" class="button">View Workout</a>
          <p>Stay motivated and keep pushing forward!</p>
          <p>Best regards,<br>Medifit AI Team</p>
        </div>
        <div class="footer">
          <p>You're receiving this email because you have workout reminders enabled in your Medifit AI account.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(userEmail, subject, html);
};

const sendGoalAchievement = async (userEmail, userName, goalName) => {
  const subject = `🎉 Congratulations! Goal Achieved`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Goal Achieved!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Congratulations! You've achieved your goal:</p>
          <h2>${goalName}</h2>
          <p>Your hard work and dedication are paying off. Keep up the amazing work! 🚀</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/analytics" class="button">View Progress</a>
          <p>Continue to push yourself and achieve even greater milestones!</p>
          <p>Best regards,<br>Medifit AI Team</p>
        </div>
        <div class="footer">
          <p>You're receiving this email because you have achievement notifications enabled in your Medifit AI account.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(userEmail, subject, html);
};

const sendMealReminder = async (userEmail, userName, mealType, scheduledTime) => {
  const subject = `Meal Reminder: ${mealType}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #4facfe; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ Meal Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>It's time for your ${mealType}!</p>
          <p><strong>Scheduled Time:</strong> ${scheduledTime}</p>
          <p>Don't forget to log your meal to keep track of your nutrition goals. 📊</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/meals" class="button">Log Meal</a>
          <p>Stay on track with your nutrition goals!</p>
          <p>Best regards,<br>Medifit AI Team</p>
        </div>
        <div class="footer">
          <p>You're receiving this email because you have meal reminders enabled in your Medifit AI account.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(userEmail, subject, html);
};

const sendOTPEmail = async (userEmail, otpCode) => {
  const subject = 'Medifit AI - Email Verification Code';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for signing up for Medifit AI! Please use the verification code below to verify your email address:</p>
          <div class="otp-code">${otpCode}</div>
          <div class="warning">
            <strong>⚠️ Important:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
          </div>
          <p>If you didn't request this verification code, please ignore this email.</p>
          <p>Best regards,<br>Medifit AI Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(userEmail, subject, html);
};

const sendPasswordResetEmail = async (userEmail, otpCode) => {
  const subject = 'Medifit AI - Password Reset Code';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: #fff; border: 2px dashed #2563eb; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 20px 0; border-radius: 8px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Use this code to reset your Medifit AI password:</p>
          <div class="otp-code">${otpCode}</div>
          <div class="warning">
            <strong>⚠️ Important:</strong> This code will expire in 10 minutes. If you did not request this, please ignore this email.
          </div>
          <p>Best regards,<br>Medifit AI Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(userEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWorkoutReminder,
  sendGoalAchievement,
  sendMealReminder,
  initializeEmailService,
};
