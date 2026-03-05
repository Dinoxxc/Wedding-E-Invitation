const twilio = require('twilio');
const logger = require('./logger');

class SMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (this.accountSid && this.authToken && this.phoneNumber) {
      this.client = twilio(this.accountSid, this.authToken);
      this.enabled = true;
    } else {
      this.enabled = false;
      logger.warn('SMS service not configured. Set TWILIO credentials in .env');
    }
  }

  async sendSMS(to, message) {
    if (!this.enabled) {
      logger.warn('SMS service disabled - credentials not configured');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: to
      });

      logger.info(`SMS sent successfully to ${to}`, { sid: result.sid });
      return { success: true, sid: result.sid };
    } catch (error) {
      logger.error('SMS sending failed', { error: error.message, to });
      return { success: false, error: error.message };
    }
  }

  async sendWeddingReminder(guestData) {
    const message = `Hi ${guestData.name}! This is a reminder about our wedding on ${process.env.WEDDING_DATE || 'Dec 31, 2026'}. We look forward to celebrating with you! Please bring your QR code for check-in. See you soon!`;
    return await this.sendSMS(guestData.phone, message);
  }

  async sendCheckInConfirmation(guestData) {
    const message = `Welcome ${guestData.name}! You have successfully checked in. Enjoy the celebration!`;
    return await this.sendSMS(guestData.phone, message);
  }

  async sendBulkReminders(guests) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const guest of guests) {
      if (guest.phone) {
        const result = await this.sendWeddingReminder(guest);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ phone: guest.phone, error: result.error });
        }
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

module.exports = new SMSService();
