// see https://github.com/nodemailer/nodemailer#set-up-smtp
var smtpConfig = {
    host: 'mail.example.com',
    port: 465,
    secure: true,
    tls: {
        rejectUnauthorized: false,
        requestCert: true
    },
    auth: {
        user: 'user@example.com',
        pass: 'abc123'
    },
    debug: true
};
