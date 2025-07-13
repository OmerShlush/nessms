import nodemailer from 'nodemailer';
import { config } from '../configurations/app.config';
import { Logger } from '../configurations/log4js.config';

const transporter = nodemailer.createTransport({
    host: config.SMTP.host,
    port: config.SMTP.port,
    // auth: config.SMTP.auth
});

const sendEmail = (emailto: string[], subject: string, text: string) => {
    return new Promise<boolean>((resolve, reject) => {
        const mailOptions = {
            from: config.SMTP.email,
            to: emailto,
            subject: subject,
            text
        }

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                Logger.error(error);
                reject(false);
            } else {
                Logger.info('Message sent via mail', info.accepted);
                resolve(true);
            }
        });
    });
}

export { sendEmail };
