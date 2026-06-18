import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string | number>('SMTP_PORT', 587));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Puerto SSL es seguro, TLS (587) no lo es a nivel de conexión inicial
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const from = this.configService.get<string>('SMTP_FROM', 'no-reply@sindicatoenap.cl');
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    const isMock = !host || !user || !pass || 
                   host.includes('YOUR_') || 
                   user.includes('mock_') || 
                   pass.includes('mock_') || 
                   user.includes('YOUR_') || 
                   pass.includes('YOUR_');

    if (isMock) {
      this.logger.warn(`SMTP credentials not configured (mock values detected). Simulated sending email to: ${to} - Subject: "${subject}"`);
      return true;
    }

    this.logger.log(`Sending email to ${to} with subject "${subject}"...`);
    
    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully to ${to}.`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }
}
