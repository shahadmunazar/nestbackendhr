
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor() {
        const port = Number(process.env.MAIL_PORT);
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: port,
            secure: port === 465, // true for 465, false for others
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false // Helps with some server certificates
            }
        });
    }

    async sendVerificationEmail(email: string, name: string, token: string, password?: string) {
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
        const fromName = process.env.MAIL_FROM_NAME || 'MatDash CRM';
        const fromAddress = process.env.MAIL_FROM_ADDRESS || 'no-reply@example.com';

        this.logger.log(`Sending verification email to ${email} with token ${token}...`);

        const mailOptions = {
            from: `"${fromName}" <${fromAddress}>`,
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                         <h2 style="color: #333; margin: 0;">Welcome to ${fromName}!</h2>
                    </div>
                
                    <p style="color: #555; font-size: 16px;">Hi ${name},</p>
                    <p style="color: #555; font-size: 16px;">Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                    </div>

                    ${password ? `
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #e9ecef; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Your Temporary Password</p>
                        <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 24px; color: #222; font-weight: bold; letter-spacing: 2px;">${password}</p>
                    </div>
                    <p style="color: #cc0000; font-size: 14px; text-align: center;"><strong>Important:</strong> Please keep this password secure and change it immediately after your first login.</p>
                    ` : ''}

                    <div style="background-color: #fafafa; padding: 15px; border-radius: 5px; font-size: 12px; color: #777; margin-top: 30px;">
                        <p style="margin: 0 0 5px;">If the button above doesn't work, verify by clicking this link:</p>
                        <p style="margin: 0; word-break: break-all;"><a href="${verificationLink}" style="color: #007bff;">${verificationLink}</a></p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px; text-align: center;">If you did not request this registration, please ignore this email.</p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error(`Error sending email to ${email}: ${error.message}`);
            throw error;
        }
    }
    async sendForgotPasswordEmail(email: string, name: string, token: string) {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
        const fromName = process.env.MAIL_FROM_NAME || 'MatDash CRM';
        const fromAddress = process.env.MAIL_FROM_ADDRESS || 'no-reply@example.com';

        const mailOptions = {
            from: `"${fromName}" <${fromAddress}>`,
            to: email,
            subject: 'Reset Your Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2>Reset Your Password</h2>
                    <p>Hi ${name},</p>
                    <p>You requested to reset your password. Click the button below to set a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        };

        return this.transporter.sendMail(mailOptions);
    }
}
