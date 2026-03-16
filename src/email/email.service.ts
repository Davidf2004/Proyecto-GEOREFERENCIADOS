import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { envs } from 'src/config/envs';
import { EmailOptions } from 'src/core/interfaces/mail-options.interface';
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter = nodemailer.createTransport({
        service: envs.MAILER_SERVICE,
        auth: {
            user: envs.MAILER_EMAIL,
            pass: envs.MAILER_PASSWORD
        }
    });
    async sendEmail(options: EmailOptions) : Promise<boolean> {
        try{
            const result = await this.transporter.sendMail({
            from: envs.MAILER_EMAIL,
            to: options.to,
            cc: options.cc,
            subject: options.subject,
            html: options.html
        });
         this.logger.log(`Email sent to ${options.to}${options.cc ? ` with cc ${options.cc}` : ''} (${result.messageId})`);
         return true;
        }
        catch(error){
            this.logger.error(`Failed to send email to ${options.to}`, error instanceof Error ? error.stack : String(error));
            return false;
        }
        
    }
}
