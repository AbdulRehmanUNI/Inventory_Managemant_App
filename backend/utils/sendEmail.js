const nodeMailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
const sendEmail = async (subject,message,sent_from,send_to,reply_to) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // tls: {
        //     rejectUnauthorized: false
        // }
    })

        // option for sending email
    const options= {
        from: sent_from,
        to: send_to,
        subject: subject,
        html: message,
        replyTo: reply_to
    }

    // send email
    await transporter.sendMail(options, (err,info) => {
        if(err){
            console.log(err);
        }else{
            console.log(info);
        }
    })

}


module.exports = sendEmail;

