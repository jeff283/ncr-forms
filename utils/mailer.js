require('dotenv').config();

const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = (to, subject, text) => {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text // plain text body
    };
  
    //disabled while in debugging state
    //return transporter.sendMail(mailOptions);
  };
  
  module.exports = sendEmail;