const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Wedding Invitation'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email sending failed', { error: error.message, to });
      return { success: false, error: error.message };
    }
  }

  async sendRSVPConfirmation(rsvpData) {
    const subject = 'RSVP Confirmation - Wedding Invitation';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .details { background: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your RSVP!</h1>
          </div>
          <div class="content">
            <p>Dear ${rsvpData.guest_name},</p>
            <p>We have received your RSVP. Here are the details:</p>
            <div class="details">
              <p><strong>Name:</strong> ${rsvpData.guest_name}</p>
              <p><strong>Email:</strong> ${rsvpData.email}</p>
              <p><strong>Attendance:</strong> ${rsvpData.attendance === 'attending' ? 'Will Attend' : 'Cannot Attend'}</p>
              <p><strong>Number of Guests:</strong> ${rsvpData.number_of_guests || 1}</p>
              ${rsvpData.dietary_restrictions ? `<p><strong>Dietary Restrictions:</strong> ${rsvpData.dietary_restrictions}</p>` : ''}
              ${rsvpData.special_requests ? `<p><strong>Special Requests:</strong> ${rsvpData.special_requests}</p>` : ''}
            </div>
            <p>We look forward to celebrating with you!</p>
            <p>If you need to make any changes, please contact us directly.</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(rsvpData.email, subject, html);
  }

  async sendGuestInvitation(guestData, qrCodePath) {
    const subject = 'You Are Invited to Our Wedding!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.8; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; }
          .header { text-align: center; padding: 40px 20px; border-bottom: 2px solid #000; }
          .header h1 { font-size: 32px; margin: 0; font-weight: 300; letter-spacing: 2px; }
          .content { padding: 40px 20px; text-align: center; }
          .qr-section { margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .details-box { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Wedding Invitation</h1>
            <p style="font-size: 18px; margin: 10px 0;">You Are Cordially Invited</p>
          </div>
          <div class="content">
            <p style="font-size: 18px;">Dear ${guestData.name},</p>
            <p>We are delighted to invite you to celebrate our special day!</p>
            
            <div class="details-box">
              <p><strong>Invitation Type:</strong> ${guestData.invitation_type}</p>
              <p><strong>Number of Guests:</strong> ${guestData.max_guests}</p>
              ${guestData.table_number ? `<p><strong>Table Number:</strong> ${guestData.table_number}</p>` : ''}
            </div>

            <div class="qr-section">
              <h3>Your Personal QR Code</h3>
              <p>Please present this QR code at the venue for check-in:</p>
              <img src="cid:qrcode" alt="QR Code" style="max-width: 200px; margin: 20px auto; display: block;"/>
              <p style="font-size: 12px; color: #666;">Unique Code: ${guestData.unique_code}</p>
            </div>

            <p>We can't wait to celebrate with you!</p>
          </div>
          <div class="footer">
            <p>Please RSVP at your earliest convenience</p>
            <p><a href="${process.env.FRONTEND_URL}/rsvp">Click here to RSVP</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = qrCodePath ? [{
      filename: 'qrcode.png',
      path: qrCodePath,
      cid: 'qrcode'
    }] : [];

    return await this.sendEmail(guestData.email, subject, html, attachments);
  }

  async sendWeddingReminder(guestData) {
    const subject = 'Reminder: Wedding Day is Coming Soon!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px 20px; }
          .highlight { background: #f0f0f0; padding: 20px; margin: 20px 0; border-left: 4px solid #000; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Wedding Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${guestData.name},</p>
            <p>This is a friendly reminder that our wedding is coming up soon!</p>
            <div class="highlight">
              <p><strong>Date:</strong> ${process.env.WEDDING_DATE || 'December 31, 2026'}</p>
              <p><strong>Venue:</strong> [Venue Name & Address]</p>
              <p>Please don't forget to bring your QR code for check-in.</p>
            </div>
            <p>We're excited to celebrate with you!</p>
          </div>
          <div class="footer">
            <p>See you soon!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(guestData.email, subject, html);
  }

  async sendBulkReminders(guests) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const guest of guests) {
      if (guest.email) {
        const result = await this.sendWeddingReminder(guest);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ email: guest.email, error: result.error });
        }
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

module.exports = new EmailService();
