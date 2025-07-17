import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templates = {
    welcome: fs.readFileSync(path.resolve(__dirname, '../public/welcome.html'), 'utf-8'),
    reset: fs.readFileSync(path.resolve(__dirname, '../public/reset.html'), 'utf-8'),
};

export default class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstname = user.firstname;
        this.url = url;
        this.from = `hotelreservation<${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // sendgrid
            return 1;
        }
        return nodemailer.createTransport({
            host: process.env.DEV_EMAIL_HOST,
            port: process.env.DEV_EMAIL_PORT,
            auth: {
                user: process.env.DEV_EMAIL_USERNAME,
                pass: process.env.DEV_EMAIL_PASSWORD
            }
        });
    }

    replacePlaceholders(html) {
        return html
            .replace('{{firstname}}', this.firstname)
            .replace(/{{url}}/g, html.includes('{{url}}') ? this.url : '');
    }

    async send(template, subject) {
        let html = templates[template];
        html = this.replacePlaceholders(html);

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendResetMail() {
        await this.send('reset', 'Reset your password');
    }

    async sendWelcomeMail() {
        await this.send('welcome', 'Welcome to the hotel reservation system');
    }
}
