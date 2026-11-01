import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Sends transactional email over SMTP when SMTP_HOST is configured.
 * Without SMTP, messages are logged in development so flows can still be tested,
 * and only a warning (no message content) is logged in production.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      const port = Number(this.config.get<string>('SMTP_PORT') || 587);
      const user = this.config.get<string>('SMTP_USER');
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass: this.config.get<string>('SMTP_PASS') } : undefined,
      });
    } else {
      this.transporter = null;
    }
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) {
      if (this.config.get('NODE_ENV') === 'production') {
        this.logger.warn(`SMTP is not configured; email "${subject}" was not sent`);
      } else {
        this.logger.log(`[dev email] to=${to} subject="${subject}"\n${text}`);
      }
      return;
    }
    await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM') || this.config.get<string>('SMTP_USER'),
      to,
      subject,
      text,
    });
  }
}
