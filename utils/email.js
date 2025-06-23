const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const templates = {
    welcome: fs.readFileSync(path.resolve(__dirname, '../public/welcome.html'), 'utf-8'),
    reset: fs.readFileSync(path.resolve(__dirname, '../public/reset.html'), 'utf-8'),
};




module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstname = user.firstname;
        this.url = url;
        this.from = `hotelreservation<${process.env.EMAIL_FROM}>`
    }
    
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // sendgrid
            return 1
        }
        return nodemailer.createTransport({
            host: process.env.DEV_EMAIL_HOST,
            PORT: process.env.DEV_EMAIL_PORT,
            auth: {
                user: process.env.DEV_EMAIL_USERNAME,
                pass: process.env.DEV_EMAIL_PASSWORD
            }
        })
    }


    replacePlaceholders(html) {
        return html
            .replace('{{firstname}}', this.firstname)
            .replace(/{{url}}/g, html.includes('{{url}}') ? this.url : '');
    }

    async send(template, subject) {
        // render html template
        let html = templates[template];

        // if (!html) {
        //     throw new Error(`Template "${template}" not found in cache.`);
        // }

        // Replace placeholders with actual user data
        html = this.replacePlaceholders(html);
        // define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html
        }

        // create transport and send mail
        
        await this.newTransport().sendMail(mailOptions)
    }

    async sendResetMail() {
        await this.send('reset', 'Reset your password');
    }

    async sendWelcomeMail() {
        await this.send('welcome', 'Welcome to the hotel reservation system');
    }
}