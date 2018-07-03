const {promisify} = require('util');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const format = require('string-template');

module.exports = class SnapshotMailer {
    constructor(mailConfig) {
        this.mailConfig = mailConfig;

        // create reusable transporter object using the default SMTP transport
        this.transporter = nodemailer.createTransport(this.mailConfig.smtp);

        // attach Promise based methods for some callback based methods
        this.transporter.verifyAsync = promisify(this.transporter.verify);
        this.transporter.sendMailAsync = promisify(this.transporter.sendMail);
    }

    async testConnection() {
        return this.transporter.verifyAsync();
    }

    async send(snapshotMetadata, recipientAddress, recipientName = this.mailConfig.defaultRecipientName) {
        console.log('mailing ' + snapshotMetadata.url + ' to ' + recipientAddress);

        const substUrls = (s) => format(s, {
            websiteUrl: snapshotMetadata.url,
            pdfUrl: snapshotMetadata.pdf,
            defaultRecipientName: recipientName
        });

        const formattedHtml = substUrls(this.mailConfig.html);
        const formattedText = typeof this.mailConfig.text !== 'undefined' && this.mailConfig.text != null ? substUrls(this.mailConfig.text) : htmlToText.fromString(formattedHtml, {
            hideLinkHrefIfSameAsText: true
        });

        // setup e-mail data with unicode symbols
        const mailOptions = {
            from: {
                name: this.mailConfig.senderName,
                address: this.mailConfig.senderAddress
            }, // sender address
            to: {
                name: recipientName,
                address: recipientAddress
            }, // list of receivers
            subject: this.mailConfig.subject, // subject line
            text: formattedText, // plaintext body
            html: formattedHtml, // html body
        };

        // send mail with defined transport object
        return this.transporter.sendMailAsync(mailOptions);
    }
}