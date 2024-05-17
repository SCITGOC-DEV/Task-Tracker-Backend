const poolQuery = require("../misc/poolQuery.js");
const express = require('express');
const nodemailer = require('nodemailer');
const emailRouter = express.Router();

const pass = "AAN##2022";

// configure nodemailer
const transporter = nodemailer.createTransport({
    host: "mail.axratech.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "ayenaing@axratech.com", // generated ethereal user
      pass: pass, // generated ethereal password
    },
});

// function to send the email
const sendEmail = (newTasksCount) => {
    const mailOptions = {
        from: 'ayenaing@axratech.com',
        to: 'lwinnandaroo21@gmail.com',
        subject: 'New tasks added to the table',
        text: `Today's date: ${new Date().toDateString()}\nNew tasks added: ${newTasksCount}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

emailRouter.post('/', async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10); 

        await poolQuery(`select count(*) AS newTasksCount from tracking WHERE DATE(start_date_time) = '${today}'`, (err, result) => {
            console.log(result.rows[0].newtaskscount)
            if (err) throw err;
            const newTasksCount = result.rows[0].newtaskscount;

           // console.log(newTasksCount);

            sendEmail(newTasksCount);

            res.status(200).json('API call successful');
        });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = emailRouter;